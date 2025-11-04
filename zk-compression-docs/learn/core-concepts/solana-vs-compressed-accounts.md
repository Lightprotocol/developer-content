---
title: Solana vs Compressed Accounts
description: Technical reference comparing regular Solana accounts and compressed accounts.
hidden: true
---

ZK Compression extends Solana's account model with compressed accounts. This guide provides a technical comparison of regular and compressed Solana accounts.

# Account Structure

## Solana Account Structure

Regular Solana accounts store state on chain. 
* Each account stores up to 10 MB of data.
* Creating a Solana account requires a rent exemption balance, tied to account size.
* The account is accessible by address identifier during [program](https://solana.com/docs/core/accounts#program-account) execution. 
* The identifier can be a public key or [PDA (program derived address)](https://solana.com/docs/core/pda).

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

## Compressed Account Structure

Compressed accounts mirror the regular Solana account layout. 
* State is stored on the Solana ledger and is reconstructed by indexers.
* Account data is verified against on-chain roots with every transaction, which allows transactions to use the account data inside Solana's virtual machine as if it were stored on-chain.
* No fixed maximum size like Solana's 10 MB, but Solana's 1,232-byte transaction limit constrains practical data size to roughly 1 KB per account.
* Compressed accounts are identified by its unique hash, or optionally an address.

```rust
pub struct CompressedAccount {
    pub owner: Pubkey,                        // Program that owns this account
    pub lamports: u64,                        // Account balance
    pub address: Option<[u8; 32]>,            // Optional persistent identifier
    pub data: Option<CompressedAccountData>,  // Account data
    pub hash: [u8; 32],                       // Unique account hash
    pub tree_info: TreeInfo,                  // State tree metadata
}
```

{% hint style="info" %}
This shows the key fields. The full struct includes additional fields: `slot_created`, `seq`, and `prove_by_index`. Find the complete definition here: [light-protocol/sdk-libs/client/src/indexer/types.rs:508-520](https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/client/src/indexer/types.rs#L508-L520)
{% endhint %}

<details>

<summary>How compressed accounts work</summary>

1. Millions of compressed accounts are stored as hashes in Merkle tree leaves
2. All accounts in one Merkle tree are compressed into a root hash
3. The root hash is stored in one Solana account for cryptographic verification
4. Compressed account history is recorded on the Solana ledger
5. Latest compressed account state is fetched from an indexer
6. Compressed account state is verified against the on-chain root hash with a validity proof

{% hint style="info" %}
State Merkle trees are provided by the protocol and Indexers generate validity proofs. Developers don't configure state Merkle trees or generate validity proofs.
{% endhint %}

</details>


### Data Field

The `data` field contains the compressed account's program state through `CompressedAccountData`:

```rust
pub struct CompressedAccountData {
    pub discriminator: [u8; 8],  // Type identifier for account data
    pub data: Vec<u8>,           // Serialized program state
    pub data_hash: [u8; 32],     // Hash of the data field
}
```

- `discriminator`: Identifies the data type for programs to correctly deserialize account data. Similar to Anchor's 8-byte account discriminator.
- `data`: Stores the account's current state as arbitrary bytes (e.g., serialized user data, balances, metadata).
- `data_hash`: Pre-computed hash of the `data` field (32 bytes). 
  - Used to compute the compressed account hash that gets stored in the state tree leaf instead of the raw data bytes.

### Hash Field

The `hash` field is a unique identifier that ensures global uniqueness by incorporating:
- Account owner, lamports, address, and data hash
- Public key of the state tree's on-chain account
- Compressed account's position in the tree (`leaf_index`)

### Address and Derivation

Compressed accounts are optionally identified by an `address`, because ensuring that the address of a new account is unique incurs additional computational overhead.

{% hint style="info" %}
- Use the address field wherever the state must be unique (such as for NFTs or certain PDAs)
- You don't need the address for any fungible state (e.g., fungible tokens)
{% endhint %}

{% columns %}
{% column %}
**Compressed Account Address Derivation**

* The key difference to regular PDAs is that compressed accounts require an **address tree** parameter. 
* This address tree ensures uniqueness by verifying the address doesn't already exist. 
* [Learn how to derive an address for a compressed account here](../../compressed-pdas/guides/how-to-create-compressed-accounts.md#derive-address).

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
{% endcolumn %}

{% column %}
**Solana PDA Derivation**

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
{% endcolumn %}
{% endcolumns %}

### TreeInfo Field

The `tree_info` field contains metadata about the Merkle tree where the compressed account resides:

```rust
pub struct TreeInfo {
    pub tree: Pubkey,                       // Merkle tree account pubkey
    pub queue: Pubkey,                      // Associated queue account
    pub tree_type: TreeType,                // StateV1, StateV2, AddressV1, AddressV2
    pub cpi_context: Option<Pubkey>,        // Optional CPI context
    pub next_tree_info: Option<NextTreeInfo>, // Next tree for rollover
}
```

* `tree`: Pubkey of Merkle tree account that stores the tree's structure and data.
* `queue`: Queue account pubkey
  * Buffers updates of compressed accounts before they are added to the Merkle tree. The Light System Program inserts values into the queue.
  * Clients and programs do not interact with the queue.
* `tree_type`: Identifies tree version (StateV1, AddressV2) and account for hash insertion
* `cpi_context` (currently on devnet): Optional CPI context account for batched operations across multiple programs (may be null)
  * Allows a single zero-knowledge proof to verify compressed accounts from different programs in one instruction
  * First program caches its signer checks, second program reads them and combines instruction data
  * Reduces instruction data size and compute unit costs when multiple programs interact with compressed accounts
* `next_tree_info`: The tree to use for the next operation when the current tree is full (may be null)
  * When set, use this tree as output tree.
  * The protocol creates new trees, once existing trees fill up.

# Reading Account Data

Reading compressed accounts follows a similar pattern to regular Solana accounts.
* The main difference is that compressed account RPC methods query an indexer instead of the ledger directly.
* The Photon indexer reconstructs compressed account state from the Solana ledger by reading transaction logs
* Account hashes are stored on-chain in Merkle trees, but the full account data must be reconstructed by the indexer.

**Key RPC Methods:**
- [`getCompressedAccount()`](../../resources/json-rpc-methods/getcompressedaccount.md) - Similar to `getAccountInfo()`.
- [`getCompressedBalance()`](../../resources/json-rpc-methods/getcompressedbalance.md) - Similar to `getBalance()`.
- [`getCompressedAccountsByOwner()`](../../resources/json-rpc-methods/getcompressedaccountsbyowner.md) - Similar to `getProgramAccounts()`.
- [`getValidityProof()`](../../resources/json-rpc-methods/getvalidityproof.md) - Verifies integrity of the compressed state.

{% columns %}
{% column %}

## Reading a Solana Account

```rust
// Account structure
#[account]
#[derive(Debug)]
pub struct AccountData {
    pub user: Pubkey,      // 32 bytes
    pub name: String,      // Variable length
    pub data: [u8; 128],   // 128 bytes
}

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

Reading data from a Solana account involves two steps:

1. Fetch the account from your RPC provider using its address
2. Deserialize the account's data field from raw bytes into the appropriate data structure, as defined by the program that owns the account.

{% endcolumn %}

{% column %}
### Reading a Compressed Account

```rust
// Compressed account data structure
#[derive(Clone, Debug, AnchorDeserialize, AnchorSerialize, LightDiscriminator, LightHasher)]
pub struct CompressedAccountData {
    pub user: Pubkey,
    pub name: String,
    pub data: [u8; 128],
}

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

Reading data from a compressed account involves these steps:

1. Fetch the compressed account data from your RPC provider using address or hash
2. Deserialize the account's data field into the appropriate data structure
3. To use the account in a transaction: Generate a validity proof using the account hash via `getValidityProof()`.

The validity proof proves that the account hash exists at the specified leaf index in the state tree. This proof is included in transaction instruction data for on-chain verification by the Light System Program.
{% endcolumn %}
{% endcolumns %}

* [`get_compressed_account()`](../../resources/json-rpc-methods/getcompressedaccount.md) retrieves information about a specific compressed account using either its address or hash. Information includes the compressed account state, balance, and metadata. The indexer reconstructs the account state from the Solana ledger.
* [`get_compressed_balance()`](../../resources/json-rpc-methods/getcompressedbalance.md) retrieves the lamport balance for a specific compressed account by address or hash.
* [`get_compressed_accounts_by_owner()`](../../resources/json-rpc-methods/getcompressedaccountsbyowner.md) returns all compressed accounts owned by a specific address.
* [`get_validity_proof()`](../../resources/json-rpc-methods/getvalidityproof.md) generates zero-knowledge proofs that prove either the address does not exist yet in the specified address tree (for create) or that the account hash exists in the state tree (for update, close, reinitialize, burn).
    * Fetch this proof from your RPC provider that supports ZK Compression.
    * You don't need to generate validity proofs.
