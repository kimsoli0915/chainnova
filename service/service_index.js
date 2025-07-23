const express = require('express');
const cors = require('cors');
const { createAgent } = require('@veramo/core');
const { CredentialIssuer } = require('@veramo/credential-w3c');
const { DIDResolverPlugin } = require('@veramo/did-resolver');
const { Resolver } = require('did-resolver');
const { getResolver } = require('key-did-resolver'); // did:key 지원

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Veramo Agent 생성 (CredentialVerifier 생략!)
const agent = createAgent({
  plugins: [
    new CredentialIssuer(), // VC 발급 + 검증 모두 처리 가능
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getResolver()
      }),
    }),
  ],
});

// ✅ VC 검증 엔드포인트
app.post('/verify-vc', async (req, res) => {
  const { vc } = req.body;

  //console.log("📩 VC 수신됨:", JSON.stringify(vc, null, 2)); // ✅ VC 내용 출력

  try {
    const result = await agent.verifyCredential({ credential: vc });

    if (result.verified) {
      console.log("✅ VC 유효함"); // ✅ 검증 성공 로그
      return res.json({ verified: true, message: '✅ VC is valid' });
    } else {
      console.log("❌ VC 무효함"); // ❌ 검증 실패 로그
      return res.status(400).json({ verified: false, message: '❌ VC is invalid' });
    }
  } catch (err) {
    console.error('VC 검증 오류:', err); // 🛠 에러 로그
    return res.status(500).json({ error: 'VC 검증 중 오류 발생' });
  }
});


app.listen(3002, () => {
  console.log('✅ 서비스 제공자 백엔드 실행됨: http://localhost:3002');
});
