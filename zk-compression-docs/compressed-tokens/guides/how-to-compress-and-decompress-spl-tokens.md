---
title: Compress and Decompress SPL Tokens
description: Complete guide to compress SPL tokens with compress() and decompress with decompress(), troubleshooting and advanced configurations.
---

The `compress()` and `decompress()` functions convert SPL tokens between compressed and regular format.

Before we convert formats, we need:

* An SPL mint with a token pool for compression. This token pool can be created for new SPL mints via [`createMint()`](how-to-create-and-register-a-mint-account-for-compression.md) or added to existing SPL mints via [`createTokenPool()`](how-to-create-compressed-token-pools-for-mint-accounts.md).
* For `compress()` SPL tokens in an Associated Token Account, or
* For `decompress()` compressed token accounts with sufficient balance.

{% tabs %}
{% tab title="compress()" %}
```typescript
// Compress SPL tokens to compressed tokens
const compressionSignature = await compress(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    amount,
    payer, // owner of SPL tokens
    tokenAccount.address, // source SPL token account (sourceTokenAccount parameter)
    recipient, // recipient owner address (toAddress parameter)
);
```
{% endtab %}

{% tab title="decompress()" %}
```typescript
// Decompress compressed tokens to SPL tokens
const transactionSignature = await decompress(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    amount,
    payer, // owner of compressed tokens
    tokenAccount.address, // destination token account (toAddress parameter)
);
```
{% endtab %}
{% endtabs %}

{% hint style="success" %}
**Function Difference and Best Practice:**

* `compress(amount, sourceTokenAccount, toAddress)` compresses specific amounts from source to a specified recipient. Use for transfers and precise amounts.
* `compressSplTokenAccount(tokenAccount, remainingAmount)` compresses the entire SPL token account balance minus optional remaining amount only to the same owner. Use to migrate complete token accounts with optional partial retention. [Here is how](how-to-compress-complete-spl-token-accounts.md).
{% endhint %}

### Full Code Example

{% stepper %}
{% step %}
## Prerequisites

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

Follow these steps to create an RPC Connection. Replace `<your_api_key>` with your API key before running.

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
## Compress / Decompress Tokens

{% tabs %}
{% tab title="Compress Tokens" %}
Compress SPL tokens to compressed format.

<pre class="language-typescript" data-title="compress-tokens.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL mint with token pool and mint SPL tokens to ATA
// 3. Call compress() to convert SPL tokens to compressed format
// 4. Verify balances via getTokenAccountBalance and getCompressedTokenAccountsByOwner

import { Keypair } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import {
    createMint,
    compress
} from '@lightprotocol/compressed-token';
import {
    getOrCreateAssociatedTokenAccount,
    mintTo as splMintTo,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import BN from 'bn.js';

async function compressTokens() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL mint with token pool and mint SPL tokens to ATA
    const { mint } = await createMint(rpc, payer, payer.publicKey, 9);
    console.log("Mint with token pool created:", mint.toBase58());

    const tokenOwner = Keypair.generate();
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        rpc, payer, mint, tokenOwner.publicKey, false, TOKEN_PROGRAM_ID
    );

    // Mint SPL tokens to the ATA
    const splAmount = 1_000_000_000; // 1 token with 9 decimals
    await splMintTo(rpc, payer, mint, tokenAccount.address, payer, splAmount, [], undefined, TOKEN_PROGRAM_ID);
    console.log("SPL tokens minted:", splAmount / 1_000_000_000, "tokens");

    console.log("Compress Tokens");

    const compressAmount = 400_000_000; // 0.4 tokens

<strong>    // Step 3: Call compress() to convert to compressed format
</strong><strong>    // Lock SPL tokens to pool account and mint compressed tokens
</strong><strong>    const compressTx = await compress(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // SPL mint with token pool for compression
</strong><strong>        compressAmount, // amount to compress
</strong><strong>        tokenOwner, // owner of SPL tokens
</strong><strong>        tokenAccount.address, // source token account
</strong><strong>        tokenOwner.publicKey, // recipient for compressed tokens
</strong><strong>    );
</strong>
    console.log("Compressed amount:", compressAmount / 1_000_000_000, "tokens");
    console.log("Transaction:", compressTx);

    // Step 4: Verify balances via getTokenAccountBalance and getCompressedTokenAccountsByOwner
    const finalTokenBalance = await rpc.getTokenAccountBalance(tokenAccount.address);
    const finalCompressedAccounts = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );

    // Calculate total compressed balance
    const finalCompressedBalance = finalCompressedAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );

    console.log("\nFinal balances:");
    console.log("Regular SPL tokens:", finalTokenBalance.value.uiAmount);
    console.log("Compressed tokens:", finalCompressedBalance.toNumber() / 1_000_000_000);

    return {
        compressTransaction: compressTx,
        finalCompressedBalance,
        finalSplBalance: finalTokenBalance.value.amount
    };
}

compressTokens().catch(console.error);
</code></pre>
{% endtab %}

{% tab title="Compress and Decompress" %}
Compress SPL tokens and decompress in one script.

<pre class="language-typescript" data-title="compress-and-decompress-tokens.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL mint with token pool and mint SPL tokens to ATA
// 3. Compress SPL tokens to compressed format
// 4. Decompress compressed tokens back to SPL format
// 5. Verify final balances

import { Keypair } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import {
    createMint,
    compress,
    decompress
} from '@lightprotocol/compressed-token';
import {
    getOrCreateAssociatedTokenAccount,
    mintTo as splMintTo,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import BN from 'bn.js';

async function compressAndDecompressTokens() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL mint with token pool and mint SPL tokens to ATA
    const { mint } = await createMint(rpc, payer, payer.publicKey, 9);
    console.log("Mint with token pool created:", mint.toBase58());

    const tokenOwner = Keypair.generate();
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        rpc, payer, mint, tokenOwner.publicKey, false, TOKEN_PROGRAM_ID
    );

    // Mint SPL tokens to the ATA
    const splAmount = 1_000_000_000; // 1 token with 9 decimals
    await splMintTo(rpc, payer, mint, tokenAccount.address, payer, splAmount, [], undefined, TOKEN_PROGRAM_ID);
    console.log("SPL tokens minted:", splAmount / 1_000_000_000, "tokens");

    console.log("\n=== Compress Tokens ===");

    const compressAmount = 600_000_000; // 0.6 tokens

<strong>    // Step 3: Compress SPL tokens
</strong><strong>    const compressTx = await compress(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint,
</strong><strong>        compressAmount,
</strong><strong>        tokenOwner,
</strong><strong>        tokenAccount.address,
</strong><strong>        tokenOwner.publicKey,
</strong><strong>    );
</strong>
    console.log("Compressed amount:", compressAmount / 1_000_000_000, "tokens");
    console.log("Compress transaction:", compressTx);

    // Verify compressed balance
    const compressedAccounts = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );
    const compressedBalance = compressedAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );
    console.log("Compressed balance:", compressedBalance.toNumber() / 1_000_000_000, "tokens");

    console.log("\n=== Decompress Tokens ===");

    const decompressAmount = 300_000_000; // 0.3 tokens

<strong>    // Step 4: Decompress compressed tokens back to SPL format
</strong><strong>    const decompressTx = await decompress(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint,
</strong><strong>        decompressAmount,
</strong><strong>        tokenOwner,
</strong><strong>        tokenAccount.address,
</strong><strong>    );
</strong>
    console.log("Decompressed amount:", decompressAmount / 1_000_000_000, "tokens");
    console.log("Decompress transaction:", decompressTx);

    // Step 5: Verify final balances
    const finalTokenBalance = await rpc.getTokenAccountBalance(tokenAccount.address);
    const finalCompressedAccounts = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );
    const finalCompressedBalance = finalCompressedAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );

    console.log("\n=== Final Balances ===");
    console.log("Regular SPL tokens:", finalTokenBalance.value.uiAmount);
    console.log("Compressed tokens:", finalCompressedBalance.toNumber() / 1_000_000_000);

    return {
        compressTransaction: compressTx,
        decompressTransaction: decompressTx,
        finalCompressedBalance,
        finalSplBalance: finalTokenBalance.value.amount
    };
}

compressAndDecompressTokens().catch(console.error);
</code></pre>
{% endtab %}
{% endtabs %}
{% endstep %}
{% endstepper %}

## Troubleshooting

<details>

<summary>"Insufficient balance" difference between <code>decompress</code> and <code>compress</code></summary>

Check your balances before operations:

```typescript
// For decompression - check compressed balance
const compressedAccounts = await rpc.getCompressedTokenAccountsByOwner(
    owner.publicKey,
    { mint }
);
const compressedBalance = compressedAccounts.items.reduce(
    (sum, account) => sum.add(account.parsed.amount),
    new BN(0)
);

// For compression - check SPL token balance
const tokenBalance = await rpc.getTokenAccountBalance(tokenAccount);
const splBalance = new BN(tokenBalance.value.amount);

console.log("Can decompress up to:", compressedBalance.toString());
console.log("Can compress up to:", splBalance.toString());
```

</details>

<details>

<summary>"Invalid owner"</summary>

Ensure the signer owns the tokens being decompressed/compressed:

```typescript
// The owner parameter must be the actual owner
const decompressTx = await decompress(
    rpc,
    payer, // can be different (pays fees)
    mint,
    amount,
    actualOwner, // must own compressed tokens
    destinationAta,
);

const compressTx = await compress(
    rpc,
    payer, // can be different (pays fees)
    mint,
    amount,
    actualOwner, // must own SPL tokens
    sourceAta,
    recipient,
);
```

</details>

## Advanced Configurations

<details>

<summary>Compress to Different Owner</summary>

Compress tokens directly to someone else:

```typescript
const recipientWallet = new PublicKey("RECIPIENT_WALLET_ADDRESS");

// Compress your SPL tokens to recipient
const compressTx = await compress(
    rpc,
    payer,
    mint,
    amount,
    tokenOwner, // current owner signs
    tokenAccount, // your token account
    recipientWallet, // recipient gets compressed tokens
);
```

</details>

<details>

<summary>Batch Operations</summary>

Compress multiple token accounts:

```typescript
// Compress to multiple recipients at once
const recipients = [recipient1.publicKey, recipient2.publicKey, recipient3.publicKey];
const amounts = [1_000_000_000, 2_000_000_000, 500_000_000]; // Different amounts

const batchCompressTx = await compress(
    rpc,
    payer,
    mint,
    amounts, // Array of amounts
    owner,
    tokenAccount,
    recipients, // Array of recipients
);

console.log("Batch compression completed:", batchCompressTx);
```

</details>

<details>

<summary>Decompress with Delegate Authority</summary>

Decompress tokens using delegate authority:

```typescript
import { decompressDelegated } from '@lightprotocol/compressed-token';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Get ATA for decompressed tokens
const ataAddress = await getAssociatedTokenAddress(
    mint,
    recipient,
    false,
    TOKEN_PROGRAM_ID
);

// Delegate decompresses tokens
await decompressDelegated(
    rpc,
    payer,
    mint,
    amount,
    delegate, // Signer - owner of compressed tokens
    ataAddress, // Uncompressed token account (ATA)
);
```

</details>

# Next Steps

Learn how to compress complete token accounts in one transaction and reclaim rent afterwards.

{% content-ref url="how-to-compress-complete-spl-token-accounts.md" %}
[how-to-compress-complete-spl-token-accounts.md](how-to-compress-complete-spl-token-accounts.md)
{% endcontent-ref %}
