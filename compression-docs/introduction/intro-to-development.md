---
description: >-
  Welcome! This guide has everything you need to know to start developing with
  ZK Compression on Solana
---

# Intro to Development

{% hint style="info" %}
For the sake of brevity, this guide assumes you are familiar with the basics of Solana. If you aren't, we recommend reading the following:

* [Solana documentation](https://solana.com/docs/intro/dev)
* [The Solana Programming Model: An Introduction to Developing on Solana](https://www.helius.dev/blog/the-solana-programming-model-an-introduction-to-developing-on-solana).

\
Further, you **do not need** to understand ZK to master ZK Compression! However, if you are interested in learning the fundamentals, we recommend reading the following:

* [Zero-Knowledge Proofs: An Introduction to the Fundamentals](https://www.helius.dev/blog/zero-knowledge-proofs-an-introduction-to-the-fundamentals)
* [Zero-Knowledge Proofs: Its Applications on Solana](https://www.helius.dev/blog/zero-knowledge-proofs-its-applications-on-solana)
{% endhint %}

## What You'll Need to Get Started

Development with ZK Compression on Solana consists of two main parts:&#x20;

* [Client development](intro-to-development.md#client-side-development)
* [On-chain program development](intro-to-development.md#on-chain-program-development)

The [ZK Compression RPC API](../developers/json-rpc-methods/) is the glue between clients and on-chain programs. It extends Solana's default [JSON RPC API](https://solana.com/docs/rpc) with additional endpoints for interacting with ZK compressed state. To view the complete list of supported endpoints, visit the [JSON RPC Methods](../developers/json-rpc-methods/) section.

### A Quick Intro to Client-side Development

The following TypeScript and Rust SDKs are used to interact with ZK Compression:

<table><thead><tr><th width="129">Language</th><th width="327">SDK</th><th>Description</th></tr></thead><tbody><tr><td>TypeScript</td><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js">@lightprotocol/stateless.js</a></td><td>SDK to interact with compression programs via the ZK Compression RPC API</td></tr><tr><td>TypeScript</td><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/js/compressed-token">@lightprotocol/compressed-token</a></td><td>SDK to interact with the compressed token program</td></tr><tr><td>Rust</td><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/sdk">light-sdk</a></td><td>Rust client</td></tr></tbody></table>

#### RPC Connection

An RPC connection is needed to interact with the network. You can either work with an RPC infrastructure provider that supports ZK Compression or run your own RPC Node.

{% hint style="info" %}
[Helius Labs](https://github.com/helius-labs) supports ZK Compression and maintains its canonical RPC and [Photon indexer implementation](https://github.com/helius-labs/photon).

Our local dev tooling supports Photon out of the box via the `light test-validator` command. To learn how to run a standalone Photon RPC node, visit the [Run a Node](../node-operators/run-a-node.md#photon-indexer-node) section.
{% endhint %}

### Quickstart

{% hint style="info" %}
The code samples work! You can copy & paste them into your IDE or terminal and run!
{% endhint %}

#### Installation (Node.js, web)

<table><thead><tr><th width="183">Package Manager </th><th>Command</th></tr></thead><tbody><tr><td>NPM</td><td><pre class="language-sh"><code class="lang-sh">npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @coral-xyz/anchor \
    @lightprotocol/zk-compression-cli
</code></pre></td></tr><tr><td>Yarn</td><td><p></p><pre class="language-sh"><code class="lang-sh">yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @coral-xyz/anchor \
    @lightprotocol/zk-compression-cli
</code></pre></td></tr></tbody></table>

#### Creating an RPC Connection

<pre class="language-typescript"><code class="lang-typescript">import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

// Helius exposes Solana and Photon RPC endpoints through a single URL
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=&#x3C;api_key>";
const PHOTON_ENDPOINT = RPC_ENDPOINT;
<strong>const connection: Rpc = createRpc(RPC_ENDPOINT, PHOTON_ENDPOINT)
</strong>
console.log("connection", connection);
</code></pre>

#### Using Localnet

```sh
# Start a local test validator
light test-validator
```

```typescript
const stateless = require("@lightprotocol/stateless.js");

const connection = stateless.createRpc();

async function main() {
  let slot = await connection.getSlot();
  console.log(slot);

  let health = await connection.getIndexerHealth(slot);
  console.log(health);
  // "Ok"
}

main();
```

#### Minting and Transferring Compressed Tokens

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

/// Helius exposes Solana and compression RPC endpoints through a single URL
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<api_key>";
const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT)

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

  /// Create compressed token mint
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

  /// Transfer compressed tokens from payer to tokenRecipient's pubkey
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

### On-chain Program Development

{% hint style="info" %}
The ZK Compression primitive is the core of [the Light protocol](https://github.com/Lightprotocol). To leverage ZK Compression, your custom program invokes the _Light system program_ via Cross-Program Invocation (CPI). For the sake of simplicity, we refer to this set of protocol smart contracts as _compression programs._
{% endhint %}

You can write custom programs using ZK compression in Anchor or native Rust.

First, ensure your development environment has [Rust](https://www.rust-lang.org/tools/install), [the Solana CLI](https://docs.solanalabs.com/cli/install), and [Anchor](https://www.anchor-lang.com/docs/installation) installed. If you haven't installed them, refer to this [setup guide](https://solana.com/developers/guides/getstarted/setup-local-development).

We provide tooling for testing your on-chain program on a local Solana cluster. The `light test-validator` command, available with the [ZK Compression CLI](https://github.com/Lightprotocol/light-protocol/blob/main/cli/README.md), automatically initializes a local Solana cluster with the compression programs, all necessary system accounts, and syscalls activated. By default, it also starts a local Photon RPC instance and Prover node.

<table><thead><tr><th width="285">Program</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/programs/system">light-system-program</a></td><td><p>The system program. It enforces the compressed account layout with ownership and sum checks and verifies the validity of your input state<br></p><p>It is also invoked to create/write to compressed accounts and PDAs</p></td></tr><tr><td><a href="https://crates.io/crates/light-compressed-token">light-compressed-token</a></td><td>A compressed token implementation built on top of ZK Compression. It enforces a SPL-compatible token layout and allows for arbitrary compression/decompression between this and the SPL standard</td></tr><tr><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/programs/account-compression">account-compression</a></td><td>Implements state and address trees. It is used by the Light System program</td></tr></tbody></table>

## Build by Example

While you get started building with ZK Compression, use these GitHub resources available to help accelerate your journey:

* [Web Example Client](https://github.com/Lightprotocol/example-web-client)
* [Node Example Client](https://github.com/Lightprotocol/example-nodejs-client)
* [Token Escrow Anchor Program](https://github.com/Lightprotocol/light-protocol/tree/light-v0.3.0/examples/token-escrow)

## Developer Environments

ZK Compression is currently available on Localnet, using `light test-validator`, and Devnet.

## Getting Support

For the best support, head to the:

* [Solana StackExchange](https://solana.stackexchange.com/) for Solana-specific questions
* [Light Developer Discord](https://discord.gg/CYvjBgzRFP) for program-related questions
* [Helius Developer Discord](https://discord.gg/Uzzf6a7zKr) for RPC-related questions

Remember to include as much detail as possible in your question, and please use text (not screenshots) to show error messages so other people with the same problem can find your question!

## Next Steps

You're now ready to start building with ZK Compression! Head to the [Client Quickstart](../developers/typescript-client.md) section, or [build ](intro-to-development.md#build-by-example)[a program](intro-to-development.md#build-by-example) and provide feedback!
