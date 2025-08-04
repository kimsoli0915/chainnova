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
const fetch = require('node-fetch');

const secretKey = process.env.TOSS_SECRET_KEY;
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Veramo Agent 생성
const agent = createAgent({
  plugins: [
    new CredentialIssuer(),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getResolver(),
      }),
    }),
  ],
});

// ✅ 스마트컨트랙트 설정
const contractAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // 수정된 주소
const contractABI = [
  "function isVCRegistered(bytes32 vcHash) view returns (bool)",
  "function isVCUsed(bytes32 vcHash) view returns (bool)",
  "function markVCUsed(bytes32 vcHash)"
];

if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.");
}

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// ✅ VC 단순 검증 엔드포인트
app.post('/verify-vc', async (req, res) => {
  const { vc } = req.body;

  try {
    const result = await agent.verifyCredential({ credential: vc });
    if (!result.verified) {
      return res.status(400).json({ verified: false, message: "❌ VC is invalid" });
    }

    const jwt = vc.proof?.jwt;
    if (jwt) {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
      const exp = payload.exp * 1000;
      if (Date.now() > exp) {
        return res.status(400).json({ verified: false, message: "⛔ VC expired" });
      }
    }

    const vcHash = crypto.createHash('sha256').update(JSON.stringify(vc)).digest('hex');
    const vcHashBytes32 = '0x' + vcHash;

    const isRegistered = await contract.isVCRegistered(vcHashBytes32);
    if (!isRegistered) {
      return res.status(200).json({ verified: true, onchainMatch: false, used: false });
    }

    const isUsed = await contract.isVCUsed(vcHashBytes32);
    if (isUsed) {
      return res.status(400).json({ verified: true, onchainMatch: true, used: true });
    }

    await contract.markVCUsed(vcHashBytes32);
    return res.status(200).json({ verified: true, onchainMatch: true, used: false });
  } catch (err) {
    console.error("❌ VC 검증 중 오류:", err);
    return res.status(500).json({ error: 'VC 검증 중 오류 발생' });
  }
});

// ✅ Toss 결제 승인 + VC 검증 및 사용 처리
app.post('/confirm-payment', async (req, res) => {
  const { paymentKey, orderId, amount, vc } = req.body;

  try {
    const result = await agent.verifyCredential({ credential: vc });
    if (!result.verified) {
      return res.status(400).json({ message: '❌ VC 유효성 실패' });
    }

    const jwt = vc.proof?.jwt;
    const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
    const exp = payload.exp * 1000;
    if (Date.now() > exp) {
      return res.status(400).json({ message: '⛔ VC expired' });
    }

    const vcHash = crypto.createHash('sha256').update(JSON.stringify(vc)).digest('hex');
    const vcHashBytes32 = '0x' + vcHash;

    const isRegistered = await contract.isVCRegistered(vcHashBytes32);
    if (!isRegistered) {
      return res.status(400).json({ message: '⚠️ VC not registered on-chain' });
    }

    const isUsed = await contract.isVCUsed(vcHashBytes32);
    if (isUsed) {
      return res.status(400).json({ message: '🚫 VC already used' });
    }

    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ paymentKey, orderId, amount })
    });

    const tossData = await tossResponse.json();

    const tx = await contract.markVCUsed(vcHashBytes32);
    await tx.wait();

    return res.status(200).json({ message: "✅ 결제 승인 완료", tossResult: tossData });
  } catch (err) {
    console.error("❌ confirm-payment 오류:", err);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

app.listen(3002, () => {
  console.log('✅ 서비스제공자 백엔드 실행됨: http://localhost:3002');
});
