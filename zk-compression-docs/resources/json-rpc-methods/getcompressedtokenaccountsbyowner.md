---
description: >-
  Retrieve compressed token accounts owned by a specific address. RPC method
  guide with use cases, tips and examples.
---

# getCompressedTokenAccountsByOwner

The`getCompressedTokenAccountsByOwner` RPC method retrieves all compressed token accounts owned by a specific public key. The method supports mint filtering to query specific tokens, cursor-based pagination for handling large result sets, and returns parsed token data with merkle context for verification.

{% hint style="info" %}
You can test this method via the OpenAPI example or custom examples below.
{% endhint %}

{% openapi-operation spec="get-compressed-token-balances-by-owner" path="/getCompressedTokenAccountsByOwner" method="post" %}
[OpenAPI get-compressed-token-balances-by-owner](https://raw.githubusercontent.com/helius-labs/photon/refs/heads/main/src/openapi/specs/getCompressedTokenBalancesByOwner.yaml)
{% endopenapi-operation %}

#### Common Use Cases

* **Token Portfolio Display**: Show all compressed tokens owned by a wallet address
* **Balance Aggregation**: Calculate total token holdings across multiple compressed accounts
* **Token Transfer Setup**: Find available token accounts to use as transfer sources
* **Wallet Integration**: Support compressed token discovery in wallet interfaces
* **DeFi Protocol Integration**: Query user token holdings for lending, trading, or staking

#### Parameters

1. `owner` (PublicKey, required): Base58-encoded public key of the account owner to query token accounts for.
2. `options` (object, optional): Configuration object containing filtering and pagination parameters:
   * `mint` (PublicKey, optional): Base58-encoded mint address to filter results by specific token
   * `cursor` (string, optional): Pagination cursor from previous response for fetching next page
   * `limit` (BN, optional): Maximum number of accounts to return (use `bn()` helper function)

**Note**: All parameters are optional within the options object. Without filters, returns all compressed token accounts for the owner.

#### Response

The response contains a paginated list of compressed token accounts:

* `items` (array): Array of compressed token account objects
  * `compressedAccount` (object): Compressed account data and merkle proof context
    * `address` (string): Compressed account address (if available)
    * `owner` (string): Account owner public key
    * `lamports` (number): Account lamports
    * `data` (object): Account data information
    * `hash` (string): Account hash for merkle proof verification
  * `parsed` (object): Parsed token-specific information
    * `mint` (PublicKey): Token mint address
    * `owner` (PublicKey): Token account owner
    * `amount` (BN): Token amount as BN object - use .toString() for exact value
    * `delegate` (PublicKey | null): Delegate address if set, null otherwise
    * `state` (number): Account state (0=initialized, 1=frozen, etc.)
    * `tlv` (Buffer | null): Type-Length-Value extension data if present
* `cursor` (string | null): Pagination cursor for next batch, null if no more results

#### Developer Tips

* **BN Object Handling**: The `amount` field is a BN object - use `.toString()` for exact values or `.toNumber()` for small amounts
* **State Values**: The `state` field is a numeric enum (0=initialized, 1=frozen, etc.) not a string
* **Parameter Types**: Use `bn()` helper function for the `limit` parameter, not raw numbers
* **Pagination**: Use cursor-based pagination for large token portfolios to avoid timeouts
* **Performance**: Filter by mint address when querying specific tokens to reduce response size
* **Empty Responses**: Handle cases where owners have no compressed token accounts gracefully

#### Examples

The below examples work - just make sure you installed the dependencies.

<details>

<summary>Dependencies &#x26; Setup</summary>

```bash
npm install @lightprotocol/stateless.js
```

</details>

**Example: Get All Token Accounts**

{% tabs %}
{% tab title="cURL" %}
```bash
curl -X POST https://devnet.helius-rpc.com?api-key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getCompressedTokenAccountsByOwner",
    "params": {
      "owner": "OWNER_PUBKEY_HERE"
    }
  }'
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
import { createRpc, bn, Rpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const rpc: Rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

async function getAllTokenAccounts(): Promise<void> {
    const owner = new PublicKey('OWNER_ADDRESS_HERE');
    const result = await rpc.getCompressedTokenAccountsByOwner(owner);
    
    console.log(`Found ${result.items.length} compressed token accounts`);
    
    result.items.forEach((account, index) => {
        console.log(`Token Account ${index + 1}:`);
        console.log(`  Mint: ${account.parsed.mint.toBase58()}`);
        console.log(`  Amount: ${account.parsed.amount.toString()}`);
        console.log(`  Owner: ${account.parsed.owner.toBase58()}`);
        console.log(`  State: ${account.parsed.state}`);
    });
    
    return result;
}

getAllTokenAccounts();
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
    
    // Query compressed token accounts by owner
    let owner = Pubkey::from_str("OWNER_PUBKEY_HERE")?;
    
    match client.get_compressed_token_accounts_by_owner(&owner, None).await? {
        response => {
            println!("Found {} compressed token accounts", response.value.items.len());
            
            for (index, account) in response.value.items.iter().enumerate() {
                println!("Token Account {}:", index + 1);
                println!("  Mint: {}", account.parsed.mint);
                println!("  Amount: {}", account.parsed.amount);
                println!("  Owner: {}", account.parsed.owner);
                println!("  State: {}", account.parsed.state);
            }
        }
    }

    Ok(())
}
```
{% endtab %}
{% endtabs %}

**Example: Filter by Specific Token Mint**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { createRpc, bn, Rpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const rpc: Rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

async function getTokenAccountsByMint(): Promise<void> {
    const owner = new PublicKey('OWNER_ADDRESS_HERE');
    const mint = new PublicKey('TOKEN_MINT_HERE');
    
    const result = await rpc.getCompressedTokenAccountsByOwner(owner, {
        mint
    });
    
    if (result.items.length === 0) {
        console.log('No compressed token accounts found for this mint');
        return;
    }
    
    let totalBalance = bn(0);
    result.items.forEach((account, index) => {
        const amount = account.parsed.amount;
        totalBalance = totalBalance.add(amount);
        
        console.log(`Account ${index + 1}:`);
        console.log(`  Amount: ${amount.toString()}`);
        console.log(`  Hash: ${account.compressedAccount.hash}`);
    });
    
    console.log(`Total Balance: ${totalBalance.toString()}`);
    
    return result;
}

getTokenAccountsByMint();
```
{% endtab %}
{% endtabs %}

**Example: Paginated Token Discovery**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { createRpc, bn, Rpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const rpc: Rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

async function getAllTokenAccountsPaginated(owner: PublicKey) {
    let allAccounts = [];
    let cursor = undefined;
    const batchSize = 50; // Smaller batch size for DevNet
    
    do {
        const batch = await rpc.getCompressedTokenAccountsByOwner(owner, {
            cursor,
            limit: bn(batchSize)
        });
        
        allAccounts.push(...batch.items);
        cursor = batch.cursor;
        
        console.log(`Fetched ${batch.items.length} token accounts, total: ${allAccounts.length}`);
        
        // Rate limiting for DevNet
        await new Promise(resolve => setTimeout(resolve, 100));
        
    } while (cursor);
    
    // Group by mint
    const accountsByMint = new Map();
    allAccounts.forEach(account => {
        const mintKey = account.parsed.mint.toBase58();
        if (!accountsByMint.has(mintKey)) {
            accountsByMint.set(mintKey, []);
        }
        accountsByMint.get(mintKey).push(account);
    });
    
    console.log(`Total compressed token accounts: ${allAccounts.length}`);
    console.log(`Unique token mints: ${accountsByMint.size}`);
    
    return { allAccounts, accountsByMint };
}

// Usage
const owner = new PublicKey('OWNER_ADDRESS_HERE');
getAllTokenAccountsPaginated(owner);
```
{% endtab %}
{% endtabs %}

**Example: Calculate Token Portfolio Value**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { createRpc, bn, Rpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const rpc: Rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

async function calculateTokenPortfolio(): Promise<Map<string, any>> {
    const owner = new PublicKey('OWNER_ADDRESS_HERE');
    const tokenAccounts = await rpc.getCompressedTokenAccountsByOwner(owner);
    
    if (tokenAccounts.items.length === 0) {
        console.log('No compressed token accounts found');
        return;
    }
    
    const portfolio = new Map();
    
    tokenAccounts.items.forEach(account => {
        const mintKey = account.parsed.mint.toBase58();
        const amount = account.parsed.amount;
        
        if (portfolio.has(mintKey)) {
            const existing = portfolio.get(mintKey);
            portfolio.set(mintKey, existing.add(amount));
        } else {
            portfolio.set(mintKey, amount);
        }
    });
    
    console.log('Compressed Token Portfolio:');
    portfolio.forEach((balance, mint) => {
        console.log(`  ${mint}: ${balance.toString()}`);
    });
    
    return portfolio;
}

calculateTokenPortfolio();
```
{% endtab %}
{% endtabs %}
