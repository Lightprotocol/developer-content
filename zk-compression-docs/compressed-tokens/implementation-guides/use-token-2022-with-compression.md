---
description: >-
  Complete guide to mint, compress and transfer tokens with Token-2022 Metadata
  with ZK Compression.
---


### What you will do

With this guide you will mint, compress, and transfer tokens with Token-2022 Metadata.

### Overview Token 2022 Extensions

Token 2022 Extensions are optional features that can be added to Token 2022 mints on Solana to enable additional functionality.

ZK Compression supports compressing the following mint-extensions:

* MetadataPointer
* TokenMetadata
* InterestBearingConfig
* GroupPointer
* GroupMemberPointer
* TokenGroup
* TokenGroupMember

All other extensions are not yet supported.

{% hint style="info" %}
If you require support for other mint-extensions, [let us know](https://t.me/swen_light)!
{% endhint %}

### Get started

{% stepper %}
{% step %}
#### Prerequisites

{% hint style="info" %}
You need the following SDK versions:

* `@lightprotocol/stateless.js` ≥ 0.21.0
* `@lightprotocol/compressed-token` ≥ 0.21.0
* `@solana/web3.js` ≥ 1.95.3
{% endhint %}

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
#### Mint, compress, and transfer tokens with Token-2022 Metadata

Run `compress-t22.ts`.

{% code title="compress-t22.ts" %}
```typescript
// Token-2022 with ZK Compression - Local
// 1. Load wallet and connect to local validator
// 2. Create Token-2022 mint with metadata extension and register for compression via createTokenPool()
// 3. Mint SPL tokens to ATA, compress via compress(), and transfer compressed tokens via transfer()
// 4. Verify balances via getTokenAccountBalance and getCompressedTokenAccountsByOwner

import { confirmTx, createRpc } from "@lightprotocol/stateless.js";
import {
  compress,
  createTokenPool,
  transfer,
} from "@lightprotocol/compressed-token";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo as mintToSpl,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

// Step 1: Setup local connection and load wallet
import * as fs from 'fs';
import * as os from 'os';

const walletPath = `${os.homedir()}/.config/solana/id.json`;
const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
const payer = Keypair.fromSecretKey(Buffer.from(secretKey));
const connection = createRpc(); // defaults to localhost:8899

(async () => {

  // Generate mint keypair and define Token-2022 metadata
  const mint = Keypair.generate();
  const decimals = 9;

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name: "Local Test Token",
    symbol: "LTT",
    uri: "https://example.com/token-metadata.json",
    additionalMetadata: [["environment", "localnet"], ["test", "true"]],
  };

  // Calculate space requirements for Token-2022 mint with MetadataPointer extension
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  // Check wallet balance
  const balance = await connection.getBalance(payer.publicKey);

  // Step 2: Create Token-2022 mint with metadata extension
  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );
  
  const mintTransaction = new Transaction().add(
    // Create account for Token-2022 mint
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    // Initialize MetadataPointer extension
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    // Initialize Token-2022 mint account
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    ),
    // Initialize token metadata
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    })
  );

  // Send Token-2022 mint creation transaction
  const mintCreationTxId = await sendAndConfirmTransaction(
    connection, 
    mintTransaction, 
    [payer, mint]
  );
  console.log(`Token-2022 mint created with address: ${mint.publicKey.toString()}`);

  // Step 3: Call createTokenPool() to initialize omnibus account
  // and register Token-2022 mint with Compressed Token Program
  // Create PDA that holds SPL tokens for compressed tokens
  const registerTxId = await createTokenPool(
    connection,
    payer,
    mint.publicKey, // Token-2022 mint to register with compressed token program 
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  // Step 4: Create associated token account and mint tokens
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint.publicKey, // Token-2022 mint with token pool for compression
    payer.publicKey,
    undefined,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  // Mint Token-2022 tokens to ATA
  const mintAmount = 400_000_000; // 0.4 tokens
  const mintToTxId = await mintToSpl(
    connection,
    payer,
    mint.publicKey, // Token-2022 mint with token pool for compression
    ata.address, // destination token account
    payer.publicKey, // mint authority
    mintAmount, // amount to mint
    undefined, // multiSigners (not used for single authority)
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log(`Minted ${mintAmount / 1e9} Token-2022 tokens with metadata extension`);
  console.log(`Transaction: ${mintToTxId}`);

  // Step 5: Call compress() to convert Token-2022 tokens to compressed format
  // Transfer Token-2022 tokens to omnibus pool and mint compressed tokens
  const compressAmount = 300_000_000; // 0.3 tokens
  const compressTxId = await compress(
    connection,
    payer,
    mint.publicKey, // Token-2022 mint with token pool for compression
    compressAmount, // amount to compress
    payer, // owner of SPL tokens
    ata.address, // Source ATA for compression
    payer.publicKey // recipient for compressed tokens
  );
  console.log(`\nCompressed ${compressAmount / 1e9} Token-2022 tokens`);
  console.log(`Transaction: ${compressTxId}`);

  // Step 6: Transfer compressed Token-2022 tokens
  const transferRecipient = Keypair.generate(); // Keypair recipient
  const transferAmount = 100_000_000; // 0.1 tokens
  const transferTxId = await transfer(
    connection,
    payer,
    mint.publicKey, // Token-2022 mint with token pool for compression
    transferAmount,
    payer,
    transferRecipient.publicKey
  );
  console.log(`\nTransferred ${transferAmount / 1e9} Compressed Token-2022 tokens`);
  console.log(`Transaction: ${transferTxId}`);
  console.log(`Recipient: ${transferRecipient.publicKey.toString()}`);

  // Step 7: Verify balances via getTokenAccountBalance and getCompressedTokenAccountsByOwner
  const senderCompressedAccounts = await connection.getCompressedTokenAccountsByOwner(payer.publicKey, { mint: mint.publicKey });
  const senderBalance = senderCompressedAccounts.items.reduce((sum, account) => sum + Number(account.parsed.amount), 0);
  
  const recipientCompressedAccounts = await connection.getCompressedTokenAccountsByOwner(transferRecipient.publicKey, { mint: mint.publicKey });
  const recipientBalance = recipientCompressedAccounts.items.reduce((sum, account) => sum + Number(account.parsed.amount), 0);

  const splBalance = await connection.getTokenAccountBalance(ata.address);

  console.log(`\nSummary Token-2022 balances:`);
  console.log(`Sender balance: ${senderBalance / 1e9} compressed tokens / ${splBalance.value.uiAmount} SPL tokens`);
  console.log(`Recipient balance: ${recipientBalance / 1e9} compressed tokens`);

})().catch(console.error);
```
{% endcode %}
{% endstep %}

{% step %}
#### Success!

You've just compressed Token-2022 tokens with metadata extensions and transferred them using ZK Compression.
{% endstep %}
{% endstepper %}

***

### Next Steps

Explore more guides in our cookbook section.

{% content-ref url="../../../zk-compression-docs/compressed-tokens/guides/" %}
[guides](../../../zk-compression-docs/compressed-tokens/guides/)
{% endcontent-ref %}
