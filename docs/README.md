# Overview

## What is Light Protocol? <a href="#what-is-light" id="what-is-light"></a>

Light is a protocol built on Solana that introduces **ZK compression,** a primitive that enables secure scaling directly on the L1.

## **Why build with Light?**

**Hyperscale state:** Developers and users can opt to compress their on-chain state, reducing state costs **by orders of magnitude** while preserving the security, performance, and composability of the Solana L1.

**A new design space for computation**: In addition to classic on-chain compute, compressed state via Light natively supports custom ZK compute, enabling developers to build previously impossible computation designs on Solana.



### State cost reduction <a href="#state-cost-reduction" id="state-cost-reduction"></a>

| Creation Cost        | Regular Account | Compressed Account             |
| -------------------- | --------------- | ------------------------------ |
| 100-byte PDA Account | \~ 0.0016 SOL   | \~ 0.00001 SOL (160x cheaper)  |
| 100 Token Accounts   | \~ 0.2 SOL      | \~ 0.00004 SOL (5000x cheaper) |

### Core Features <a href="#core-features" id="core-features"></a>

| **Minimal state cost**        | Securely stores state on cheaper ledger space instead of the more expensive account space, allowing apps to scale to millions of users.                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L1 security & performance** | Execution and data availability on Solana, preserving the performance and security guarantees of the L1.                                                                |
| **Composable**                | Solana programs can mix and match between compressed and regular on-chain state, allowing atomic interaction with multiple programs, accounts, and compressed accounts. |
| **Custom ZK compute**         | Leverage Light's on-chain contracts and plumbing, and tap into global, unified ZK-friendly state.                                                                       |

#### ZK and Compression in a Nutshell: <a href="#zk-and-compression-in-a-nutshell" id="zk-and-compression-in-a-nutshell"></a>

_**Compression**_**:** Only the [state roots](learn/core-concepts/state-trees.md) (small fingerprints of all [compressed accounts](learn/core-concepts/compressed-account-model.md)) are stored in on-chain accounts. The underlying data is stored on the cheaper Solana ledger.

_**ZK**_**:** The protocol uses small zero-knowledge proofs (validity proofs) to ensure the integrity of the compressed state. This is all done under the hood. You can fetch validity proofs from [RPC providers](developers/json-rpc-methods/) that support ZK Compression.

## How to use this Documentation

This documentation provides a high-level introduction to the ZK Compression primitive and is a directory guiding you to relevant codebases, examples, and advanced guides.

{% hint style="info" %}
Light Protocol is being built in the [open](https://github.com/Lightprotocol/light-protocol), and ~~mainnet~~ is live! Stay up-to-date with the teams contributing to ZK compression and its RPC implementation: [Light](https://twitter.com/LightProtocol) and [Helius](https://twitter.com/heliuslabs).
{% endhint %}
