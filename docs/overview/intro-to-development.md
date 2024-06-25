# Intro to Development

Welcome! Light's core primitive is ZK Compression. This guide has everything you need to know to start developing with it.

{% hint style="info" %}
For the sake of brevity, the guide assumes you are familiar with the basics of Solana. If you aren't, we recommend reading the [Solana documentation](https://solana.com/docs/intro/dev) first.
{% endhint %}

## What you'll need to get started <a href="#what-youll-need-to-get-started" id="what-youll-need-to-get-started"></a>

First things first, you do **not** need to understand ZK to master ZK Compression!

Development with ZK Compression on Solana consists of two main parts:

* client development
* on-chain program development

The glue between clients and on-chain programs is the ZK Compression RPC API. It extends Solana's default [JSON RPC API](https://solana.com/docs/rpc) with additional endpoints for interacting with ZK compressed state. To view the full list of supported endpoints, visit the JSON RPC Methods section.

#### Client-side development <a href="#client-side-development" id="client-side-development"></a>

You can use SDKs in Rust and Typescript to interact with ZK Compression:

| Language   | SDK                                                                                                              | Description                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Typescript | [@lightprotocol/stateless.js](https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js)         | SDK to interact with compression programs via the ZK Compression RPC API |
| Typescript | [@lightprotocol/compressed-token](https://github.com/Lightprotocol/light-protocol/tree/main/js/compressed-token) | SDK to interact with the compressed token program.                       |
| Rust       | [light-sdk](https://github.com/Lightprotocol/light-protocol/tree/main/programs/compressed-pda/src/sdk)           | Rust client                                                              |

**RPC Connection**

You'll also need a connection with an RPC to interact with the network. You can either work with an RPC infrastructure provider that supports ZK Compression or run your own RPC Node.

[Helius Labs](https://github.com/helius-labs) supports ZK Compression and maintains its canonical RPC and Photon indexer implementation [here](https://github.com/helius-labs/photon).

Our local dev tooling supports Photon out of the box via the `light test-validator` command. To learn how to run a standalone Photon RPC node, visit the Run a Node section.

#### Quickstart <a href="#quickstart" id="quickstart"></a>

The code samples work! You can copy & paste them into your IDE or terminal and run!

**Installation (node.js, web)**

| Package Manager | Command                                                                                                                                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NPM             | <pre class="language-sh"><code class="lang-sh">npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @coral-xyz/anchor \
    @lightprotocol/zk-compression-cli
</code></pre> |
| Yarn            | <pre class="language-sh"><code class="lang-sh">npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @coral-xyz/anchor \
    @lightprotocol/zk-compression-cli
</code></pre> |

**Creating an Rpc connection**

```typescript
import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

const connection: Rpc = createRpc(
  "https://zk-testnet.helius.dev:8899", // rpc
  "https://zk-testnet.helius.dev:8784", // zk compression rpc
  "https://zk-testnet.helius.dev:3001" // prover
);

console.log("connection", connection);
```

**Using Localnet**

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

**Minting and transferring compressed tokens**

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

const connection: Rpc = createRpc(
  "https://zk-testnet.helius.dev:8899", // rpc
  "https://zk-testnet.helius.dev:8784", // zk compression rpc
  "https://zk-testnet.helius.dev:3001" // prover
);

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

You can find a quickstart guide for creating and transferring compressed-tokens here.

To get started quickly with an end-to-end client for your application, check out the ZK compression [web](https://github.com/Lightprotocol/example-web-client) and [node](https://github.com/Lightprotocol/example-nodejs-client) examples on GitHub.

### On-chain program development <a href="#on-chain-program-development" id="on-chain-program-development"></a>

The ZK compression primitive is the core of [the Light protocol](https://github.com/Lightprotocol). To leverage ZK compression, your custom program invokes the _Light system program_ via Cross-Program Invocation (CPI). For the sake of simplicity, we refer to this set of protocol smart contracts as _compression programs._

You can write custom programs using ZK compression in Anchor or native Rust.

First, you'll need to ensure your machine has Rust, the Solana CLI, and Anchor installed. If you haven't installed them, refer to this [setup guide](https://solana.com/developers/guides/getstarted/setup-local-development).

We provide tooling for testing your on-chain program on a local Solana cluster.

[ZK Compression CLI](https://github.com/Lightprotocol/light-protocol/blob/main/cli/README.md): `light test-validator` automatically initializes a local Solana cluster with the compression programs, all necessary system accounts, and syscalls activated. By default, it also starts a local Photon RPC instance and Prover node.

<table><thead><tr><th width="253">Program</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/programs/system">light-system-program</a></td><td>The system program. It enforces the compressed account layout with ownership and sum checks and verifies the validity of your input state. Invoke it to create/write to compressed accounts and PDAs.</td></tr><tr><td><a href="https://crates.io/crates/light-compressed-token">light-compressed-token</a></td><td>A compressed token implementation built on top of ZK Compression. It enforces a SPL-compatible token layout and allows for arbitrary compression/decompression between this and the SPL standard.</td></tr><tr><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/programs/account-compression">account-compression</a></td><td>Implements state and address trees. Used by the Light System program.</td></tr></tbody></table>

## Build by Example <a href="#build-by-example" id="build-by-example"></a>

While you get started building with ZK compression, use these GitHub resources available to help accelerate your journey:

* [Web example client](https://github.com/Lightprotocol/example-web-client)
* [Node example client](https://github.com/Lightprotocol/example-nodejs-client)
* [Token Escrow anchor program](https://github.com/Lightprotocol/light-protocol/tree/light-v0.3.0/examples/token-escrow)

## Developer Environments <a href="#developer-environments" id="developer-environments"></a>

Today, you can build with ZK compression on Localnet. This is a local Solana cluster that you run on your machine using `light test-validator`. A public Devnet will become available soon.

## Getting support <a href="#getting-support" id="getting-support"></a>

For the best support, head to the:

* [Solana Stackexchange](https://solana.stackexchange.com/) for Solana-specific questions
* [Light Developer Discord](https://discord.gg/CYvjBgzRFP) for program-related questions
* [Helius Developer Discord](https://discord.gg/Uzzf6a7zKr) for RPC-related questions

Remember to include as much detail as possible in your question, and please use text (not screenshots) to show error messages so other people with the same problem can find your question!

## Next steps <a href="#next-steps" id="next-steps"></a>

You're now ready to start building with ZK compression! Head to the Client Quickstart section, or build a program and provide feedback!
