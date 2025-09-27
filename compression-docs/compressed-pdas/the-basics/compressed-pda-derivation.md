---
description: >-
  Reference to functions for creating compressed PDAs with derive_address and
  derive_address_seed. Derive deterministic addresses for compressed accounts.
---

# Compressed PDA Derivation

Compressed accounts can be identified by hash or optionally by address. Addresses provide deterministic lookups for compressed accounts. Use addresses when you need to find the same account across different program executions, such as user profiles, account relationships, and cross-program references. Fungible accounts like tokens typically don't need addresses.

{% hint style="info" %}
See [source code](https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/sdk/src/address.rs) for complete implementation details.
{% endhint %}

```rust
// Regular PDA
let (pda, _) = Pubkey::find_program_address(&[b"user", user.key().as_ref()], &program_id);

// Compressed PDA
let (address, _) = derive_address(&[b"user", user.key().as_ref()], &tree_pubkey, &program_id);
```

## Address Properties

Address seeds are 32 bytes. Multiple seeds are hashed into a single 32-byte seed. The first byte is set to zero for BN254 field size compatibility. Addresses are created independently from compressed accounts and stored in address space trees maintained by the protocol.

Every address can only be created once per address tree. Address seeds can be reused in different address trees, which produces different addresses:

```rust
derive_address(&[b"user", user.key().as_ref()], &tree_a, &program_id);
derive_address(&[b"user", user.key().as_ref()], &tree_b, &program_id);
```

For global address uniqueness across all address trees, the used address Merkle tree must be checked in your program logic.

## `derive_address_seed()`

Derives a single address seed for a compressed account, based on the provided multiple `seeds` and `program_id`. Use when you only need the seed for CPI calls or lower-level operations.

```rust
pub fn derive_address_seed(
    seeds: &[&[u8]],     // Multiple input seeds to hash
    program_id: &Pubkey, 
) -> [u8; 32]            // Single 32-byte address seed
```

**Example:**

```rust
use light_sdk::address::derive_address_seed;

let address_seed = derive_address_seed(
    &[b"user_profile", user.key().as_ref()],
    &crate::ID,
);
```

## `derive_address()`

Derives an address from provided seeds. Returns that address and a singular seed. Use for creating or looking up compressed accounts by address.

```rust
pub fn derive_address(
    seeds: &[&[u8]],              // Multiple input seeds to hash
    merkle_tree_pubkey: &Pubkey,  // Address tree public key
    program_id: &Pubkey,          
) -> ([u8; 32], [u8; 32])        // (address, address_seed)
```

## Create Address Example

Data structures for creating addresses via CPI to the light system program.

```rust
pub use light_compressed_account::instruction_data::data::NewAddressParams;
pub use light_compressed_account::instruction_data::data::NewAddressParamsPacked;
#[cfg(feature = "v2")]
pub use light_compressed_account::instruction_data::data::{
    NewAddressParamsAssigned, NewAddressParamsAssignedPacked,
    PackedReadOnlyAddress, ReadOnlyAddress,
};

let packed_address_tree_info = instruction_data.address_tree_info;
let tree_accounts = cpi_accounts.tree_accounts();

let address_tree_pubkey = tree_accounts[address_tree_info
   .address_merkle_tree_pubkey_index as usize]
   .key();

let (address, address_seed) = derive_address(
    &[b"counter"],
    &address_tree_pubkey,
    &crate::ID,
);

// Used in cpi to light-system program
// to insert the new address into the address merkle tree.
let new_address_params = packed_address_tree_info
    .into_new_address_params_packed(address_seed);
```

## Next Steps

Learn about utilities to invoke the light-system-program via cpi.

