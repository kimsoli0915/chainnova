const express = require('express')
const cors = require('cors')
const { ethers } = require('ethers')
const crypto = require('crypto')

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

// Veramo agent 생성
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

// VC 발급 및 온체인 등록
app.post('/issue-vc', async (req, res) => {
  const { birth, cardNumber, expiryDate, cvc, cardPassword, signature, userAddress } = req.body

  try {
    const message = JSON.stringify({ birth, cardNumber, expiryDate, cvc, cardPassword })

    // 1. 서명 검증
    const recoveredAddress = ethers.verifyMessage(message, signature)
    if (!recoveredAddress || recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(400).json({ error: '서명 불일치' })
    }

    // 2. DID 발급 (임시)
    const issuer = await agent.didManagerCreate()

    // 3. VC 생성
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

    // 4. SHA-256 해시 생성
    const vcHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(vc))
      .digest('hex')

    // 5. 스마트 컨트랙트에 해시 등록
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" // 배포 주소
    const contractABI = [
      "function registerVC(bytes32 vcHash) external",
      "function isVCRegistered(bytes32 vcHash) view returns (bool)"
    ]

    const provider = new ethers.JsonRpcProvider("http://localhost:8545")

    // ✅ Hardhat 테스트용 계정의 개인키 사용
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    const signer = new ethers.Wallet(privateKey, provider)

    const contract = new ethers.Contract(contractAddress, contractABI, signer)

    const vcHashBytes32 = "0x" + vcHash // bytes32로 변환
    const tx = await contract.registerVC(vcHashBytes32)
    await tx.wait()

    console.log("✅ VC 해시 온체인 등록 완료:", tx.hash)

    await fetch('http://localhost:3002/verify-vc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vc })
    })

    // 6. VC와 해시 응답
    res.json({ vc, vcHash })

  } catch (err) {
    console.error('VC 발급 실패:', err.message, err.stack)
    res.status(500).json({ error: 'VC 발급 중 오류 발생' })
  }
})

app.listen(3001, () => {
  console.log('✅ 백엔드 서버 실행: http://localhost:3001')
})
