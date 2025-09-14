---
description: >-
  Complete guide to create an airdrop – with or without code. Access to Cost
  calculation and best practices. ZK compression is the most efficient way to
  distribute SPL tokens.
---

# Create an Airdrop

## Create an Airdrop

***

### Cost Comparison

{% hint style="info" %}
You can use the [Airship Calculator ](https://airship.helius.dev/calculator)to anticipate the cost of your airdrop.
{% endhint %}

<table><thead><tr><th width="145">Airdrop Size</th><th width="271" align="center">Regular Airdrop</th><th align="center">ZK Compression Airdrop</th></tr></thead><tbody><tr><td>10,000</td><td align="center">20.4 SOL (*$<em>4,080</em>)</td><td align="center"><strong>0.0065 SOL (*</strong><em><strong>$1.3</strong></em><strong>)</strong></td></tr><tr><td>100,000</td><td align="center">203.96 SOL (*$<em>40,080</em>)</td><td align="center"><strong>0.065 SOL (*</strong><em><strong>$13)</strong></em></td></tr><tr><td>1,000,000</td><td align="center">2039.28 SOL (*$<em>400,080</em>)</td><td align="center"><strong>0.65 SOL (*</strong><em><strong>$130)</strong></em></td></tr></tbody></table>

_\*\* assuming $200 per SOL_

### Guides

There are two ways to use ZK Compression to distribute your SPL tokens.

<table data-card-size="large" data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-cover data-type="image">Cover image</th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover-dark data-type="image">Cover image (dark)</th></tr></thead><tbody><tr><td><h4>No-Code Airdrop Tool</h4></td><td>Use <strong>Airship by Helius Labs</strong> to airdrop to up to 200,000 recipients via Webapp.</td><td><a href="https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FE0oE3REMOZ17k0DWPx8v%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-42.png?alt=media&#x26;token=9d16dff6-d33d-48d4-878c-ee7708f994bc">https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FE0oE3REMOZ17k0DWPx8v%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-42.png?alt=media&#x26;token=9d16dff6-d33d-48d4-878c-ee7708f994bc</a></td><td><a href="https://www.helius.dev/docs/airship/getting-started">https://www.helius.dev/docs/airship/getting-started</a></td><td><a href="https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FcuP7pwOZ9tTKHmwAp1ZG%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-65.png?alt=media&#x26;token=10132d8a-8141-474a-8011-c0cef25a146c">https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FcuP7pwOZ9tTKHmwAp1ZG%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-65.png?alt=media&#x26;token=10132d8a-8141-474a-8011-c0cef25a146c</a></td></tr><tr><td><h4>Custom Programmatic Airdrop</h4></td><td>Create a <strong>programmatic</strong> <strong>airdrop</strong> with this guide for more control.</td><td><a href="https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FTqUkWv52GGezXThrQx5X%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-41.png?alt=media&#x26;token=d7dd12c0-453e-4056-a98f-dff2d68cd976">https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FTqUkWv52GGezXThrQx5X%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-41.png?alt=media&#x26;token=d7dd12c0-453e-4056-a98f-dff2d68cd976</a></td><td></td><td><a href="https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FN9pPsKMGlPFLJifzp1ob%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-68.png?alt=media&#x26;token=83e89c0d-f782-4c31-85b0-39a8c8575308">https://1579626568-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGcNj6jjKQBC0HgPwNdGy%2Fuploads%2FN9pPsKMGlPFLJifzp1ob%2FLight%20Protocol%20v2%20-%20Batched%20Merkle%20trees-68.png?alt=media&#x26;token=83e89c0d-f782-4c31-85b0-39a8c8575308</a></td></tr></tbody></table>

### Programmatic Airdrop

#### What you will do

By the end of this guide you will have a fully functioning programmatic airdrop.

The high-level overview is this:

1. Mint and send the to-be-airdropped SPL tokens to a wallet you control.
2. Create batches of instructions based on a list of recipients and amounts.
3. Build transactions from these instruction batches, then sign, send, and confirm them.
4. Tokens will appear in the recipients wallets automatically, or you can implement a claim function.

#### Get started

{% stepper %}
{% step %}
**Preqrequisites to Initialize Airdrop Project**

Make sure you have dependencies and developer environment set up!

{% hint style="info" %}
System Requirements

* **Node.js >= 20.18.0** (required by latest Solana packages)
* npm or yarn package manager
{% endhint %}

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

Follow these steps to create an RPC Connection. Replace \<your\_api\_key> with your API key before running.

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
**Mint SPL tokens to your wallet**

Run this `mint-spl-tokens.ts` to mint SPL tokens to your wallet.

{% code title="mint-spl-tokens.ts" %}
```typescript
// Mint SPL Tokens for Airdrop - LocalNet
// 1. Load wallet and connect to local validator
// 2. Create SPL mint with token pool for compression via createMint()
// 3. Create ATA and mint SPL tokens to sender for airdrop preparation
// 4. Output mint address for use in simple-airdrop.ts

import { Keypair } from "@solana/web3.js";
import { createRpc } from "@lightprotocol/stateless.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { createTokenPool } from "@lightprotocol/compressed-token";
import * as fs from 'fs';
import * as os from 'os';

// Step 1: Setup local connection and load wallet
const connection = createRpc(); // defaults to localhost:8899

// Load wallet from filesystem
const walletPath = `${os.homedir()}/.config/solana/id.json`;
const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
const payer = Keypair.fromSecretKey(Buffer.from(secretKey));

(async () => {
  // Step 2: Create SPL mint with token pool for compression
  const mint = await createMint(connection, payer, payer.publicKey, null, 9);
  const poolTxId = await createTokenPool(connection, payer, mint);
  console.log(`Mint address: ${mint.toBase58()}`);
  console.log(`TokenPool created: ${poolTxId}`);

  // Step 3: Create associated token account for sender
  // The sender will send tokens from this account to the recipients as compressed tokens.
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint, // SPL mint with token pool for compression
    payer.publicKey
  );
  console.log(`ATA address: ${ata.address.toBase58()}`);

  // Step 4: Mint SPL tokens to ATA.
  // The sender will send tokens from this account to the recipients as compressed tokens.
  const mintToTxId = await mintTo(
    connection,
    payer,
    mint, // SPL mint with token pool for compression
    ata.address, // distributor ATA
    payer.publicKey,
    100_000_000_000 // amount: 100 tokens with 9 decimals
  );
  console.log(`\nSPL tokens minted and ready for distribution!`);
  console.log(`Transaction: ${mintToTxId}`);
  
  console.log(`\nCopy mint address to your airdrop script: ${mint.toBase58()}`);
})();
```
{% endcode %}
{% endstep %}

{% step %}
#### Execute the Airdrop

Next, distribute the SPL tokens to all recipients.

{% hint style="warning" %}
Ensure you have the latest `@lightprotocol/stateless.js` and `@lightprotocol/compressed-token` versions `≥ 0.21.0`!
{% endhint %}

<pre class="language-typescript" data-title="simple-airdrop.ts"><code class="lang-typescript">// Simple Airdrop - LocalNet
// 1. Load wallet and select compression infrastructure with getStateTreeInfos() and getTokenPoolInfos()
// 2. Build CompressedTokenProgram.compress() instruction for multiple recipients in one transaction
// 3. Execute transaction with compute budget and confirm compression operation with sendAndConfirmTx()
// 4. Verify distribution via getCompressedTokenAccountsByOwner

import { Keypair, PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import {
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectTokenPoolInfo,
} from "@lightprotocol/compressed-token";
import {
  bn,
  buildAndSignTx,
  calculateComputeUnitPrice,
  createRpc,
  dedupeSigner,
  Rpc,
  selectStateTreeInfo,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as fs from 'fs';
import * as os from 'os';

// Step 1: Setup local connection and load wallet
const connection: Rpc = createRpc(); // defaults to localhost:8899
<strong>const mint = new PublicKey("MINTADDRESS"); // Replace with mint address from mint-spl-tokens.ts
</strong>
<strong>// Local uses file wallet. Use constants from .env file in production
</strong>const walletPath = `${os.homedir()}/.config/solana/id.json`;
const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
const payer = Keypair.fromSecretKey(Buffer.from(secretKey));
const owner = payer;

(async () => {
  // Step 2: Select state tree and token pool
  const activeStateTrees = await connection.getStateTreeInfos();
  const treeInfo = selectStateTreeInfo(activeStateTrees);

  const infos = await getTokenPoolInfos(connection, mint);
  const info = selectTokenPoolInfo(infos);

  // Step 3: Get or create source token account for distribution
<strong>  // The sender will send tokens from this account to the recipients as compressed tokens.
</strong>  const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint, // SPL mint with token pool for compression
    payer.publicKey
  );

  // Step 4: Define airdrop recipients and amounts
  const airDropAddresses = [
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
  ];
  
  const amounts = [
    bn(20_000_000_000), // 20 tokens 
    bn(30_000_000_000), // 30 tokens
    bn(40_000_000_000), // 40 tokens
  ];

  const totalAmount = amounts.reduce((sum, amt) => sum + amt.toNumber(), 0);
  console.log(`Distributing ${totalAmount / 1e9} compressed tokens to ${airDropAddresses.length} recipients`);

  const initialSplBalance = await connection.getTokenAccountBalance(sourceTokenAccount.address);
  console.log(`Sender initial balance: ${initialSplBalance.value.uiAmount} tokens`);

  // Step 5: Build transaction with compute budget and compression instruction
  const instructions = [];
<strong>  // Set compute unit limits based on recipient count (estimated 120k CU per recipient)
</strong>  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 120_000 * airDropAddresses.length }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: calculateComputeUnitPrice(20_000, 120_000 * airDropAddresses.length), // dynamic priority fee
    })
  );

  // Create compression instruction for multiple recipients in one transaction
  const compressInstruction = await CompressedTokenProgram.compress({
    payer: payer.publicKey,
    owner: owner.publicKey,
    source: sourceTokenAccount.address, // source ATA holding SPL tokens
    toAddress: airDropAddresses, // recipient addresses for compressed tokens
    amount: amounts, // different amounts for each recipient
    mint, // SPL mint with token pool for compression
    tokenPoolInfo: info,
    outputStateTreeInfo: treeInfo, // destination state tree
  });
  instructions.push(compressInstruction);

  // Step 6: Sign and send transaction
  const additionalSigners = dedupeSigner(payer, [owner]);
  const { blockhash } = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(instructions, payer, blockhash, additionalSigners);
  
<strong>  // For production: Add address lookup table to reduce transaction size and fees
</strong>  // const lookupTableAddress = new PublicKey("9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ"); // mainnet // or "qAJZMgnQJ8G6vA3WRcjD9Jan1wtKkaCFWLWskxJrR5V" for devnet
  // const lookupTableAccount = (await connection.getAddressLookupTable(lookupTableAddress)).value!;
  // const tx = buildAndSignTx(instructions, payer, blockhash, additionalSigners, [lookupTableAccount]);
  const txId = await sendAndConfirmTx(connection, tx);

  console.log(`\nAirdrop completed!`);
  console.log(`Transaction: ${txId}`);

  // Step 7: Verify distribution via getCompressedTokenAccountsByOwner
  for (let i = 0; i &#x3C; airDropAddresses.length; i++) {
    const recipientAccounts = await connection.getCompressedTokenAccountsByOwner(airDropAddresses[i], { mint });
    const balance = recipientAccounts.items.reduce((sum, account) => sum + Number(account.parsed.amount), 0);
    console.log(`Recipient ${i + 1} (${airDropAddresses[i].toString()}): ${balance / 1e9} compressed tokens`);
  }

  const finalSplBalance = await connection.getTokenAccountBalance(sourceTokenAccount.address);
  console.log(`\nSender balance after airdrop: ${finalSplBalance.value.uiAmount} SPL tokens`);

  return txId;
})();
</code></pre>
{% endstep %}

{% step %}
#### Success!

You've executed an airdrop with compressed tokens.
{% endstep %}
{% endstepper %}

***

### Next Steps

You're ready to deploy an airdrop on devnet or mainnet.

{% hint style="success" %}
You can use an existing mint or create a new one with `createMint`.
{% endhint %}

1. Configure your environment variables

{% code title="example.env" %}
```bash
RPC_ENDPOINT=https://devnet.helius-rpc.com?api-key=YOUR_API_KEY
PAYER_KEYPAIR=YOUR_BASE58_ENCODED_PRIVATE_KEY
MINT_ADDRESS=YOUR_MINT_ADDRESS
```
{% endcode %}

2. Mint SPL tokens to your wallet, as shown in the guide above. See the [source code here](https://github.com/Lightprotocol/example-token-distribution/blob/main/src/simple-airdrop/mint.ts).
3. Choose below between the
   1. Simple Airdrop Script for <10,000 recipients, and
   2. Script for large-scale Airdrops with batched operations
4. Add the variables to your airdrop script & execute the airdrop!

#### A. Simple Airdrop

{% hint style="success" %}
For small airdrops (<10,000 recipients). [View ](https://github.com/Lightprotocol/example-token-distribution/blob/main/src/simple-airdrop/simple-airdrop.ts)[the source code here](https://github.com/Lightprotocol/example-token-distribution/blob/main/src/simple-airdrop/simple-airdrop.ts).
{% endhint %}

<details>

<summary>Simple Airdrop</summary>

```typescript
// 1. Load environment and select compression infrastructure with getStateTreeInfos() and getTokenPoolInfos()
// 2. Build CompressedTokenProgram.compress() instruction for multiple recipients in one transaction
// 3. Execute transaction with compute budget, address lookup table, and confirm with sendAndConfirmTx()
// 4. Verify distribution via getCompressedTokenAccountsByOwner

import {
    PublicKey,
    TransactionInstruction,
    ComputeBudgetProgram,
} from '@solana/web3.js';
import {
    CompressedTokenProgram,
    getTokenPoolInfos,
    selectTokenPoolInfo,
} from '@lightprotocol/compressed-token';
import {
    bn,
    buildAndSignTx,
    calculateComputeUnitPrice,
    createRpc,
    dedupeSigner,
    Rpc,
    selectStateTreeInfo,
    sendAndConfirmTx,
} from '@lightprotocol/stateless.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { MINT_ADDRESS, PAYER_KEYPAIR, RPC_ENDPOINT } from '../constants';

(async () => {
    const connection: Rpc = createRpc(RPC_ENDPOINT);
    const mintAddress = MINT_ADDRESS;
    const payer = PAYER_KEYPAIR;
    const owner = payer;
    const recipients = [
        PublicKey.default,
        // ...
    ];

    // 1. Select a state tree
    const treeInfos = await connection.getStateTreeInfos(); // Fixed: removed deprecated getCachedActiveStateTreeInfos
    const treeInfo = selectStateTreeInfo(treeInfos);

    // 2. Select a token pool
    const tokenPoolInfos = await getTokenPoolInfos(connection, mintAddress);
    const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);

    // Create an SPL token account for the sender.
    // The sender will send tokens from this account to the recipients as compressed tokens.
    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintAddress,
        payer.publicKey,
    );

    // 1 recipient = 120_000 CU
    // 5 recipients = 170_000 CU
    const units = 120_000;
    const amount = bn(333);
    // To land faster, replace this with a dynamic fee based on network
    // conditions.
    const microLamports = calculateComputeUnitPrice(20_000, units);

    const instructions: TransactionInstruction[] = [
        ComputeBudgetProgram.setComputeUnitLimit({ units }),
        ComputeBudgetProgram.setComputeUnitPrice({
            microLamports,
        }),
    ];

    const compressInstruction = await CompressedTokenProgram.compress({
        payer: payer.publicKey,
        owner: owner.publicKey,
        source: sourceTokenAccount.address,
        toAddress: recipients,
        amount: recipients.map(() => amount),
        mint: mintAddress,
        outputStateTreeInfo: treeInfo,
        tokenPoolInfo,
    });
    instructions.push(compressInstruction);

    // https://www.zkcompression.com/developers/protocol-addresses-and-urls#lookup-tables
    const lookupTableAddress = new PublicKey(
        '9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ', // mainnet
        // "qAJZMgnQJ8G6vA3WRcjD9Jan1wtKkaCFWLWskxJrR5V" // devnet
    );

    // Get the lookup table account state
    const lookupTableAccount = (
        await connection.getAddressLookupTable(lookupTableAddress)
    ).value!;

    const additionalSigners = dedupeSigner(payer, [owner]);

    const { blockhash } = await connection.getLatestBlockhash();

    const tx = buildAndSignTx(
        instructions,
        payer,
        blockhash,
        additionalSigners,
        [lookupTableAccount],
    );

    const txId = await sendAndConfirmTx(connection, tx);
    console.log(`txId: ${txId}`);
})();
```

</details>

#### B. Large-scale Airdrop with Batched Operations

{% hint style="success" %}
For large-scale airdrops (10,000+ recipients) we recommend to batch operations efficiently.\
[View the source code here.](https://github.com/Lightprotocol/example-token-distribution/tree/main/src/optimized-airdrop)
{% endhint %}

1. **create-instructions.ts** - Process recipients in chunks, create batched CompressedTokenProgram.compress() instructions with optimized compute limits

<details>

<summary>create-instructions.ts</summary>

```typescript
// 1. Process recipients in chunks with selectStateTreeInfo() and selectTokenPoolInfo() for each batch
// 2. Create CompressedTokenProgram.compress() instructions with ComputeBudgetProgram limits for multiple recipients
// 3. Return batched instructions for optimized large-scale airdrop execution

import {
  CompressedTokenProgram,
  TokenPoolInfo,
} from "@lightprotocol/compressed-token";
import {
  bn,
  selectStateTreeInfo,
  StateTreeInfo,
} from "@lightprotocol/stateless.js";
import {
  ComputeBudgetProgram,
  TransactionInstruction,
  PublicKey,
} from "@solana/web3.js";

interface CreateAirdropInstructionsParams {
  amount: number | bigint;
  recipients: PublicKey[];
  payer: PublicKey;
  sourceTokenAccount: PublicKey;
  mint: PublicKey;
  stateTreeInfos: StateTreeInfo[];
  tokenPoolInfos: TokenPoolInfo[];
  maxRecipientsPerInstruction?: number;
  maxInstructionsPerTransaction?: number;
  computeUnitLimit?: number;
  computeUnitPrice?: number | undefined;
}

export type InstructionBatch = TransactionInstruction[];

export async function createAirdropInstructions({
  amount,
  recipients,
  payer,
  sourceTokenAccount,
  mint,
  stateTreeInfos,
  tokenPoolInfos,
  maxRecipientsPerInstruction = 5,
  maxInstructionsPerTransaction = 3,
  computeUnitLimit = 500_000,
  computeUnitPrice = undefined,
}: CreateAirdropInstructionsParams): Promise<InstructionBatch[]> {
  const instructionBatches: InstructionBatch[] = [];
  const amountBn = bn(amount.toString());

  // Process recipients in chunks
  for (
    let i = 0;
    i < recipients.length;
    i += maxRecipientsPerInstruction * maxInstructionsPerTransaction
  ) {
    const instructions: TransactionInstruction[] = [];

    instructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitLimit })
    );
    if (computeUnitPrice) {
      instructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: computeUnitPrice,
        })
      );
    }

    const treeInfo = selectStateTreeInfo(stateTreeInfos);
    const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);
    
    for (let j = 0; j < maxInstructionsPerTransaction; j++) {
      const startIdx = i + j * maxRecipientsPerInstruction;
      const recipientBatch = recipients.slice(
        startIdx,
        startIdx + maxRecipientsPerInstruction
      );

      if (recipientBatch.length === 0) break;

      const compressIx = await CompressedTokenProgram.compress({
        payer,
        owner: payer,
        source: sourceTokenAccount,
        toAddress: recipientBatch,
        amount: recipientBatch.map(() => amountBn),
        mint,
        tokenPoolInfo,
        outputStateTreeInfo: treeInfo,
      });

      instructions.push(compressIx);
    }

    if (
      (computeUnitPrice && instructions.length > 2) ||
      (!computeUnitPrice && instructions.length > 1)
    ) {
      instructionBatches.push(instructions);
    }
  }

  return instructionBatches;
}
```

</details>

2. **update-blockhash.ts** - Maintain fresh blockhashes with background refresh loop using getLatestBlockhash() every 30 seconds

<details>

<summary>update-blockhash.ts</summary>

```typescript
import { Rpc } from "@lightprotocol/stateless.js";

// 1. Fetch initial blockhash with getLatestBlockhash() and store in exported variable
// 2. Set up background refresh loop with setTimeout() to update blockhash every 30 seconds
// 3. Provide AbortSignal support to stop background updates when airdrop completes

export let currentBlockhash: string;

export async function updateBlockhash(
  connection: Rpc,
  signal: AbortSignal
): Promise<void> {
  try {
    const { blockhash } = await connection.getLatestBlockhash();
    currentBlockhash = blockhash;
    console.log(`Initial blockhash: ${currentBlockhash}`);
  } catch (error) {
    console.error("Failed to fetch initial blockhash:", error);
    return;
  }

  // Update blockhash in the background
  (function updateInBackground() {
    if (signal.aborted) return;
    const timeoutId = setTimeout(async () => {
      if (signal.aborted) return;
      try {
        const { blockhash } = await connection.getLatestBlockhash();
        currentBlockhash = blockhash;
        console.log(`Updated blockhash: ${currentBlockhash}`);
      } catch (error) {
        console.error("Failed to update blockhash:", error);
      }
      updateInBackground();
    }, 30_000);

    signal.addEventListener("abort", () => clearTimeout(timeoutId));
  })();
}
```

</details>

3. **sign-and-send.ts** - Execute batched transactions with VersionedTransaction, retry logic, and sendAndConfirmTx() confirmation

<details>

<summary>sign-and-send.ts</summary>

```typescript
// 1. Initialize blockhash updates with updateBlockhash() and get address lookup table with getAddressLookupTable()
// 2. Process instruction batches with VersionedTransaction and retry logic for failed transactions
// 3. Yield batch results with sendAndConfirmTx() confirmation and comprehensive error handling

import { Rpc, sendAndConfirmTx } from "@lightprotocol/stateless.js";
import {
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { InstructionBatch } from "./create-instructions";
import { currentBlockhash, updateBlockhash } from "./update-blockhash";
import bs58 from "bs58";

export enum BatchResultType {
  Success = "success",
  Error = "error",
}

export type BatchResult =
  | { type: BatchResultType.Success; index: number; signature: string }
  | { type: BatchResultType.Error; index: number; error: string };

export async function* signAndSendAirdropBatches(
  batches: InstructionBatch[],
  payer: Keypair,
  connection: Rpc,
  maxRetries = 3
): AsyncGenerator<BatchResult> {
  const abortController = new AbortController();
  const { signal } = abortController;

  await updateBlockhash(connection, signal);

  const statusMap = new Array(batches.length).fill(0); // Initialize all as pending (0)

  // Use zk-compression look up table for your network
  // https://www.zkcompression.com/developers/protocol-addresses-and-urls#lookup-tables
  const lookupTableAddress = new PublicKey(
    "9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ"
  );

  // Get the lookup table account
  const lookupTableAccount = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value!;

  while (statusMap.includes(0)) {
    // Continue until all are confirmed or errored
    const pendingBatches = statusMap.filter((status) => status === 0).length;
    console.log(`Sending ${pendingBatches} transactions`);

    const sends = statusMap.map(async (status, index) => {
      if (status !== 0) return; // Skip non-pending batches

      let retries = 0;
      while (retries < maxRetries && statusMap[index] === 0) {
        if (!currentBlockhash) {
          console.warn("Waiting for blockhash to be set...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        try {
          const tx = new VersionedTransaction(
            new TransactionMessage({
              payerKey: payer.publicKey,
              recentBlockhash: currentBlockhash,
              instructions: batches[index],
            }).compileToV0Message([lookupTableAccount])
          );
          tx.sign([payer]);

          const sig = bs58.encode(tx.signatures[0]);
          console.log(`Batch ${index} signature: ${sig}`);

          const confirmedSig = await sendAndConfirmTx(connection, tx, {
            skipPreflight: true,
            commitment: "confirmed",
          });

          if (confirmedSig) {
            statusMap[index] = 1; // Mark as confirmed
            return {
              type: BatchResultType.Success,
              index,
              signature: confirmedSig,
            };
          }
        } catch (e) {
          retries++;
          console.warn(`Retrying batch ${index}, attempt ${retries + 1}`);
          if (retries >= maxRetries) {
            statusMap[index] = `err: ${(e as Error).message}`; // Mark as error
            return {
              type: BatchResultType.Error,
              index,
              error: (e as Error).message,
            };
          }
        }
      }
    });

    const results = await Promise.all(sends);
    for (const result of results) {
      if (result) yield result as BatchResult;
    }
  }

  // Stop the blockhash update loop
  abortController.abort();
}
```

</details>

4. **airdrop.ts** - Finally, put it all together in your main file:

<details>

<summary>airdrop.ts (entrypoint file)</summary>

{% code title="airdrop.ts" %}
```typescript
// 1. Create compressed mint with createMint(), mint supply with mintTo(), get infrastructure with getStateTreeInfos() and getTokenPoolInfos()
// 2. Generate batched compression instructions with createAirdropInstructions() - create CompressedTokenProgram.compress() calls
// 3. Execute batched airdrop with signAndSendAirdropBatches() - sign transactions and confirm with sendAndConfirmTx() for large-scale distribution

import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  calculateComputeUnitPrice,
  createRpc,
  Rpc,
} from "@lightprotocol/stateless.js";
import { createMint, getTokenPoolInfos } from "@lightprotocol/compressed-token";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { createAirdropInstructions } from "./create-instructions";
import { BatchResultType, signAndSendAirdropBatches } from "./sign-and-send";
import dotenv from "dotenv";
import bs58 from "bs58";
dotenv.config();

// Step 1: Setup environment and RPC connection
const RPC_ENDPOINT = `https://mainnet.helius-rpc.com?api-key=${process.env.HELIUS_API_KEY}`;
const connection: Rpc = createRpc(RPC_ENDPOINT);
const PAYER = Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR!));

// Step 2: Define airdrop recipient list (20 example addresses)
const recipients = [
  "GMPWaPPrCeZPse5kwSR3WUrqYAPrVZBSVwymqh7auNW7",
  "GySGrTgPtPfMtYoYTmwUdUDFwVJbFMfip7QZdhgXp8dy",
  "Bk1r2vcgX2uTzwV3AUyfRbSfGKktoQrQufBSrHzere74",
  "8BvkadZ6ycFNmQF7S1MHRvEVNb1wvDBFdjkAUnxjK9Ug",
  "EmxcvFKXsWLzUho8AhV9LCKeKRFHg5gAs4sKNJwhe5PF",
  "6mqdHkSpcvNexmECjp5XLt9V9KnSQre9TvbMLGr6sEPM",
  "3k4MViTWXBjFvoUZiJcNGPvzrqnTa41gcrbWCMMnV6ys",
  "2k6BfYRUZQHquPtpkyJpUx3DzM7W3K6H95igtJk8ztpd",
  "89jPyNNLCcqWn1RZThSS4jSqU5VCJkR5mAaSaVzuuqH4",
  "3MzSRLf9jSt6d1MFFMMtPfUcDY6XziRxTB8C5mfvgxXG",
  "9A1H6f3N8mpAPSdfqvYRD4cM1NwDZoMe3yF5DwibL2R2",
  "PtUAhLvUsVcoesDacw198SsnMoFNVskR5pT3QvsBSQw",
  "6C6W6WpgFK8TzTTMNCPMz2t9RaMs4XnkfB6jotrWWzYJ",
  "8sLy9Jy8WSh6boq9xgDeBaTznn1wb1uFpyXphG3oNjL5",
  "GTsQu2XCgkUczigdBFTWKrdDgNKLs885jKguyhkqdPgV",
  "85UK4bjC71Jwpyn8mPSaW3oYyEAiHPbESByq9s5wLcke",
  "9aEJT4CYHEUWwwSQwueZc9EUjhWSLD6AAbpVmmKDeP7H",
  "CY8QjRio1zd9bYWMKiVRrDbwVenf3JzsGf5km5zLgY9n",
  "CeHbdxgYifYhpB6sXGonKzmaejqEfq2ym5utTmB6XMVv",
  "4z1qss12DjUzGUkK1fFesqrUwrEVJJvzPMNkwqYnbAR5",
].map((address) => new PublicKey(address));

(async () => {
  // Step 3: Create compressed mint and register for compression
  // 3a: Call createMint() to initialize mint with compression pool
  const { mint, transactionSignature } = await createMint(
    connection,
    PAYER, // fee payer
    PAYER.publicKey, // mint authority
    9 // decimals
  );
  console.log(
    `create-mint success! txId: ${transactionSignature}, mint: ${mint.toBase58()}`
  );

  // Step 4: Create associated token account for distributor
  // 4a: Ensure PAYER has ATA for holding tokens before compression
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    PAYER, // fee payer
    mint, // token mint
    PAYER.publicKey // token owner
  );
  console.log(`ATA: ${ata.address.toBase58()}`);

  // Step 5: Mint initial token supply to distributor
  // 5a: Create 10 billion tokens in the ATA for airdrop distribution
  const mintToTxId = await mintTo(
    connection,
    PAYER, // fee payer and mint authority
    mint, // token mint
    ata.address, // destination ATA
    PAYER.publicKey, // mint authority
    10e9 * LAMPORTS_PER_SOL // amount: 10 billion tokens with decimals
  );
  console.log(`mint-to success! txId: ${mintToTxId}`);

  // Step 6: Get compression infrastructure for batch operations
  // 6a: Fetch available state trees for compressed account storage
  const stateTreeInfos = await connection.getStateTreeInfos();

  // 6b: Get token pool infos for compression operations
  const tokenPoolInfos = await getTokenPoolInfos(connection, mint);

  // Step 7: Create instruction batches for large-scale airdrop
  // 7a: Generate batched compression instructions with compute optimization
  const instructionBatches = await createAirdropInstructions({
    amount: 1e6, // 1 million tokens per recipient
    recipients, // array of recipient addresses
    payer: PAYER.publicKey, // transaction fee payer
    sourceTokenAccount: ata.address, // source ATA holding SPL tokens
    mint, // token mint
    stateTreeInfos, // state trees for compressed accounts
    tokenPoolInfos, // token pools for compression
    computeUnitPrice: calculateComputeUnitPrice(10_000, 500_000), // dynamic priority fee
  });

  // Step 8: Execute batched airdrop with error handling
  // 8a: Process instruction batches with retry logic and confirmation
  for await (const result of signAndSendAirdropBatches(
    instructionBatches,
    PAYER,
    connection
  )) {
    if (result.type === BatchResultType.Success) {
      console.log(`Batch ${result.index} confirmed: ${result.signature}`);
    } else if (result.type === BatchResultType.Error) {
      console.log(`Batch ${result.index} failed: ${result.error}`);
      // Use result.index to access the specific batch in instructionBatches
      const failedBatch = instructionBatches[result.index];
      console.log(`Failed batch instructions:`, failedBatch);
      // Additional logic to handle failed instructions
    }
  }

  console.log("Airdrop process complete.");
})();
```
{% endcode %}

</details>

***

### Advanced Features

**Decompress / Claim**

{% hint style="info" %}
Solana Wallets like Phantom and Backpack already support compressed tokens.\
Still, you can let users decompress to SPL via your Frontend to customize claims. Here's how:point\_down:
{% endhint %}

<details>

<summary><strong>Decompress SPL Tokens</strong></summary>

```typescript
import {
  bn,
  buildAndSignTx,
  sendAndConfirmTx,
  dedupeSigner,
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram, Keypair, PublicKey } from "@solana/web3.js";
import {
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectMinCompressedTokenAccountsForTransfer,
  selectTokenPoolInfosForDecompression,
} from "@lightprotocol/compressed-token";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import bs58 from "bs58";
import dotenv from "dotenv";
dotenv.config();

// Set these values in your .env file
const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const mint = new PublicKey(process.env.MINT_ADDRESS!);
const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR!));

const owner = payer;
const amount = 1e5;
const connection: Rpc = createRpc(RPC_ENDPOINT);

(async () => {
  // 1. Create an associated token account for the user if it doesn't exist
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  // 2. Fetch compressed token accounts
  const compressedTokenAccounts =
    await connection.getCompressedTokenAccountsByOwner(owner.publicKey, {
      mint,
    });

  // 3. Select
  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts.items,
    bn(amount)
  );

  // 4. Fetch validity proof
  const proof = await connection.getValidityProof(
    inputAccounts.map((account) => account.compressedAccount.hash)
  );

  // 5. Fetch token pool infos
  const tokenPoolInfos = await getTokenPoolInfos(connection, mint);

  // 6. Select
  const selectedTokenPoolInfos = selectTokenPoolInfosForDecompression(
    tokenPoolInfos,
    amount
  );

  // 7. Build instruction
  const ix = await CompressedTokenProgram.decompress({
    payer: payer.publicKey,
    inputCompressedTokenAccounts: inputAccounts,
    toAddress: ata.address,
    amount,
    tokenPoolInfos: selectedTokenPoolInfos,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
  });

  // 8. Sign, send, and confirm
  const { blockhash } = await connection.getLatestBlockhash();
  const additionalSigners = dedupeSigner(payer, [owner]);
  const signedTx = buildAndSignTx(
    [ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }), ix],
    payer,
    blockhash,
    additionalSigners
  );
  return await sendAndConfirmTx(connection, signedTx);
})();

```

</details>

Tip: Set priority fees dynamically for decompression. Learn more [here](https://docs.helius.dev/guides/sending-transactions-on-solana#summary).

#### Native Swap via Jup-API <a href="#native-swap-via-jup-api" id="native-swap-via-jup-api"></a>

If you have a custom FE, you can let users swap compressed tokens using the Jup-API. A reference implementation is available [here](https://github.com/Lightprotocol/example-jupiter-swap-node).

***

### Next Steps

Explore more guides in our cookbook section.

{% content-ref url="../cookbook/" %}
[cookbook](../cookbook/)
{% endcontent-ref %}

