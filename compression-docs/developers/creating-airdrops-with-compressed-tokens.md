# Creating Airdrops with Compressed Tokens

**ZK Compression is the most efficient way to distribute your SPL tokens.**&#x20;

**By the end of this guide, you'll have implemented a fully functioning, programmatic airdrop.**

:bulb: Further below, we provide an advanced section for custom [Decompress/claims](creating-airdrops-with-compressed-tokens.md#advanced-decompress-claim) and [native Jupiter swaps](creating-airdrops-with-compressed-tokens.md#native-swap-via-jup-api) with zk-compressed tokens.

{% hint style="info" %}
_Key benefits of compressed tokens:_

* Up to **5000x** cheaper than regular tokens
* Supported by leading Solana wallets, including Phantom and Backpack
* Compatible with existing programs via atomic compression and decompression between SPL <> Compressed tokens
{% endhint %}

## Airdropping SPL Tokens

<details>

<summary>No-code Solution</summary>

[Airship](https://airship.helius.dev/) by Helius Labs is an excellent no-code airdrop tool. Airship uses compressed tokens under the hood.\
\
For programmatic airdrops with more control, keep reading. :point\_down:

</details>

The high level overview is this:

1. Mint/Send the to-be-airdropped SPL tokens to a wallet you control.
2. Create batches of instructions based on a list of recipients and amounts.
3. Build transactions from these instruction batches, then sign, send, and confirm them.

{% hint style="info" %}
The code snippets work! You can copy + paste them into your IDE.
{% endhint %}

### 1. Install the SDK

{% tabs %}
{% tab title="npm" %}
```bash
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token \ 
    bs58 \
    dotenv
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \ 
    @solana/spl-token \ 
    bs58 \
    dotenv
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token \ 
    bs58 \
    dotenv
```
{% endtab %}
{% endtabs %}

### 2. Mint SPL tokens to yourself

```typescript
import { Keypair } from '@solana/web3.js';
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { createMint } from '@lightprotocol/compressed-token';
import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";


// Create RPC Connection
const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com?api-key=<api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT);
const PAYER = Keypair.fromSecretKey(<private_key>);

(async() => {
   
    /// Create an SPL mint + register it for compression.
    const { mint, transactionSignature } = await createMint(
        connection,
        PAYER,
        PAYER.publicKey,
        9,
        PAYER,
    );
    console.log(`create-mint success! txId: ${transactionSignature}`);


    /// Create an associated SPL token account for the sender (PAYER)
    const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        PAYER,
        mint,
        PAYER.publicKey
    );
    console.log(`ATA: ${ata.address.toBase58()}`);



    /// Mint SPL tokens to the sender
    const mintToTxId = await mintTo(
        connection,
        PAYER,
        mint,
        ata.address,
        PAYER.publicKey,
        10e9 * 1e9 // 10_000_000_000 * decimals
      );
    console.log(`mint-to success! txId: ${mintToTxId}`);
})();
```

You now have a regular SPL token account owned by `PAYER` that holds all minted tokens.

### 3. Distribute the tokens

Next, you want to distribute the SPL tokens from your distributor to all recipients.

{% hint style="info" %}
Ensure you have the latest `@lightprotocol/stateless.js` and `@lightprotocol/compressed-token` versions `≥ 0.20.9`!
{% endhint %}

#### A. Simple version

<details>

<summary><strong>Simple airdrop script</strong></summary>

```typescript
import * as web3 from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import {
  bn,
  buildAndSignTx,
  calculateComputeUnitPrice,
  createRpc,
  dedupeSigner,
  pickRandomTreeAndQueue,
  Rpc,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import * as splToken from "@solana/spl-token";
import dotenv from "dotenv";
import bs58 from "bs58";
dotenv.config();

// Set these values in your .env file
const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const MINT_ADDRESS = new PublicKey(process.env.MINT_ADDRESS!);
const PAYER_KEYPAIR = Keypair.fromSecretKey(
  bs58.decode(process.env.PAYER_KEYPAIR!)
);

(async () => {
  try {
    const connection: Rpc = createRpc(RPC_ENDPOINT);
    const mintAddress = MINT_ADDRESS;
    const payer = PAYER_KEYPAIR;
    const activeStateTrees = await connection.getCachedActiveStateTreeInfo();

    /// Pick a new tree for each transaction!
    const { tree } = pickRandomTreeAndQueue(activeStateTrees);

    // Get the SPL token account for the sender which you previously created
    // The sender will send tokens from this account to the recipients as compressed tokens.
    const sourceTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintAddress,
      payer.publicKey
    );

    // Airdrop to example recipient
    // 1 recipient = 120_000 CU
    // 5 recipients = 170_000 CU
    const airDropAddresses = [
      "GMPWaPPrCeZPse5kwSR3WUrqYAPrVZBSVwymqh7auNW7",
    ].map((address) => new web3.PublicKey(address));

    const amount = bn(111); // each recipient will receive 111 tokens
    
    const instructions: web3.TransactionInstruction[] = [];
    instructions.push(
      web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 120_000 }),
      web3.ComputeBudgetProgram.setComputeUnitPrice({
        // Replace this with a dynamic priority_fee based on network conditions.
        microLamports: calculateComputeUnitPrice(20_000, 120_000),
      })
    );
    
    const compressInstruction = await CompressedTokenProgram.compress({
      payer: payer.publicKey,
      owner: payer.publicKey,
      source: sourceTokenAccount.address, // here, the owner of this account is also the payer.
      toAddress: airDropAddresses,
      amount: airDropAddresses.map(() => amount),
      mint: mintAddress,
      outputStateTree: tree,
    });
    instructions.push(compressInstruction);

    // Use zk-compression LUT for your network
    // https://www.zkcompression.com/developers/protocol-addresses-and-urls#lookup-tables
    const lookupTableAddress = new web3.PublicKey(
      "9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ" // mainnet
    );

    // Get the lookup table account state
    const lookupTableAccount = (
      await connection.getAddressLookupTable(lookupTableAddress)
    ).value!;

    // Sign the transaction with the payer and owner keypair
    const owner = payer;
    const additionalSigners = dedupeSigner(payer, [owner]);
    const { blockhash } = await connection.getLatestBlockhash();

    const tx = buildAndSignTx(
      instructions,
      payer,
      blockhash,
      additionalSigners,
      [lookupTableAccount]
    );

    const simulate = await connection.simulateTransaction(tx);
    if (simulate.value.err) {
      console.error("Simulation failed", simulate);
    } else {
      console.log("Simulation successful", simulate);
    }
    // Uncomment to send the transaction.
    // const txId = await sendAndConfirmTx(connection, tx);
    // console.log(`txId: ${txId}`);
  } catch (e) {
    console.error(`Compression failed:`, e);
  }
})();
```

</details>

#### B. Optimized for large-scale airdrops

First, create a helper that takes recipients and amounts and returns batches of instructions:

### create-instructions.ts

```typescript
// create-instructions.ts
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import {
  bn,
  ActiveTreeBundle,
  pickRandomTreeAndQueue,
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
  stateTrees: ActiveTreeBundle[];
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
  stateTrees,
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

    const { tree } = pickRandomTreeAndQueue(stateTrees);

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
        outputStateTree: tree,
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

Now, you can create the logic that signs and sends transactions in batches. For this, first add a helper method that refreshes Solana blockhashes in the background:

### update-blockhash.ts

```typescript
// update-blockhash.ts
import { Rpc } from "@lightprotocol/stateless.js";

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

Then, add the helper that signs and sends the transactions using recent blockhashes.

### sign-and-send.ts

```typescript
// sign-and-send.ts
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

  // Use zk-compression LUT for your network
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

Finally, put it all together in your main file:

### airdrop.ts (main file)

```typescript
// airdrop.ts
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  calculateComputeUnitPrice,
  createRpc,
  Rpc,
} from "@lightprotocol/stateless.js";
import { createMint } from "@lightprotocol/compressed-token";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { createAirdropInstructions } from "./create-instructions";
import { BatchResultType, signAndSendAirdropBatches } from "./sign-and-send";
import dotenv from "dotenv";
import bs58 from "bs58";
dotenv.config();

const RPC_ENDPOINT = `https://mainnet.helius-rpc.com?api-key=${process.env.HELIUS_API_KEY}`;
const connection: Rpc = createRpc(RPC_ENDPOINT);
const PAYER = Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR!));

// These are 20 example Solana Pubkeys
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
  /// Create an SPL mint + register it for compression.
  const { mint, transactionSignature } = await createMint(
    connection,
    PAYER,
    PAYER.publicKey,
    9
  );
  console.log(
    `create-mint success! txId: ${transactionSignature}, mint: ${mint.toBase58()}`
  );

  /// Create an associated SPL token account for the sender (PAYER)
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    PAYER,
    mint,
    PAYER.publicKey
  );
  console.log(`ATA: ${ata.address.toBase58()}`);

  //   /// Mint SPL tokens to the sender
  const mintToTxId = await mintTo(
    connection,
    PAYER,
    mint,
    ata.address,
    PAYER.publicKey,
    10e9 * LAMPORTS_PER_SOL // 10B tokens * decimals
  );
  console.log(`mint-to success! txId: ${mintToTxId}`);

  const activeStateTrees = await connection.getCachedActiveStateTreeInfo();

  const instructionBatches = await createAirdropInstructions({
    amount: 1e6,
    recipients,
    payer: PAYER.publicKey,
    sourceTokenAccount: ata.address,
    mint,
    stateTrees: activeStateTrees,
    computeUnitPrice: calculateComputeUnitPrice(10_000, 500_000),
  });

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

Ensure that you have all the necessary `.env` variables set up. You can now run your code and execute the airdrop!

## Advanced: Decompress / Claim

{% hint style="info" %}
Compressed tokens are supported in major Solana wallets like Phantom and Backpack. Still, you can let users decompress to SPL via your Frontend (FE) to customize claims, which is helpful if their wallets don’t support ZK compression. Here's how:point\_down:
{% endhint %}

<details>

<summary><strong>Decompress SPL Tokens</strong></summary>

```typescript
import { Rpc, createRpc, bn } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram, selectMinCompressedTokenAccountsForTransfer } from '@lightprotocol/compressed-token';
import { createAssociatedTokenAccount } from '@solana/spl-token';

const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com?api-key=<api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT);
const publicKey = PUBLIC_KEY;
const mint = MINT_KEYPAIR.publicKey;
const amount = bn(1e5);

(async () => {
    // 0. Create an associated token account for the user if it doesn't exist
    const ata = await createAssociatedTokenAccount(
        connection,
        PAYER,
        mint,
        publicKey,
    );

    // 1. Fetch the latest compressed token account state
    const compressedTokenAccounts =
        await connection.getCompressedTokenAccountsByOwner(publicKey, {
            mint,
        });

    // 2. Select accounts to transfer from based on the transfer amount
    const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
        compressedTokenAccounts,
        amount,
    );

    // 3. Fetch recent validity proof
    const proof = await connection.getValidityProof(
        inputAccounts.map(account => bn(account.compressedAccount.hash)),
    );

    // 4. Create the decompress instruction
    const decompressIx = await CompressedTokenProgram.decompress({
        payer: publicKey,
        inputCompressedTokenAccounts: inputAccounts,
        toAddress: ata,
        amount,
        recentInputStateRootIndices: proof.rootIndices,
        recentValidityProof: proof.compressedProof,
    });

    // 6. Sign and send the transaction...
})();
```

</details>

## Advanced Tips

* Set priority fees dynamically for decompression. Learn more [here](https://docs.helius.dev/guides/sending-transactions-on-solana#summary).

## Native Swap via Jup-API

* If you have a custom FE, you can let users swap compressed tokens using the Jup-API. You can find an example implementation demo [here](https://github.com/Lightprotocol/example-jupiter-swap-node).

***

## Support

For additional support or questions, please refer to our [documentation](https://www.zkcompression.com) or contact [Swen](https://t.me/swen_light) or [Mert](https://t.me/mert_helius) on Telegram or via [email](mailto:friends@lightprotocol.com).
