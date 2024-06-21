# TypeScript Client

## Stateless.js API Reference Guide <a href="#what-is-solana-web3-js" id="what-is-solana-web3-js"></a>

The @lightprotocol/stateless.js library covers the  [ZK Compression JSON RPC API](json-rpc-methods.md). It aims to provide all the necessary functionality to interact with the ZK Compression primitive.

You can find the complete source for the `@lightprotocol/stateless.js` library [here](https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js).

## Installation

**For use in Node.js or a web application**

```shell-session
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/zk-compression-cli \
    @solana/web3.js \
    @coral-xyz/anchor
```

## Basics

### Rpc <a href="#connection" id="connection"></a>

[Source Documentation](https://github.com/Lightprotocol/light-protocol/blob/main/js/stateless.js/src/rpc.ts)

The Rpc connection is used to interact with the [ZK Compression JSON RPC](json-rpc-methods.md). It's a thin wrapper extending Solana's Connection. You can use Rpc to get compressed account info, build compression transactions, and use regular Connection methods such as confirm transactions, get account info, and more.

**Example Usage**

```sh
# Start a local test-validator
light test-validator
```

```typescript
const stateless = require("@lightprotocol/stateless.js");
 
let connection = createRpc();
 
let slot = await connection.getSlot();
console.log(slot);
// 93186439
 
let health = await connection.getIndexerHealth(slot);
console.log(health);
// "Ok"

```

The above example shows only a few of the methods on Rpc. Please visit the [JSON RPC Methods](json-rpc-methods.md) section for the full list of compression endpoints.

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
  bn,
  confirmTx,
  createRpc,
} from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
import { ComputeBudgetProgram, Keypair, PublicKey } from "@solana/web3.js";

const payer = Keypair.generate();
const tokenRecipient = Keypair.generate();
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
    payer,
    9
  );

  /// Mint compressed tokens
  const mintToTxId = await mintTo(
    connection,
    payer,
    mint,
    payer.publicKey,
    payer,
    1e9
  );

  /// Transfer compressed tokens
  const transferTxId = await transfer(
    connection,
    payer,
    mint,
    7e8,
    payer,
    tokenRecipient.publicKey
  );
  
  console.log("transfer txId", transferTxId)
  
}

main()
```

#### Compressing SOL

You can also directly interact with the Light system program to transfer compressed SOL and create compressed accounts and compressed PDAs.

```typescript

const {
  LightSystemProgram,
  Rpc,
  buildAndSignTx,
  compress,
  confirmTx,
  createRpc,
  defaultTestStateTreeAccounts,
  sendAndConfirmTx,
} = require("@lightprotocol/stateless.js");

const { ComputeBudgetProgram, Keypair, PublicKey } = require("@solana/web3.js");

const fromKeypair = Keypair.generate();
const toKeypair = Keypair.generate();
/// Rpc, by default, connects to the local nodes started via 'light test-validator' 
const connection: Rpc = createRpc();

const main = async () => {

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
        [],
    );
    
    /// Confirm 
    const txId = await sendAndConfirmTx(connection, tx);

}

main()
```

To get started building with examples, check out these GitHub repositories:

* [Web example client](https://github.com/Lightprotocol/example-web-client)
* [Node example client](https://github.com/Lightprotocol/example-nodejs-client)
* [Token escrow program example](https://github.com/Lightprotocol/light-protocol/tree/light-v0.3.0/examples/token-escrow)
