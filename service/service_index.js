require('dotenv').config({ path: __dirname + '/.env' });
//.env 파일에 저장된 비밀 키(TOSS_SECRET_KEY, PRIVATE_KEY, VC_CONTRACT_ADDRESS 등) 로드

const express = require('express'); // http 서버 프레임워크
const cors = require('cors'); // 클라이언트 도메인에서 API를 호출할 수 있게 허용

const { createAgent } = require('@veramo/core');
const { CredentialIssuer } = require('@veramo/credential-w3c');
const { DIDResolverPlugin } = require('@veramo/did-resolver');
const { Resolver } = require('did-resolver');
const { getResolver } = require('key-did-resolver');

const crypto = require('crypto');
const { ethers } = require('ethers');

const app = express();

// ====== 미들웨어 ======
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    console.log(`${re                                                                                                                   q.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - t0}ms`);
  });
  next();
});

// ====== 환경변수 ======
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const VC_CONTRACT_ADDRESS = process.env.VC_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// 서버 실행 시 아래 값이 누락되면 즉시 종료(throw)
// TOSS_SECRET_KEY Toss 결제 API 인증용
// PRIVATE_KEY 블록체인 트랜잭션 서명용
// VC_CONTRACT_ADDRESS 배포된 VC를 관리하는 스마트컨트랙트 주소
// 이 과정에서 빠르게 오류를 감지, 잘못된 설정으로 인한 결제 오류 방지

if (!TOSS_SECRET_KEY) throw new Error('❌ TOSS_SECRET_KEY 누락');
if (!PRIVATE_KEY) throw new Error('❌ PRIVATE_KEY 누락');
if (!VC_CONTRACT_ADDRESS) throw new Error('❌ VC_CONTRACT_ADDRESS 누락 (배포 주소 필요)');

// ====== Veramo Agent ====== DID, VC를 다루는 프레임워크
const agent = createAgent({
  plugins: [
    new CredentialIssuer(), // VC 생성 및 발급 기능 제공
    new DIDResolverPlugin({ resolver: new Resolver({ ...getResolver() }) }),
    // VC 안의 DID 주체(DID:key 등)를 실제 공개키로 해석
  ],
});

// ====== 스마트컨트랙트 ======
const contractABI = [
  'function isVCRegistered(bytes32 vcHash) view returns (bool)',
  'function isVCUsed(bytes32 vcHash) view returns (bool)',
  'function markVCUsed(bytes32 vcHash)',
];
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY, provider);
const contract = new ethers.Contract(VC_CONTRACT_ADDRESS, contractABI, signer);
// ethers.js : Ethereum 호환 네트워크 연결
// provider : 블록체인 노드 접근
// signer : PRIVATE_KEY를 이용해 트랜잭션 서명
// contract : VC 상태 관리 컨트랙트 인스턴스

// 부팅 시 주소 검증 (실수 방지)
(async () => {
  const code = await provider.getCode(VC_CONTRACT_ADDRESS);
  if (code === '0x') throw new Error(`❌ 컨트랙트 코드 없음: ${VC_CONTRACT_ADDRESS} (주소/네트워크 확인)`);
})().catch(e => { console.error(e); process.exit(1); });

// ====== 유틸 ====== (유틸리티 함수 하단에 표로 정리...)
function decodeBase64Url(s) {
  try { return Buffer.from(s, 'base64url').toString(); }
  catch { return Buffer.from(s, 'base64').toString(); }
}
function getExpMsFromVC(vc) {
  const jwt = vc?.proof?.jwt;
  if (!jwt) return 0;
  const parts = jwt.split('.');
  if (parts.length < 2) return 0;
  const payload = JSON.parse(decodeBase64Url(parts[1]));
  return (payload?.exp ?? 0) * 1000;
}
function toVcHashBytes32(vc) {
  const hex = crypto.createHash('sha256').update(JSON.stringify(vc)).digest('hex');
  return '0x' + hex;
}
function httpError(res, status, code, message, extra = {}) {
  return res.status(status).json({ ok: false, code, message, ...extra });
}
function assertNotExpired(vc, atMs = Date.now()) {
  const expMs = getExpMsFromVC(vc);
  if (!expMs) {
    const err = new Error('VC has no exp');
    err.status = 400; err.code = 'VC_NO_EXP';
    throw err;
  }
  if (atMs >= expMs) {
    const err = new Error(`VC expired at ${new Date(expMs).toISOString()}`);
    err.status = 400; err.code = 'VC_EXPIRED';
    throw err;
  }
  return expMs;
}
async function ensureMarkUsed(vcHash) {
  const used = await contract.isVCUsed(vcHash);
  if (!used) {
    const tx = await contract.markVCUsed(vcHash);
    await tx.wait(1);
    console.log(`✅ markVCUsed: ${vcHash}`);
  }
}

// 단순 검증
app.post('/verify-vc', async (req, res) => {
  try {
    const { vc } = req.body || {};
    if (!vc) return httpError(res, 400, 'BAD_REQUEST', 'VC missing');

    const result = await agent.verifyCredential({ credential: vc });
                         // VC의 서명 진위와 발급자 식별을 확인
    if (!result.verified) return httpError(res, 400, 'VC_INVALID', '❌ VC is invalid');

    const expMs = assertNotExpired(vc); // VC 만료 확인
    const vcHash = toVcHashBytes32(vc); // VC 해시 생성

    const isRegistered = await contract.isVCRegistered(vcHash);
    const isUsed = isRegistered ? await contract.isVCUsed(vcHash) : false;
		// 온체인 상태 조회

    return res.json({
      ok: true,
      verified: true,
      onchainMatch: !!isRegistered,
      used: !!isUsed,
      vcHash,
      expIso: new Date(expMs).toISOString(),
      message: isRegistered ? (isUsed ? 'VC already used' : 'VC ok') : 'VC not on-chain',
    });
  } catch (e) {
    console.error('❌ /verify-vc:', e);
    return httpError(res, e.status || 500, e.code || 'SERVER_ERROR', e.message || 'server error');
  } 
});

app.post('/confirm-payment', async (req, res) => {
  const { paymentKey, orderId, amount, vc } = req.body || {};
  const amtNum = Number(amount);

  // 공통 로그/응답 헬퍼
  let vcHash = undefined; // 초기에 없을 수 있으니 바깥에 선언
  const fail = (code, message, extra = {}, status = 400) => {
    console.error('❌ CONFIRM FAIL', {
      code, message,
      paymentKey, orderId, amount: amtNum,
      vcHash,
      ...extra, // tossResult, approvedAt 등
    });
    return res.status(status).json({ ok: false, code, message, ...extra });
  };
  const success = (data) => {
    console.log('CONFIRM SUCCESS', {
      paymentKey, orderId, vcHash,
      approvedAt: data?.approvedAt,
    });
    return res.json({ ok: true, code: 'CONFIRMED', message: '✅ 결제 승인 완료 & VC 사용 처리', tossResult: data });
  };

  try {
    if (!paymentKey || !orderId || !Number.isFinite(amtNum)) {
      return fail('BAD_REQUEST', 'paymentKey/orderId/amount 누락');
    }
    if (!vc) {
      return fail('VC_MISSING', 'VC 누락');
    }

    // 1) VC 유효성/만료
    const verify = await agent.verifyCredential({ credential: vc });
    if (!verify.verified) return fail('VC_INVALID', '❌ VC 유효성 실패');

    const expMs = assertNotExpired(vc);
    vcHash = toVcHashBytes32(vc); // <- 실패 로그에도 vcHash가 들어감

    // 2) 온체인 상태
    const isRegistered = await contract.isVCRegistered(vcHash);
    if (!isRegistered) return fail('VC_NOT_ONCHAIN', 'VC not registered on-chain');

    const isUsed = await contract.isVCUsed(vcHash);
    if (isUsed) return fail('VC_ALREADY_USED', '🚫 VC already used');

    // 3) Toss Confirm (+ S008 자동처리 쓰는 경우엔 confirmWithRetry 호출)
    const resp = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount: amtNum }),
    });
    // Toss Secret Key를 Basic Auth로 인코딩 및 전송
    // Toss 서버로부터 결제 승인 결과(status: 'DONE')를 받으면 성공 처리
    const tossData = await resp.json().catch(() => ({}));
    console.log('📡 Toss Confirm 응답:', tossData);

    if (!resp.ok) return fail('TOSS_CONFIRM_FAIL', '결제 실패 또는 대기', { tossResult: tossData });
    if (tossData?.status !== 'DONE') return fail('TOSS_NOT_DONE', '결제 미완료', { tossResult: tossData });
    if (String(tossData?.orderId) !== String(orderId))
      return fail('ORDER_ID_MISMATCH', 'orderId 불일치', { tossResult: tossData });
    if (Number(tossData?.totalAmount) !== amtNum)
      return fail('AMOUNT_MISMATCH', '금액 불일치', { tossResult: tossData });

    // 4) 승인 시각 기준 만료 재검사
    const approvedAtMs = tossData?.approvedAt ? Date.parse(tossData.approvedAt) : Date.now();
    if (expMs && approvedAtMs >= expMs) {
      return fail('VC_EXPIRED_BEFORE_APPROVAL', '⛔ VC expired before approval', {
        approvedAt: tossData.approvedAt
      });
      console.log('VC만료');
    }

    // 5) mark-used
    await ensureMarkUsed(vcHash); // 등록된 VC를 사용 처리

    return success(tossData);

  } catch (e) {
    // 예외도 동일 포맷으로 한 줄
    return fail(e.code || 'SERVER_ERROR', e.message || 'server error', {}, e.status || 500);
  }
});


// ====== 헬스체크 ======
app.get('/health', (_, res) => res.json({ ok: true })); // 서버 살아 있는지 확인

// ====== 서버 기동 ======
const PORT = Number(process.env.PORT || 3002);
app.listen(PORT, async () => {
  console.log(`✅ 서비스제공자 백엔드 실행됨: http://localhost:${PORT}`);
  try {
    const [addr, net] = await Promise.all([signer.getAddress(), provider.getNetwork()]);
    console.log(`Signer: ${addr}`);
    console.log(`ChainId: ${net.chainId.toString()}, RPC: ${provider._getConnection().url}`);
  } catch (e) {
    console.warn('Signer/Provider 정보 조회 실패:', e.message);
  }
});