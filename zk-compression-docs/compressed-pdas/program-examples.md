---
description: Program example repository for compressed accounts with tests.
---

# Examples

{% hint style="success" %}
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/program-examples) to query the program examples in natural language.
{% endhint %}

## Basic Operations

- **[basic-operations/anchor](./basic-operations/anchor/)** - Anchor program with Rust and TypeScript tests
- **[basic-operations/native-rust](./basic-operations/native-rust/)** - Native Solana program with light-sdk and Rust tests.

Basic Operations include:
- **create** - Initialize a new compressed account.
- **update** - Modify data in an existing compressed account.
- **close** - Clear account data and preserve its address.
- **reinit** - Reinitialize a closed account with the same address.
- **burn** - Permanently delete a compressed account.

## Counter Program

Full compressed account lifecycle (create, increment, decrement, reset, close):

* [**counter/anchor**](https://github.com/Lightprotocol/program-examples/tree/main/counter/anchor) - Anchor program with Rust and TypeScript tests
* [**counter/native**](https://github.com/Lightprotocol/program-examples/tree/main/counter/native) - Native Solana program with `light-sdk` and Rust tests.
* [**counter/pinocchio**](https://github.com/Lightprotocol/program-examples/tree/main/counter/pinocchio) - Pinocchio program with `light-sdk-pinocchio` and Rust tests.

## Create-and-update Program

* [**create-and-update**](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) - Create a new compressed account and update an existing compressed account with a single validity proof in one instruction.

## Create-and-read Program

* [**read-only**](https://github.com/Lightprotocol/program-examples/tree/main/read-only) - Create a new compressed account and read it on-chain.

## Compare compressed vs uncompressed Program

* [**account-comparison**](https://github.com/Lightprotocol/program-examples/tree/main/account-comparison) - Compare compressed vs regular Solana accounts.

## ZK-ID Program

* [**zk-id**](https://github.com/Lightprotocol/program-examples/tree/main/zk-id) - A minimal Solana program that uses zero-knowledge proofs for identity verification with compressed accounts.

# Build your own Program

{% content-ref url="create-a-program-with-compressed-pdas.md" %}
[create-a-program-with-compressed-pdas.md](create-a-program-with-compressed-pdas.md)
{% endcontent-ref %}
