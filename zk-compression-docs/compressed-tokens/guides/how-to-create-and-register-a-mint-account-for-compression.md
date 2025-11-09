---
title: Create and Register a Mint Account for Compression
description: Complete guide to create and register an SPL token mint account for compression with createMint(), troubleshooting and advanced configurations.
---

{% hint style="info" %}
The mint account itself requires rent (like regular SPL mints), but individual compressed token accounts are rent-free.
{% endhint %}

Compressed tokens use an SPL mint that is registered with the compressed token program. Connect an existing SPL mint with [`createTokenPool()`](how-to-create-compressed-token-pools-for-mint-accounts.md) or use `createMint()` to create a new one from scratch.

{% code title="function-create-mint.ts" %}
```typescript
// Create SPL mint with token pool for compression
const { mint, transactionSignature } = await createMint(
    rpc,
    payer,
    mintAuthority.publicKey,
    decimals,
);
```
{% endcode %}

{% hint style="success" %}
**Best Practice:** Each mint supports a maximum of 4 token pools total. During compression/decompression operations, token pools get write-locked. Use `addTokenPools()` to create additional pools that increase per-block write-lock capacity.
{% endhint %}

# Full Code Example

{% stepper %}
{% step %}
## Prerequisites

Make sure you have dependencies and developer environment set up!

<details>

<summary>Prerequisites &#x26; Setup</summary>

#### Dependencies

```bash
npm install --save-dev typescript tsx @types/node &&
npm install \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

**Alternatives:**

```bash
yarn add --dd typescript tsx @types/node &&
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

```bash
pnpm add --save-dev typescript tsx @types/node &&
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
## Create SPL Mint with Token Pool for Compression

Run this script to create a mint account with token pool for compression.

<pre class="language-typescript" data-title="create-mint.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL mint with token pool for compression via createMint()

import { Keypair } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { createMint } from '@lightprotocol/compressed-token';

async function createCompressedMint() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
        const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

<strong>    // Step 2: Call createMint() to create mint account and token pool for compression
</strong><strong>    const { mint, transactionSignature } = await createMint(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        payer.publicKey, // mint authority
</strong><strong>        9
</strong><strong>    );
</strong>
    console.log("SPL mint with token pool for compression created");
    console.log("Mint address:", mint.toBase58());
    console.log("Transaction:", transactionSignature);


    return { mint, transactionSignature };
}

createCompressedMint().catch(console.error);
</code></pre>
{% endstep %}
{% endstepper %}

## Advanced Configurations

<details>

<summary>Customize Mint Authority</summary>

Customize who can mint new compressed tokens.

```typescript
const mintAuthority = Keypair.generate();

const { mint, transactionSignature } = await createMint(
    rpc,
    payer,
    mintAuthority.publicKey,
    9,
);
```

</details>

<details>

<summary>Add Freeze Authority</summary>

Customize who can freeze/thaw compressed token accounts.

```typescript
const freezeAuthority = Keypair.generate();

const { mint, transactionSignature } = await createMint(
    rpc,
    payer,
    payer.publicKey, // mint authority
    9, // decimals
    Keypair.generate(), // mint keypair
    undefined, // confirm options
    undefined, // token program ID
    freezeAuthority.publicKey, // freeze authority
);
```

</details>

# Next Steps

Learn how to create additional compressed token pools for your SPL mint to increase write-lock limits.

{% content-ref url="how-to-create-compressed-token-pools-for-mint-accounts.md" %}
[how-to-create-compressed-token-pools-for-mint-accounts.md](how-to-create-compressed-token-pools-for-mint-accounts.md)
{% endcontent-ref %}