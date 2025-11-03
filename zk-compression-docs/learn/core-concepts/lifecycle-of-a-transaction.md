---
title: Lifecycle of a Transaction
description: Overview to the lifecycle of a transaction that interacts with compressed accounts.
---

{% hint style="info" %}
This guide assumes you are familiar with transactions on Solana. If you aren't, we recommend to read the [Solana documentation on transactions](https://solana.com/docs/core/transactions).
{% endhint %}

ZK Compression transactions are fully compatible with Solana's Transaction and Versioned Transaction formats.

There are three key nuances in building transactions with compressed accounts as compared to regular accounts:

* Instructions must specify the list of all compressed accounts being read or written to. To read or write to a compressed account, the instruction must send the current account state on-chain and prove its validity
* Each unique state tree that gets read or written to (via any compressed account) needs to be specified as per Solana's regular on-chain [account access lists](https://solana.com/docs/core/transactions#array-of-account-addresses)
* To read any compressed account state on-chain, the client must send a validity proof alongside the instruction data to the chain. Depending on your program logic, the validity proof can prove A) the validity of all specified read accounts and B) the non-existence of a specified PDA within the compressed address space, e.g., for creating a new compressed PDA account

We can express a transaction more generally as:

`(state, validityProof) -> state transition -> state'`

Here's what this looks like when updating a single compressed PDA account:

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/6N5Y8RAa4ZWhbdBjcDzF/image.png" alt="" width="563"><figcaption><p>Simplified: Read and Write compressed accounts</p></figcaption></figure>

In this example, we assume that the client previously created said compressed account and thereafter fetched its compressed account info from an RPC node

The custom Solana program executing the state transition _Data_ -> _Data'_ should require its client to pack the instructions efficiently. In the above scenario, the total data that's sent to the chain is: `address (same)`, `owner program (same)`, `data`, `data'-data`, `validity proof`

The compressed account after its update looks like this:

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/rh20BbzWTX4702q851kZ/image.png" alt="" width="563"><figcaption><p>Full representation of a compressed account with PDA</p></figcaption></figure>

### On-chain Protocol Execution

To write compressed state, a custom caller program must invoke the Light System Program via CPI. The system program then does the following:

1. Runs relevant checks ([sum check](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/verify_state_proof.rs#L204-L210), etc.)
2. [Verifies the validity proof](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214)
3. [Nullifies](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214) the "old" leaf of the compressed account that is being written to
4. [Appends](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L245-L254) the new compressed account hash to the state tree and advances the tree's state root
5. [Emits](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L272-L279) the new compressed account state onto the Solana ledger

An RPC node then parses the transaction and compressed state and provides the read state to clients via the ZK Compression RPC API

### Next Steps

{% content-ref url="considerations.md" %}
[considerations.md](considerations.md)
{% endcontent-ref %}
