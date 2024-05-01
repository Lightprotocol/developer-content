# Node operator guide

## What is a Node Operator within the LightLayer?[​](https://docs.eigenlayer.xyz/eigenlayer/operator-guides/operator-introduction#what-is-a-node-operator-within-eigenlayer) <a href="#what-is-a-node-operator-within-eigenlayer" id="what-is-a-node-operator-within-eigenlayer"></a>

Operators, who can be either individuals or organizations, play an active role in the Light protocol. There are three different types of nodes within Light:

[**Forester nodes**](run-a-node/forester-nodes.md) plant and update public and program-owned state trees on behalf of developers and users.

[**Prover nodes**](run-a-node/prover-nodes.md) allow app and wallet developers to outsource validity proof generation.

[**RPC nodes**](run-a-node/rpc-nodes.md) index the chain and enable app developers to build transactions that interact with Light state on Solana.

### Eligibility criteria&#x20;

Becoming an Operator in the Light ecosystem is permissionless. Any Solana address can register as a Forester node operator.&#x20;

Prover nodes and RPC nodes can be operated either standalone or together: in its default configuration, the canonical RPC node implementation by [Helius Labs](https://github.com/helius-labs/photon) bundles a prover node. The official RPC API specification supports proof generation via the `getValidityProof` endpoint making it easy to serve proofs together with regular PRC methods via the same port.\






