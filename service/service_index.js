require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const { createAgent } = require('@veramo/core');
const { CredentialIssuer } = require('@veramo/credential-w3c');
const { DIDResolverPlugin } = require('@veramo/did-resolver');
const { Resolver } = require('did-resolver');
const { getResolver } = require('key-did-resolver');
const crypto = require('crypto');
const { ethers } = require('ethers');

const paymentRouter = require('./payment')

const secretKey = process.env.TOSS_SECRET_KEY
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', paymentRouter)

// ✅ Veramo Agent 생성
const agent = createAgent({
  plugins: [
    new CredentialIssuer(),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getResolver()
      }),
    }),
  ],
});

// ✅ 스마트컨트랙트 설정
const contractAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
const contractABI = [
  "function isVCRegistered(bytes32 vcHash) view returns (bool)",
  "function isVCUsed(bytes32 vcHash) view returns (bool)",
  "function markVCUsed(bytes32 vcHash)"
];

// ✅ signer 명시 설정 (Hardhat 계정 또는 환경변수 사용)
if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.");
}

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const privateKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// ✅ VC 검증 및 사용 등록 엔드포인트
app.post('/verify-vc', async (req, res) => {
  const { vc } = req.body;

  try {
    // 1. Veramo로 VC 유효성 검증
    const result = await agent.verifyCredential({ credential: vc });
    if (!result.verified) {
      console.log("❌ VC 검증 실패");
      return res.status(400).json({ verified: false, message: "❌ VC is invalid" });
    }

    // 2. VC 만료일 확인 (JWT payload의 exp claim)
    const jwt = vc.proof?.jwt;
    if (jwt) {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
      const exp = payload.exp * 1000; // 초 → 밀리초
      if (Date.now() > exp) {
        console.log("⛔ VC 만료됨 (expirationDate 초과)");
        return res.status(400).json({ verified: false, message: "⛔ VC expired" });
      }
    }

    // 3. VC 해시 생성 (SHA-256)
    const vcHash = crypto.createHash('sha256').update(JSON.stringify(vc)).digest('hex');
    const vcHashBytes32 = '0x' + vcHash;

    // 4. VC 등록 여부 확인
    const isRegistered = await contract.isVCRegistered(vcHashBytes32);
    if (!isRegistered) {
      console.log("⚠️ VC는 유효하지만 온체인에 등록되지 않음");
      return res.status(200).json({
        verified: true,
        onchainMatch: false,
        used: false,
        message: "⚠️ VC is valid but not on-chain registered"
      });
    }

    // 5. VC 사용 여부 확인
    const isUsed = await contract.isVCUsed(vcHashBytes32);
    if (isUsed) {
      console.log("🚫 VC는 이미 사용됨");
      return res.status(400).json({
        verified: true,
        onchainMatch: true,
        used: true,
        message: "🚫 VC already used"
      });
    }

    // 6. VC 사용 처리 → 스마트컨트랙트에 기록
    const tx = await contract.markVCUsed(vcHashBytes32);
    await tx.wait();

    console.log("✅ VC 사용 처리 완료");
    return res.status(200).json({
      verified: true,
      onchainMatch: true,
      used: false,
      message: "✅ VC verified and marked as used"
    });

  } catch (err) {
    console.error("❌ VC 검증 중 오류:", err);
    return res.status(500).json({ error: 'VC 검증 중 오류 발생' });
  }
});

app.listen(3002, () => {
  console.log('✅ 서비스제공자 백엔드 실행됨: http://localhost:3002');
});
