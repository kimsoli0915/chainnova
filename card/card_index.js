const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

// Veramo 패키지 임포트
const { createAgent } = require('@veramo/core')
const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = require('@veramo/key-manager')
const { DIDManager, MemoryDIDStore } = require('@veramo/did-manager')
const { KeyDIDProvider } = require('@veramo/did-provider-key')
const { KeyManagementSystem } = require('@veramo/kms-local')
const { CredentialIssuer } = require('@veramo/credential-w3c')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Veramo 에이전트 설정
const agent = createAgent({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore())
      }
    }),
    new DIDManager({
      store: new MemoryDIDStore(),
      defaultProvider: 'did:key',
      providers: {
        'did:key': new KeyDIDProvider({
          defaultKms: 'local'
        })
      }
    }),
    new CredentialIssuer()
  ]
})

// VC 발급 API (입력받는 모든 정보를 credentialSubject에 포함)
app.post('/issue-vc', async (req, res) => {
  // 입력값 모두 받아오기 (추가: birth, cardPassword)
  const { birth, cardNumber, expiryDate, cvc, cardPassword } = req.body
  try {
    // 카드사 DID (issuer)
    const issuer = await agent.didManagerCreate()
    // 사용자 DID (credentialSubject)
    const user = await agent.didManagerCreate()

    // VC 발급
    const vc = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'CardCredential'],
        credentialSubject: {
          id: user.did,
          birth,        // 생년월일
          cardNumber,   // 카드번호
          expiryDate,   // 유효기간
          cvc,          // CVC 번호
          cardPassword  // 카드 비밀번호
        }
      },
      proofFormat: 'jwt'
    })

    res.json(vc)
  } catch (err) {
    console.error(err)
    res.status(500).send('VC 발급 실패')
  }
})

app.listen(3001, () => {
  console.log('✅ 백엔드 서버 실행: http://localhost:3001')
})