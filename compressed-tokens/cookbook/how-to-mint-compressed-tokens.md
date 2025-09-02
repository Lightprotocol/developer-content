---
description: >-
  Complete guide to mint compressed tokens with `mintTo()`, troubleshooting, and
  advanced configurations.
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: true
---

# How to Mint Compressed Tokens

The `mintTo()` function creates compressed token accounts for recipients and increases the mint's token supply. Only the mint authority can perform this operation.

The `mintTo()` function

1. Mints SPL tokens to token pool PDA, the [omnibus account](#user-content-fn-1)[^1] for compression and decompression of tokens
2. Create compressed accounts containing mint, owner, and amount for each recipient

Before minting compressed tokens, you need an SPL mint registered with the compressed token program via [`createMint()`](how-to-create-and-register-a-mint-account-for-compression.md) for a new mint, or [`createTokenPool()`](how-to-create-compressed-token-pools-for-mint-accounts.md) for an existing mint.

{% code title="function-mint-compressed-tokens.ts" %}
```typescript
import { mintTo } from '@lightprotocol/compressed-token';
import { PublicKey } from '@solana/web3.js';

// Use existing mint with token pool for compression to mint compressed tokens
const mint = new PublicKey("MINT_ADDRESS");
const recipient = new PublicKey("RECIPIENT_WALLET_ADDRESS");
const amount = 1_000_000_000; // 1 token (9 decimals)

// Mint compressed tokens - mints SPL tokens to pool, creates compressed token accounts
const transactionSignature = await mintTo(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    recipient, // recipient address (toPubkey parameter)
    payer, // mint authority
    amount,
);
```
{% endcode %}

## Full Code Example

{% stepper %}
{% step %}
### Prerequisites

Make sure you have dependencies and developer environment set up!

<details>

<summary>Prerequisites &#x26; Setup</summary>

**Dependencies**

```bash
npm install --save-dev typescript tsx @types/node && \
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

#### Alternatives:

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

**Developer Environment**

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
#### Minting Compressed Tokens

Run this script to mint compressed tokens to a recipient!

<pre class="language-typescript" data-title="mint-compressed-tokens.ts"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL mint with token pool for compression
// 3. Call mintTo() with mint, recipient, and amount - mint SPL tokens to pool and create compressed token accounts
// 4. Verify via getCompressedTokenAccountsByOwner

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { createMint, mintTo } from '@lightprotocol/compressed-token';

async function mintCompressedTokens() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL mint with token pool for compression
    const { mint, transactionSignature: mintCreateTx } = await createMint(
        rpc,
        payer,
        payer.publicKey, // mint authority
        9
    );

    console.log("Mint with token pool for compression created!");
    console.log("Mint address:", mint.toBase58());
    console.log("Create mint transaction:", mintCreateTx);
    
    // Generate recipient keypair
    const recipient = Keypair.generate();
    
    // Define amount to mint
    const mintAmount = 1_000_000_000; // 1 token with 9 decimals

<strong>    // Step 3: Call mintTo() with mint, recipient, and amount
</strong><strong>    // Mint SPL tokens to pool and create compressed token account
</strong><strong>    const transactionSignature = await mintTo(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // SPL mint with token pool for compression
</strong><strong>        recipient.publicKey,
</strong><strong>        payer, // mint authority
</strong><strong>        mintAmount
</strong><strong>    );
</strong>
    console.log("\nCompressed token minted!");
    console.log("Recipient:", recipient.publicKey.toBase58());
    console.log("Compressed Token Balance:", mintAmount / 1_000_000_000, "tokens");
    console.log("Mint token transaction:", transactionSignature);

    // Step 4: Verify via getCompressedTokenAccountsByOwner
    const tokenAccounts = await rpc.getCompressedTokenAccountsByOwner(
        recipient.publicKey,
        { mint }
    );

    if (tokenAccounts.items.length > 0) {
        const balance = tokenAccounts.items[0].parsed.amount;    }

    return { transactionSignature, recipient: recipient.publicKey, amount: mintAmount };
}

mintCompressedTokens().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
**Success!**

You've successfully minted compressed tokens. The output shows:

* **Compressed token supply**: Increased the total supply of your mint
* **Compressed token balance**
{% endstep %}
{% endstepper %}

## Troubleshooting

<details>

<summary>"TokenPool not found"</summary>

```typescript
// Error message: "TokenPool not found. Please create a compressed token
// pool for mint: [ADDRESS] via createTokenPool().
```

The mint does no have a token pool for compression. Ensure you created the mint using `createMint`.

```typescript
// Create mint with token pool for compression
import { createMint } from '@lightprotocol/compressed-token';
const { mint } = await createMint(rpc, payer, payer.publicKey, 9);
```

</details>

<details>

<summary>"TokenPool mint does not match the provided mint"</summary>

The token pool info doesn't correspond to the mint address. Ensure you're fetching the correct pool:

```typescript
// Get the correct token pool for your mint
const tokenPoolInfo = await getTokenPoolInfos(rpc, mint);
```

</details>

<details>

<summary>"Amount and toPubkey arrays must have the same length"</summary>

When minting to multiple recipients, ensure arrays are the same size.

```typescript
// Wrong: Mismatched array lengths
const recipients = [addr1, addr2, addr3];
const amounts = [100, 200]; // Only 2 amounts for 3 recipients

// Correct: Same length arrays
const recipients = [addr1, addr2, addr3];
const amounts = [100, 200, 300]; // 3 amounts for 3 recipients
```

</details>

## Advanced Configuration

<details>

<summary>Mint to Multiple Recipients</summary>

```typescript
// Mint different amounts to multiple recipients
const recipients = [
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
];

const amounts = [
    1_000_000_000, // 1 token
    2_000_000_000, // 2 tokens  
    500_000_000,   // 0.5 tokens
];

const transactionSignature = await mintTo(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    recipients, // array of recipients (toPubkey parameter)
    payer, // mint authority
    amounts, // array of amounts (amount parameter)
);
```

</details>

<details>

<summary>With Custom Mint Authority</summary>

Mint tokens using a custom mint authority with `approveAndMintTo()`:

```typescript
import { approveAndMintTo } from '@lightprotocol/compressed-token';

// Mint tokens with a separate mint authority
const transactionSignature = await approveAndMintTo(
    rpc,
    payer, 
    mint, // SPL mint with token pool for compression
    recipient.publicKey, // recipient of minted tokens (toPubkey parameter)
    mintAuthority, // mint authority
    mintAmount,
);
```

</details>

## Next Steps

Learn how to transfer compressed tokens you just minted.

{% content-ref url="how-to-transfer-compressed-token.md" %}
[how-to-transfer-compressed-token.md](how-to-transfer-compressed-token.md)
{% endcontent-ref %}

[^1]: SPL token account that holds SPL tokens corresponding to compressed tokens in circulation. Tokens are locked when compressed and withdrawn when decompressed. Owned by the compressed token program's CPI authority PDA.
