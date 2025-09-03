---
description: >-
  Returns a single ZK Proof used by the compression program to verify that the
  given accounts are valid and the new addresses can be created. Overview to
  method, use cases, examples and developer tips.
---

# getValidityProof

The`getValidityProof` RPC method generates zero-knowledge proofs to verify that the given accounts are valid or the new addresses can be created. This proof is required for any operation on compressed accounts (transfer, approve, decompress, etc.) for on-chain verification.

{% hint style="info" %}
You can test this method via the OpenAPI example or [custom examples below](getvalidityproof.md#examples).
{% endhint %}

{% hint style="info" %}
* Proof limits per request are:
  * `hashes`: 1, 2, 3, 4, or 8
  * `newAddressesWithTrees` : 1, 2
* The `newAddresses` param field is supported but deprecated. Please use `newAddressesWithTrees`instead.
{% endhint %}

{% openapi-operation spec="get-validity-proof" path="/" method="post" %}
[OpenAPI get-validity-proof](https://raw.githubusercontent.com/helius-labs/photon/refs/heads/main/src/openapi/specs/getValidityProof.yaml)
{% endopenapi-operation %}

### Common Use Cases

* **Token Transfers:** Generate proofs required for transferring compressed tokens.
* **Account Operations:** Create proofs needed for any compressed account modification.
* **Batch Processing:** Generate proofs for multiple accounts in a single call.
* **State Tree Verification:** Prove account inclusion in the current state tree.
* **Transaction Building:** Obtain proof data needed for compressed transaction instructions.
* **Program Integration:** Get validity proofs for custom program operations on compressed accounts.

### Parameters

1. `hashes` (BN254\[], required): Array of BN254 objects representing compressed account hashes to generate proofs for.
2. `newAddresses` (BN254\[], optional): Array of BN254 objects representing new addresses to include in the proof for address tree verification.

### Response

The response contains ValidityProofWithContext data:

* `compressedProof` (ValidityProof | null): The compressed validity proof object for zero-knowledge verification
* `roots` (BN\[]): Array of merkle tree roots used in proof generation
* `rootIndices` (number\[]): Array of indices of the roots in the state tree
* `leafIndices` (number\[]): Array of indices of the leaves being proven
* `leaves` (BN\[]): Array of leaf values in the merkle tree
* `treeInfos` (TreeInfo\[]): Array of information about the state trees used
* `proveByIndices` (boolean\[]): Array indicating whether to prove by indices for each element

### Developer Tips

* **Fetch Accounts First**: Always get compressed accounts before generating proofs - you need existing account hashes
* **Batch Processing**: You can generate proofs for multiple accounts in a single call. Allowed counts: 1, 2, 3, 4, or 8 accounts
* **Proof Usage**: The proof is required for any operation that modifies compressed accounts (transfers, burns, etc.)
* **Caching**: Validity proofs are only valid for the current state - don't cache them for long periods
* **Error Handling**: If accounts don't exist or have been modified, proof generation will fail
* **Integration**: Use `proof.compressedProof` and `proof.rootIndices` when building transactions
* **State Changes**: After any transaction, previously generated proofs become invalid for those accounts

### Examples

The below examples work - just make sure you installed the dependencies.

<details>

<summary>Dependencies &#x26; Setup</summary>

```bash
npm install @lightprotocol/stateless.js @solana/web3.js
```

</details>

#### Example: Generate Validity Proof

Generate a validity proof for compressed accounts.

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { Rpc, createRpc, bn } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

async function generateValidityProof(): Promise<void> {
  const connection: Rpc = createRpc(
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
  );

  try {
    // Get compressed accounts
    const owner = new PublicKey('OWNER_PUBLIC_KEY_HERE');
    const accounts = await connection.getCompressedAccountsByOwner(owner);
    
    if (accounts.items.length === 0) {
      console.log('No compressed accounts found');
      return;
    }

    // Generate validity proof
    const hashes = accounts.items.slice(0, 2).map(acc => bn(acc.hash));
    const validityProof = await connection.getValidityProof(hashes);

    console.log('Validity Proof Generated:');
    console.log(`  Accounts: ${hashes.length}`);
    console.log(`  Roots: ${validityProof.roots.length}`);
    console.log(`  Root Indices: ${validityProof.rootIndices.length} elements`);
    console.log(`  Leaf Indices: ${validityProof.leafIndices.length} elements`);
    
    // Ready for use in transactions
    console.log('\nProof ready for compressed transactions');
    
  } catch (error: unknown) {
    console.error('Error generating validity proof:', error);
  }
}

generateValidityProof();
```
{% endtab %}

{% tab title="cURL" %}
```bash
# Use account hashes from getCompressedAccountsByOwner
curl -X POST https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getValidityProof",
    "params": {
      "hashes": [
        "ACCOUNT_HASH_1",
        "ACCOUNT_HASH_2"
      ]
    }
  }'
```
{% endtab %}

{% tab title="Rust" %}
{% hint style="info" %}
**Rust Client**: `light-client` v0.14.0 is available on crates.io. Use `LightClient` for the current stable API.
{% endhint %}

```rust
use light_client::rpc::LightClient;
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    let client = LightClient::new("https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY".to_string()).await?;
    
    // Get compressed accounts first
    let owner = "OWNER_PUBLIC_KEY_HERE";
    let accounts = client.get_compressed_accounts_by_owner(owner).await?;
    
    if accounts.items.is_empty() {
        println!("No compressed accounts found");
        return Ok(());
    }
    
    // Generate validity proof for the accounts
    let hashes: Vec<String> = accounts.items.iter()
        .take(2)
        .map(|acc| acc.hash.clone())
        .collect();
    
    let validity_proof = client.get_validity_proof(hashes.clone()).await?;
    
    println!("Validity Proof Generated:");
    println!("  Accounts: {}", hashes.len());
    println!("  Roots: {}", validity_proof.roots.len());
    println!("  Root Indices: {}", validity_proof.root_indices.len());

    Ok(())
}
```
{% endtab %}
{% endtabs %}

### Example: Proof Generation for Token Transfer

Generate a validity proof for a compressed token transfer operation:

{% tabs %}
{% tab title="JavaScript" %}
```javascript
import { Rpc, createRpc, bn } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

async function generateProofForTransfer() {
  const connection = createRpc(
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
    'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
  );

  try {
    // Get compressed token accounts
    const owner = new PublicKey('OWNER_PUBLIC_KEY_HERE');
    const mint = new PublicKey('TOKEN_MINT_HERE');
    
    const tokenAccounts = await connection.getCompressedTokenAccountsByOwner(
      owner,
      { mint }
    );
    
    if (tokenAccounts.items.length === 0) {
      console.log('No compressed token accounts found');
      return;
    }

    // Generate proof for the token accounts (limit to allowed numbers: 1, 2, 3, 4, or 8)
    const limitedAccounts = tokenAccounts.items.slice(0, 4);
    const hashes = limitedAccounts.map(acc => bn(acc.compressedAccount.hash));
    const validityProof = await connection.getValidityProof(hashes);

    console.log('Validity Proof for Transfer:');
    console.log(`  Token accounts: ${hashes.length}`);
    console.log(`  Roots: ${validityProof.roots.length}`);
    
    // This proof is now ready to use with CompressedTokenProgram.transfer()
    console.log('\nProof ready for token transfer instruction');
    console.log('Use this with:');
    console.log('  recentValidityProof: validityProof.compressedProof');
    console.log('  recentInputStateRootIndices: validityProof.rootIndices');
    
  } catch (error) {
    console.error('Error generating proof:', error);
  }
}

generateProofForTransfer();
```
{% endtab %}
{% endtabs %}

