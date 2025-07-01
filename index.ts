import { createAgent, IDIDManager } from '@veramo/core'
import { KeyManager } from '@veramo/key-manager'
import { KeyDIDProvider } from '@veramo/did-provider-key'
import { DIDManager } from '@veramo/did-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { MemoryPrivateKeyStore } from '@veramo/key-manager'
import { MemoryDIDStore } from '@veramo/did-manager'
import { MemoryKeyStore } from '@veramo/key-manager'

const agent = createAgent<IDIDManager>({
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

//testtesttest
//chainnova123