# In a Nutshell

## High-level System Overview

1. **Off-Chain State Storage:** State is stored off-chain, e.g., as logs on the Solana ledger, resulting in no [rent](https://solana.com/docs/intro/rent) cost.
2. **Transaction specify state:** Transactions define the state they access (read/write) and include it in the transaction payload.
3. **State Validation:**
   1. Solana Programs [invoke](https://solana.com/docs/core/cpi) the Protocol System Program to update compressed state.
      1. **The protocol** [**validates**](core-concepts/validity-proofs.md) **the state** (validity of read state, sum checks, ownership checks).
      2. **The protocol enforces a schema:** Classic Accounts → Compressed Accounts: [Compressed accounts](core-concepts/compressed-account-model.md) have a layout similar to classic accounts.
4. **State Updates:** At the end of a transaction, the new state is recorded as a log on the Solana ledger.
5. [**Photon RPC Nodes**](../node-operators/run-a-node.md#photon-rpc-node)**:** index and persist the logs, making the compressed account state available to clients via the [ZK Compression RPC API](../introduction/json-rpc-methods.md).
