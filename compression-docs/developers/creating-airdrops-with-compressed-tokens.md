---
hidden: true
---

# Creating Airdrops with Compressed Tokens

You can use ZK Compression to distribute SPL tokens at scale.

{% hint style="info" %}
_Key benefits of compressed tokens:_

* Up to **5000x** cheaper than regular tokens
* Supported by leading Solana wallets, including Phantom and Backpack
* Compatible with existing programs via atomic compression and decompression between SPL <> Compressed tokens
{% endhint %}

## Airdropping SPL Tokens

<details>

<summary>No-code</summary>

[Airship](https://airship.helius.dev/) by Helius Labs is a no-code airdrop tool. Airship uses compressed tokens under the hood.

</details>

### 1. Install the SDK

{% tabs %}
{% tab title="npm" %}
```bash
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add -g @lightprotocol/zk-compression-cli && \
pnpm add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js
```
{% endtab %}
{% endtabs %}

### 2. **Create an RPC Connection**

```tsx
import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

const RPC_ENDPOINT = "https://mainnet.helius-rpc.com?api-key=<api_key>";

const connection: Rpc = createRpc(RPC_ENDPOINT)
```

### 3. Mint SPL tokens to yourself

```typescript
import { Keypair } from '@solana/web3.js';
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { createMint } from '@lightprotocol/compressed-token';
import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";


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

### 4. Distribute the tokens

{% hint style="info" %}
This is the **most efficient** way of distributing your SPL tokens.
{% endhint %}

The high level is this:

1. Create batches of instructions based on a list of recipients and amounts
2. Build transactions from these instruction batches, then sign, send, and confirm them.

**First, create a helper `CreateAirdropInstructions` that takes recipients and amounts and returns batches of instructions.**

```typescript
// create-airdrop-instructions.ts

import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { bn, Rpc, BN } from "@lightprotocol/stateless.js";
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Keypair,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
} from "@solana/web3.js";

interface CreateAirdropInstructionsParams {
  amount: number | BN;
  recipients: PublicKey[];
  payer: PublicKey;
  sourceTokenAccount: PublicKey;
  mint: PublicKey;
  maxRecipientsPerInstruction?: number;
  maxInstructionsPerTransaction?: number;
  computeUnitLimit?: number;
  computeUnitPrice?: number | undefined;
}

type InstructionBatch = TransactionInstruction[];

export async function createAirdropInstructions({
  amount,
  recipients,
  payer,
  sourceTokenAccount,
  mint,
  maxRecipientsPerInstruction = 5,
  maxInstructionsPerTransaction = 3,
  computeUnitLimit = 500_000,
  computeUnitPrice = undefined,
}: CreateAirdropInstructionsParams): Promise<InstructionBatch[]> {
  const instructionBatches: InstructionBatch[] = [];
  const amountBn = bn(amount);

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

**Next,  create a helper which signs and sends in batches:**

```typescript
// sign-and-send-airdrop-batches.ts
import { TransactionMessage, TransactionInstruction, Keypair, VersionedTransaction, Connection } from "@solana/web3.js";

type InstructionBatch = TransactionInstruction[]
type BatchResult = 
  | { type: 'success', index: number, signature: string }
  | { type: 'error', index: number, error: string };

async function* signAndSendAirdropBatches(
  batches: InstructionBatch[],
  payer: Keypair,
  connection: Connection,
  timeout = 60_000
) {
  const unconfirmed = new Set(Array.from({ length: batches.length }, (_, i) => i));
  const start = Date.now();
  
  while (unconfirmed.size > 0) {
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout: ${unconfirmed.size} batches remaining`);
    }

    const { blockhash } = await connection.getLatestBlockhash();
    
    const sends = Array.from(unconfirmed).map(async (index) => {
      try {
        const tx = new VersionedTransaction(
          new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: blockhash,
            instructions: batches[index],
          }).compileToV0Message()
        );
        tx.sign([payer]);
        
        const sig = await connection.sendTransaction(tx, { skipPreflight: true });
        const confirmed = await connection.confirmTransaction(sig, 'processed');
        if (confirmed) {
          unconfirmed.delete(index);
          return { type: 'success', index, signature: sig };
        }
      } catch (e) {
        return { type: 'error', index, error: e.message };
      }
    });

    const results = await Promise.all(sends);
    for (const result of results) {
      if (result) yield result;
    }
  }
}


```

**Finally, you can call all methods in your main script**

<pre class="language-typescript"><code class="lang-typescript">import { Keypair, PublicKey } from '@solana/web3.js';
import {
  bn,
  buildAndSignTx,
  createRpc,
  dedupeSigner,
  Rpc,
} from "@lightprotocol/stateless.js";
import { createMint } from '@lightprotocol/compressed-token';
import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";


const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com?api-key=&#x3C;api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT);
const PAYER = Keypair.fromSecretKey(&#x3C;private_key>);

const AIRDROP_AMOUNT_PER_WALLET = bn(1e6);

// 15 recipients fit into 1 solana transaction.
const MAX_RECIPIENTS_PER_IX = 5;
const MAX_IXS_PER_TX = 3;

// These are example Solana Pubkeys
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
 ].map(address => new PublicKey(address));


(async() => {

      // provide from previous steps  
      const mint = ...
      const ata = ...


      const instructionBatches = await createAirdropInstructions({
          amount: 42,
          recipients,
          payer: PAYER.publicKey,
          sourceTokenAccount: ata.address,
          mint,
<strong>      });
</strong><strong>      
</strong><strong>
</strong>      for await (const result of signAndSendAirdropBatches(
instructionBatches, PAYER, connection)) {
          if (result.type === 'success') {
                console.log(`Batch ${result.index} confirmed: ${result.signature}`);
          } else {
                console.log(`Batch ${result.index} failed: ${result.error}`);
          }
      }
      
      console.log("airdrop complete.")

})();
</code></pre>





Tips and tricks



Advanced

* alternative: mintTo&#x20;
* reading from csv or file
* dynamic priority fees \<link>, custom send logic, staked connection etc



### Decompress

can implement claim -> advantages&#x20;

* decompressing&#x20;

## Native Swap via Jup-api











**Full JSON RPC API:**

{% content-ref url="json-rpc-methods/" %}
[json-rpc-methods](json-rpc-methods/)
{% endcontent-ref %}

### Advanced Integration

<details>

<summary><strong>Decompress and Compress SPL Tokens</strong></summary>

```typescript
import { Rpc, createRpc, bn } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram, selectMinCompressedTokenAccountsForTransfer } from '@lightprotocol/compressed-token';
import { createAssociatedTokenAccount } from '@solana/spl-token';

const RPC_ENDPOINT = 'https://devnet.helius-rpc.com?api-key=<api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);
const publicKey = PUBLIC_KEY;
const mint = MINT_KEYPAIR.publicKey;
const amount = bn(1e8);

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

    // 5. Create the compress instruction
    const compressIx = await CompressedTokenProgram.compress({
        payer: publicKey,
        owner: publicKey,
        source: ata,
        toAddress: publicKey,
        amount,
        mint,
    });

    // 6. Sign and send the transaction with sequential decompression and compression
})();
```

</details>



## Support

For additional support or questions, please refer to our [documentation](https://www.zkcompression.com) or contact [Swen](https://t.me/swen_light) or [Mert](https://t.me/mert_helius) on Telegram or via [email](mailto:friends@lightprotocol.com).
