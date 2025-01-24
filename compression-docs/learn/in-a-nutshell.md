# In a Nutshell

## High-level System Overview

1. **State is stored as call data in** [**Solana's ledger**](https://www.helius.dev/blog/all-you-need-to-know-about-compression-on-solana#state-vs-ledger)**,** resulting in very low rent cost
2. **Transactions specify the state they access** (read/write) and include it in the transaction payload
3. **State Validation:**
   1. Solana Programs [invoke](https://solana.com/docs/core/cpi) the [Light Protocol System Program](../developers/addresses-and-urls.md#program-ids-and-accounts-from-27th-aug-2024-onward) to update compressed state
      1. **The protocol** [**validates**](core-concepts/validity-proofs.md) **the state** (validity of existing state, sum checks, ownership checks)
      2. **The protocol enforces a schema:** Classic Accounts → Compressed Accounts.  [Compressed accounts](core-concepts/compressed-account-model.md) have a layout similar to classic accounts
4. **State Updates:** At the end of an instruction, the new state is recorded as a log on the Solana ledger
5. [**Photon RPC Nodes**](https://www.zkcompression.com/node-operators/run-a-node#photon-rpc-node)**:** These nodes index the state changes, making the compressed account state available to clients via the [ZK Compression RPC API](https://www.zkcompression.com/developers/json-rpc-methods)
6. **Forester Nodes (Keeper Nodes)**: Interact with the [Account Compression Program](../developers/addresses-and-urls.md#program-ids-and-accounts-from-27th-aug-2024-onward) to empty queues and rollover state trees.
