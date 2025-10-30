---
description: >-
  Retrieve compressed account information by address or hash. RPC method guide
  with use cases, tips and examples.
---


The `getCompressedAccount` RPC method retrieves information about a specific compressed account using either its address or hash. Information includes the compressed account state, balance, and metadata.

{% hint style="info" %}
You can test this methods via the OpenAPI example or custom examples below.
{% endhint %}

{% openapi-operation spec="get-compressed-token-balances-by-owner" path="/getCompressedAccount" method="post" %}
[OpenAPI get-compressed-token-balances-by-owner](https://raw.githubusercontent.com/helius-labs/photon/refs/heads/main/src/openapi/specs/getCompressedTokenBalancesByOwner.yaml)
{% endopenapi-operation %}

#### Common Use Cases

* **Checking Compressed Account Balance:** Retrieve the lamport balance of any compressed account.
* **Verifying Account Existence:** Check if a compressed account exists and has been initialized with data or lamports.
* **Inspecting Compressed Account Data:** Access the stored data within a compressed account, including program-specific state.
* **Identifying Account Owner:** Determine which program owns a compressed account to understand how its data should be interpreted.
* **Merkle Tree Information:** Get the merkle tree context including leaf index and sequence number for proof generation.

#### Parameters

1. `address` (string, optional): The base-58 encoded address of the compressed account to query.
2. `hash` (string, optional): The base-58 encoded 32-byte hash of the compressed account.

**Note:** Either `address` OR `hash` must be provided, but not both. If neither is provided, the request will fail.

#### Response

Returns compressed account information directly, or null if account not found:

* `hash` (string): The 32-byte hash of the compressed account as a base-58 string.
* `owner` (string): The base-58 encoded public key of the program that owns this account.
* `lamports` (number): The number of lamports owned by the account.
* `tree` (string): The public key of the merkle tree storing this account.
* `leafIndex` (number): The leaf index of this account in the merkle tree.
* `seq` (number): The sequence number of this account.
* `slotCreated` (number): The slot when this account was created.
* `data` (object, optional): The account data object containing:
  * `discriminator` (BN): The account discriminator as BN object.
  * `data` (string): Base64 encoded account data.
  * `dataHash` (string): The 32-byte hash of the account data.

#### Developer Tips

* **Address vs Hash**: Use `address` when you know the account's derived address, and `hash` when you have the specific hash from a previous query or transaction
* **Hash Format**: When using the `hash` parameter, pass the hash value directly as returned from other RPC methods (like `getCompressedAccountsByOwner`). Hash values must be used immediately after retrieval for accurate results
* **Error Handling**: Always check if the returned value is `null` before accessing account properties, as the account may not exist
* **Merkle Context**: The returned `leafIndex`, `tree`, and `seq` fields are crucial for generating merkle proofs when updating or transferring compressed accounts
* **Data Interpretation**: The `data` field contains program-specific information. Use the `discriminator` to identify the account type and parse the `data` accordingly
* **Rate Limits**: Be mindful of RPC rate limits when making frequent queries. Consider batching requests when possible
* **Hash Verification**: The `dataHash` field allows you to verify the integrity of the account data without storing the full data on-chain

#### Examples

The below examples work - just make sure you installed the dependencies.

<details>

<summary>Dependencies &#x26; Setup</summary>

```bash
npm install @lightprotocol/stateless.js @solana/web3.js
```

**For Rust examples**: Create a Cargo project with these dependencies in `Cargo.toml`:

```toml
[dependencies]
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
solana-sdk = "1.18"
# light-client = "0.1"  # Add when available
serde_json = "1.0"
```

</details>

**Example: Fetching Compressed Account by Address**

Let's fetch information for a compressed account using its address.

{% tabs %}
{% tab title="cURL" %}
```bash
curl -X POST https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getCompressedAccount",
    "params": {
      "address": "11111113R2cuenjG5nFubqX9Wzuukdin2YfGQVzu5"
    }
  }'
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
import { Rpc, createRpc, createBN254, BN254, CompressedAccountWithMerkleContext } from '@lightprotocol/stateless.js';

async function getCompressedAccountInfo(): Promise<void> {
  const rpc: Rpc = createRpc(
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
  );

  try {
    // Query by address
    const address: BN254 = createBN254('11111113R2cuenjG5nFubqX9Wzuukdin2YfGQVzu5', 'base58');
    const accountInfo: CompressedAccountWithMerkleContext | null = 
      await rpc.getCompressedAccount(address);

    if (!accountInfo) {
      console.log('Compressed account not found.');
      return;
    }

    console.log('Compressed Account Info:', {
      hash: accountInfo.hash,
      owner: accountInfo.owner,
      lamports: accountInfo.lamports,
      tree: accountInfo.tree,
      leafIndex: accountInfo.leafIndex,
      sequence: accountInfo.seq,
      slotCreated: accountInfo.slotCreated,
      dataHash: accountInfo.data?.dataHash,
    });
  } catch (error: unknown) {
    console.error('Error fetching compressed account:', error);
  }
}

getCompressedAccountInfo();
```
{% endtab %}

{% tab title="Rust" %}
{% hint style="info" %}
**Rust Client**: `light-client` v0.14.0 is available on crates.io. Use `LightClient` for the current stable API.
{% endhint %}

```rust
// Current API: light-client 0.14.0
use light_client::rpc::LightClient;
use solana_sdk::bs58;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    let client = LightClient::new("https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY".to_string()).await?;
    
    // Query compressed account by address
    let address = "11111113R2cuenjG5nFubqX9Wzuukdin2YfGQVzu5";
    
    match client.get_compressed_account(Some(address), None).await? {
        Some(account_info) => {
            println!("Compressed Account Info:");
            println!("  Hash: {}", account_info.hash);
            println!("  Owner: {}", account_info.owner);
            println!("  Lamports: {}", account_info.lamports);
            println!("  Tree: {}", account_info.tree);
            println!("  Leaf Index: {}", account_info.leaf_index);
        }
        None => {
            println!("Compressed account not found.");
        }
    }

    Ok(())
}
```
{% endtab %}
{% endtabs %}

**Example: Fetching Compressed Account by Hash**

You can also query a compressed account using its hash.

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { Rpc, createRpc, bn } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

async function getCompressedAccountByHash(): Promise<void> {
  const rpc: Rpc = createRpc(
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
  );

  try {
    // First, get compressed accounts to obtain a real hash
    const owner = new PublicKey('4LhEEtzAhM6wEXJR2YQHPEs79UEx8e6HncmeHbqbW1w1');
    const accounts = await rpc.getCompressedAccountsByOwner(owner);
    
    if (accounts.items.length === 0) {
      console.log('No compressed accounts found');
      return;
    }

    // Query by hash using a real hash from the first account
    const hash = bn(accounts.items[0].hash);
    const accountInfo = await rpc.getCompressedAccount(undefined, hash);

    if (accountInfo) {
      console.log('Compressed Account Info:', {
        hash: accountInfo.hash,
        owner: accountInfo.owner,
        lamports: accountInfo.lamports,
        tree: accountInfo.tree,
        leafIndex: accountInfo.leafIndex
      });
    } else {
      console.log('Compressed account not found.');
    }
  } catch (error: unknown) {
    console.error('Error:', error);
  }
}

getCompressedAccountByHash();
```
{% endtab %}
{% endtabs %}
