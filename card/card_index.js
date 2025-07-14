const express = require('express')
const cors = require('cors')
const { ethers } = require('ethers')

// Veramo 패키지 임포트
const { createAgent } = require('@veramo/core')
const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = require('@veramo/key-manager')
const { DIDManager, MemoryDIDStore } = require('@veramo/did-manager')
const { KeyDIDProvider } = require('@veramo/did-provider-key')
const { KeyManagementSystem } = require('@veramo/kms-local')
const { CredentialIssuer } = require('@veramo/credential-w3c')

const app = express()
app.use(cors())
app.use(express.json())

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

// VC 발급 API (MetaMask 사용자 서명 검증 구조)
app.post('/issue-vc', async (req, res) => {
  // 1. 프론트에서 모두 받아오기
  const { birth, cardNumber, expiryDate, cvc, cardPassword, signature, userAddress } = req.body

  try {
    // 2. 메시지 구성 (프론트와 완전히 동일하게!)
    const message = JSON.stringify({ birth, cardNumber, expiryDate, cvc, cardPassword })

    // 3. 사용자의 MetaMask 서명 검증
    const recoveredAddress = ethers.verifyMessage(message, signature)
    if (!recoveredAddress || recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(400).send('Invalid user signature')
    }

    // 4. 카드사 DID (issuer)
    // 주의: 실제 서비스에서는 카드사 DID/키를 DB 등에 보관/재사용해야 함!
    const issuer = await agent.didManagerCreate()

    // 5. VC 발급 (사용자 서명도 포함)
    const vc = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'CardCredential'],
        credentialSubject: {
          id: `did:ethr:${userAddress}`,
          birth,
          cardNumber,
          expiryDate,
          cvc,
          cardPassword,
          userSignature: signature   // 사용자 서명 포함!
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
