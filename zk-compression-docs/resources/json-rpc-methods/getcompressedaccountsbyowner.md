---
description: >-
  Retrieve all compressed accounts owned by a specific address. RPC method guide
  with use cases, tips and examples.
---

# getCompressedAccountsByOwner

The`getCompressedAccountsByOwner` RPC method returns all compressed accounts owned by a specific address, with support for filtering, pagination, and data slicing.

{% hint style="info" %}
You can test this method via the OpenAPI example or custom examples below.
{% endhint %}

{% openapi-operation spec="get-compressed-token-balances-by-owner" path="/getCompressedAccountsByOwner" method="post" %}
[OpenAPI get-compressed-token-balances-by-owner](https://raw.githubusercontent.com/helius-labs/photon/refs/heads/main/src/openapi/specs/getCompressedTokenBalancesByOwner.yaml)
{% endopenapi-operation %}

#### Common Use Cases

* **Portfolio Discovery**: Find all compressed accounts for a wallet
* **Token Account Enumeration**: Discover user's compressed token holdings
* **Account Migration**: Identify accounts to migrate from regular to compressed
* **Balance Aggregation**: Calculate total holdings across all accounts

#### Parameters

1. `owner` (PublicKey, required): Base58-encoded public key of the account owner to query compressed accounts for.
2. `options` (object, optional): Configuration object for filtering and pagination:
   * `filters` (array, optional): Array of filter objects to narrow results by specific criteria
   * `dataSlice` (object, optional): Slice of account data to return with `offset` and `length` fields
   * `cursor` (string, optional): Cursor for pagination from previous response to fetch next page
   * `limit` (BN, optional): Maximum number of accounts to return (use `bn()` helper)

**Note**: All options parameters are optional. Without filters, returns all compressed accounts for the owner.

#### Response

The response contains a paginated list of compressed accounts:

* `items` (array): Array of compressed account objects with merkle context
  * `hash` (string): Unique hash identifying the account for merkle proof generation
  * `address` (string, optional): Account address if available
  * `lamports` (number): Account balance in lamports
  * `owner` (string): Public key of the account owner
  * `data` (object): Account data information including discriminator and data hash
  * `tree` (string): Public key of the merkle tree storing this account
  * `leafIndex` (number): Position of account in the merkle tree
  * `seq` (number): Sequence number for account ordering
  * `slotCreated` (number): Slot when account was created
* `cursor` (string | null): Pagination cursor for next batch, null if no more results

#### Developer Tips

* **Pagination Strategy**: Use cursor-based pagination for owners with many accounts to avoid timeouts and ensure consistent results
* **Data Slicing Optimization**: Implement data slicing when you only need account metadata to reduce response size and improve performance
* **Empty Response Handling**: Handle cases gracefully where new addresses have no compressed accounts - this is normal behavior
* **Caching Considerations**: Cache results appropriately as compressed account states can change with each transaction
* **Batch Size**: Start with smaller batch sizes (50-100) and adjust based on response times and data needs

#### Troubleshooting

<details>

<summary>"No accounts found"</summary>

**Owner has no compressed accounts**

This is normal for new addresses or those that haven't used compression:

```typescript
const accounts = await rpc.getCompressedAccountsByOwner(owner);

if (accounts.items.length === 0) {
    console.log("No compressed accounts found for this owner");
    console.log("Create compressed accounts first using createAccountWithLamports or token operations");
}
```

</details>

<details>

<summary>"Request timeout with large responses"</summary>

**Too many accounts returned at once**

Use pagination and data slicing to reduce response size:

```typescript
const accounts = await rpc.getCompressedAccountsByOwner(owner, {
    limit: bn(50),        // Smaller batch size
    dataSlice: {          // Reduce data per account
        offset: 0,
        length: 10
    }
});
```

</details>

#### Examples

The below examples work - just make sure you installed the dependencies.

<details>

<summary>Dependencies &#x26; Setup</summary>

```bash
npm install @lightprotocol/stateless.js @solana/web3.js
```

**For Rust examples**: Requires `light-client`, `solana-sdk`, `anyhow`, and `tokio` crates. See Rust example comments for setup details.

</details>

**Example: Get All Compressed Accounts**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { createRpc, Rpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const rpc: Rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

async function getAllCompressedAccounts() {
    const owner = new PublicKey('OWNER_ADDRESS_HERE');
    const result = await rpc.getCompressedAccountsByOwner(owner);
    
    console.log(`Found ${result.items.length} compressed accounts`);
    
    result.items.forEach((account, index) => {
        console.log(`Account ${index + 1}:`);
        console.log(`  Hash: ${account.hash.toString()}`);
        console.log(`  Lamports: ${account.lamports.toString()}`);
        console.log(`  Owner: ${account.owner.toBase58()}`);
    });
    
    return result;
}

getAllCompressedAccounts();
```
{% endtab %}

{% tab title="cURL" %}
```bash
curl -X POST https://devnet.helius-rpc.com?api-key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getCompressedAccountsByOwner",
    "params": {
      "owner": "OWNER_PUBKEY_HERE"
    }
  }'
```
{% endtab %}

{% tab title="Rust" %}
{% hint style="info" %}
**Rust Client**: `light-client` v0.14.0 is available on crates.io. Use `LightClient` for the current stable API.
{% endhint %}

```rust
// Current API: light-client 0.14.0
use light_client::rpc::LightClient;
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    let client = LightClient::new("https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY".to_string()).await?;
    
    // Query compressed accounts by owner
    let owner = Pubkey::from_str("OWNER_PUBKEY_HERE")?;
    
    match client.get_compressed_accounts_by_owner(&owner, None).await? {
        response => {
            println!("Found {} compressed accounts", response.value.items.len());
            
            for (index, account) in response.value.items.iter().enumerate() {
                println!("Account {}:", index + 1);
                println!("  Hash: {}", account.hash);
                println!("  Lamports: {}", account.lamports);
                println!("  Owner: {}", account.owner);
                println!("  Tree: {}", account.tree);
                println!("  Leaf Index: {}", account.leaf_index);
            }
        }
    }

    Ok(())
}
```
{% endtab %}
{% endtabs %}

**Example: Paginated Account Discovery with Balance Aggregation**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { createRpc, bn, Rpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const rpc: Rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

async function getAllAccountsPaginated(owner: PublicKey) {
    let allAccounts = [];
    let cursor = undefined;
    let totalBalance = bn(0);
    const batchSize = 100;
    
    do {
        const batch = await rpc.getCompressedAccountsByOwner(owner, {
            cursor,
            limit: bn(batchSize)
        });
        
        allAccounts.push(...batch.items);
        cursor = batch.cursor;
        
        // Calculate running balance
        batch.items.forEach(account => {
            totalBalance = totalBalance.add(account.lamports);
        });
        
        console.log(`Fetched ${batch.items.length} accounts, total: ${allAccounts.length}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
    } while (cursor);
    
    console.log(`Total compressed accounts: ${allAccounts.length}`);
    console.log(`Total balance: ${totalBalance.toString()} lamports`);
    return { accounts: allAccounts, totalBalance };
}

// Usage
const owner = new PublicKey('OWNER_ADDRESS_HERE');
getAllAccountsPaginated(owner);
```
{% endtab %}
{% endtabs %}

**Example: Filter by Data Slice**

```typescript
import { createRpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const rpc = createRpc("https://devnet.helius-rpc.com?api-key=<your-api-key>");
const owner = new PublicKey("OWNER_PUBKEY_HERE");

async function getAccountsWithDataSlice() {
    const accounts = await rpc.getCompressedAccountsByOwner(owner, {
        dataSlice: {
            offset: 0,
            length: 32  // First 32 bytes only
        }
    });
    
    console.log(`Found ${accounts.items.length} accounts with data slice`);
    
    accounts.items.forEach((account, index) => {
        console.log(`Account ${index + 1}:`);
        console.log(`  Hash: ${account.hash.toString()}`);
        console.log(`  Data length: ${account.data?.data?.length || 0} bytes`);
    });
    
    return accounts;
}

getAccountsWithDataSlice();
```
