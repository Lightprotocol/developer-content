# Node operator guide

## What is a Node Operator within the LightLayer?[​](https://docs.eigenlayer.xyz/eigenlayer/operator-guides/operator-introduction#what-is-a-node-operator-within-eigenlayer) <a href="#what-is-a-node-operator-within-eigenlayer" id="what-is-a-node-operator-within-eigenlayer"></a>

Operators, who can be either individuals or organizations, play an active role in the Light protocol. There are three different types of nodes within Light:

For details on each node class, hardware requirements, and how to run them, refer to the respective guides:

<table><thead><tr><th width="152">Node class</th><th width="325">Description</th><th width="129">Guide</th><th>Relevant for</th></tr></thead><tbody><tr><td><strong>Forester node</strong></td><td>Create and update public and program-owned state trees on behalf of developers and users.</td><td><a href="run-a-node/forester-nodes.md">Guide</a></td><td>Liveness</td></tr><tr><td><strong>Prover node</strong></td><td>Generate validity proofs on behalf of app and wallet developers.</td><td><a href="run-a-node/prover-nodes.md">Guide</a></td><td>perf.</td></tr><tr><td><strong>RPC node</strong></td><td>Index Light smart contracts, enabling apps to build transactions that interact with compressed state.</td><td><a href="run-a-node/rpc-nodes.md">Guide</a></td><td>CR, perf.</td></tr></tbody></table>



### Eligibility criteria&#x20;

Becoming an Operator is permissionless for all three node classes.

Any Solana address can register as a Forester node operator.&#x20;

Prover nodes and RPC nodes can be operated either standalone or together: in its default configuration, the canonical RPC node implementation by [Helius Labs](https://github.com/helius-labs/photon) bundles a prover node. The official [RPC API ](../developers/json-rpc-methods.md)specification supports proof generation via the `getValidityProof` endpoint making it easy to serve proofs together with regular RPC methods via the same port.\






