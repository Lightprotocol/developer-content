---
title: Lifecycle of a Transaction
description: Overview to the lifecycle of a transaction that interacts with compressed accounts.
---

# Overview

{% hint style="info" %}
This guide assumes you are familiar with transactions on Solana. If you aren't, we recommend to read the [Solana documentation on transactions](https://solana.com/docs/core/transactions).
{% endhint %}

Transactions to interact with compressed accounts are fully compatible with Solana's Transaction and Versioned Transaction formats.

There are three key nuances in building transactions with compressed accounts as compared to regular accounts:

* Instructions must specify the list of all compressed accounts being read or written to. 
* To read or write to a compressed account, the instruction must send the current account state on-chain and prove its validity
* Each unique state tree that gets read or written to (via any compressed account) needs to be specified as per Solana's regular on-chain [account access lists](https://solana.com/docs/core/transactions#array-of-account-addresses)
* To read any compressed account state on-chain, the client must send a validity proof alongside the instruction data.

# Reading Compressed Accounts

Reading compressed accounts follows a similar pattern to Solana accounts.
* The main difference is that compressed account RPC methods query an indexer instead of the ledger directly.
* The indexer, called Photon, reconstructs compressed account state from the Solana ledger by reading transaction logs.

The API exposed by the indexer closely mirrors existing RPC calls, with one-to-one mapping:

| Solana RPC              | Photon RPC Calls                  |
| ----------------------- | --------------------------------- |
| getAccountInfo          | getCompressedAccount              |
| getBalance              | getCompressedBalance              |
| getTokenAccountsByOwner | getCompressedTokenAccountsByOwner |
| getProgramAccounts      | getCompressedAccountsByOwner      |


{% tabs %}
{% tab title="**Clients**" %}
Clients read compressed accounts similar to Solana accounts:

1. Fetch the compressed account data from your RPC provider using its address or hash
   * Here you use [`getCompressedAccount()`](../../resources/json-rpc-methods/getcompressedaccount.md), similar to `getAccountInfo()`.
2. Deserialize the account's data field into the appropriate data structure.

{% tabs %}
{% tab title="TypeScript" %}
```typescript
// 1. Fetch compressed account from indexer
const compressedAccount = await rpc.getCompressedAccount(
  bn(address.toBytes())
);

// 2. Deserialize account data
const accountData = coder.types.decode(
  "AccountType",
  compressedAccount.data.data
);
```
{% endtab %}

{% tab title="Rust" %}
```rust
// 1. Fetch compressed account from indexer
let compressed_account = rpc
    .get_compressed_account(address, None)
    .await?
    .value
    .unwrap();

// 2. Deserialize account data
let account_data = deserialize(&compressed_account.data)?;
```
{% endtab %}
{% endtabs %}

{% endtab %}

{% tab title="**Programs**" %}
On-chain reading within programs requires a validity proof to verify the account exists in the state tree.

1. Fetch the compressed account data from your RPC provider using its address or hash
2. Fetch a validity proof using the account hash via [`getValidityProof()`](../../resources/json-rpc-methods/getvalidityproof.md).
3. Clients pass the proof to the on-chain program in the instruction data.

{% tabs %}
{% tab title="TypeScript" %}
```typescript
// 1. Fetch compressed account from indexer
const compressedAccount = await rpc.getCompressedAccount(
  bn(address.toBytes())
);

// 2. Get validity proof using account hash
const proof = await rpc.getValidityProof(
  [bn(compressedAccount.hash)]
);

// 3. Proof is included in transaction instructions
```
{% endtab %}

{% tab title="Rust" %}
```rust
// 1. Fetch compressed account from indexer
let compressed_account = rpc
    .get_compressed_account(address, None)
    .await?
    .value
    .unwrap();

// 2. Get validity proof using account hash
let proof = rpc
    .get_validity_proof(vec![compressed_account.hash], vec![], None)
    .await?
    .value;

// 3. Proof is included in transaction instructions
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
See this [read-only program example](https://github.com/Lightprotocol/program-examples/tree/main/read-only) implementation.
{% endhint %}
{% endtab %}
{% endtabs %}

# Writing to Compressed Accounts

Writing to compressed accounts can be described more generally as:

```
(state, validityProof) -> state transition -> state'
```

Here's what this looks like when updating a single compressed PDA account:

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/6N5Y8RAa4ZWhbdBjcDzF/image.png" alt="" width="563"><figcaption><p>Simplified: Read and Write compressed accounts</p></figcaption></figure>

**Writing to a compressed account involves these steps:**
1. Fetch the compressed account data from your RPC provider using its address or hash
2. Fetch a validity proof from your RPC provider using the account hash via [`getValidityProof()`](../../resources/json-rpc-methods/getvalidityproof.md).
    * This proves either the address does not exist yet in the specified address tree (for creation) or that the account hash exists in the state tree (for updates, closure, reinitialization, burn).
    * The validity proof is included in transaction instruction data for on-chain verification by the Light System Program.

The custom Solana program executing the state transition _Data_ -> _Data'_ requires its client to pack the instructions with:
* `address`: persistent identifier of the compressed account (unchanged)
* `owner program`: program ID that owns this account (unchanged)
* `data`: current account data
* `data'`: updated account data
* `validity proof`: 128-byte ZK proof that verifies the current account hash exists in the state tree

{% hint style="info" %}
See this [guide to update a compressed account](../../compressed-pdas/guides/how-to-update-compressed-accounts.md).
{% endhint %}

The compressed account after its update looks like this:

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/rh20BbzWTX4702q851kZ/image.png" alt="" width="563"><figcaption><p>Full representation of a compressed account with PDA</p></figcaption></figure>

## On-chain Execution

To write compressed state, a program invokes the Light System Program via CPI. The system program then does the following:

1. Runs relevant checks ([sum check](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/verify_state_proof.rs#L204-L210), etc.)
2. [Verifies the validity proof](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214)
3. [Nullifies](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214) the existing leaf of the compressed account that is being written to, to prevent double spending
4. [Appends](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L245-L254) the new compressed account hash to the state tree and advances the tree's state root
5. [Emits](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L272-L279) the new compressed account state onto the Solana ledger

An RPC node then parses the transaction and compressed state and provides the read state to clients via the ZK Compression RPC API.

# Next Steps

Understand where ZK Compression may or may not be the best solution.

{% content-ref url="considerations.md" %}
[considerations.md](considerations.md)
{% endcontent-ref %}