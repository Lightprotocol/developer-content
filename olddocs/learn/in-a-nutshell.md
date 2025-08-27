---
description: This page provides a high-level overview of the Light Protocol architecture.
---

# In a Nutshell

## High-level System Overview

1. **State is stored as call data in** [**Solana's ledger**](https://www.helius.dev/blog/all-you-need-to-know-about-compression-on-solana#state-vs-ledger)**,** resulting in no rent cost
2. **Transaction Specify State:** Transactions define the state they access (read/write) and include it in the transaction payload
3. **State Validation:**
   1. Solana Programs [invoke](https://solana.com/docs/core/cpi) the [Light Protocol System Program](../developers/devnet-addresses.md#program-ids-and-accounts-from-27th-aug-2024-onward) to update compressed state
      1. **The protocol** [**validates**](core-concepts/validity-proofs.md) **the state** (validity of read state, sum checks, ownership checks)
      2. **The protocol enforces a schema:** Classic Accounts → Compressed Accounts.  [Compressed accounts](core-concepts/compressed-account-model.md) have a layout similar to classic accounts
4. **State Updates:** At the end of a transaction, the new state is recorded as a log on the ledger
5. [**Photon RPC Nodes**](https://www.zkcompression.com/node-operators/run-a-node#photon-rpc-node)**:** These nodes index and persist the logs, making the compressed account state available to clients via the [ZK Compression RPC API](https://www.zkcompression.com/developers/json-rpc-methods)
6. **Forester nodes (cranks)**: Interact with the [Account Compression Program](../developers/devnet-addresses.md#program-ids-and-accounts-from-27th-aug-2024-onward) to empty queues, and roll-over trees, where compressed state is stored.
