---
title: Client Library
description: Overview to Rust and Typescript client guides. Guides include step-by-step implementation and full code examples.
hidden: true
---

# Overview

Use this guide to build a Typescript or Rust client.

{% tabs %}
{% tab title="Typescript" %}

The Typescript client provides 

1. [@lightprotocol/stateless.js](https://lightprotocol.github.io/light-protocol/stateless.js/index.html) is the core RPC client that provides the ZK Compression RPC interface to query and build transactions that create or interact with compressed accounts on Solana. 

2. [@lightprotocol/compressed-token](https://lightprotocol.github.io/light-protocol/compressed-token/index.html) uses the stateless.js RPC interface to build transactions with compressed tokens.

### Installation

{% tabs %}
{% tab title="Typescript" %}

{% tabs %}
{% tab title="npm" %}
```bash
npm install --save \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
Use the [API documentation]( https://lightprotocol.github.io/light-protocol/) to look up specific function signatures, parameters, and return types.
{% endhint %}

### Create an RPC Connection

* **For unit tests, use `TestRpc`.**
  * Mock RPC instance that parses events and builds Merkle trees on-demand without persisting state.
* **For test-validator, devnet and mainnet use `Rpc`.**
  * `Rpc` is a thin wrapper extending Solana's web3.js `Connection` class with compression-related endpoints.
  * Connects to Photon indexer to query compressed accounts and prover service to generate validity proofs.
* `Rpc` and `TestRpc` implement the same `CompressionApiInterface` for consistent usage across `TestRpc`, local test validator, and public Solana networks.

{% tabs %}
{% tab title="Rpc" %}
Connect to local, devnet or mainnet with `Rpc`.

{% tabs %}
{% tab title="Mainnet" %}
{% code overflow="wrap" %}
```typescript
import { createRpc } from '@lightprotocol/stateless.js';

const rpc = createRpc('https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY');
```
{% endcode %}
{% endtab %}

{% tab title="Devnet" %}
{% code overflow="wrap" %}
```typescript
import { createRpc } from '@lightprotocol/stateless.js';

const rpc = createRpc('https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY');
```
{% endcode %}
{% endtab %}

{% tab title="Localnet" %}
Start a local test-validator with the below command. It will start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001.

{% code overflow="wrap" %}
```bash
light test-validator
```
{% endcode %}

Then connect to it:

{% code overflow="wrap" %}
```typescript
import { createRpc } from '@lightprotocol/stateless.js';

const rpc = createRpc();
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="TestRpc" %}
Set up test environment with `TestRpc`.

{% code overflow="wrap" %}
```typescript
import { getTestRpc } from '@lightprotocol/stateless.js';
import { LightWasm, WasmFactory } from '@lightprotocol/hasher.rs';

const lightWasm: LightWasm = await WasmFactory.getInstance();
const testRpc = await getTestRpc(lightWasm);
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="Rust" %}
* **For local testing, use** [**`light-program-test`**](https://docs.rs/light-program-test)**.**
  * Initializes a [LiteSVM](https://github.com/LiteSVM/LiteSVM) optimized for ZK Compression with auto-funded payer, local prover server and TestIndexer to generate proofs instantly. Requires Light CLI for program binaries.
  * Use for unit and integration tests of your program or client code.
* **For devnet and mainnet use** [**`light-client`**](https://docs.rs/light-client)
  * `light-client` is an RPC client for compressed accounts and tokens.
  * Connects to Photon indexer to query compressed accounts and generate validity proofs.
* `LightClient` and `LightProgramTest` implement the same [`Rpc`](https://docs.rs/light-client/latest/light_client/rpc/trait.Rpc.html) and [`Indexer`](https://docs.rs/light-client/latest/light_client/indexer/trait.Indexer.html) traits for consistent usage across `light-program-test`, local test validator, and public Solana networks.
{% endtab %}
{% endtabs %}

{% hint style="success" %}
Find [full code examples at the end](add) for Anchor.
{% endhint %}

# Implementation Guide

{% hint style="info" %}
Ask anything via [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol/3.1-javascripttypescript-sdks).
{% endhint %}

This guide covers the components to build a Rust and Typescript client. Here is the complete flow:

{% tabs %}
{% tab title="Create" %}
<figure><picture><source srcset="../../.gitbook/assets/client-create (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-create.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Update" %}
<figure><picture><source srcset="../../.gitbook/assets/client-update (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-update.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Close" %}
<figure><picture><source srcset="../../.gitbook/assets/client-close (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-close.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Reinitialize" %}
<figure><picture><source srcset="../../.gitbook/assets/client-reinit (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-reinit.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Burn" %}
<figure><picture><source srcset="../../.gitbook/assets/client-burn (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-burn.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}
{% endtabs %}

{% stepper %}
{% step %}
### Dependencies


{% endtab %}

{% tab title="Rust" %}
{% tabs %}
{% tab title="LightClient" %}
{% code overflow="wrap" %}
```toml
[dependencies]
light-client = "0.16.0"
light-sdk = "0.16.0"
tokio = { version = "1", features = ["full"] }
solana-program = "2.2"
anchor-lang = "0.31.1" 
```
{% endcode %}
{% endtab %}

{% tab title="LightProgramTest" %}
{% code overflow="wrap" %}
```toml
[dev-dependencies]
light-program-test = "0.16.0"
light-sdk = "0.16.0"
tokio = { version = "1", features = ["full"] }
solana-program = "2.2"
anchor-lang = "0.31.1"
```
{% endcode %}
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The [`light-sdk`](https://docs.rs/light-sdk) provides abstractions similar to Anchor's `Account`: macros, wrappers and CPI interface to create and interact with compressed accounts in Solana programs.
{% endhint %}
{% endtab %}
{% endtabs %}

{% endstep %}

