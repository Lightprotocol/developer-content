# Tradeoffs

While ZK compression offers significant advantages for managing state on Solana at scale, it's important to consider the trade-offs involved in using it for your use case:

### **Larger Transaction Size**

* **State To bandwidth:** To read from a compressed account inside a program, the client must send the to-be-read account state to the chain. This increases the transaction size.
* **Proof Size:** Each instruction that reads compressed accounts incurs a global validity proof size of 128 bytes. This size remains consistent whether reading from one or multiple compressed accounts in a single instruction.

### **High Compute Unit Cost**

* **Hashing**: ZK compression uses [Poseidon hashes](https://eprint.iacr.org/2019/458.pdf). While Poseidon hashes enable more efficient state inclusion and exclusion proofs, recomputing the hashes on-chain is more expensive (CU) than keccak256 hashes.
* **Validity proof verification:** The base cost of verifying a validity proof to read compressed accounts is \~100,000 CUs. This also remains consistent whether reading from one or multiple compressed accounts in a single instruction.
* At the time of writing, Solana does not consider a transaction's CU cost in its base fee calculation. However, CU cost will impact effective priority during L1 congestion events.
* We expect most compressed transactions to be within low to mid-six-digit CUs. For example, a typical compressed token transfer costs around 292,000 CUs.

Transaction size limits (1232 bytes) are currently more restrictive for the composability and flexibility of compressed transactions than the CU budget per transaction (1.4 million), so we deem the tradeoff worthwhile.

### Per-transaction state cost&#x20;

Whenever a [transaction](lifecycle-of-a-transaction.md) writes to a compressed account, it nullifies the previous compressed account state and appends the new compressed account as a leaf to the state tree. Both of these actions incur costs that add to Solana's base fee:

* **Appending compressed account state to a state tree**: Typically \~100-200 lamports per new leaf\
  $$\left( 2^{\text{tree\_depth}} \times \text{tree\_account\_rent\_cost} \times \text{rollover\_threshold} \right)$$
* **Nullifying a leaf in a state tree**: The current default [forester node](../../node-operators/run-a-node.md#light-forester-node) implementation can nullify one leaf within one Solana transaction (5000 lamports base fee).

## Next Steps

This covers most of the key concepts about ZK compression! Next, [build a program](../../developers/intro-to-development.md#on-chain-program-development) or application with ZK compression or learn how to set up and [run](../../node-operators/run-a-node.md) your own node.
