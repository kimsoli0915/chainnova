const express = require('express')
const cors = require('cors')

// Veramo 패키지
const { createAgent } = require('@veramo/core')
const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = require('@veramo/key-manager')
const { DIDManager, MemoryDIDStore } = require('@veramo/did-manager')
const { KeyDIDProvider } = require('@veramo/did-provider-key')
const { KeyManagementSystem } = require('@veramo/kms-local')
const { CredentialIssuer } = require('@veramo/credential-w3c')

const app = express()
app.use(cors())
app.use(express.json())  // 🔥 중요! req.body 파싱
app.use(express.urlencoded({ extended: true }))

// Veramo 에이전트 구성
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

// VC 발급 API
app.post('/issue-vc', async (req, res) => {
  try {
    const {
      birth,
      cardNumber,
      expiryDate,
      cvc,
      cardPassword,
      walletAddress,
      signature
    } = req.body

    // 🔐 서버에서 서명 검증 가능 (선택)
    if (!walletAddress || !signature) {
      return res.status(400).json({ error: '지갑 주소 또는 서명 누락' })
    }

    // issuer & subject DID 생성
    const issuer = await agent.didManagerCreate()
    const user = await agent.didManagerCreate()

    // VC 생성
    const vc = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'CardCredential'],
        credentialSubject: {
          id: user.did,
          birth,
          cardNumber,
          expiryDate,
          cvc,
          cardPassword,
          walletAddress
        }
      },
      proofFormat: 'jwt'
    })

    res.json(vc)
  } catch (err) {
    console.error('VC 발급 실패:', err.message)
    res.status(500).json({ error: 'VC 발급 중 오류 발생' })
  }
})

app.listen(3001, () => {
  console.log('✅ 백엔드 서버 실행: http://localhost:3001')
})
