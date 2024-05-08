# Intro to Development

Welcome! This guide has everything you need to know to develop with ZK compression on Solana.

## High-Level Developer Overview

Developing with ZK compression is very similar to regular Solana development. For the sake of brevity, we're assuming you are familiar with the basics of Solana. If you aren't, we recommend reading the [Solana documentation](https://solana.com/docs/intro/dev) first.

Development can be broken down into two main parts:

1. **On-chain program development**
2. **Client development**

On Solana, clients interact with on-chain programs via the [JSON RPC API](https://solana.com/docs/rpc).

The **ZK compression RPC API** extends Solana's default JSON RPC API with additional endpoints that make it easy to read and interact with ZK compressed state. To view the full list of supported endpoints, visit the [JSON RPC Methods](json-rpc-methods.md) section.

## What you'll need to get started

To develop with ZK compression, you'll need different tools based on whether you are developing for client-side, on-chain programs, or both.

### Client-side development

You can use SDKs in Rust and Typescript to interact with ZK compression:

<table><thead><tr><th width="129">Language</th><th width="327">SDK</th><th>Description</th></tr></thead><tbody><tr><td>Typescript</td><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js">@lightprotocol/stateless.js</a></td><td>SDK to interact with the compression programs via the ZK compression RPC API</td></tr><tr><td>Typescript</td><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/js/compressed-token">@lightprotocol/compressed-token</a></td><td>SDK to interact with the compressed token program</td></tr><tr><td>Rust</td><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/programs/compressed-pda/src/sdk">light-sdk</a></td><td>Rust client</td></tr></tbody></table>

You'll also need a connection with an RPC to interact with the network. You can either work with an RPC infrastructure provider that supports ZK compression or run your own RPC Node.

{% hint style="info" %}
[Helius Labs](https://github.com/helius-labs) supports ZK compression and maintains its canonical RPC and Photon indexer implementation [here](https://github.com/helius-labs/photon).

Our local dev tooling supports Photon out of the box. To learn how to run a standalone Photon RPC node, visit the [Run a Node](broken-reference) section.
{% endhint %}

To get started quickly with a client for your application, you can check out the ZK compression [web](https://github.com/Lightprotocol/example-web-client) and [node](https://github.com/Lightprotocol/example-nodejs-client) examples on GitHub.



### On-chain program development

{% hint style="info" %}
The ZK compression primitive is the core of [the Light protocol](https://github.com/Lightprotocol). To leverage ZK compression, your custom program invokes the _Light system programs_ via Cross-Program Invocation (CPI). For the sake of simplicity, we refer to this set of protocol smart contracts as _compression programs._
{% endhint %}

You can write programs using ZK compression in either Anchor or native Rust.

First, you'll need to ensure your machine has Rust, the Solana CLI, and Anchor installed. If you haven't installed them, refer to this detailed [setup guide](https://solana.com/developers/guides/getstarted/setup-local-development).

We provide tooling that makes testing your on-chain program on a local Solana cluster easy:

[ZK Compression CLI](https://github.com/Lightprotocol/light-protocol/blob/main/cli/README.md) - `light test-validator` automatically initializes a local Solana cluster with the compression programs, all necessary system accounts, and syscalls activated. By default, it also starts a local Photon RPC instance and Prover node.

Explorer - The explorer parses compression transactions into a human-readable format, which is great for debugging your program.

## Build by Example

While you get started building with ZK compression,  use these GitHub resources available to help accelerate your journey:

* [Web example client](https://github.com/Lightprotocol/example-web-client)
* [Node example client](https://github.com/Lightprotocol/example-nodejs-client)
* [Token Escrow anchor program](https://github.com/Lightprotocol/light-protocol/tree/main/examples/token-escrow)

## Developer Environments

Today, you can build with ZK compression on Localnet. This is a local Solana cluster that you run on your machine using `light test-validator`. A public Devnet will become available soon.

## Getting support

For the best support, head to the:

* [Solana Stackexchange](https://solana.stackexchange.com/) for Solana-specific questions
* [Light Developer Discord](https://discord.gg/CYvjBgzRFP) for program-related questions
* [Helius Developer Discord](https://discord.gg/Uzzf6a7zKr) for RPC-related questions

Remember to include as much detail as possible in your question, and please use text (not screenshots) to show error messages, so other people with the same problem can find your question!

## Next steps

You're now ready to start building with ZK compression! [Build ](intro-to-development.md#build-by-example)[an app](intro-to-development.md#build-by-example) and provide feedback!
