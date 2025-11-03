---
title: How to Compress and Decompress SPL Tokens
description: Complete guide to compress SPL tokens with compress() and decompress with decompress(), troubleshooting and advanced configurations.
---

The `compress()` and `decompress()` functions convert SPL tokens between compressed and regular format.

The functions perform opposite operations:

1. `compress()` locks SPL tokens in a token pool account and creates compressed accounts, and
2. `decompress()` withdraws SPL tokens from the token pool to an Associated Token Account and invalidates compressed accounts.

Before we convert formats, we need:

* An SPL mint registered with the compressed token program via `createMint()` or `createTokenPool()`,&#x20;
* for `compress()` SPL tokens in an Associated Token Account, or
* for `decompress()` compressed token accounts with sufficient balance.

{% hint style="success" %}
**Function Difference and Best Practice:**

* `compress(amount, sourceTokenAccount, toAddress)` compresses specific amounts from\
  source to a specified recipient. Use for transfers and precise amounts.
* `compressSplTokenAccount(tokenAccount, remainingAmount)` compresses the entire SPL token account balance minus optional remaining amount only to the same owner. Use to migrate complete token accounts with optional partial retention. [Here is how](how-to-compress-complete-spl-token-accounts.md).
{% endhint %}

{% code title="function-decompress-compress.ts" %}
```typescript
  import { decompress, compress } from '@lightprotocol/compressed-token';
  import { PublicKey } from '@solana/web3.js';
  import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

  const mint = new PublicKey("YOUR_EXISTING_MINT_ADDRESS");
  const recipient = new PublicKey("RECIPIENT_WALLET_ADDRESS");
  const amount = 1_000_000_000; // 1 token (9 decimals)

  // Create ATA for decompressed tokens
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
      rpc, payer, mint, payer.publicKey
  );

  // Decompress compressed tokens to SPL tokens
  const transactionSignature = await decompress(
      rpc,
      payer,
      mint, // SPL mint with token pool for compression
      amount,
      payer, // owner of compressed tokens
      tokenAccount.address, // destination token account (toAddress parameter)
  );

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
#### Decompress Tokens

Convert compressed tokens to regular SPL tokens.

<pre class="language-typescript" data-title="decompress-tokens.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL mint with token pool and mint initial compressed tokens
// 3. Call decompress() to convert compressed tokens to SPL tokens
// 4. Verify decompressed balance via getTokenAccountBalance

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { 
    createMint, 
    mintTo, 
    decompress
} from '@lightprotocol/compressed-token';
import { 
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import * as fs from 'fs';
import * as os from 'os';

async function decompressTokens() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL mint with token pool and mint initial compressed tokens
    const { mint } = await createMint(rpc, payer, payer.publicKey, 9);
    console.log("Mint with token pool created:", mint.toBase58());

    const tokenOwner = Keypair.generate();
    const compressedAmount = 1_000_000_000; // 1 token with 9 decimals
    await mintTo(rpc, payer, mint, tokenOwner.publicKey, payer, compressedAmount);
    console.log("Compressed tokens minted:", compressedAmount / 1_000_000_000, "tokens");

    // Create or get Associated Token Account for decompression
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        rpc, payer, mint, tokenOwner.publicKey, false, TOKEN_PROGRAM_ID
    );

    const decompressAmount = 500_000_000; // 0.5 tokens
    console.log("Decompress Tokens");

<strong>    // Step 3: Call decompress() to convert to SPL tokens
</strong><strong>    // Withdraw SPL tokens from omnibus pool and burn compressed tokens
</strong><strong>    const decompressTx = await decompress(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // SPL mint with token pool for compression
</strong><strong>        decompressAmount, // amount to decompress
</strong><strong>        tokenOwner, // owner of compressed tokens
</strong><strong>        tokenAccount.address, // destination token account (toAddress parameter)
</strong><strong>    );
</strong>
    console.log("Tokens decompressed:", decompressAmount / 1_000_000_000, "tokens");
    console.log("Transaction:", decompressTx);

    // Verify decompressed balance in SPL token account
    const tokenBalance = await rpc.getTokenAccountBalance(tokenAccount.address);
    console.log("SPL token balance:", tokenBalance.value.uiAmount);

    // Save state for compress step
    const state = {
        mint: mint.toBase58(),
        tokenOwner: Array.from(tokenOwner.secretKey),
        tokenAccount: tokenAccount.address.toBase58(),
        payer: Array.from(payer.secretKey)
    };
    fs.writeFileSync('./shared-state.json', JSON.stringify(state, null, 2));

    return { 
        mint,
        tokenOwner,
        tokenAccount: tokenAccount.address,
        decompressTransaction: decompressTx
    };
}

decompressTokens().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
#### Compress Tokens

Continue from the previous step to compress regular SPL tokens back to compressed format.

<pre class="language-typescript" data-title="compress-tokens.ts" data-overflow="wrap"><code class="lang-typescript">// Continue from Step 1 - compress SPL tokens
// 1. Call compress() to convert SPL tokens to compressed format
// 2. Verify balances via getTokenAccountBalance and getCompressedTokenAccountsByOwner

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { compress } from '@lightprotocol/compressed-token';
import { 
    mintTo as splMintTo,
    TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import BN from 'bn.js';
import * as fs from 'fs';

async function compressTokens() {
    if (!fs.existsSync('./shared-state.json')) {
        console.log("No SPL tokens found. Please run 'npx tsx decompress.ts first.");
        return;
    }

    const state = JSON.parse(fs.readFileSync('./shared-state.json', 'utf8'));
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.fromSecretKey(new Uint8Array(state.payer));
    const mint = new PublicKey(state.mint);
    const tokenOwner = Keypair.fromSecretKey(new Uint8Array(state.tokenOwner));
    const tokenAccount = new PublicKey(state.tokenAccount);

    console.log("Compress Tokens");

    // Add SPL tokens to account for compression
    await splMintTo(rpc, payer, mint, tokenAccount, payer, 300_000_000, [], undefined, TOKEN_PROGRAM_ID);
    
    const compressAmount = 400_000_000; // 0.4 tokens

<strong>    // Step 1: Call compress() to convert to compressed format
</strong><strong>    // Lock SPL tokens to pool account and mint compressed tokens
</strong><strong>    const compressTx = await compress(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // SPL mint with token pool for compression
</strong><strong>        compressAmount, // amount to compress
</strong><strong>        tokenOwner, // owner of SPL tokens
</strong><strong>        tokenAccount, // source token account
</strong><strong>        tokenOwner.publicKey, // recipient for compressed tokens
</strong><strong>    );
</strong>
    console.log("Compressed amount:", compressAmount / 1_000_000_000, "tokens");
    console.log("Transaction:", compressTx);

    // Step 2: Verify balances via getTokenAccountBalance and getCompressedTokenAccountsByOwner
    const finalTokenBalance = await rpc.getTokenAccountBalance(tokenAccount);
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
{% endstep %}

{% step %}
**Success!**

You've decompressed and compressed tokens. The output shows:

* **Decompression**: Compressed tokens converted to regular SPL tokens in your Associated Token Account
* **Compression**: Regular SPL tokens converted to compressed tokens
* **Balance verification**: Both operations confirmed with token amounts
{% endstep %}
{% endstepper %}

### Troubleshooting

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

### Advanced Configurations

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

### Next Steps

Learn how to compress complete token accounts in one transaction and reclaim rent afterwards.

{% content-ref url="how-to-compress-complete-spl-token-accounts.md" %}
[how-to-compress-complete-spl-token-accounts.md](how-to-compress-complete-spl-token-accounts.md)
{% endcontent-ref %}
