const { createAgent } = require('@veramo/core')
const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = require('@veramo/key-manager')
const { KeyDIDProvider } = require('@veramo/did-provider-key')
const { DIDManager, MemoryDIDStore } = require('@veramo/did-manager')
const { KeyManagementSystem } = require('@veramo/kms-local')

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
    })
  ]
})

async function main() {
  const identifier = await agent.didManagerCreate()
  console.log('✅ 생성된 DID:', identifier.did)
}

main()
