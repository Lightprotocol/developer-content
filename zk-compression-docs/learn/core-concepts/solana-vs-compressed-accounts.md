---
title: Compressed Account Model
description: Overview to compressed account structure and how to access compressed account data
hidden: true
---

## Overview

{% hint style="info" %}
This guide assumes that you're familiar with [Solana's account model](https://solana.com/docs/core/accounts).
{% endhint %}

Compressed accounts store state and are similar to regular Solana accounts but with five main differences:

* Each compressed account can be identified by its hash
* Each write to a compressed account changes its hash
* An `address` can optionally be set as a permanent unique ID of the compressed account.
* All compressed accounts are stored in sparse state trees. Only the tree's state root (i.e., a small fingerprint of all compressed accounts) is stored in the on-chain account space.

These differences make compressed accounts rent-free and allow the protocol to store state as calldata on the Solana ledger instead of the costly on-chain account space.

## In a Nutshell

Transactions can use compressed account data inside Solana's virtual machine as if it were stored on-chain by combining state compression and zero-knowledge proofs:

1. Millions of compressed accounts are stored as hashes in Merkle tree leaves
2. All accounts in one Merkle tree are compressed into a root hash
3. The root hash is stored in one Solana account for cryptographic verification
4. Compressed account state is recorded on the Solana ledger
5. Latest compressed account state is fetched from your RPC provider
6. Compressed account state is verified against the on-chain root hash with a validity proof

{% hint style="success" %}
* Merkle trees are provided by the protocol and Indexers generate validity proofs. 
* Developers don't configure state Merkle trees or generate validity proofs.

[You will learn more about Merkle trees and validity proofs in the next section](merkle-trees.md). 
{% endhint %}

## Compressed Account Structure

Compressed accounts include the core Solana account fields (owner, lamports, data) plus additional fields to index and store compressed state.

```rust
pub struct CompressedAccount {
    pub address: Option<[u8; 32]>,            // Optional persistent identifier
    pub data: Option<CompressedAccountData>,  // Account data
    pub hash: [u8; 32],                       // Unique account hash
    pub lamports: u64,                        // Account balance
    pub owner: Pubkey,                        // Program that owns this account
}
```

{% hint style="info" %}
Find the [source code here](https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/client/src/indexer/types.rs#L508-L520).
{% endhint %}

<details>

<summary>Solana Account Structure</summary>

```rust
pub struct Account {
    pub lamports: u64,       // Account balance
    pub data: Vec<u8>,       // Arbitrary data (program state)
    pub owner: Pubkey,       // Program that owns this account
    pub executable: bool,    // Is this a program account
    pub rent_epoch: Epoch,   // Legacy field
}
```

{% hint style="info" %}
Find the source code here: [agave/sdk/account/src/lib.rs:48-60](https://github.com/anza-xyz/agave/blob/67412607f511ded3770031280b6aaf10607713fc/sdk/account/src/lib.rs#L48-L60)
{% endhint %}

</details>

### Address and Hash

Each compressed account can be **identified by its hash**, regardless of whether it has an address. By definition, whenever any data of a compressed account changes, its hash changes. 

That's why an **address** can serve as optional and additional **persistent identifier**. 
* An address is represented as 32 bytes in the format of a `PublicKey`.
* Addresses are optional, because ensuring that the address of a new account is unique incurs additional computational overhead.

{% hint style="info" %}
- Use the address field wherever the state must be unique (such as for NFTs or certain PDAs) and requires a persistent identifier.
- You don't need the address for any fungible state (e.g., fungible tokens)
{% endhint %}

**Compressed Account Address Derivation**

Compressed account addresses are derived similar to PDAs.

* Like PDAs, compressed account addresses don't belong to a private key; rather, they're derived from the program that owns them.
* The key difference to regular PDAs is that compressed accounts require an **address tree** parameter. 
* Address tree's store addresses of compressed accounts and ensure its uniqueness.

{% tabs %}
{% tab title="TypeScript" %}

```typescript
const seed = deriveAddressSeed(
  [
    Buffer.from("account"),
    user.publicKey.toBytes()
  ],
  programId
);

const address = deriveAddress(seed, addressTree);
```

{% hint style="info" %}
Learn more about address derivation for a [Typescript Client here](../client-library/typescript.md#derive-address).
{% endhint %}

{% endtab %}

{% tab title="Rust" %}

```rust
let (address, _) = derive_address(
  &[
    b"account",
    user.pubkey().as_ref()
  ],
  &address_tree_pubkey,
  &program_id
);
```

{% hint style="info" %}
Learn more about address derivation for a [Rust Client here](../client-library/rust.md#derive-address).
{% endhint %}

{% endtab %}
{% endtabs %}


<details>

<summary>Solana PDA Derivation</summary>

{% code title="derive-pda.ts" %}
```typescript
const [pda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("account"),
    user.publicKey.toBuffer()
  ],
  programId
);
```
{% endcode %}

{% code title="derive-pda.rs" %}
```rust
let (pda, _bump) = Pubkey::find_program_address(
  &[
    b"account",
    user.pubkey().as_ref()
  ],
  &program_id
);
```
{% endcode %}

</details>


### Data Field

The `data` field contains the compressed account's program state:

```rust
pub struct CompressedAccountData {
    pub discriminator: [u8; 8],  // Type identifier for account data
    pub data: Vec<u8>,           // Serialized program state
    pub data_hash: [u8; 32],     // Hash of the data field
}
```

- `discriminator`: Identifies the data type for programs to correctly deserialize account data. Similar to Anchor's 8-byte account discriminator.
- `data`: Stores the account's current state as arbitrary bytes (e.g., serialized user data, balances, metadata).
  * Compressed accounts have no fixed maximum size to store data like Solana's 10 MB.
  * Still, Solana's 1,232-byte transaction limit constrains practical data size to roughly 1 KB per account.
- `data_hash`: Hash of the `data` field (32 bytes). 
  * When computing the compressed account hash for the state tree, the protocol uses this fixed-size hash instead of the variable-length data bytes. 
  * This keeps hash computation efficient and consistent regardless of data size.

## Accessing Compressed Account Data

The account structure changes how compressed accounts are accessed. Still, accessing compressed accounts follows a similar pattern to regular Solana accounts.
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

Reading data from a Solana account involves two steps:

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

# Next Steps
Learn how state trees store compressed accounts and address trees store addresses.

{% content-ref url="merkle-trees-validity-proofs.md" %}
[merkle-trees-validity-proofs.md](merkle-trees-validity-proofs.md)
{% endcontent-ref %}