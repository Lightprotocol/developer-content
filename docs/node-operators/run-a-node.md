# Run a node

## Running a Node for Local Development

For local development, the [ZK Compression CLI](https://github.com/Lightprotocol/light-protocol/blob/main/cli/)  `test-validator` command starts a single-node Solana cluster with all relevant nodes (Photon RPC and Prover), system programs, accounts, and runtime features:

```sh
light test-validator
```

To connect to public networks (i.e., Devnet, Mainnet-Beta), you can either work with an RPC infrastructure provider that supports ZK Compression, such as [Helius Labs](https://helius.xyz/), or run your own nodes:

{% hint style="info" %}
There are three different types of nodes:

* [Light forester nodes](run-a-node.md#forester-node)
* [Photon RPC nodes](run-a-node.md#photon-rpc-node)
* [Prover nodes](run-a-node.md#prover-node)

_Becoming an operator for any node type is permissionless_
{% endhint %}

## Light Forester Node

Developers may choose to have their program-owned state trees serviced by a network of Light Forester nodes. These nodes manage the creation, rollover, and updating of shared and program-owned state trees.

{% hint style="info" %}
On ZK-Testnet, only shared state trees are supported end-to-end. Once full program-owned state tree support gets rolled out, you can service your program-owned state trees permissionlessly, i.e., self-host a standalone node.
{% endhint %}

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/forester" %}

## Photon RPC Node

RPC nodes index the compression programs, enabling clients to read and build transactions interacting with compressed state

The canonical compression indexer is named Photon. It can be run locally and requires minimal setup, which must be pointed to an existing Solana RPC. See the Github [repo](https://github.com/helius-labs/photon) for more info:

{% embed url="https://github.com/helius-labs/photon" %}

## Prover Node

Provers can generate validity proofs for state inclusion on behalf of app and wallet developers

**Prover nodes** can be operated either stand-alone or with an RPC node: in its default configuration, the canonical Photon RPC node implementation by [Helius Labs](https://github.com/helius-labs/photon) bundles a Prover node. The [ZK Compression RPC API ](https://docs.lightprotocol.com/developers/json-rpc-methods)specification supports proof generation via the `getValidityProof` endpoint, making it easy to serve proofs using regular RPC methods via the same port

Please refer to the Github repo for more info:

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/light-prover" %}

