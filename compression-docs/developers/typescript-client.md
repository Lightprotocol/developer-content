# TypeScript Client

## Stateless.js API Reference Guide <a href="#what-is-solana-web3-js" id="what-is-solana-web3-js"></a>

The [@lightprotocol/stateless.js library](https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js) covers the [ZK Compression JSON RPC API](json-rpc-methods/). It aims to provide all the necessary functionality to interact with the ZK Compression primitive

## Installation

**For use in Node.js or a web application**

<table><thead><tr><th width="201">Package Manager</th><th>Command</th></tr></thead><tbody><tr><td>NPM</td><td><pre class="language-sh"><code class="lang-sh">npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @coral-xyz/anchor \
    @lightprotocol/zk-compression-cli
</code></pre></td></tr><tr><td>Yarn</td><td><pre class="language-sh"><code class="lang-sh">yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/zk-compression-cli \
    @solana/web3.js \
    @coral-xyz/anchor
</code></pre></td></tr></tbody></table>

## Basics

### Rpc <a href="#connection" id="connection"></a>

[Source Documentation](https://github.com/Lightprotocol/light-protocol/blob/main/js/stateless.js/src/rpc.ts)

The `Rpc` connection is used to interact with the [ZK Compression JSON RPC](json-rpc-methods/). It's a thin wrapper extending [Solana's web3.js `Connection` class](https://solana-labs.github.io/solana-web3.js/classes/Connection.html). You can use `Rpc` to get compressed account info, build compression transactions, and use regular `Connection` methods such as confirm transactions, get account info, and more

**Example Usage with Devnet**

```typescript
const stateless = require("@lightprotocol/stateless.js");


/// Helius exposes Solana and compression RPC endpoints through a single URL
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<api_key>";
const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT)

async function main() {
  let slot = await connection.getSlot();
  console.log(slot);

  let health = await connection.getIndexerHealth(slot);
  console.log(health);
  // "Ok"
}

main();
```

The example above shows only a few of the methods on `Rpc`. Visit the [JSON RPC Methods](json-rpc-methods/) section for the full list of compression endpoints

## Quickstart

### Starting the test-validator for Local Development

```sh
light test-validator 
```

The command above will start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001, respectively&#x20;

### Creating and Sending Transactions

#### Creating, Minting, and Transferring a Compressed Token

{% hint style="info" %}
This example uses the **compressed token program**, which is built using ZK Compression and offers an SPL-compatible token layout.
{% endhint %}

```typescript
import {
  LightSystemProgram,
  Rpc,
  confirmTx,
  createRpc,
} from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
import { Keypair } from "@solana/web3.js";

const payer = Keypair.generate();
const tokenRecipient = Keypair.generate();

/// Localnet 
const connection: Rpc = createRpc();

const main = async () => {
  /// Airdrop lamports to pay fees
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 10e9)
  );

  await confirmTx(
    connection,
    await connection.requestAirdrop(tokenRecipient.publicKey, 1e6)
  );

  /// Create a compressed token mint
  const { mint, transactionSignature } = await createMint(
    connection,
    payer,
    payer.publicKey,
    9 // Number of decimals
  );

  console.log(`create-mint  success! txId: ${transactionSignature}`);

  /// Mint compressed tokens to the payer's account
  const mintToTxId = await mintTo(
    connection,
    payer,
    mint,
    payer.publicKey, // Destination
    payer,
    1e9 // Amount
  );

  console.log(`Minted 1e9 tokens to ${payer.publicKey} was a success!`);
  console.log(`txId: ${mintToTxId}`);

  /// Transfer compressed tokens
  const transferTxId = await transfer(
    connection,
    payer,
    mint,
    7e8, // Amount
    payer, // Owner
    tokenRecipient.publicKey // To address
  );

  console.log(`Transfer of 7e8 ${mint} to ${tokenRecipient.publicKey} was a success!`);
  console.log(`txId: ${transferTxId}`);
};

main();
```

#### Compressing SOL

You can also directly interact with the Light system program to transfer compressed SOL and create compressed accounts and compressed PDAs.

```typescript
import { confirmTx } from "@lightprotocol/stateless.js";

/// Compressing SOL
const {
  LightSystemProgram,
  buildAndSignTx,
  createRpc,
  defaultTestStateTreeAccounts,
  sendAndConfirmTx,
} = require("@lightprotocol/stateless.js");

const { ComputeBudgetProgram, Keypair } = require("@solana/web3.js");

const fromKeypair = Keypair.generate();

/// Localnet
const connection = createRpc();

(async () => {
  /// Airdrop lamports to pay tx fees
  await confirmTx(
    connection,
    await connection.requestAirdrop(fromKeypair.publicKey, 10e9)
  );

  /// Fetch latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();

  /// Compress lamports to self
  const ix = await LightSystemProgram.compress({
    payer: fromKeypair.publicKey,
    toAddress: fromKeypair.publicKey,
    lamports: 1_000_000_000,
    outputStateTree: defaultTestStateTreeAccounts().merkleTree,
  });

  /// Create a VersionedTransaction and sign it
  const tx = buildAndSignTx(
    [ComputeBudgetProgram.setComputeUnitLimit({ units: 1_200_000 }), ix],
    fromKeypair,
    blockhash,
    []
  );

  /// Confirm
  const txId = await sendAndConfirmTx(connection, tx);
  console.log("Transaction Signature:", txId);
})();
```

### Creating Lookup Tables

{% hint style="info" %}
For public networks such as Devnet, we provide [shared lookup tables](devnet-addresses.md#lookup-tables) for Light's common program IDs and accounts
{% endhint %}

```typescript
import { Rpc, confirmTx, createRpc } from "@lightprotocol/stateless.js";
import { createTokenProgramLookupTable } from "@lightprotocol/compressed-token";
import { Keypair, PublicKey} from "@solana/web3.js";
import { RPC_ENDPOINT } from "./constants";
const payer = Keypair.generate();
const authority = payer;
const additionalTokenMints : PublicKey[] = [];
const additionalAccounts : PublicKey[] = [];

// Localnet
const connection: Rpc = createRpc();

const main = async () => {
  /// airdrop lamports to pay gas and rent
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 1e7)
  );

  /// Create LUT
  const { address } = await createTokenProgramLookupTable(
    connection,
    payer,
    authority,
    additionalTokenMints,
    additionalAccounts
  );

  console.log("Created lookup table:", address.toBase58());
};

main();
```

To get started building with examples, check out these GitHub repositories:

* [Web Example Client](https://github.com/Lightprotocol/example-web-client)
* [Node Example Client](https://github.com/Lightprotocol/example-nodejs-client)
* [Token Escrow Program Example](https://github.com/Lightprotocol/light-protocol/tree/light-v0.3.0/examples/token-escrow)
