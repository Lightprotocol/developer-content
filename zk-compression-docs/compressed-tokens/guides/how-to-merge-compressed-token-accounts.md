---
description: >-
  Complete guide to merge multiple compressed token accounts into a single
  account with `mergeTokenAccounts()`, troubleshooting and advanced
  configurations.
---


The `mergeTokenAccounts()` function consolidates multiple compressed accounts of the same mint into a single compressed account.

The function

1. consumes multiple input compressed token accounts (up to 8 accounts), and
2. creates a single output compressed account with combined balance for the owner.

Before we merge compressed accounts, we need

* multiple compressed token accounts of the same mint owned by the same wallet, and
* SPL mint registered with the compressed token program via `createMint()` or `createTokenPool()`.

{% hint style="success" %}
State trees where compressed account's are stored, are append only. `mergeTokenAccounts()` reduces account fragmentation to simplify balance calculations from `getCompressedTokenAccountsByOwner`
{% endhint %}

{% code title="function-merge-accounts.ts" %}
```typescript
import { mergeTokenAccounts } from '@lightprotocol/compressed-token';
import { Keypair, PublicKey } from '@solana/web3.js';

const mint = new PublicKey("YOUR_MINT_ADDRESS");
const owner = payer;

// Combines multiple compressed token accounts into single compressed account
const transactionSignature = await mergeTokenAccounts(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    owner,
);
```
{% endcode %}

### Full Code Example

{% stepper %}
{% step %}
#### Prerequisites

Make sure you have dependencies and developer environment set up!

<details>

<summary>Prerequisites &#x26; Setup</summary>

#### Dependencies

```bash
npm install --save-dev typescript tsx @types/node && \
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

**Alternatives:**

```bash
yarn add --dev typescript tsx @types/node && \
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

```bash
pnpm add --save-dev typescript tsx @types/node && \
pnpm add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

#### Developer Environment

By default, this guide uses Localnet.

```bash
# Install the development CLI
npm install @lightprotocol/zk-compression-cli
```

```bash
# Start a local test validator
light test-validator

## ensure you have the Solana CLI accessible in your system PATH 
```

```typescript
// createRpc() defaults to local test validator endpoints
import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

const connection: Rpc = createRpc();

async function main() {
  let slot = await connection.getSlot();
  console.log(slot);

  let health = await connection.getIndexerHealth(slot);
  console.log(health);
  // "Ok"
}

main();
```

**Alternative: Using Devnet**

Follow these steps to develop create an RPC Connection. Replace `<your_api_key>` with your API key before running.

{% hint style="info" %}
[Get your API key here](https://www.helius.dev/zk-compression), if you don't have one yet.
{% endhint %}

```typescript
import { createRpc } from "@lightprotocol/stateless.js";

// Helius exposes Solana and Photon RPC endpoints through a single URL
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<your_api_key>";
const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

console.log("Connection created!");
console.log("RPC Endpoint:", RPC_ENDPOINT);
```

</details>
{% endstep %}

{% step %}
#### Merging Compressed Accounts

Run this script to merge multiple compressed token accounts into one!

<pre class="language-typescript" data-title="merge-compressed-accounts.ts" data-overflow="wrap"><code class="lang-typescript">// 1: Setup funded payer and connect to local validator
// 2. Create mint and multiple compressed accounts  
// 3. Call mergeTokenAccounts() to consolidate multiple compressed accounts to one output
// 4. Use getCompressedTokenAccountsByOwner() to query account states before and after merge

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { 
    createMint, 
    mintTo, 
    mergeTokenAccounts 
} from '@lightprotocol/compressed-token';

async function mergeCompressedAccounts() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL mint with token pool for compression
    const { mint } = await createMint(rpc, payer, payer.publicKey, 9);
    console.log("SPL Mint with token pool created:", mint.toBase58());

    const tokenOwner = Keypair.generate();
    const amounts = [300_000_000, 200_000_000, 500_000_000]; // 0.3, 0.2, 0.5 tokens
    
    console.log("Creating multiple compressed accounts...");
    
    for (let i = 0; i &#x3C; amounts.length; i++) {
        await mintTo(
            rpc,
            payer,
            mint, // SPL mint with token pool for compression
            tokenOwner.publicKey,// recipient address (toPubkey parameter)
            payer, // mint authority
            amounts[i],
        );
    }

    // Step 2a: Get all compressed accounts before merging
    const accountsBefore = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );

    console.log("Number of accounts before merge:", accountsBefore.items.length);
    
    // Step 2b: Calculate total balance across all compressed accounts
    const totalBalance = accountsBefore.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new (require('bn.js'))(0)
    );
    console.log("Total balance:", totalBalance.toNumber() / 1_000_000_000, "tokens");

    accountsBefore.items.forEach((account, index) => {
        console.log(`Account ${index + 1}:`, account.parsed.amount.toNumber() / 1_000_000_000, "tokens");
    });

<strong>    // Step 3: Call mergeTokenAccounts() to consolidate into single account
</strong><strong>    // Nullify old compressed accounts and create one with combined balance
</strong><strong>    const mergeTx = await mergeTokenAccounts(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // SPL mint with token pool for compression
</strong><strong>        tokenOwner,
</strong><strong>    );
</strong>
    console.log("\nMerge Compressed Accounts...");
    console.log("Transaction:", mergeTx);

    // Step 4: Verify merge results - check single compressed account contains total balance
    const accountsAfter = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );

    console.log("Number of accounts after merge:", accountsAfter.items.length);
    
    if (accountsAfter.items.length > 0) {
        const mergedBalance = accountsAfter.items[0].parsed.amount;
        console.log("Merged account balance:", mergedBalance.toNumber() / 1_000_000_000, "tokens");
    }


    return { 
        mint,
        tokenOwner,
        mergeTransaction: mergeTx,
        accountsBefore: accountsBefore.items.length,
        accountsAfter: accountsAfter.items.length
    };

}

mergeCompressedAccounts().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
**Success!**

You've merged multiple compressed token accounts. The output shows:

* **Account consolidation**: Multiple accounts merged into a single account
* **Unified Balance**: Total account balance maintained across the merge
{% endstep %}
{% endstepper %}

### Troubleshooting

<details>

<summary>"No compressed token accounts found"</summary>

The owner has no compressed token accounts for the specified mint:

```typescript
// Check if accounts exist before merging
const accounts = await rpc.getCompressedTokenAccountsByOwner(
    owner.publicKey,
    { mint }
);

if (accounts.items.length === 0) {
    console.log("No compressed token accounts found for this mint");
    console.log("Mint address:", mint.toBase58());
    console.log("Owner address:", owner.publicKey.toBase58());
    return;
}

console.log(`Found ${accounts.items.length} accounts to merge`);
```

</details>

### Advanced Configuration

<details>

<summary>Conditional Merging</summary>

```typescript
// Get account count
const accounts = await rpc.getCompressedTokenAccountsByOwner(
    owner.publicKey,
    { mint }
);

// Only merge if more than 2 accounts
if (accounts.items.length > 2) {
    console.log(`Merging ${accounts.items.length} accounts...`);
    
    const mergeTx = await mergeTokenAccounts(
        rpc,
        payer,
        mint,
        tokenOwner,
    );
    
    console.log("Merge completed:", mergeTx);
} else {
    console.log("Merge not needed - optimal account structure");
}
```

</details>

<details>

<summary>Merge Multiple Mints</summary>

```typescript
const mints = [
    new PublicKey("MINT_1_ADDRESS"),
    new PublicKey("MINT_2_ADDRESS"),
];

// Merge accounts for each mint
for (const mint of mints) {
    console.log(`Merging accounts for mint: ${mint.toBase58()}`);
    
    const mergeTx = await mergeTokenAccounts(
        rpc,
        payer,
        mint,
        tokenOwner,
    );
    
    console.log(`Merge completed: ${mergeTx}`);
}
```

</details>

### Next Steps

Learn how to create additional compressed token pools for your SPL mint to increase write-lock limits.

{% content-ref url="how-to-create-compressed-token-pools-for-mint-accounts.md" %}
[how-to-create-compressed-token-pools-for-mint-accounts.md](how-to-create-compressed-token-pools-for-mint-accounts.md)
{% endcontent-ref %}
