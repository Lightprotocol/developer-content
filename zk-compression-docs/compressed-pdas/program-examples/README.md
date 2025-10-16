---
description: Program example repository with tests.
---

# Program Examples

{% hint style="success" %}
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/program-examples) to query the program examples in natural language.
{% endhint %}

### Counter Program

Full compressed account lifecycle (create, increment, decrement, reset, close):

* [**counter/anchor**](https://github.com/Lightprotocol/program-examples/tree/main/counter/anchor) - Anchor program with Rust and TypeScript tests
* [**counter/native**](https://github.com/Lightprotocol/program-examples/tree/main/counter/native) - Native Solana program with `light-sdk` and Rust tests.
* [**counter/pinocchio**](https://github.com/Lightprotocol/program-examples/tree/main/counter/pinocchio) - Pinocchio program with `light-sdk-pinocchio` and Rust tests.

### Create-and-update Program

* [**create-and-update**](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) - Create a new compressed account and update an existing compressed account with a single validity proof in one instruction.

### Create-and-read Program

* [**read-only**](https://github.com/Lightprotocol/program-examples/tree/main/read-only) - Create a new compressed account and read it onchain.

### Compare uncompressed vs compressed accounts Program

* [**account-comparison**](https://github.com/Lightprotocol/program-examples/tree/main/account-comparison) - Compare compressed vs regular Solana accounts.

## Dependencies

### Rust Crates

* `light-sdk` - Core SDK for compressed accounts in native and anchor programs
* `light-sdk-pinocchio` Core SDK for compressed accounts in pinocchio programs
* `light-client` - RPC client and indexer for interacting with compressed accounts
* `light-program-test` - Testing utilities for compressed programs.

### TypeScript/JavaScript Packages

* `@lightprotocol/stateless.js` - Client library for interacting with compressed accounts
* `@lightprotocol/zk-compression-cli` - Command-line tools for ZK compression development

## Prerequisites

Required versions:

* **Rust**: 1.86.0 or later
* **Solana CLI**: 2.2.15
* **Anchor CLI**: 0.31.1
* **Zk compression CLI**: 0.27.0 or later
* **Node.js**: 23.5.0 or later

Install the Light CLI:

```bash
$ npm -g i @lightprotocol/zk-compression-cli
```

Install Solana CLI:

```bash
sh -c "$(curl -sSfL https://release.solana.com/v2.2.15/install)"
```

Install Anchor CLI:

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest
avm use latest
```

## Getting Started with your own Program

1. install the light cli

```bash
$ npm -g i @lightprotocol/zk-compression-cli
```

2. instantiate a template Solana program with compressed accounts

```bash
$ light init <project-name>
```
