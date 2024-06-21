# Lifecycle of a Transaction

ZK Compression transactions are fully compatible with Solana's Transaction and VersionedTransaction. There are three key nuances in building transactions with compressed accounts as compared to regular accounts:

* Instructions must specify the list of all compressed accounts being read or written to. To read or write to a compressed account, the instruction must send the current account state on-chain and prove its validity.
* Each unique state tree that gets read or written to (via any compressed account) needs to be specified as per Solana's regular on-chain [account access lists](https://solana.com/docs/core/transactions#array-of-account-addresses).&#x20;
* To read any compressed account state on-chain, the client must send a validity proof alongside the instruction data to the chain. Depending on your program logic, the validity proof can prove A) the validity of all specified read accounts and B) the non-existence of a specified PDA within the compressed address space, e.g., for creating a new compressed PDA account.

We can express a transaction more generally as:

`(state, validityProof) -> state transition -> state'`

Here's what this looks like when updating a single compressed PDA account:

<figure><img src="../../.gitbook/assets/image (5).png" alt="" width="563"><figcaption><p>Simplified: Read and Write compressed accounts</p></figcaption></figure>

In this example, we assume that the client previously created said compressed account and thereafter fetched its compressed account info from an [RPC node](../../node-operators/run-a-node.md#photon-indexer-node).

The custom Solana program executing the state transition Data -> Data' should require its client to pack the instructions efficiently. In the above scenario, the total data that's sent to the chain is: `address (same)`, `owner program (same)`, `data`, `data'-data`, `validity proof.`

The compressed account after its update looks like this:

<figure><img src="../../.gitbook/assets/image (6).png" alt="" width="563"><figcaption><p>Full representation of a compressed account with PDA</p></figcaption></figure>

## On-chain Protocol Execution

To write compressed state, the custom program invokes the protocol via CPI. The protocol then does the following:

1. The protocol [verifies the validity proof](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/verify\_state\_proof.rs#L180)&#x20;
2. The protocol runs relevant checks ([sum check](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L54C5-L60C8), etc.)
3. [Nullifies](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L153-L158) the "old" leaf of the compressed account that is being written to
4. Appends the new compressed account hash to the state tree and advances the tree's [state root](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L172-L181)
5. [Emits](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L189-L195) the new "raw" compressed account state onto the ledger

An[ RPC node](../../node-operators/run-a-node.md#photon-indexer-node) then parses the transaction and compressed state and provides the read state to clients via the [ZK Compression RPC API](../../developers/json-rpc-methods.md).
