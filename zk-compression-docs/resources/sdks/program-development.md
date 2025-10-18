---
description: >-
  Overview to on-chain program development. Quick access to SDKs for Anchor,
  Pinocchio, or native Rust.
---

# Program Development

ZK Compression's Rust crates are published to [crates.io](https://docs.rs/releases/search?query=zk+compression) and can be found on [docs.rs](https://crates.io/search?q=zk%20compression) with the `light-` prefix.

## Rust Crates

* [`light-sdk`](https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/sdk) — For Anchor and native programs. Includes CPI utilities, compressed account abstractions similar to anchor Account, and metadata structs for CPIs to the Light System program.
* [`light-sdk-pinocchio`](https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/sdk-pinocchio) — For Pinocchio programs. Pinocchio-optimized SDK with compressed account abstractions and CPI utilities.



## Light Programs Overview

{% hint style="info" %}
Your custom program invokes the _Light system program_ via Cross-Program Invocation (CPI) to leverage ZK Compression.
{% endhint %}

<table><thead><tr><th width="202">Program</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/programs/system">light-system-program</a></td><td>Enforces compressed account layout, ownership checks, and validity proof verification. Used to create/write compressed accounts and PDAs</td></tr><tr><td><a href="https://crates.io/crates/light-compressed-token">light-compressed-token</a></td><td>SPL-compatible compressed token implementation with arbitrary compression/decompression support</td></tr><tr><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/programs/account-compression">account-compression</a></td><td><p>State and address tree implementation used by the Light System program. Clients and custom programs do not interact with the Account Compression Program. This is all done under the hood.</p><h3 id="next-steps"><br></h3></td></tr></tbody></table>

## Version Requirements

These are the required version for program development.

* **Rust**: 1.86.0 or later
* **Solana CLI**: 2.2.15
* **Anchor CLI**: 0.31.1
* **Zk compression CLI**: 0.27.0 or later
* **Node.js**: 23.5.0 or later

{% embed url="https://solana.com/developers/guides/getstarted/setup-local-development" %}

{% content-ref url="../cli-installation.md" %}
[cli-installation.md](../cli-installation.md)
{% endcontent-ref %}

## Program Examples

{% content-ref url="../../compressed-pdas/program-examples.md" %}
[program-examples.md](../../compressed-pdas/program-examples.md)
{% endcontent-ref %}

## Build your own program

Get an overview of compressed PDAs and create your custom program.

{% content-ref url="../../compressed-pdas/create-a-program-with-compressed-pdas.md" %}
[create-a-program-with-compressed-pdas.md](../../compressed-pdas/create-a-program-with-compressed-pdas.md)
{% endcontent-ref %}
