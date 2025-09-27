---
description: >-
  Reference for LightAccount module. Compressed account abstraction similar to
  Anchor Account and required traits.
---

# LightAccount

LightAccount is a wrapper around compressed account data similar to Anchor's `Account<T>`. This abstracts access to compressed account data with automatic serialization and hashing.

{% hint style="info" %}
See [source code](https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/sdk/src/account.rs) for complete implementation details.
{% endhint %}

### Compressed account with LightHasher and LightDiscriminator

Account data structs used with LightAccount must implement the traits:

* DataHasher
* LightDiscriminator
* AnchorSerialize, AnchorDeserialize
* Debug, Default, Clone

```rust
use light_sdk::{LightHasher, LightDiscriminator};
use solana_pubkey::Pubkey;
#[derive(Clone, Debug, Default, LightHasher, LightDiscriminator)]
pub struct CounterAccount {
    #[hash]
    pub owner: Pubkey,
    pub counter: u64,
}
```

#### Account Data Hashing

The `LightHasher` derives a hashing scheme from the compressed account layout. Alternatively, `DataHasher` can be implemented manually.

**Constraints:**

* Maximum 12 fields per struct (use nested structs for larger accounts)
* Fields must be less than BN254 field size (254 bits)
* Use `#[hash]` attribute on fields >31 bytes (e.g., Pubkeys) and fields included in account hash

### Create Compressed Account

Address must be derived using `derive_address()` before account creation.

`new_init()` creates an account wrapper for new compressed accounts. Returns `LightAccount<T>`.

```rust
let mut my_compressed_account = LightAccount::<'_, CounterAccount>::new_init(
    &crate::ID,
    Some(address),  // derived address
    output_tree_index,
);
// Set data:
my_compressed_account.owner = ctx.accounts.signer.key();
```

### Update Compressed Account

`new_mut()` creates an account wrapper for updating existing accounts. Returns `Result<LightAccount<T>, LightSdkError>`.

```rust
let mut my_compressed_account = LightAccount::<'_, CounterAccount>::new_mut(
    &crate::ID,
    &account_meta,
    my_compressed_account,
)?;  // Can fail with LightSdkError
// Increment counter.
my_compressed_account.counter += 1;
```

### Close Compressed Account

`new_close()` creates an account wrapper for closing existing accounts. Returns `Result<LightAccount<T>, LightSdkError>`.

```rust
let mut my_compressed_account = LightAccount::<'_, CounterAccount>::new_close(
    &crate::ID,
    &account_meta_close,
    my_compressed_account,
)?;  // Can fail with LightSdkError
```

## Next Steps

See [create-and-update example](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) for complete usage.
