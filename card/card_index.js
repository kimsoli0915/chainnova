const express = require('express')
const cors = require('cors')
const { ethers } = require('ethers')
<<<<<<< HEAD
=======
const crypto = require('crypto') // SHA256 해시를 위한 모듈
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2

const { createAgent } = require('@veramo/core')
const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = require('@veramo/key-manager')
const { DIDManager, MemoryDIDStore } = require('@veramo/did-manager')
const { KeyDIDProvider } = require('@veramo/did-provider-key')
const { KeyManagementSystem } = require('@veramo/kms-local')
const { CredentialIssuer } = require('@veramo/credential-w3c')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

<<<<<<< HEAD
// Veramo 에이전트
=======
// Veramo 에이전트 설정
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
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
        'did:key': new KeyDIDProvider({ defaultKms: 'local' })
      }
    }),
    new CredentialIssuer()
  ]
})

// VC 발급 API
app.post('/issue-vc', async (req, res) => {
  const { birth, cardNumber, expiryDate, cvc, cardPassword, signature, userAddress } = req.body

  try {
<<<<<<< HEAD
=======
    // 클라이언트가 서명한 원본 메시지
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
    const message = JSON.stringify({ birth, cardNumber, expiryDate, cvc, cardPassword })

    // MetaMask 서명 검증
    const recoveredAddress = ethers.verifyMessage(message, signature)
    if (!recoveredAddress || recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(400).json({ error: '서명 불일치' })
    }
<<<<<<< HEAD

    // issuer DID 생성
    const issuer = await agent.didManagerCreate()

    // VC 생성
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
          userSignature: signature
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

=======

    // issuer DID 생성
    const issuer = await agent.didManagerCreate()

    // VC 생성
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
          userSignature: signature
        }
      },
      proofFormat: 'jwt'
    })

    // 생성된 VC의 SHA256 해시값 생성
    const vcHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(vc))
      .digest('hex')

    // VC와 VC 해시 함께 반환
    res.json({ vc, vcHash })

  } catch (err) {
    console.error('VC 발급 실패:', err)
    res.status(500).json({ error: 'VC 발급 중 오류 발생' })
  }
})

app.listen(3001, () => {
  console.log('✅ 백엔드 서버 실행: http://localhost:3001')
})
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
