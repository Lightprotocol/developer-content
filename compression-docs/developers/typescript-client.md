# TypeScript Client

## Stateless.js API Reference Guide <a href="#what-is-solana-web3-js" id="what-is-solana-web3-js"></a>

The @lightprotocol/stateless.js library covers the  [ZK Compression JSON RPC API](json-rpc-methods/). It aims to provide all the necessary functionality to interact with the ZK Compression primitive.

You can find the complete source for the `@lightprotocol/stateless.js` library [here](https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js).

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

The Rpc connection is used to interact with the [ZK Compression JSON RPC](json-rpc-methods/). It's a thin wrapper extending Solana's Connection. You can use Rpc to get compressed account info, build compression transactions, and use regular Connection methods such as confirm transactions, get account info, and more.

**Example Usage with Devnet**

```typescript
const stateless = require("@lightprotocol/stateless.js");


// Helius exposes Solana and compression RPC endpoints through a single URL
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

The above example shows only a few of the methods on Rpc. Please visit the [JSON RPC Methods](json-rpc-methods/) section for the full list of compression endpoints.

## Quickstart

### Starting the test-validator for local development

```sh
light test-validator 
```

This will start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001.&#x20;

### Creating and sending transactions

#### Creating, minting, and transferring a Compressed Token

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
  /// airdrop lamports to pay fees
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 10e9)
  );

  await confirmTx(
    connection,
    await connection.requestAirdrop(tokenRecipient.publicKey, 1e6)
  );

  /// Create compressed-token mint
  const { mint, transactionSignature } = await createMint(
    connection,
    payer,
    payer.publicKey,
    9
  );

  console.log(`create-mint  success! txId: ${transactionSignature}`);

  /// Mint compressed tokens
  const mintToTxId = await mintTo(
    connection,
    payer,
    mint,
    payer.publicKey,
    payer,
    1e9
  );

  console.log(`mint-to      success! txId: ${mintToTxId}`);

  /// Transfer compressed tokens
  const transferTxId = await transfer(
    connection,
    payer,
    mint,
    7e8,
    payer,
    tokenRecipient.publicKey
  );

  console.log(`transfer     success! txId: ${transferTxId}`);
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

To get started building with examples, check out these GitHub repositories:

* [Web example client](https://github.com/Lightprotocol/example-web-client)
* [Node example client](https://github.com/Lightprotocol/example-nodejs-client)
* [Token escrow program example](https://github.com/Lightprotocol/light-protocol/tree/light-v0.3.0/examples/token-escrow)
