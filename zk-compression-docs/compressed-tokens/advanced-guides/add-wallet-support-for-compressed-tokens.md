---
title: Add Wallet Support for Compressed Tokens
description: Guide to add Compressed Token Support to Your Wallet Application
---

# Best Practices

* **Clear UI Indicators —** Provide clear visual distinctions between compressed and uncompressed SPL tokens
* **Transaction History** — Provide detailed transaction histories for compressed tokens
* **Decompression and Compression** — Provide a clear path for users to convert between compressed and uncompressed tokens when needed

{% hint style="success" %}
Leading Solana Wallets like Phantom and Backpack already support compressed tokens.
{% endhint %}

# Integration Steps

{% tabs %}
{% tab title="Code Snippets" %}

### Display Compressed Token Balances

```javascript
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as os from 'os';

// 1. Setup RPC connection to local test validator
// 2. Call getCompressedTokenBalancesByOwnerV2() to fetch compressed token balances per mint
// 3. Display results with balance amounts and mint addresses

const connection: Rpc = createRpc(); // defaults to localhost:8899

// Load wallet from filesystem
const walletPath = `${os.homedir()}/.config/solana/id.json`;
const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
const payer = Keypair.fromSecretKey(Buffer.from(secretKey));
const publicKey = payer.publicKey;

(async () => {
    // Fetch compressed token balances for wallet address
    // Returns balance for owner per mint - can optionally apply filter: {mint, limit, cursor}
    const balances = await connection.getCompressedTokenBalancesByOwnerV2(publicKey);

    console.log(`\nMint Address ${publicKey.toString()}:\n`);

    if (balances.value.items.length === 0) {
        console.log("No compressed token balances found");
    } else {
        for (const item of balances.value.items) {
            const balanceValue = typeof item.balance === 'string'
                ? parseInt(item.balance, 16)
                : item.balance;

            // Fetch mint info to get decimals
            try {
                const mintInfo = await connection.getAccountInfo(new PublicKey(item.mint));
                if (mintInfo && mintInfo.data) {
                    const decimals = mintInfo.data[44];
                    console.log(`Compressed Token Balance: ${balanceValue / Math.pow(10, decimals)} tokens`);
                }
            } catch (e) {
                console.log(`Could not fetch mint info: ${e}`);
            }
        }
    }
})();

```

### Get Transaction History

```javascript
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const connection: Rpc = createRpc();
const publicKey = new PublicKey('<add-pubkey>');

(async () => {
    const signatures = await connection.getCompressionSignaturesForOwner(publicKey);
    console.log(signatures);

    if (signatures.items.length > 0) {
        const parsedTransaction = await connection.getTransactionWithCompressionInfo(signatures.items[0].signature);
        console.log(parsedTransaction);
    }
})();
```

### Send Compressed Tokens

{% code overflow="wrap" expandable="true" %}
```typescript
import {
  Rpc,
  createRpc,
  bn,
  dedupeSigner,
  sendAndConfirmTx,
  buildAndSignTx,
} from "@lightprotocol/stateless.js";
import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer,
} from "@lightprotocol/compressed-token";
import { ComputeBudgetProgram, Keypair, PublicKey } from "@solana/web3.js";

const connection: Rpc = createRpc();
const mint = new PublicKey("MINT_ADDRESS");
const payer = PAYER_KEYPAIR;
const owner = payer;
const recipient = Keypair.generate();
const amount = bn(1e8);

(async () => {
  const compressedTokenAccounts =
    await connection.getCompressedTokenAccountsByOwner(owner.publicKey, { mint });

  if (compressedTokenAccounts.items.length === 0) {
    console.log("No compressed token accounts found");
    return;
  }

  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts.items,
    amount
  );

  const proof = await connection.getValidityProof(
    inputAccounts.map((account) => account.compressedAccount.hash)
  );

  const ix = await CompressedTokenProgram.transfer({
    payer: payer.publicKey,
    inputCompressedTokenAccounts: inputAccounts,
    toAddress: recipient.publicKey,
    amount,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const additionalSigners = dedupeSigner(payer, [owner]);
  const signedTx = buildAndSignTx(
    [ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }), ix],
    payer,
    blockhash,
    additionalSigners
  );

  const transferTxId = await sendAndConfirmTx(connection, signedTx);
  console.log(`Transaction: ${transferTxId}`);
})();
```
{% endcode %}

{% endtab %}

{% tab title="End-to-End Guide" %}

{% stepper %}
{% step %}
### **Prerequisites**

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
### Display Compressed Token Balances

This example fetches and displays all compressed token balances for a wallet address.

```javascript
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as os from 'os';

// 1. Setup RPC connection to local test validator
// 2. Call getCompressedTokenBalancesByOwnerV2() to fetch compressed token balances per mint
// 3. Display results with balance amounts and mint addresses

const connection: Rpc = createRpc(); // defaults to localhost:8899

// Load wallet from filesystem
const walletPath = `${os.homedir()}/.config/solana/id.json`;
const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
const payer = Keypair.fromSecretKey(Buffer.from(secretKey));
const publicKey = payer.publicKey;

(async () => {
    // Fetch compressed token balances for wallet address
    // Returns balance for owner per mint - can optionally apply filter: {mint, limit, cursor}
    const balances = await connection.getCompressedTokenBalancesByOwnerV2(publicKey);

    console.log(`\nMint Address ${publicKey.toString()}:\n`);

    if (balances.value.items.length === 0) {
        console.log("No compressed token balances found");
    } else {
        for (const item of balances.value.items) {
            const balanceValue = typeof item.balance === 'string'
                ? parseInt(item.balance, 16)
                : item.balance;

            // Fetch mint info to get decimals
            try {
                const mintInfo = await connection.getAccountInfo(new PublicKey(item.mint));
                if (mintInfo && mintInfo.data) {
                    // SPL Token mint decimals are at offset 44
                    const decimals = mintInfo.data[44];
                    console.log(`Compressed Token Balance: ${balanceValue / Math.pow(10, decimals)} tokens`);
                }
            } catch (e) {
                console.log(`Could not fetch mint info: ${e}`);
            }
        }
    }
})();
```
{% endstep %}

{% step %}
### Get Transaction History

This example retrieves compression transaction signatures and detailed transaction information for wallet transaction history display.

```javascript
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

// 1. Setup RPC connection and fetch compression transaction signatures using getCompressionSignaturesForOwner()
// 2. Retrieve detailed transaction data with getTransactionWithCompressionInfo() including pre/post balances
// 3. Display transaction history with signature list and balance changes

const connection: Rpc = createRpc(); // defaults to localhost:8899
const publicKey = new PublicKey('CLEuMG7pzJX9xAuKCFzBP154uiG1GaNo4Fq7x6KAcAfG');

(async () => {
    // Fetch compression transaction signatures for wallet address
    // Returns confirmed signatures for compression transactions involving the specified account owner
    const signatures = await connection.getCompressionSignaturesForOwner(publicKey);
    console.log(signatures);

    // Check if any signatures exist before trying to access them
    if (signatures.items.length > 0) {
        // Retrieve detailed transaction information with compression data
        // Returns pre- and post-compressed token balances grouped by owner
        const parsedTransaction = await connection.getTransactionWithCompressionInfo(signatures.items[0].signature);
        console.log(parsedTransaction);
    } else {
        console.log("No compression transactions found for this address");
    }
})();
```
{% endstep %}

{% step %}
### Send Compressed Tokens

First, set up a test mint to and mint 10 compressed tokens to your filesystem wallet.

<details>

<summary>Set up Test Mint</summary>

```typescript
import { Keypair } from "@solana/web3.js";
import { Rpc, confirmTx, createRpc } from '@lightprotocol/stateless.js';
import { createMint, mintTo } from '@lightprotocol/compressed-token';
import * as fs from 'fs';
import * as os from 'os';

// 1. Setup RPC connection and load filesystem wallet for mint operations
// 2. Call createMint() to create SPL mint with token pool for compression
// 3. Call mintTo() to mint compressed tokens to filesystem wallet

const connection: Rpc = createRpc(); // defaults to localhost:8899

// Load wallet from filesystem
const walletPath = `${os.homedir()}/.config/solana/id.json`;
const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
const payer = Keypair.fromSecretKey(Buffer.from(secretKey));
const mintKeypair = Keypair.generate();

(async() => {
    // Fund payer with SOL
    await connection.requestAirdrop(payer.publicKey, 1e9);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create SPL mint with token pool for compression
    const { mint, transactionSignature } = await createMint(
        connection,
        payer,
        payer.publicKey, // mint authority
        9,
        mintKeypair,
    );
    console.log(`Mint address: ${mint.toString()}`);
    console.log(`Transaction: ${transactionSignature}`);

    // Mint compressed tokens to payer
    const mintToTxId = await mintTo(
        connection,
        payer,
        mint, // SPL mint with token pool for compression
        payer.publicKey, // recipient address
        payer, 
        10e9,
    );

    console.log(`\nMinted ${10e9 / 1e9} compressed token`);
    console.log(`Transaction: ${mintToTxId}`);
})();
```

</details>

{% hint style="success" %}
Make sure you add your Mint address to `send-tokens.ts`.
{% endhint %}

<pre class="language-typescript" data-title="send-tokens.ts"><code class="lang-typescript">// Compressed Token Transfer - Local
// 1. Load wallet and fetch compressed token accounts with getCompressedTokenAccountsByOwner()
// 2. Select accounts for transfer using selectMinCompressedTokenAccountsForTransfer() 
//    and get validity proof with getValidityProof()
// 3. Create transfer instruction with CompressedTokenProgram.transfer() 
//    and submit transaction with sendAndConfirmTx()
// 4. Verify balances via getCompressedTokenAccountsByOwner()

import {
  Rpc,
  createRpc,
  bn,
  dedupeSigner,
  sendAndConfirmTx,
  buildAndSignTx,
} from "@lightprotocol/stateless.js";
import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer,
} from "@lightprotocol/compressed-token";
import { ComputeBudgetProgram, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from 'fs';
import * as os from 'os';

// Step 1: Setup RPC connection and define transfer parameters
const connection: Rpc = createRpc(); // defaults to localhost:8899
<strong>const mint = new PublicKey("MINT ADDRESS"); // Replace with mint address
</strong>
// Load wallet from filesystem
const walletPath = `${os.homedir()}/.config/solana/id.json`;
const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
const payer = Keypair.fromSecretKey(Buffer.from(secretKey));
const owner = payer;

const recipient = Keypair.generate();
const amount = bn(1e8);

(async () => {
  // Step 2: Fetch compressed account hashes from state trees
  const compressedTokenAccounts =
    await connection.getCompressedTokenAccountsByOwner(owner.publicKey, {
      mint, // SPL mint with token pool for compression
    });

  if (compressedTokenAccounts.items.length === 0) {
    console.log("No compressed token accounts found for this mint");
    return;
  }

  // Show initial sender balance
  const initialBalance = compressedTokenAccounts.items.reduce((sum, account) => sum + Number(account.parsed.amount), 0);
  console.log(`Sender balance: ${initialBalance / 1e8} compressed tokens`);

  // Step 3: Select minimum compressed accounts for transfer amount
  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts.items,
    amount
  );

  // Get validity proof for Merkle tree verification
  const proof = await connection.getValidityProof(
    inputAccounts.map((account) => account.compressedAccount.hash)
  );

  // Step 4: Create transfer instruction that consumes input accounts and creates new output accounts
  const ix = await CompressedTokenProgram.transfer({
    payer: payer.publicKey,
    inputCompressedTokenAccounts: inputAccounts, // accounts to consume
    toAddress: recipient.publicKey,
    amount,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
  });

  // Step 5: Build, sign, and submit transaction
  const { blockhash } = await connection.getLatestBlockhash();
  const additionalSigners = dedupeSigner(payer, [owner]);
  const signedTx = buildAndSignTx(
    [ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }), ix],
    payer,
    blockhash,
    additionalSigners
  );
  const transferTxId = await sendAndConfirmTx(connection, signedTx);

  console.log(`\nTransferred ${amount.toNumber() / 1e8} compressed tokens`);
  console.log(`Transaction: ${transferTxId}`);
  console.log(`Recipient: ${recipient.publicKey.toString()}`);

  // Step 6: Verify via getCompressedTokenAccountsByOwner
  const senderCompressedAccounts = await connection.getCompressedTokenAccountsByOwner(payer.publicKey, { mint });
  const senderBalance = senderCompressedAccounts.items.reduce((sum, account) => sum + Number(account.parsed.amount), 0);
  
  const recipientCompressedAccounts = await connection.getCompressedTokenAccountsByOwner(recipient.publicKey, { mint });
  const recipientBalance = recipientCompressedAccounts.items.reduce((sum, account) => sum + Number(account.parsed.amount), 0);

  console.log(`\nSummary compressed token balances:`);
  console.log(`Sender balance: ${senderBalance / 1e8} compressed tokens`);
  console.log(`Recipient balance: ${recipientBalance / 1e8} compressed token`);

  return transferTxId;
})();
</code></pre>
{% endstep %}

{% endstepper %}

{% endtab %}

{% endtabs %}

## Advanced Integrations

Use these integrations to let users convert between regular and compressed format as needed.

<details>

<summary><strong>Decompress to Regular SPL</strong></summary>

This example converts compressed tokens to regular SPL format using `CompressedTokenProgram.decompress().`

```javascript
import {
  bn,
  buildAndSignTx,
  sendAndConfirmTx,
  dedupeSigner,
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram } from "@solana/web3.js";
import {
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectMinCompressedTokenAccountsForTransfer,
  selectTokenPoolInfosForDecompression,
} from "@lightprotocol/compressed-token";

// 1. Setup RPC connection and fetch compressed token accounts with getCompressedTokenAccountsByOwner()
// 2. Select accounts and token pool infos using selectMinCompressedTokenAccountsForTransfer() and selectTokenPoolInfosForDecompression()
// 3. Create decompress instruction with CompressedTokenProgram.decompress() and submit transaction

// Step 1: Setup RPC connection and define decompression parameters
const connection: Rpc = createRpc("https://mainnet.helius-rpc.com?api-key=<api_key>";);
const payer = PAYER_KEYPAIR;
const owner = PAYER_KEYPAIR;
const mint = MINT_ADDRESS;
const amount = 1e5; // 100K tokens to decompress

(async () => {
  // 1. Fetch compressed token accounts
  const compressedTokenAccounts =
    await connection.getCompressedTokenAccountsByOwner(owner.publicKey, {
      mint,
    });

  // 2. Select
  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts.items,
    bn(amount)
  );

  // 3. Fetch validity proof
  const proof = await connection.getValidityProof(
    inputAccounts.map((account) => account.compressedAccount.hash)
  );

  // 4. Fetch & Select tokenPoolInfos
  const tokenPoolInfos = await getTokenPoolInfos(connection, mint);
  const selectedTokenPoolInfos = selectTokenPoolInfosForDecompression(
    tokenPoolInfos,
    amount
  );

  // 5. Build instruction
  const ix = await CompressedTokenProgram.decompress({
    payer: payer.publicKey,
    inputCompressedTokenAccounts: inputAccounts,
    toAddress: owner.publicKey,
    amount,
    tokenPoolInfos: selectedTokenPoolInfos,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
  });
  
  
  // 6. Sign, send, and confirm.
  // Example with keypair:
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

<details>

<summary><strong>Compress Regular SPL Tokens</strong></summary>

This example converts regular SPL tokens to compressed format using `CompressedTokenProgram.compress().`

```typescript
// 1. Setup RPC connection and get user ATA with getOrCreateAssociatedTokenAccount()
// 2. Fetch state tree and token pool infos using getStateTreeInfos() and getTokenPoolInfos()
// 3. Create compress instruction with CompressedTokenProgram.compress() and submit transaction


import {
  buildAndSignTx,
  sendAndConfirmTx,
  Rpc,
  createRpc,
  selectStateTreeInfo,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram } from "@solana/web3.js";
import {
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectTokenPoolInfo,
} from "@lightprotocol/compressed-token";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

// Step 1: Setup RPC connection and define compression parameters
const connection: Rpc = createRpc(
  "https://mainnet.helius-rpc.com?api-key=<api_key>"
);
  const payer = <PAYER_KEYPAIR>;
  const mint = <MINT_ADDRESS>;
const amount = 1e5; // 100K tokens to compress

(async () => {
  // Step 2: Get or create associated token account for SPL tokens
  const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer, // fee payer
    mint, // token mint address
    payer.publicKey // token account owner
  );

  // Step 3: Fetch and select state tree info for compression
  const treeInfos = await connection.getStateTreeInfos();
  const treeInfo = selectStateTreeInfo(treeInfos);

  // Step 4: Fetch and select token pool info for compression
  const tokenPoolInfos = await getTokenPoolInfos(connection, mint);
  const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);

  // Step 5: Create compress instruction - transfer SPL tokens to pool and create compressed accounts
  const compressInstruction = await CompressedTokenProgram.compress({
    payer: payer.publicKey, // fee payer
    owner: payer.publicKey, // owner of source SPL tokens
    source: sourceTokenAccount.address, // source ATA address
    toAddress: payer.publicKey, // recipient of compressed tokens (self)
    amount, // amount to compress
    mint, // token mint address
    outputStateTreeInfo: treeInfo, // state tree for compressed accounts
    tokenPoolInfo, // token pool for compression
  });

  // Step 6: Build, sign, and submit compression transaction
  const { blockhash } = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(
    [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      compressInstruction,
    ],
    payer, // transaction signer
    blockhash,
    [payer] // additional signers
  );
  await sendAndConfirmTx(connection, tx);
})();
```

</details>

## Common Errors

<details>

<summary>No compressed tokens found</summary>

If `getCompressedTokenBalancesByOwnerV2` returns empty:

* Ensure the wallet has compressed tokens (not regular SPL tokens)
* Verify you're on the correct network (devnet/mainnet)

</details>

# Next Steps

Take a look at other compressed token guides.

{% content-ref url="../../../zk-compression-docs/compressed-tokens/guides/" %}
[guides](../../../zk-compression-docs/compressed-tokens/guides/)
{% endcontent-ref %}
