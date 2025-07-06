---
layout:
  width: default
  title:
    visible: true
  description:
    visible: false
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Overview

<figure><img src=".gitbook/assets/Build_Anything.png" alt=""><figcaption></figcaption></figure>

## Welcome to ZK Compression

ZK Compression is a new account primitive that lets developers store tokens and PDAs on Solana at a fraction of the cost, without sacrificing L1 performance or security.

## State Cost Reduction

<table><thead><tr><th width="252">Creation Cost</th><th width="188">Regular Account</th><th>Compressed Account</th></tr></thead><tbody><tr><td>100-byte PDA Account</td><td>~ 0.0016 SOL</td><td>~ 0.00001 SOL (160x cheaper)</td></tr><tr><td>100 Token Accounts</td><td>~ 0.2 SOL</td><td>~ 0.00004 SOL (5000x cheaper)</td></tr></tbody></table>

## Core Features

<table><thead><tr><th width="248"></th><th></th></tr></thead><tbody><tr><td><strong>Minimal state cost</strong></td><td>Securely stores state on cheaper <a href="https://solana.com/docs/terminology#ledger">ledger</a> space instead of the more expensive account space, allowing apps to scale to millions of users.</td></tr><tr><td><strong>L1 security &#x26; performance</strong></td><td>Execution and data availability on Solana, preserving the performance and security guarantees of the L1</td></tr><tr><td><strong>Composable</strong></td><td>Apps can mix and match between compressed and regular on-chain state, allowing atomic interaction with multiple programs, accounts, and compressed accounts.</td></tr></tbody></table>

## ZK and Compression in a Nutshell

_**Compression**_**:**  Only the [state roots](learn/core-concepts/state-trees.md) (small fingerprints of all [compressed accounts](learn/core-concepts/compressed-account-model.md)) are stored in on-chain accounts. The underlying data is stored on the cheaper Solana ledger.

_**ZK**_**:** The protocol uses small zero-knowledge proofs ([validity proofs](learn/core-concepts/validity-proofs.md)) to ensure the integrity of the compressed state. This is all done under the hood. You can fetch validity proofs from [RPC providers](get-started/intro-to-development.md#rpc-connection) that support ZK Compression.

## How to Use This Documentation

This documentation introduces the ZK Compression primitive and guides you to relevant codebases and examples.

{% hint style="info" %}
ZK Compression and its RPC implementation is built by [Light](https://twitter.com/LightProtocol) and [Helius](https://twitter.com/heliuslabs).
{% endhint %}
