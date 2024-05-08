# Overview

## What is ZK compression?

Zk compression is a new primitive built on Solana that enables the secure scaling of state directly on the L1.

Users and program developers can opt to compress their on-chain state, **reducing state costs by orders of magnitude** while preserving the security, performance, and composability of the Solana L1.



## State cost reduction

<table><thead><tr><th width="252">Creation Cost</th><th width="188">Regular Account</th><th>Compressed Account</th></tr></thead><tbody><tr><td>100-byte PDA Account</td><td>~ 0.0016 SOL</td><td>~ 0.00001 SOL (160x cheaper)</td></tr><tr><td>100 Token Accounts</td><td>~ 0.2 SOL</td><td>~ 0.00004 SOL (5000x cheaper)</td></tr></tbody></table>



## Core Features

<table><thead><tr><th width="248"></th><th></th></tr></thead><tbody><tr><td><strong>Minimal state cost</strong></td><td>Enables Solana programs to securely store state on cheaper ledger space instead of more expensive account space, allowing apps to scale sustainably to millions of users.</td></tr><tr><td><strong>L1 security &#x26; performance</strong></td><td>Execution and data availability on Solana, preserving the performance and security guarantees of the L1.</td></tr><tr><td><strong>Composable</strong></td><td>Solana programs can mix and match between compressed and regular on-chain state, allowing atomic interaction with multiple programs, accounts, and compressed accounts.</td></tr></tbody></table>



## How to use this Documentation

This documentation provides a high-level introduction to the ZK compression primitive and is a directory guiding you to relevant codebases, examples, and advanced guides.

{% hint style="info" %}
The ZK compression primitive is being built in the open, and a public Testnet will soon be available. Stay up to date with the core teams contributing to ZK compression and its RPC implementation: [Light](https://twitter.com/LightProtocol) and [Helius Labs](https://twitter.com/heliuslabs).
{% endhint %}
