---
title: Lifecycle of a Transaction
description: >-
  Overview to the lifecycle of a transaction that interacts with compressed
  accounts.
---

# Lifecycle of a Transaction

## Overview

{% hint style="info" %}
This guide assumes you are familiar with transactions on Solana. If you aren't, we recommend to read the [Solana documentation on transactions](https://solana.com/docs/core/transactions).
{% endhint %}

Transactions to interact with compressed accounts are fully compatible with Solana's Transaction and Versioned Transaction formats.

There are few nuances to build transactions with compressed accounts as compared to regular accounts:

* Instructions must specify the list of all compressed accounts being read or written to.
* To read or write to a compressed account, the instruction must send the current account state on-chain and prove its validity.&#x20;
* Each unique state tree that gets read or written to (via any compressed account) needs to be specified as per Solana's regular on-chain [account access lists](https://solana.com/docs/core/transactions#array-of-account-addresses).

## Reading Compressed Accounts

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

## Writing to Compressed Accounts

Writing to compressed accounts can be described more generally as:

```
(state, validityProof) -> state transition -> state'
```

**Writing to a compressed account involves these steps:**

1. Fetch the compressed account data from your RPC provider using its address or hash
2. Fetch a validity proof from your RPC provider using the account hash via [`getValidityProof()`](../../resources/json-rpc-methods/getvalidityproof.md) to prove the account hash exists in the state tree.

The Solana program executing the state transition _**Data**_**&#x20;->&#x20;**_**Data'**_ requires its client to pack the instructions with:

* `address`: persistent identifier of the compressed account (unchanged)
* `owner program`: program ID that owns this account (unchanged)
* `data`: current account data
* `data'`: updated account data
* `validity proof`: 128-byte ZK proof that verifies the current account hash exists in the state tree

{% hint style="info" %}
See this [guide to update a compressed account](../../compressed-pdas/guides/how-to-update-compressed-accounts.md).
{% endhint %}

<figure><img src="../../.gitbook/assets/Light Protocol v2 - Batched Merkle trees (4) (1).png" alt="Diagram illustrating compressed account state updates.  On the left, under “Read Existing Account,” four stacked boxes represent: 	1.	Address – the unique identifier of the account, 	2.	Owner Program – the Solana program controlling the account, 	3.	Data – the account’s stored state, and 	4.	Validity Proof – a zero-knowledge proof verifying that the read data is valid.  An arrow in the center points to the right, labeled “Write Updated Account,” showing the same fields—Address, Owner Program, and Data′ (updated data)—indicating that only the data field changes while the validity proof ensures correctness.  This visualization explains the read-modify-write process for compressed accounts in Solana’s ZK Compression architecture, demonstrating how off-chain state updates are validated and written on-chain."><figcaption><p>Simplified: Read and Write compressed accounts</p></figcaption></figure>

### On-chain Execution

To write compressed state, a program invokes the Light System Program via CPI. The system program then does the following:

1. Runs relevant checks ([sum check](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/verify_state_proof.rs#L204-L210), etc.)
2. [Verifies the validity proof](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214)
3. [Nullifies](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L209-L214) the existing leaf of the compressed account that is being written to, to prevent double spending.
4. [Appends](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L245-L254) the new compressed account hash to the state tree and advances the tree's state root
5. [Emits](https://github.com/Lightprotocol/light-protocol/blob/v.1.0.0/programs/system/src/invoke/processor.rs#L272-L279) the new compressed account state onto the Solana ledger

An RPC node then parses the transaction and compressed state and provides the read state to clients via the ZK Compression RPC API.

{% tabs %}
{% tab title="Before Tx Execution" %}
<figure><img src="../../.gitbook/assets/image (2).png" alt="Diagram showing the initial data flow in before writing compressed state on-chain. A Client interacts with an Indexer (RPC) to fetch account data and generate a validity proof. The client then builds and sends a transaction to a Custom Program, which in turn invokes the Light System Program. On the right, the H(Account) hash represents the existing compressed account within the State Tree. This visualization explains how proofs and account hashes are prepared for verification prior to state updates during Solana’s on-chain execution process in. The diagram is simplified and does not include other components that are involved such as the queues, account compression program and forester nodes"><figcaption></figcaption></figure>
{% endtab %}

{% tab title="After Tx Execution" %}
<figure><img src="../../.gitbook/assets/image (3).png" alt="Diagram illustrating the on-chain execution and proof verification phase in Solana’s ZK Compression. The Client and Indexer provide proof and data to a Custom Program, which calls the Light System Program. The system program performs checks, proof verification and hashing. The H(Account) hash represents the existing compressed account hash that is nullified (to prevent double spending). The update compressed account is represented by the H(Account′) hash appended to the State Tree. This diagram visualizes how the Light System Program validates the proof, nullifies the old leaf, appends the new state hash, and advances the tree root.  The diagram is simplified and does not include other components that are involved such as the queues, account compression program and forester nodes"><figcaption></figcaption></figure>
{% endtab %}
{% endtabs %}

## Next Steps

Now that you Understand where ZK Compression may or may not be the best solution.

{% content-ref url="considerations.md" %}
[considerations.md](considerations.md)
{% endcontent-ref %}
