---
description: Program example repository for compressed accounts with tests.
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

## Build your own Program

{% content-ref url="create-a-program-with-compressed-pdas.md" %}
[create-a-program-with-compressed-pdas.md](create-a-program-with-compressed-pdas.md)
{% endcontent-ref %}
