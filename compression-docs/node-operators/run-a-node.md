# Run a Node

## Running a Node for Local Development

For local development, the [ZK Compression CLI](https://github.com/Lightprotocol/light-protocol/blob/main/cli/)  `test-validator` command starts a single-node Solana cluster with all relevant nodes (Photon RPC and Prover), system programs, accounts, and runtime features:

```sh
light test-validator
```

To connect to public networks (Devnet, Mainnet-Beta), you can either work with an RPC infrastructure provider that supports ZK Compression, such as [Helius Labs](https://helius.xyz/) or run your own nodes:

{% hint style="info" %}
There are three different types of nodes:

* [Photon RPC nodes](run-a-node.md#photon-rpc-node)
* [Prover nodes](run-a-node.md#prover-node)
* [Light forester nodes](run-a-node.md#forester-node)

Becoming an operator for any node type is permissionless.
{% endhint %}

## Photon RPC Node

RPC nodes index the compression programs, enabling clients to read and build transactions interacting with compressed state.

The canonical compression indexer is named Photon. It can be run locally and requires minimal setup. You just need to point it to an existing Solana RPC. See the Github [repo](https://github.com/helius-labs/photon) for more info:

{% embed url="https://github.com/helius-labs/photon" %}

## Prover Node

Provers can generate validity proofs for state inclusion on behalf of app and wallet developers.

**Prover nodes** can be operated either stand-alone or with an RPC node: in its default configuration, the canonical Photon RPC node implementation by [Helius Labs](https://github.com/helius-labs/photon) bundles a Prover node. The [ZK Compression RPC API ](https://docs.lightprotocol.com/developers/json-rpc-methods)specification supports proof generation via the `getValidityProof` endpoint, making it easy to serve proofs using regular RPC methods via the same port.

Please refer to the Github repo for more info:

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/gnark-prover" %}

## Light Forester Node

Developers may choose to have their program-owned state trees serviced by a network of Light Forester nodes. These nodes manage the creation, rollover, and updating of shared and program-owned state trees. Any Solana account can register as a Light Forester node operator.

Servicing program-owned state trees is permissionless, so you can self-host a standalone node.

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/sergey/crank-server" %}
