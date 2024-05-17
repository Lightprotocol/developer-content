# Lifecycle of a Transaction

ZK Compression transactions are fully compatible with Solana's Transaction and VersionedTransaction. There are three key nuances in building transactions with compressed accounts as compared to regular accounts:

* Instructions must specify the list of all compressed accounts being read or written to. To read or write to a compressed account, the instruction must send the current account state on-chain and prove its validity.
* Each unique state tree that gets read or written to (via any compressed account) needs to be specified as per Solana's regular on-chain [account access lists](https://solana.com/docs/core/transactions#array-of-account-addresses).
* To read any compressed account state on-chain, the client must send a validity proof alongside the instruction data to the chain. Depending on your program logic, the validity proof can prove A) the validity of all specified read accounts and B) the non-existence of a specified PDA within the compressed address space, e.g., for creating a new compressed PDA account.

We can express a transaction more generally as:

`(state, validityProof) -> state transition -> state'`

Here's what this looks like when updating a single compressed PDA account:

<figure><img src="https://www.zkcompression.com/~gitbook/image?url=https%3A%2F%2F3488020389-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDBJ4vLlhHTdkUGOiHxbB%252Fuploads%252FYlt1ftz6KJz3Zc0VLOIB%252Fimage.png%3Falt%3Dmedia%26token%3Df225cb5d-a1e9-40f0-b91c-289b5dbcf741&#x26;width=768&#x26;dpr=4&#x26;quality=100&#x26;sign=714b122431c0973b866f7144b6c80aa68b869280a8c7cec16da2985bf6945988" alt="" width="563"><figcaption><p>Simplified: Read and Write compressed accounts</p></figcaption></figure>

In this example, we assume that the client previously created said compressed account and thereafter fetched its compressed account info from an [RPC node](../../node-operators/node-operator-guide/run-a-node.md#photon-rpc-node-1).

The custom Solana program executing the state transition Data -> Data' should require its client to pack the instructions efficiently. In the above scenario, the total data that's sent to the chain is: `address (same)`, `owner program (same)`, `data`, `data'-data`, `validity proof.`

The compressed account after its update looks like this:

<figure><img src="https://www.zkcompression.com/~gitbook/image?url=https%3A%2F%2F3488020389-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDBJ4vLlhHTdkUGOiHxbB%252Fuploads%252FBpJx0y1hjF3bTXmb3QhL%252Fimage.png%3Falt%3Dmedia%26token%3D272a064a-0b01-4508-9940-dfbe2134ca69&#x26;width=768&#x26;dpr=4&#x26;quality=100&#x26;sign=8e096ae7be73c7c54854bde4eb473a62e810dba9a692de105a0631d48fe14262" alt="" width="563"><figcaption><p>Full representation of a compressed account with PDA</p></figcaption></figure>

### On-chain Protocol Execution <a href="#on-chain-protocol-execution" id="on-chain-protocol-execution"></a>

To write compressed state, the custom program invokes the protocol via CPI. The protocol then does the following:

1. The protocol [verifies the validity proof](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/verify\_state\_proof.rs#L180)
2. The protocol runs relevant checks ([sum check](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L54C5-L60C8), etc.)
3. [Nullifies](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L153-L158) the "old" leaf of the compressed account that is being written to
4. Appends the new compressed account hash to the state tree and advances the tree's [state root](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L172-L181)
5. [Emits](https://github.com/Lightprotocol/light-protocol/blob/main/programs/compressed-pda/src/invoke/processor.rs#L189-L195) the new "raw" compressed account state onto the ledger

An RPC node then parses the transaction and compressed state and provides the read state to clients via the [ZK Compression RPC API](../../overview/json-rpc-methods.md).
