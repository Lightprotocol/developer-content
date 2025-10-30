---
description: >-
  Complete guide to compress complete SPL Token Accounts with
  `compressSplTokenAccount`, troubleshooting and advanced configurations. Use
  for account migration and to reclaim rent afterwards.
---


The `compressSplTokenAccount` function compresses the balance of an SPL token account, with an optional `remainingAmount` parameter to leave tokens in the original account.

The function

1. Transfer SPL tokens from ATA to token pool account (omnibus account)
2. Create equivalent compressed accounts for the account owner

Before compressing SPL token accounts, you need:

* SPL mint registered with the compressed token program via `createMint()` or `createTokenPool()`
* SPL token account (ATA) with tokens to compress

After compression, empty token accounts can now be closed to reclaim rent with [`closeAccount()`](https://solana.com/developers/cookbook/tokens/close-token-accounts).

{% hint style="success" %}
**Function Difference and Best Practice:**

* `compressSplTokenAccount(tokenAccount, remainingAmount)` compresses the entire SPL token\
  account balance minus optional remaining amount only to the same owner. Use to migrate complete token\
  accounts with optional partial retention.
* `compress(amount, sourceTokenAccount, toAddress)` compresses specific amounts from\
  source to a specified recipient. Use for transfers and precise amounts. [Here is how](how-to-compress-and-decompress-spl-tokens.md).
{% endhint %}

{% code title="function-compress-spl-accounts.ts" %}
```typescript
import { compressSplTokenAccount } from '@lightprotocol/compressed-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { bn } from '@lightprotocol/stateless.js';

const mint = new PublicKey("YOUR_MINT_ADDRESS");
const owner = payer; // Account owner (signer)
const tokenAccount = new PublicKey("YOUR_TOKEN_ACCOUNT_ADDRESS");
const remainingAmount = bn(100_000_000); // Optional: amount to keep uncompressed

// Transfers SPL tokens to omnibus pool and mints compressed tokens,
const transactionSignature = await compressSplTokenAccount(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    owner,
    tokenAccount, // SPL token account to compress
    remainingAmount, // optional amount to keep in SPL format
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

Follow these steps to create an RPC Connection. Replace `<your-api-key>` with your actual API key.

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
#### Compressing SPL Token Accounts

Run this script to compress an entire SPL token account!

<pre class="language-typescript" data-title="compress-spl-token-accounts.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL token account with tokens
// 3. Call compressSplTokenAccount() to convert SPL tokens to compressed format
// 4. Verify results via getTokenAccountBalance and getCompressedTokenAccountsByOwner
// 5. Optional: reclaim rent for empty token accounts

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc, bn } from '@lightprotocol/stateless.js';
import { 
    createMint, 
    compressSplTokenAccount 
} from '@lightprotocol/compressed-token';
import { 
    createAssociatedTokenAccount,
    mintTo,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID 
} from '@solana/spl-token';

async function compressSplTokenAccounts() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL token account with tokens
    let { mint, tokenAccount, tokenOwner } = await setup();

    // Check balances before compression - SPL account and compressed token accounts
    const splBalanceBefore = await rpc.getTokenAccountBalance(tokenAccount);
    const compressedAccountsBefore = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );

    console.log("\nBefore Compression:");
    console.log("SPL token balance:", Number(splBalanceBefore.value.amount) / 1_000_000_000, "tokens");
    console.log("Compressed accounts:", compressedAccountsBefore.items.length);

<strong>    // Step 3: Call compressSplTokenAccount() to convert SPL tokens to compressed format
</strong><strong>    // Transfer SPL tokens to omnibus pool and mint compressed tokens
</strong><strong>    const compressTx = await compressSplTokenAccount(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // mint with existing token pool
</strong><strong>        tokenOwner,
</strong><strong>        tokenAccount, // SPL token account to be compressed
</strong><strong>    );
</strong>
    console.log("SPL token account compressed!");
    console.log("Transaction:", compressTx);

    // Step 4: Verify SPL and compressed token account balance
    const splBalanceAfter = await rpc.getTokenAccountBalance(tokenAccount);
    const compressedAccountsAfter = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );

    console.log("\nAfter Compression:");
    console.log("SPL token balance:", Number(splBalanceAfter.value.amount) / 1_000_000_000, "tokens");
    console.log("Compressed accounts:", compressedAccountsAfter.items.length);

    // Calculate total compressed balance from all compressed accounts
    const totalCompressed = compressedAccountsAfter.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        bn(0)
    );
    console.log("Total compressed balance:", totalCompressed.toNumber() / 1_000_000_000, "tokens");

<strong>    // Check if SPL account can be closed for rent reclaim
</strong><strong>    if (Number(splBalanceAfter.value.amount) === 0) {
</strong><strong>        console.log("SPL token account is now empty and can be closed to reclaim rent!");
</strong><strong>    }
</strong>
    console.log("Transaction signature:", compressTx);

    return { 
        compressTransaction: compressTx,
        tokenAccount,
        splBalanceAfter: Number(splBalanceAfter.value.amount),
        compressedBalance: totalCompressed.toNumber()
    };

    async function setup() {
        
        const { mint } = await createMint(
            rpc,
            payer,
            payer.publicKey,
            9,
        );
        console.log("Compressed mint created:", mint.toBase58());

        const tokenOwner = Keypair.generate();
        
        const tokenAccount = await createAssociatedTokenAccount(
            rpc,
            payer,
            mint,
            tokenOwner.publicKey,
        );
        console.log("SPL token account created:", tokenAccount.toBase58());

        const mintAmount = 2_000_000_000;
        await mintTo(
            rpc,
            payer,
            mint,
            tokenAccount,
            payer,
            mintAmount,
        );
        console.log("SPL tokens minted:", mintAmount / 1_000_000_000, "tokens");

        return {
            mint,
            tokenAccount,
            tokenOwner,
        };
    }
}

compressSplTokenAccounts().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
**Success!**

You've compressed an SPL token account. The output shows:

* **Account compression**: Entire SPL token account balance converted to compressed format.
* **Balance verification**: All tokens migrated from SPL account to compressed accounts.
* **Rent Reclaimable**: The empty SPL account can now be closed to reclaim rent with [`closeAccount()`](https://solana.com/developers/cookbook/tokens/close-token-accounts).
{% endstep %}
{% endstepper %}

### Troubleshooting

<details>

<summary>"Insufficient balance in token account"</summary>

The token account doesn't have enough tokens for the operation.

```typescript
// Check token account balance before compression
const balance = await rpc.getTokenAccountBalance(tokenAccount);

if (Number(balance.value.amount) === 0) {
    console.log("Token account is empty");
    return;
}

console.log("Available balance:", Number(balance.value.amount));

// Proceed with compression
const compressTx = await compressSplTokenAccount(
    rpc,
    payer,
    mint,
    owner,
    tokenAccount,
);
```

</details>

<details>

<summary>"Remaining amount exceeds balance"</summary>

The `remainingAmount` parameter exceeds the current account balance.

```typescript
const balance = await rpc.getTokenAccountBalance(tokenAccount);
const availableAmount = Number(balance.value.amount);
const remainingAmount = bn(500_000_000); // 0.5 tokens

if (remainingAmount.gt(bn(availableAmount))) {
    console.log(`Cannot leave ${remainingAmount.toString()} tokens`);
    console.log(`Available balance: ${availableAmount}`);
    throw new Error("Remaining amount exceeds balance");
}

// Use valid remaining amount
const compressTx = await compressSplTokenAccount(
    rpc,
    payer,
    mint,
    owner,
    tokenAccount,
    remainingAmount, // must be <= balance
);
```

</details>

### Advanced Configuration

<details>

<summary>Partial Account Compression</summary>

Compress most tokens while leaving some in SPL format:

```typescript
import { bn } from '@lightprotocol/stateless.js';

// Leave 100 tokens (0.1 with 9 decimals) in SPL account
const remainingAmount = bn(100_000_000);

const compressTx = await compressSplTokenAccount(
    rpc,
    payer,
    mint,
    owner,
    tokenAccount,
    remainingAmount, // amount to keep in SPL format
);

// Account will retain remainingAmount tokens
```

</details>

<details>

<summary>Compress Multiple Accounts</summary>

Compress several token accounts for the same mint:

```typescript
const tokenAccounts = [
    { account: new PublicKey("ACCOUNT_1"), owner: owner1 },
    { account: new PublicKey("ACCOUNT_2"), owner: owner2 },
    { account: new PublicKey("ACCOUNT_3"), owner: owner3 },
];

// Compress each account
for (const { account, owner } of tokenAccounts) {
    console.log(`Compressing account: ${account.toBase58()}`);
    
    try {
        const compressTx = await compressSplTokenAccount(
            rpc,
            payer,
            mint,
            owner,
            account,
        );
        console.log(`Compressed: ${compressTx}`);
    } catch (error) {
        console.log(`Failed: ${error.message}`);
    }
}
```

</details>

### Next Steps

Learn how to merge multiple compressed token accounts into one to simplify state management.

{% content-ref url="how-to-merge-compressed-token-accounts.md" %}
[how-to-merge-compressed-token-accounts.md](how-to-merge-compressed-token-accounts.md)
{% endcontent-ref %}
