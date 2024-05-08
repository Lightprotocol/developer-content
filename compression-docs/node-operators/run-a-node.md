# Run a Node

{% hint style="info" %}
There are three different types of nodes:

* [Photon RPC nodes](run-a-node.md#photon-rpc-node)
* [Prover nodes](run-a-node.md#prover-node)
* [Light forester nodes](run-a-node.md#forester-node)

Becoming an operator for any node type is permissionless.
{% endhint %}

## Photon Indexer node

RPC nodes index the compression programs, enabling clients to read and build transactions interacting with compressed state.

The canonical compression indexer is named Photon. It can be run locally and requires minimal setup. You simply need to point it to an existing Solana RPC. See the Github [repo](https://github.com/helius-labs/photon) for more info:

{% embed url="https://github.com/helius-labs/photon" %}

## Prover node

Provers can generate validity proofs for state inclusion on behalf of app and wallet developers.

**Prover nodes** can be operated either stand-alone or with an RPC node: in its default configuration, the canonical Photon RPC node implementation by [Helius Labs](https://github.com/helius-labs/photon) bundles a Prover node. The [ZK compression RPC API ](https://docs.lightprotocol.com/developers/json-rpc-methods)specification supports proof generation via the `getValidityProof` endpoint, making it easy to serve proofs using regular RPC methods via the same port.

Please refer to the Github repo for more info:

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/gnark-prover" %}

## Light Forester node

Developers may choose to have their program-owned state trees serviced by a network of Light Forester nodes. These nodes manage the creation, rollover, and updating of shared and program-owned state trees. Any Solana account can register as a Light Forester node operator.

Servicing program-owned state trees is permissionless, so you can self-host a standalone node.

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/sergey/crank-server" %}
