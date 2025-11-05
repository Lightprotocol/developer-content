---
title: Lifecycle of a Transaction
description: Overview to the lifecycle of a transaction that interacts with compressed accounts.
---

{% hint style="info" %}
This guide assumes you are familiar with transactions on Solana. If you aren't, we recommend to read the [Solana documentation on transactions](https://solana.com/docs/core/transactions).
{% endhint %}

Transactions to interact with compressed accounts fully compatible with Solana's Transaction and Versioned Transaction formats.

There are three key nuances in building transactions with compressed accounts as compared to regular accounts:

* Instructions must specify the list of all compressed accounts being read or written to. 
* To read or write to a compressed account, the instruction must send the current account state on-chain and prove its validity
* Each unique state tree that gets read or written to (via any compressed account) needs to be specified as per Solana's regular on-chain [account access lists](https://solana.com/docs/core/transactions#array-of-account-addresses)
* To read any compressed account state on-chain, the client must send a validity proof alongside the instruction data to the chain.

We can express a transaction more generally as:

`(state, validityProof) -> state transition -> state'`

Here's what this looks like when updating a single compressed PDA account:

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/6N5Y8RAa4ZWhbdBjcDzF/image.png" alt="" width="563"><figcaption><p>Simplified: Read and Write compressed accounts</p></figcaption></figure>

In this example, we assume that the client previously created said compressed account and thereafter fetched its compressed account info from an RPC node

The custom Solana program executing the state transition _Data_ -> _Data'_ should require its client to pack the instructions. In the above scenario, the total data that's sent to the chain is: `address (same)`, `owner program (same)`, `data`, `data'-data`, `validity proof`

The compressed account after its update looks like this:

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/rh20BbzWTX4702q851kZ/image.png" alt="" width="563"><figcaption><p>Full representation of a compressed account with PDA</p></figcaption></figure>

## Reading Compressed Accounts

Reading compressed accounts follows a similar pattern to regular Solana accounts.
* The main difference is that compressed account RPC methods query an indexer instead of the ledger directly.
* The indexer, called Photon, reconstructs compressed account state from the Solana ledger by reading transaction logs.

**Reading data from a compressed account involves these steps:**
1. Fetch the compressed account data from your RPC provider using its address or hash
* Here you use [`get_compressed_account()`](../../resources/json-rpc-methods/getcompressedaccount.md), similar to `getAccountInfo()`.
2. Deserialize the account's data field into the appropriate data structure
3. To use the account in a transaction, fetch a validity proof from your RPC provider that supports ZK Compression using the account hash via `getValidityProof()`.
* This proves either the address does not exist yet in the specified address tree (for creation) or that the account hash exists in the state tree (for updates, closure, reinitialization, burn).

The proof is included in transaction instruction data for on-chain verification by the Light System Program.

```rust
// Reading compressed account from indexer
let compressed_account = rpc
    .get_compressed_account(address, None)
    .await
    .unwrap()
    .value
    .unwrap();

// Deserialize compressed account data
let data_account = CompressedAccountData::deserialize(
    &mut compressed_account.data.as_ref().unwrap().data.as_slice(),
)
.unwrap();

// Access fields
assert_eq!(data_account.user, user.pubkey());
assert_eq!(data_account.name, "Heinrich");
assert_eq!(data_account.data, [1u8; 128]);

// Get validity proof to use account in a transaction
let hash = compressed_account.hash;

let rpc_result = rpc
    .get_validity_proof(vec![hash], vec![], None)
    .await?
    .value;
```

{% hint style="info" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/main/account-comparison/programs/account-comparison/tests/test_compressed_account.rs#L40-L52)
{% endhint %}


<details>

<summary>Reading a Solana Account</summary>

In comparison, reading data from a Solana account involves two steps:

1. Fetch the account from your RPC provider using its address
2. Deserialize the account's data field from raw bytes into the appropriate data structure, as defined by the program that owns the account.

```rust
// Reading account from chain
let account = svm.get_account(&account_pda).unwrap();

// Deserialize account data (skip first 8 bytes = discriminator)
let data_account = AccountData::deserialize(&mut &account.data[8..]).unwrap();

// Access fields
assert_eq!(data_account.name, "Heinrich".to_string());
assert_eq!(data_account.data, [1u8; 128]);
```

{% hint style="info" %}
Find the source code here: [account-comparison/tests/test_solana_account.rs:31-35](https://github.com/Lightprotocol/program-examples/blob/main/account-comparison/programs/account-comparison/tests/test_solana_account.rs#L31-L35)
{% endhint %}

</details>

## Writing Compressed Accounts

To write compressed state, a custom caller program must invoke the Light System Program via CPI. The system program then does the following:

1. Runs relevant checks ([sum check](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/verify_state_proof.rs#L204-L210), etc.)
2. [Verifies the validity proof](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214)
3. [Nullifies](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214) the "old" leaf of the compressed account that is being written to
4. [Appends](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L245-L254) the new compressed account hash to the state tree and advances the tree's state root
5. [Emits](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L272-L279) the new compressed account state onto the Solana ledger

An RPC node then parses the transaction and compressed state and provides the read state to clients via the ZK Compression RPC API

# Next Steps

Get an overview of the considerations regarding compressed accounts.

{% content-ref url="considerations.md" %}
[considerations.md](considerations.md)
{% endcontent-ref %}
