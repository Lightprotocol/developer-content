---
title: Compressed Account Model
description: Overview to compressed accounts and comparison to Solana accounts.
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
2. All accounts stored in a Merkle tree are compressed into a single root hash
3. The root hash is stored in one Solana account for cryptographic verification
4. Compressed account state is recorded on the Solana ledger
5. The latest compressed account state is fetched from your RPC provider
6. Compressed account state is verified against the on-chain root hash with a validity proof

{% hint style="success" %}
* Merkle trees are provided by the protocol and Indexers generate validity proofs. 
* Developers don't configure state Merkle trees or generate validity proofs.

[You will learn more about Merkle trees and validity proofs in the next section](merkle-trees-validity-proofs.md). 
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

Each compressed account can be **identified by its hash**, regardless of whether it has an address. By definition, whenever any data of a compressed account changes, its **hash changes**. 

An **address** can serve as **optional** and additional **persistent identifier**.
* It's represented as 32 bytes in the format of a `PublicKey`.
* Addresses are optional, since ensuring that the address of a new account is unique incurs additional computational overhead.

{% hint style="info" %}
- Use the address field wherever the state must be unique (such as for NFTs or certain PDAs) and requires a persistent identifier.
- You don't need the address for any fungible state (e.g., fungible tokens)
{% endhint %}

**Compressed Account Address Derivation**

Compressed account addresses are derived similar to PDAs.

* Like PDAs, compressed account addresses don't belong to a private key; rather, they're derived from the program that owns them.
* The key difference to regular PDAs is that compressed accounts require an **address tree** parameter. 
* Address Merkle tree's store addresses of compressed accounts and ensure its uniqueness.

{% tabs %}
{% tab title="TypeScript" %}

```typescript
const seed = deriveAddressSeed(
  [customSeed, signer.publicKey.toBytes()],
  new web3.PublicKey(programId),
);
const address = deriveAddress(seed, addressTree);
```

{% hint style="info" %}
Learn more about address derivation for a [Typescript Client here](../../compressed-pdas/client-library/typescript.md#derive-address).
{% endhint %}

{% endtab %}

{% tab title="Rust" %}

```rust
let (address, _) = derive_address(
    &[b"custom_seed", keypair.pubkey().as_ref()],
    &address_tree_info.tree,
    &your_program::ID,
);
```

{% hint style="info" %}
Learn more about address derivation for a [Rust Client here](../../compressed-pdas/client-library/rust.md#derive-address).
{% endhint %}

{% endtab %}
{% endtabs %}


<details>

<summary>Solana PDA Derivation</summary>

{% code title="derive-pda.ts" %}
```typescript
const [pda, bump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("seed_string"),
    publicKey.toBuffer()
  ],
  programId
);
```
{% endcode %}

{% code title="derive-pda.rs" %}
```rust
let (pda, bump) = Pubkey::find_program_address(
  &[
    b"seed_string",
    pubkey.as_ref()
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

# Next Steps

Learn about the role of validity proofs and Merkle trees in the protocol.

{% content-ref url="merkle-trees-validity-proofs.md" %}
[merkle-trees-validity-proofs.md](merkle-trees-validity-proofs.md)
{% endcontent-ref %}