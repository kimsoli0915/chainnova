// 환경설정 & 기본 의존성 로딩
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express')
const cors = require('cors')
const { ethers } = require('ethers')
const crypto = require('crypto')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

// Veramo 관련 모듈 로딩 (DID/키/VC 발급 플러그인)
const { createAgent } = require('@veramo/core')
const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = require('@veramo/key-manager') // 키 생성/저장/회전 담당
const { DIDManager, MemoryDIDStore } = require('@veramo/did-manager') // DID 생성·관리
const { KeyDIDProvider } = require('@veramo/did-provider-key') // did:key를 실제로 만들 때 사용하는 Provider
const { KeyManagementSystem } = require('@veramo/kms-local')
const { CredentialIssuer } = require('@veramo/credential-w3c') // VC 발급 기능을 제공

// 브라우저에서 들어오는 모든 요청이 정상적으로 읽히고, 처리될 수 있는 서버 만드는 과정 
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
  const { userAddress, signature } = req.body

  try {
    const message = JSON.stringify({ userAddress })

    // 1. 서명 검증
    const recoveredAddress = ethers.verifyMessage(message, signature)
    if (!recoveredAddress || recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(400).json({ error: '서명 불일치' })
    }

    // 2. DID 발급 (임시)
    const issuer = await agent.didManagerCreate()

    // 3. 만료일 설정 (5분)
    const expirationDate = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // 4. VC 생성
    const vc = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        expirationDate: expirationDate, 
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'CardCredential'],
        credentialSubject: {
          id: `did:ethr:${userAddress}`,
          paymentPurpose: "ChainNova 서비스 결제에 동의함",
          allowedUse: "once"
        }
      },
      proofFormat: 'jwt'
    })

    console.log("발급된 VC 전체:\n", JSON.stringify(vc, null, 2));
    // 5. SHA-256 해시 생성
    const vcHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(vc))
      .digest('hex')

    // 6. 스마트 컨트랙트에 해시 등록
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    const contractABI = [
      "function registerVC(bytes32 vcHash) external",
      "function isVCRegistered(bytes32 vcHash) view returns (bool)"
    ]

    if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.");
    }

    const provider = new ethers.JsonRpcProvider("http://localhost:8545")
    const privateKey = process.env.PRIVATE_KEY
    const signer = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(contractAddress, contractABI, signer)

    const vcHashBytes32 = "0x" + vcHash
    const tx = await contract.registerVC(vcHashBytes32)
    await tx.wait()

    console.log("✅ VC 해시 온체인 등록 완료:", tx.hash)

    // 7. 서비스 제공자에게 VC 전송
    await fetch('http://localhost:3002/verify-vc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vc })
    })

    // 8. VC와 해시 응답
    res.json({ vc, vcHash })

  } catch (err) {
    console.error('VC 발급 실패:', err.message, err.stack)
    res.status(500).json({ error: 'VC 발급 중 오류 발생' })
  }
})

app.listen(3001, () => {
  console.log('✅ 카드사 백엔드 실행: http://localhost:3001')
})
