# Intro to Development

Welcome! Light's core primitive is ZK Compression. This guide has everything you need to know to start developing with it.

For the sake of brevity, the guide assumes you are familiar with the basics of Solana. If you aren't, we recommend reading the [Solana documentation](https://solana.com/docs/intro/dev) first.

## What you'll need to get started <a href="#what-youll-need-to-get-started" id="what-youll-need-to-get-started"></a>

Development with ZK Compression on Solana consists of two main parts:

* [client development](intro-to-development.md#client-side-development)
* [on-chain program development](intro-to-development.md#on-chain-program-development)

The glue between clients and on-chain programs is the ZK Compression RPC API. It extends Solana's default JSON RPC API with additional endpoints for interacting with ZK compressed state. To view the full list of supported endpoints, visit the [JSON RPC Methods](json-rpc-methods.md) section.

### Client-side development <a href="#client-side-development" id="client-side-development"></a>

You can use SDKs in Rust and Typescript to interact with ZK Compression:

| Language   | SDK                                                                                                              | Description                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Typescript | [@lightprotocol/stateless.js](https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js)         | SDK to interact with compression programs via the ZK Compression RPC API |
| Typescript | [@lightprotocol/compressed-token](https://github.com/Lightprotocol/light-protocol/tree/main/js/compressed-token) | SDK to interact with the compressed token program                        |
| Rust       | [light-sdk](https://github.com/Lightprotocol/light-protocol/tree/main/programs/compressed-pda/src/sdk)           | Rust client                                                              |

You'll also need a connection with an RPC to interact with the network. You can either work with an RPC infrastructure provider that supports ZK Compression or run your own RPC Node.

[Helius Labs](https://github.com/helius-labs) supports ZK Compression and maintains its canonical RPC and Photon indexer implementation [here](https://github.com/helius-labs/photon).

Our local dev tooling supports Photon out of the box via the `light test-validator` command. To learn how to run a standalone Photon RPC node, visit the[ Run a Node](../node-operators/node-operator-guide/run-a-node.md#photon-rpc-node-1) section.

### Quickstart <a href="#quickstart" id="quickstart"></a>

**Installation (node.js, web)**

Copy

```
npm install --save \
    @lightprotocol/stateless.js \
    @solana/web3.js \
    @coral-xyz/anchor
```

**Creating an Rpc connection**

Copy

```typescript
const stateless = require("@lightprotocol/stateless.js");

// Rpc is a thin wrapper around a web3.js Connection
let connection : = stateless.createRpc("http://zk-testnet.helius.dev:8784");
 
let health = await connection.getIndexerHealth(slot);
console.log(health);
// "Ok"
```

**Creating and sending transactions**

Copy

```typescript
/// Compressing SOL
const {
  LightSystemProgram,
  Rpc,
  buildAndSignTx,
  compress,
  createRpc,
  defaultTestStateTreeAccounts,
  sendAndConfirmTx,
} = require("@lightprotocol/stateless.js");

const { ComputeBudgetProgram, Keypair, PublicKey } = require("@solana/web3.js");

const fromKeypair = Keypair.generate();
const connection = createRpc();

(async () => {

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
        [],
    );
    
    /// Confirm 
    const txId = await sendAndConfirmTx(connection, tx);
    console.log(txId);
})()
```

To get started quickly with an end-to-end client for your application, check out the ZK compression [web](https://github.com/Lightprotocol/example-web-client) and [node](https://github.com/Lightprotocol/example-nodejs-client) examples on GitHub.

### On-chain program development <a href="#on-chain-program-development" id="on-chain-program-development"></a>

{% hint style="info" %}
The ZK compression primitive is the core of [the Light protocol](https://github.com/Lightprotocol). To leverage ZK compression, your custom program invokes the _Light system program_ via Cross-Program Invocation (CPI). For the sake of simplicity, we refer to this set of protocol smart contracts as _compression programs._
{% endhint %}

You can write custom programs using ZK compression in Anchor or native Rust.

First, you'll need to ensure your machine has Rust, the Solana CLI, and Anchor installed. If you haven't installed them, refer to this [setup guide](https://solana.com/developers/guides/getstarted/setup-local-development).

We provide tooling for testing your on-chain program on a local Solana cluster.

[ZK Compression CLI](https://github.com/Lightprotocol/light-protocol/blob/main/cli/README.md): `light test-validator` automatically initializes a local Solana cluster with the compression programs, all necessary system accounts, and syscalls activated. By default, it also starts a local Photon RPC instance and Prover node.

| Program                                                                                                       | Description                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [light-system-program](https://github.com/Lightprotocol/light-protocol/tree/main/programs/system)             | The system program. Validity proof verification ownership and sum checks. Invoke to create/write to compressed accounts and PDAs. |
| [light-compressed-token](https://crates.io/crates/light-compressed-token)                                     | A compressed token implementation                                                                                                 |
| [account-compression](https://github.com/Lightprotocol/light-protocol/tree/main/programs/account-compression) | Implements state and address trees                                                                                                |

## Build by Example <a href="#build-by-example" id="build-by-example"></a>

While you get started building with ZK compression, use these GitHub resources available to help accelerate your journey:

* [Web example client](https://github.com/Lightprotocol/example-web-client)
* [Node example client](https://github.com/Lightprotocol/example-nodejs-client)
* [Token Escrow anchor program](https://github.com/Lightprotocol/light-protocol/tree/main/examples/token-escrow)

## Developer Environments <a href="#developer-environments" id="developer-environments"></a>

Today, you can build with ZK compression on Localnet. This is a local Solana cluster that you run on your machine using `light test-validator`. A public Devnet will become available soon.

## Getting support <a href="#getting-support" id="getting-support"></a>

For the best support, head to the:

* [Solana Stackexchange](https://solana.stackexchange.com/) for Solana-specific questions
* [Light Developer Discord](https://discord.gg/CYvjBgzRFP) for program-related questions
* [Helius Developer Discord](https://discord.gg/Uzzf6a7zKr) for RPC-related questions

Remember to include as much detail as possible in your question, and please use text (not screenshots) to show error messages so other people with the same problem can find your question!

## Next steps <a href="#next-steps" id="next-steps"></a>

You're now ready to start building with ZK compression! Head to the [Client Quickstart](../developers/typescript-client.md) section, or build a program and provide feedback!
