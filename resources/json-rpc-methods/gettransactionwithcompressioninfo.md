---
description: >-
  Retrieve the transaction data for the transaction with the given signature
  along with parsed compression info. RPC method guide with use cases, tips and
  examples.
---

# getTransactionWithCompressionInfo

The`getTransactionWithCompressionInfo` RPC method returns transaction data along with compression information showing which compressed accounts were opened (created) and closed (consumed) during the transaction. This method helps with transaction analysis, account lifecycle tracking, and debugging of compression operations.

{% hint style="info" %}
You can test this method via the OpenAPI example or [custom examples below](gettransactionwithcompressioninfo.md#examples).
{% endhint %}

{% openapi-operation spec="get-compression-signatures-for-account" path="/getTransactionWithCompressionInfo" method="post" %}
[OpenAPI get-compression-signatures-for-account](https://raw.githubusercontent.com/helius-labs/photon/refs/heads/main/src/openapi/specs/getCompressionSignaturesForAccount.yaml)
{% endopenapi-operation %}

### Common Use Cases

* **Transaction Analysis**: Understand what compressed accounts were affected by a transaction
* **Account Lifecycle Tracking**: Monitor when compressed accounts are created and consumed
* **Debugging**: Identify which accounts changed during failed or unexpected transactions
* **Audit Trails**: Track compressed account state changes for compliance

### Parameters

1. `signature` (string, required): Base58-encoded transaction signature to query compression information for.

**Note**: Only transactions involving compressed accounts will return compression data. Regular Solana transactions return null.

### Response

The response contains compression information and transaction data, or null if transaction not found:

* `compressionInfo` (object): Contains details about compressed account changes
  * `closedAccounts` (array): Compressed accounts consumed (spent) in this transaction
    * `account` (object): Complete compressed account data with merkle context
    * `maybeTokenData` (object | null): Token data if this is a compressed token account
  * `openedAccounts` (array): New compressed accounts created in this transaction
    * `account` (object): Complete compressed account data with merkle context
    * `maybeTokenData` (object | null): Token data if this is a compressed token account
  * `preTokenBalances` (array, optional): Token balances before transaction
    * `owner` (PublicKey): Public key of token account owner
    * `mint` (PublicKey): Public key of token mint
    * `amount` (BN): Token amount as BN object
  * `postTokenBalances` (array, optional): Token balances after transaction
    * `owner` (PublicKey): Public key of token account owner
    * `mint` (PublicKey): Public key of token mint
    * `amount` (BN): Token amount as BN object
* `transaction` (object): Standard Solana transaction data

### Developer Tips

* **Compression-only**: This method only works with transactions that involve compressed accounts
* **Real signatures required**: Use actual transaction signatures from compression operations
* **Account lifecycle**: opened = created, closed = consumed/spent in the transaction
* **Token data**: maybeTokenData is null for regular compressed accounts, populated for token accounts
* **Balance tracking**: Use pre/postTokenBalances for detailed token amount changes
* **State analysis**: Compare opened vs closed accounts to understand transaction effects

### Troubleshooting

<details>

<summary>"Transaction not found"</summary>

**Invalid or non-existent transaction signature**

Verify the signature format and check transaction existence:

```typescript
const result = await connection.getTransactionWithCompressionInfo(signature);

if (!result) {
    console.log('Transaction not found or contains no compression operations');
}
```

</details>

<details>

<summary>"No compression info"</summary>

**Transaction exists but has no compression data**

This method only returns data for transactions involving compressed accounts:

```typescript
const result = await connection.getTransactionWithCompressionInfo(signature);

if (!result) {
    console.log('Transaction does not involve compressed accounts');
    console.log('Use regular getTransaction for non-compression transactions');
}
```

</details>

<details>

<summary>"Empty account arrays"</summary>

**Transaction has compression info but no account changes shown**

Some compression operations may not create/consume accounts:

```typescript
const { compressionInfo } = result;

if (compressionInfo.openedAccounts.length === 0 && 
    compressionInfo.closedAccounts.length === 0) {
    console.log('Compression transaction with no visible account changes');
    console.log('May be a proof verification or state update operation');
}
```

</details>

### Examples

The below examples work - just make sure you installed the dependencies.

<details>

<summary>Dependencies &#x26; Setup</summary>

```bash
npm install @lightprotocol/stateless.js
```

</details>

#### Example: Analyze Transaction

{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { createRpc, Rpc, CompressedTransaction } from '@lightprotocol/stateless.js';

const rpc: Rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

async function analyzeTransactionCompression(): Promise<void> {
    const signature: string = 'TRANSACTION_SIGNATURE_HERE';
    
    const result: CompressedTransaction | null = 
        await rpc.getTransactionWithCompressionInfo(signature);
    
    if (!result) {
        console.log('Transaction not found or has no compression info');
        return;
    }
    
    const { compressionInfo } = result;
    
    console.log('Transaction Compression Summary:', {
        openedCount: compressionInfo.openedAccounts.length,
        closedCount: compressionInfo.closedAccounts.length,
        hasTokenBalances: !!(compressionInfo.preTokenBalances || compressionInfo.postTokenBalances)
    });
    
    // Type-safe account analysis
    compressionInfo.closedAccounts.forEach((entry, index) => {
        console.log(`Closed Account ${index + 1}:`, {
            hash: entry.account.hash.toString(),
            lamports: entry.account.lamports.toString(),
            hasTokenData: !!entry.maybeTokenData
        });
    });
    
    compressionInfo.openedAccounts.forEach((entry, index) => {
        console.log(`Opened Account ${index + 1}:`, {
            hash: entry.account.hash.toString(), 
            lamports: entry.account.lamports.toString(),
            hasTokenData: !!entry.maybeTokenData
        });
    });
}

analyzeTransactionCompression();
```
{% endtab %}

{% tab title="cURL" %}
```bash
curl -X POST https://devnet.helius-rpc.com?api-key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getTransactionWithCompressionInfo",
    "params": {
      "signature": "TRANSACTION_SIGNATURE_HERE"
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
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    let client = LightClient::new("https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY".to_string()).await?;
    
    // Analyze compression transaction
    let signature = "TRANSACTION_SIGNATURE_HERE";
    
    match client.get_transaction_with_compression_info(signature).await? {
        Some(result) => {
            let compression_info = &result.compression_info;
            
            println!("Compression Analysis:");
            println!("  Accounts opened: {}", compression_info.opened_accounts.len());
            println!("  Accounts closed: {}", compression_info.closed_accounts.len());
            
            // Show account details
            for (i, entry) in compression_info.opened_accounts.iter().enumerate() {
                println!("  Opened Account {}:", i + 1);
                println!("    Hash: {}", entry.account.hash);
                println!("    Lamports: {}", entry.account.lamports);
            }
        }
        None => {
            println!("Transaction not found or has no compression info");
        }
    }

    Ok(())
}
```
{% endtab %}
{% endtabs %}

#### Example: Track Token Balance Changes

```typescript
async function trackTokenBalanceChanges(): Promise<void> {
    const connection = createRpc(
        'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
        'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
    );
    
    const signature = 'TOKEN_TRANSACTION_SIGNATURE_HERE';
    
    const result = await connection.getTransactionWithCompressionInfo(signature);
    
    if (!result) {
        console.log('Transaction not found');
        return;
    }
    
    const { compressionInfo } = result;
    
    // Analyze token balance changes if available
    if (compressionInfo.preTokenBalances && compressionInfo.postTokenBalances) {
        console.log('Token Balance Changes:');
        
        compressionInfo.preTokenBalances.forEach((preBalance, index) => {
            const postBalance = compressionInfo.postTokenBalances![index];
            const change = postBalance.amount.sub(preBalance.amount);
            
            if (!change.isZero()) {
                console.log(`  Owner: ${preBalance.owner.toBase58()}`);
                console.log(`  Mint: ${preBalance.mint.toBase58()}`);
                console.log(`  Change: ${change.toString()}`);
            }
        });
    } else {
        console.log('No token balance data available for this transaction');
    }
    
    // Analyze token accounts in opened/closed arrays
    const tokenAccountsOpened = compressionInfo.openedAccounts.filter(
        entry => entry.maybeTokenData !== null
    );
    
    const tokenAccountsClosed = compressionInfo.closedAccounts.filter(
        entry => entry.maybeTokenData !== null
    );
    
    console.log(`Token accounts opened: ${tokenAccountsOpened.length}`);
    console.log(`Token accounts closed: ${tokenAccountsClosed.length}`);
    
    return {
        tokenAccountsOpened: tokenAccountsOpened.length,
        tokenAccountsClosed: tokenAccountsClosed.length
    };
}

trackTokenBalanceChanges();
```
