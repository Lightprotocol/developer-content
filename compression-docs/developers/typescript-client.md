# TypeScript Client

## Stateless.js API Reference Guide <a href="#what-is-solana-web3-js" id="what-is-solana-web3-js"></a>

The @lightprotocol/stateless.js library covers the  [ZK Compression JSON RPC API](../introduction/json-rpc-methods.md). It aims to provide all the necessary functionality to interact with the ZK Compression primitive.

You can find the complete source for the `@lightprotocol/stateless.js` library [here](https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js).

## Installation

**For use in Node.js or a web application**

```shell-session
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/cli \
    @solana/web3.js \
    @coral-xyz/anchor
```

## Basics

### Rpc <a href="#connection" id="connection"></a>

[Source Documentation](https://github.com/Lightprotocol/light-protocol/blob/main/js/stateless.js/src/rpc.ts)

The Rpc connection is used to interact with the [ZK Compression JSON RPC](../introduction/json-rpc-methods.md). It's a thin wrapper extending Solana's Connection. You can use Rpc to get compressed account info, build compression transactions, and use regular Connection methods such as confirm transactions, get account info, and more.

**Example Usage**

```typescript
const stateless = require("@lightprotocol/stateless.js");
 
let connection = createRpc("http://127.0.0.1:8899");
 
let slot = await connection.getSlot();
console.log(slot);
// 93186439
 
let health = await connection.getIndexerHealth(slot);
console.log(health);
// "Ok"

```

The above example shows only a few of the methods on Rpc. Please visit the [JSON RPC Methods](../introduction/json-rpc-methods.md) section for the full list of compression endpoints.

## Quickstart

### Starting the test-validator for local development

```
light test-validator 
```

This will start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001.&#x20;

### Creating and sending transactions

```typescript
/// Compressing SOL
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

const main = () => {

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
* [Token Escrow anchor program](https://github.com/Lightprotocol/light-protocol/tree/main/examples/token-escrow)
