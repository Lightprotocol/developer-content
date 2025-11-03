---
title: How to Combine Operations in One Transaction
description: Complete guide to combine multiple compressed token operations in a single transaction with instruction-level APIs.
hidden: true
---

Combine multiple operations in a single transaction for create mint, mint tokens, and transfer.

The SDK provides instruction-level APIs that return instructions without sending transactions. Combine these instructions to build custom transactions with multiple operations.


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
## Create Mint + Mint Tokens

Run this script to create a mint and mint tokens in a single transaction.

<pre class="language-typescript" data-title="create-and-mint.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Build instructions for create mint and mint tokens
// 3. Combine instructions in one transaction with buildAndSignTx()
// 4. Verify via getCompressedTokenAccountsByOwner

import {
    Keypair,
    ComputeBudgetProgram,
} from '@solana/web3.js';
import { createRpc, buildAndSignTx, sendAndConfirmTx, selectStateTreeInfo } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram } from '@lightprotocol/compressed-token';
import { MINT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';

async function createMintAndMintTokens() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

<strong>    // Step 2: Build instructions for create mint and mint tokens
</strong>    const mintKeypair = Keypair.generate();
    const recipient = Keypair.generate();

    // Get rent exemption for mint account
    const rentExemptBalance = await rpc.getMinimumBalanceForRentExemption(MINT_SIZE);

    // Get create mint instructions (returns array of instructions)
    const createMintIxs = await CompressedTokenProgram.createMint({
        feePayer: payer.publicKey,
        mint: mintKeypair.publicKey,
        decimals: 9,
        authority: payer.publicKey,
        freezeAuthority: null,
        rentExemptBalance,
        tokenProgramId: TOKEN_PROGRAM_ID,
    });

    // Get state tree info for minting
    const outputStateTreeInfo = selectStateTreeInfo(await rpc.getStateTreeInfos());

    // Derive token pool PDA that will be created (index 0)
    const [tokenPoolPda, bump] = CompressedTokenProgram.deriveTokenPoolPdaWithIndex(
        mintKeypair.publicKey,
        0
    );

    // Build token pool info for instruction
    const tokenPoolInfo = {
        mint: mintKeypair.publicKey,
        tokenPoolPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        balance: new BN(0),
        isInitialized: false, // Will be initialized in this transaction
        poolIndex: 0,
        bump,
    };

    // Get mint instruction
    const mintToIx = await CompressedTokenProgram.mintTo({
        feePayer: payer.publicKey,
        mint: mintKeypair.publicKey,
        authority: payer.publicKey,
        amount: 1_000_000_000, // 1 token with 9 decimals
        toPubkey: recipient.publicKey,
        outputStateTreeInfo,
        tokenPoolInfo,
    });

<strong>    // Step 3: Combine all instructions in one transaction
</strong>    const { blockhash } = await rpc.getLatestBlockhash();

    const allInstructions = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_200_000 }),
        ...createMintIxs, // Spread array of create mint instructions
        mintToIx,         // Add mint instruction
    ];

    const tx = buildAndSignTx(
        allInstructions,
        payer,
        blockhash,
        [mintKeypair] // Additional signer for mint account
    );

    const txId = await sendAndConfirmTx(rpc, tx);

    console.log("Mint address:", mintKeypair.publicKey.toBase58());
    console.log("Recipient:", recipient.publicKey.toBase58());
    console.log("Transaction:", txId);

    // Step 4: Verify via getCompressedTokenAccountsByOwner
    const tokenAccounts = await rpc.getCompressedTokenAccountsByOwner(
        recipient.publicKey,
        { mint: mintKeypair.publicKey }
    );

    if (tokenAccounts.items.length > 0) {
        const balance = tokenAccounts.items[0].parsed.amount;
        console.log("Verified balance:", balance.toNumber() / 1_000_000_000, "tokens");
    }

    return {
        transactionSignature: txId,
        mint: mintKeypair.publicKey,
        recipient: recipient.publicKey,
    };
}

createMintAndMintTokens().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
## Mint + Transfer

Run this script to mint and transfer tokens in a single transaction.

<pre class="language-typescript" data-title="mint-and-transfer.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup with existing mint
// 2. Build instructions for mint and transfer
// 3. Combine instructions in one transaction
// 4. Verify both recipient balances

import {
    Keypair,
    PublicKey,
    ComputeBudgetProgram,
} from '@solana/web3.js';
import {
    createRpc,
    buildAndSignTx,
    sendAndConfirmTx,
    selectStateTreeInfo,
} from '@lightprotocol/stateless.js';
import { CompressedTokenProgram, getTokenPoolInfos, selectTokenPoolInfo, createMint } from '@lightprotocol/compressed-token';
import BN from 'bn.js';

async function mintAndTransfer() {
    // Step 1: Setup with existing mint
    const rpc = createRpc();
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000);
    await rpc.confirmTransaction(airdropSignature);

    // Create mint first (needed for token pool)
    const { mint } = await createMint(
        rpc,
        payer,
        payer.publicKey,
        9
    );

    console.log("Mint created:", mint.toBase58());

    const firstRecipient = Keypair.generate();
    const secondRecipient = Keypair.generate();

<strong>    // Step 2: Build instructions for mint and transfer
</strong>    const outputStateTreeInfo = selectStateTreeInfo(await rpc.getStateTreeInfos());
    const tokenPoolInfo = selectTokenPoolInfo(await getTokenPoolInfos(rpc, mint));

    // Mint 2 tokens to first recipient
    const mintToIx = await CompressedTokenProgram.mintTo({
        feePayer: payer.publicKey,
        mint,
        authority: payer.publicKey,
        amount: 2_000_000_000, // 2 tokens
        toPubkey: firstRecipient.publicKey,
        outputStateTreeInfo,
        tokenPoolInfo,
    });

    // Transfer 1 token from first to second recipient
    const transferIx = await CompressedTokenProgram.transfer({
        feePayer: payer.publicKey,
        mint,
        authority: firstRecipient.publicKey,
        amount: 1_000_000_000, // 1 token
        toAddress: secondRecipient.publicKey,
        outputStateTreeInfo,
        rpc,
    });

<strong>    // Step 3: Combine instructions in one transaction
</strong>    const { blockhash } = await rpc.getLatestBlockhash();

    const allInstructions = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_500_000 }),
        mintToIx,
        transferIx,
    ];

    const tx = buildAndSignTx(
        allInstructions,
        payer,
        blockhash,
        [firstRecipient] // First recipient must sign transfer
    );

    const txId = await sendAndConfirmTx(rpc, tx);

    console.log("Mint and transfer Transaction:", txId);

    // Step 4: Verify both recipient balances
    const firstRecipientAccounts = await rpc.getCompressedTokenAccountsByOwner(
        firstRecipient.publicKey,
        { mint }
    );

    const secondRecipientAccounts = await rpc.getCompressedTokenAccountsByOwner(
        secondRecipient.publicKey,
        { mint }
    );

    const firstBalance = firstRecipientAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );

    const secondBalance = secondRecipientAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );

    console.log("\nFinal balances:");
    console.log("First recipient:", firstBalance.toNumber() / 1_000_000_000, "tokens");
    console.log("Second recipient:", secondBalance.toNumber() / 1_000_000_000, "tokens");

    return { transactionSignature: txId, mint };
}

mintAndTransfer().catch(console.error);
</code></pre>
{% endstep %}
{% endstepper %}

# Next Steps

