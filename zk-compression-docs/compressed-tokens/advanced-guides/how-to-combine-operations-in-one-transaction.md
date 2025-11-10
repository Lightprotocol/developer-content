---
title: Combine Instructions in One Transaction
description: Guide to combine multiple instructions in a single transaction. Full code example for token pool creation and for first-time compression of existing SPL tokens.
---

The SDK provides instruction-level APIs that return instructions without sending transactions. Combine these instructions to build custom transactions with multiple instructions.

This guide demonstrates creating a token pool and compressing existing SPL tokens in a single transaction.

# Full Code Example

{% stepper %}
{% step %}
## Prerequisites

Make sure you have dependencies and developer environment set up!

<details>

<summary>Prerequisites &#x26; Setup</summary>

### Dependencies

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

### Developer Environment

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
Get your API Key [here](https://www.helius.dev/zk-compression), if you don't have one yet.
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
## Create Token Pool + Compress

<pre class="language-typescript" data-title="create-pool-and-compress.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup: Create regular SPL token and mint to ATA
// 2. Build instructions for create token pool and compress
// 3. Combine instructions in one transaction
// 4. Verify compressed balance

import {
    Keypair,
    ComputeBudgetProgram,
} from '@solana/web3.js';
import {
    createRpc,
    buildAndSignTx,
    sendAndConfirmTx,
    selectStateTreeInfo,
} from '@lightprotocol/stateless.js';
import { CompressedTokenProgram } from '@lightprotocol/compressed-token';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import BN from 'bn.js';

async function createPoolAndCompress() {
    // Step 1: Setup - Create regular SPL token and mint to ATA
    const rpc = createRpc();
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000);
    await rpc.confirmTransaction(airdropSignature);

    // Create regular SPL token mint
    const mint = await createMint(
        rpc,
        payer,
        payer.publicKey,
        null,
        9,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
    );

    // Create ATA and mint tokens to it
    const ata = await getOrCreateAssociatedTokenAccount(
        rpc,
        payer,
        mint,
        payer.publicKey,
        undefined,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
    );

    await mintTo(
        rpc,
        payer,
        mint,
        ata.address,
        payer,
        1_000_000_000, // 1 token with 9 decimals
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
    );

    console.log("Regular SPL token created:", mint.toBase58());
    console.log("ATA balance:", 1, "token");

<strong>    // Step 2: Build instructions for create token pool and compress
</strong>    const outputStateTreeInfo = selectStateTreeInfo(await rpc.getStateTreeInfos());

    // Derive token pool PDA
    const tokenPoolPda = CompressedTokenProgram.deriveTokenPoolPda(mint);

    // Create token pool instruction
    const createTokenPoolIx = await CompressedTokenProgram.createTokenPool({
        feePayer: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
    });

    // Manually construct TokenPoolInfo for first-time compression
    const tokenPoolInfo = {
        mint: mint,
        tokenPoolPda: tokenPoolPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        isInitialized: true, // Set to true even though pool will be created in this tx
        balance: new BN(0),
        poolIndex: 0,
        bump: 0, // Placeholder value
    };

    // Create compress instruction
    const compressIx = await CompressedTokenProgram.compress({
        outputStateTreeInfo,
        tokenPoolInfo,
        payer: payer.publicKey,
        owner: payer.publicKey,
        source: ata.address,
        toAddress: payer.publicKey,
        amount: new BN(1_000_000_000),
        mint,
    });

<strong>    // Step 3: Combine instructions in one transaction
</strong>    const { blockhash } = await rpc.getLatestBlockhash();

    const allInstructions = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
        createTokenPoolIx,
        compressIx,
    ];

    const tx = buildAndSignTx(
        allInstructions,
        payer,
        blockhash,
        []
    );

    const txId = await sendAndConfirmTx(rpc, tx);

    console.log("Token pool created and tokens compressed");
    console.log("Transaction:", txId);

    // Step 4: Verify compressed balance
    const compressedAccounts = await rpc.getCompressedTokenAccountsByOwner(
        payer.publicKey,
        { mint }
    );

    const compressedBalance = compressedAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );

    console.log("Compressed balance:", compressedBalance.toNumber() / 1_000_000_000, "tokens");

    return {
        transactionSignature: txId,
        mint,
        compressedBalance: compressedBalance.toNumber(),
    };
}

createPoolAndCompress().catch(console.error);
</code></pre>
{% endstep %}

{% endstepper %}

# Next Steps

Learn how to transfer compressed tokens.

{% content-ref url="../guides/how-to-transfer-compressed-token.md" %}
[how-to-transfer-compressed-token.md](../guides/how-to-transfer-compressed-token.md)
{% endcontent-ref %}

