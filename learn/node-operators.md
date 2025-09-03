---
description: >-
  Set up ZK compression infrastructure, learn how to run Forester nodes, Photon
  indexers and Prover nodes.
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: true
---

# Node Operators

***

{% hint style="success" %}
Developers don't need to run any nodes to use ZK Compression.
{% endhint %}

To connect to public networks (i.e., Devnet, Mainnet-Beta), you can either work with an RPC infrastructure provider that supports ZK Compression, such as [Helius Labs](https://helius.xyz/), or run your own nodes.

{% hint style="info" %}
There are three different types of nodes:

* Photon RPC nodes
* Prover nodes
* Light forester nodes
{% endhint %}

## Photon Indexer Node

Indexer nodes use an existing connection to a Solana RPC full node to parse the transactions involving Light Protocol programs, enabling clients to read and write zk-compressed state.

The canonical ZK Compression indexer is named Photon and is maintained by Helius Labs. It is fully open-source, and can be run locally. To set it up, simply point it to an existing Solana RPC. See the Github repo for more info.

{% embed url="https://github.com/helius-labs/photon" %}

## Prover Node

Provers generate validity proofs for state inclusion and PDA uniqueness on behalf of app developers

**Prover nodes** can be operated either standalone or with an RPC node: in its default configuration, the Photon RPC node implementation by [Helius Labs](https://github.com/helius-labs/photon) bundles a Prover node. The [ZK Compression RPC API ](../resources/json-rpc-methods/)specification supports proof generation via the `getValidityProof` endpoint, making it easy to serve proofs using regular RPC methods via the same port.

Please refer to the Github repo for more info:

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/light-prover" %}

## Forester Node

These nodes manage the creation, rollover, and updating of shared and program-owned state trees. Running a forester node is permissionless for your own state trees.

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/forester" %}
