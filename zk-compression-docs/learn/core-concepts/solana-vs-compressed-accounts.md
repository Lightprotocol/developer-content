---
title: Compressed Account Model
description: Technical reference comparing regular Solana accounts and compressed accounts.
hidden: true
---

{% hint style="info" %}
This guide assumes that you're familiar with [Solana's account model](https://solana.com/docs/core/accounts).
{% endhint %}

# Overview

ZK compressed state is stored in compressed accounts. Compressed accounts are similar to regular Solana accounts but with five main differences:

* Each compressed account can be identified by its hash
* Each write to a compressed account changes its hash
* An `address` can optionally be set as a permanent unique ID of the compressed account.
* All compressed accounts are stored in sparse state trees. Only the tree's state root (i.e., a small fingerprint of all compressed accounts) is stored in the on-chain account space.

These differences make compressed accounts rent-free and allow the protocol to store state as calldata on the Solana ledger instead of the costly on-chain account space.

# How compressed accounts work

These are the steps that allow transactions to use the account data inside Solana's virtual machine as if it were stored on-chain:

1. Millions of compressed accounts are stored as hashes in Merkle tree leaves
2. All accounts in one Merkle tree are compressed into a root hash
3. The root hash is stored in one Solana account for cryptographic verification
4. Compressed account state is recorded on the Solana ledger
5. Latest compressed account state is fetched from your RPC provider
6. Compressed account state is verified against the on-chain root hash with a validity proof

{% hint style="success" %}
* Merkle trees are provided by the protocol and Indexers generate validity proofs. 
* Developers don't configure state Merkle trees or generate validity proofs.

[Learn more about Merkle trees here](<add-link-to-merkle-trees>). 
{% endhint %}

# Compressed Account Structure

Compressed accounts mirror the Solana account layout. 

```rust
pub struct CompressedAccount {
    pub owner: Pubkey,                        // Program that owns this account
    pub lamports: u64,                        // Account balance
    pub address: Option<[u8; 32]>,            // Optional persistent identifier
    pub data: Option<CompressedAccountData>,  // Account data
    pub hash: [u8; 32],                       // Unique account hash
    pub tree_info: TreeInfo,                  // Merkle tree metadata
}
```

{% hint style="info" %}
This shows the key fields. The full struct includes additional fields: `slot_created`, `seq`, and `prove_by_index`. Find the complete definition here: [light-protocol/sdk-libs/client/src/indexer/types.rs:508-520](https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/client/src/indexer/types.rs#L508-L520)
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


## Data Field

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

## Hash Field

The `hash` field is an identifier that ensures global uniqueness. It includes
- Account owner
- Compressed account's position in the state tree (`leaf_index`)
- Public key of the state tree's on-chain account
- Lamports (if non-zero)
- Address (if present)
- Data discriminator and data hash (if data is present)

{% hint style="info" %}
By definition, whenever any data of a compressed account changes, its hash changes. This impacts how developers interact with fungible state. Check out the [examples](https://www.zkcompression.com/get-started/intro-to-development#build-by-example) section to see what using hashes instead of addresses looks like in practice.
{% endhint %}

## Address and Derivation

Compressed accounts are optionally identified by a persistent `address`. 
* An address is represented as 32 bytes in the format of a `PublicKey`.
* Addresses are optional, because ensuring that the address of a new account is unique incurs additional computational overhead and the hash already serves as unique identifier.

{% hint style="info" %}
- Use the address field wherever the state must be unique (such as for NFTs or certain PDAs) and requires a persistent identifier.
- You don't need the address for any fungible state (e.g., fungible tokens)
{% endhint %}

**Compressed Account Address Derivation**

* Like PDAs, compressed account addresses don't belong to a private key; rather, they're derived from the program that owns them.
* The key difference to regular PDAs is that compressed accounts require an **address tree** parameter. 
* Address tree's store addresses of compressed accounts and ensure its uniqueness.

{% tabs %}
{% tab label="TypeScript" %}
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

{% tab label="Rust" %}
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

{% tabs %}
{% tab label="TypeScript" %}
```typescript
const [pda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("account"),
    user.publicKey.toBuffer()
  ],
  programId
);
```
{% endtab %}

{% tab label="Rust" %}
```rust
let (pda, _bump) = Pubkey::find_program_address(
  &[
    b"account",
    user.pubkey().as_ref()
  ],
  &program_id
);
```
{% endtab %}
{% endtabs %}

</details>


## TreeInfo Field

Lastly, compressed accounts include the `tree_info` field with metadata about the Merkle tree that stores the compressed account hash.

```rust
pub struct TreeInfo {
    pub tree: Pubkey,                       // Merkle tree account pubkey
    pub queue: Pubkey,                      // Associated queue account
    pub tree_type: TreeType,                // StateV1/V2 or AddressV1/V2
    pub cpi_context: Option<Pubkey>,        // Optional CPI context
    pub next_tree_info: Option<NextTreeInfo>, // Next tree for rollover
}
```

* `tree`: Pubkey of Merkle tree account that stores the tree's structure and data.
* `queue`: Queue account pubkey of queue associated with a Merkle tree
  * Buffers updates of compressed accounts before they are added to the Merkle tree. The Light System Program inserts values into the queue.
  * Clients and programs do not interact with the queue.
* `tree_type`: Identifies tree version (StateV1/V2 or AddressV1/V2) and account for hash insertion
* `cpi_context` (currently on devnet): Optional CPI context account for batched operations across multiple programs (may be null).
  * Allows a single zero-knowledge proof to verify compressed accounts from different programs in one instruction
  * First program caches its signer checks, second program reads them and combines instruction data.
  * Reduces instruction data size and compute unit costs when multiple programs interact with compressed accounts.
* `next_tree_info`: The tree to use for the next operation when the current tree is full (may be null).
  * When set, use this tree as output tree.
  * The protocol creates new trees, once existing trees fill up.

# Accessing Compressed Account Data

The account structure changes how compressed accounts are accessed. Still, accessing compressed accounts follows a similar pattern to regular Solana accounts.
* The main difference is that compressed account RPC methods query an indexer instead of the ledger directly.
* The indexer, called Photon, reconstructs compressed account state from the Solana ledger by reading transaction logs.

### Reading a Compressed Account

Reading data from a compressed account involves these steps:

1. Fetch the compressed account data from your RPC provider using its address or hash
2. Deserialize the account's data field into the appropriate data structure
3. To use the account in a transaction, generate a validity proof using the account hash via `getValidityProof()`.

The validity proof proves that the account hash exists at the specified leaf index in the state tree. This proof is included in transaction instruction data for on-chain verification by the Light System Program.

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

// Access compressed account hash
let hash = compressed_account.hash;
```

{% hint style="info" %}
Find the source code here: [account-comparison/tests/test_compressed_account.rs:40-52, 146](https://github.com/Lightprotocol/program-examples/blob/main/account-comparison/programs/account-comparison/tests/test_compressed_account.rs#L40-L52)
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

## Comparing Key RPC Methods

* [`get_compressed_account()`](../../resources/json-rpc-methods/getcompressedaccount.md) retrieves information about a specific compressed account using either its address or hash. 
  *  Similar to `getAccountInfo()`.
* [`get_compressed_balance()`](../../resources/json-rpc-methods/getcompressedbalance.md) retrieves the lamport balance for a specific compressed account by address or hash.
  * Similar to `getBalance()`.
* [`get_compressed_accounts_by_owner()`](../../resources/json-rpc-methods/getcompressedaccountsbyowner.md) returns all compressed accounts owned by a specific address.
  * Similar to `getProgramAccounts()`.
* [`get_validity_proof()`](../../resources/json-rpc-methods/getvalidityproof.md) generates zero-knowledge proofs that prove either the address does not exist yet in the specified address tree (for create) or that the account hash exists in the state tree (for update, close, reinitialize, burn).
    * Fetch this proof from your RPC provider that supports ZK Compression.
    * You don't need to generate validity proofs.


---
# Merkle trees

State and Address Merkle trees

The protocol uses multiple Merkle trees (not one global tree) to distribute transactions and reduce write-lock contention. Each compressed account must explicitly link to its specific tree.

Solana's runtime locks accounts during writes. If all compressed accounts used a single tree, that tree would become a bottleneck. Multiple trees allow parallel transactions.

V2 state trees use asynchronous updates via queues. The tree_info distinguishes between:
tree: The actual Merkle tree account
queue: Where new state is inserted (Forester updates tree from queue later)

{% hint style="success" %}
State and address Merkle trees are provided by the protocol. Developers don’t need to maintain or initialize Merkle trees themselves.
{% endhint %}

## State Merkle trees

Compressed accounts are stored as hashes in state Merkle trees.

A State tree is a binary Merkle tree that stores data of millions of compressed Solana accounts in leaves for efficient cryptographic verification the integrity of all leaves in a tree.

{% stepper %}
{% step %}
### Merkle Tree

A Merkle tree compresses data by hashing adjacent leaves repeatedly into a single root hash, starting from the lowest level. The hash of a compressed Solana account is stored as a leaf in a State tree.
{% endstep %}

{% step %}
### Merkle Root Hash

Only this root hash is stored on chain as single value on chain to secure the integrity of all compressed state in a tree. The raw state can thus be stored as calldata in the much cheaper Solana ledger space while preserving Solana's security guarantees.
{% endstep %}
{% endstepper %}

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/yYZGfWfsZriTXPIN0bIt/state%20merkle%20tree.png" alt="A diagram illustrating a binary state Merkle tree with a depth of 3 and a proof path for Leaf 1. The tree consists of 8 leaves, each representing a compressed account hash. The leaves are paired up to form nodes at each level, culminating in a single root node at the top. The proof path for Leaf 1 is highlighted, showing the hashes needed to verify the integrity of Leaf 1 up to the root node. For ZK Compression V1, &#x22;Light&#x22; state trees have a depth of 26, allowing for approximately 67 million leaves with compressed account hashes per tree."><figcaption><p>A Binary state Merkle tree, with depth 3 and proof path for Leaf 1.<br>For ZK Compression, “Light” state trees have a depth of 26, i.e. contain ~67 million leaves with compressed account hashes per tree.</p></figcaption></figure>

#### Leaf Hash Structure: Compressed Account Hashes

For compressed Solana accounts, the 32 byte leaf hashes effectively mirror the regular Solana account layout: `{DataHash, StateHash; Owner, Lamports`. 

{% hint style="info" %}
For [details on the compressed account structure see this section](<add-link-to-compressed-account-structure>).
{% endhint %}

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/PpPbEKFXwnxGN6Y9FrlU/leaf%20hash%20structure%20state%20tree.png" alt="Here&#x27;s an alt text for this image:  &#x22;Diagram showing the compressed account data structure within leaves of a Merkle tree. Four leaf nodes (Leaf 0, Leaf 1, Leaf 2, Leaf 3) are displayed at the top, each containing &#x27;Compressed Account Hash&#x27;. Below this, the data structure is broken down into components: Datahash, Lamports, OwnerHash, Address, Discriminator, StateTreeHash, and Leaf_Index in the top row, with Data, Owner, and State Tree shown in the bottom row. Leaf 1 is highlighted in green. The diagram illustrates how compressed account data is organized within the Merkle tree structure.&#x22;"><figcaption><p><a href="https://github.com/Lightprotocol/light-protocol/blob/9df1ca508813ec792f756fb65b0b266a2438d080/program-libs/compressed-account/src/compressed_account.rs#L303">Compressed Account Data Structure</a> in Leaf of Merkle Tree.</p></figcaption></figure>

## Address Merkle trees

An Address tree is a binary Merkle tree that stores addresses that serve as optional, persistent identifier for compressed accounts.

{% hint style="info" %}
Addresses can be reused across different address trees. Uniqueness is guaranteed only within the same address tree. Your program can check the address to ensure global uniqueness.
{% endhint %}





# Validity proof

#### Non-Inclusion Proofs

A non-inclusion proof demonstrates that a specific address is not present in the tree by showing:
1. The address value is greater than `leaf_lower_range_value` and less than `leaf_higher_range_value`
2. The hash of these range values exists in the Merkle tree root

This cryptographic proof ensures each address can only be created once per address tree.
{% endstep %}
{% endstepper %}


#### Key Differences from State Trees

| Feature | State Trees | Address Trees |
|---------|-------------|---------------|
| **Purpose** | Store compressed account hashes | Store derived addresses |
| **Proof Type** | Inclusion proofs (prove account hash exists) | Non-inclusion proofs (prove address doesn't exist) |
| **Tree Depth** | 26 (~67 million leaves) | 40 (~1 trillion leaves) |
| **Tree Type** | Binary Merkle tree | Indexed binary Merkle tree |
| **When Used** | Every compressed account operation | Only when creating accounts with addresses |