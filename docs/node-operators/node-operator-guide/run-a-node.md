# Run a node

### Running a Node for Local Development <a href="#running-a-node-for-local-development" id="running-a-node-for-local-development"></a>

For local development, the [ZK Compression CLI](https://github.com/Lightprotocol/light-protocol/blob/main/cli/) `test-validator` command starts a single-node Solana cluster with all relevant nodes (Photon RPC and Prover), system programs, accounts, and runtime features:

```
light test-validator
```

## Light Forester Node <a href="#photon-rpc-node" id="photon-rpc-node"></a>

Developers may choose to have their program-owned state trees serviced by a network of Light Forester nodes. These nodes manage the creation, rollover, and updating of shared and program-owned state trees. Any Solana account can register as a Light Forester node operator.

Servicing program-owned state trees is permissionless, so you can self-host a standalone node.

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/sergey/crank-server/crank" %}

## Photon RPC Node <a href="#photon-rpc-node" id="photon-rpc-node"></a>

RPC nodes index the compression programs, enabling clients to read and build transactions for compressed state.

[Helius Labs](https://helius.xyz) is building and maintaining the canonical RPC implementation. See the Github [repo](https://github.com/helius-labs/photon) for more info:

{% embed url="https://github.com/helius-labs/photon" %}

## Prover Node <a href="#prover-node" id="prover-node"></a>

Provers can generate validity proofs for state inclusion on behalf of app and wallet developers.

**Prover nodes** can be operated either stand-alone or with an RPC node: in its default configuration, the canonical Photon RPC node implementation by [Helius Labs](https://github.com/helius-labs/photon) bundles a Prover node. The [ZK Compression RPC API ](https://docs.lightprotocol.com/developers/json-rpc-methods)specification supports proof generation via the `getValidityProof` endpoint, making it easy to serve proofs using regular RPC methods via the same port.

Please refer to the Github repo for more info:

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/gnark-prover" %}
