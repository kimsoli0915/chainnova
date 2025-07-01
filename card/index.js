const { createAgent } = require('@veramo/core')
const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = require('@veramo/key-manager')
const { DIDManager, MemoryDIDStore } = require('@veramo/did-manager')
const { KeyDIDProvider } = require('@veramo/did-provider-key')
const { KeyManagementSystem } = require('@veramo/kms-local')
const { CredentialIssuer } = require('@veramo/credential-w3c')

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

async function main() {
  const identifier = await agent.didManagerCreate()
  console.log('✅ 생성된 DID:', identifier.did)

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: identifier.did },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: identifier.did,
        name: '홍길동',
        age: 30,
      }
    },
    proofFormat: 'jwt',
  })

  console.log('✅ 발급된 VC:', verifiableCredential)
}

main()
