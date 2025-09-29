---
description: >-
  Complete guide to a Solana program that updates compressed accounts using
  Light SDK and `update_compressed_account()` instruction handler.
hidden: true
---

# How to Update Compressed Accounts

Learn how to update compressed accounts in Solana programs. This guide breaks down each implementation step. Find a full code example at the end for Anchor, native Rust, and Pinocchio.

### Compressed Account Update Flow

```
CLIENT
   ├─ 1. Fetch current account state
   │  ├─ getCompressedAccount() RPC call
   │  ├─ Current account data and metadata
   │  └─ State tree information
   │
   ├─ 2. Generate inclusion proof
   │  ├─ getValidityProof() with existing account
   │  ├─ Proves account exists in state tree
   │  └─ Returns merkle proof for inclusion
   │
   └─ 3. PROGRAM
      ├─ Validate input account
      │  ├─ Verify account ownership
      │  ├─ Confirm address derivation
      │  └─ Validate account state consistency
      │
      ├─ Create updated account structure
      │  ├─ LightAccount::new_mut() with current state
      │  ├─ Apply data updates to fields
      │  └─ Preserve immutable identity fields
      │
      └─ 4. Light System Program CPI
         ├─ Verify inclusion proof (proves account exists)
         ├─ Nullify old account hash in state tree
         ├─ Create new account hash entry
         └─ Complete atomic state transition
```

## Get Started

Set up your program and use the `light-sdk` to update compressed accounts:

1. Configure instruction data,
2. initialize the compressed account, and
3. CPI Light System program

{% hint style="success" %}
Regular accounts update their data fields when state changes. Compressed accounts are identified by their hash. When compressed account state changes, the hash changes, so a new account needs to be created. The old account is nullified to prevent double spending.
{% endhint %}

{% stepper %}
{% step %}
### Prerequisites

Set up dependencies, constants, and compressed account data structure.

<details>

<summary>Dependencies, Constants, Account Data Structure</summary>

#### Dependencies

Set up `light-sdk` dependencies.

```toml
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
```

#### Constants

Set program address and CPI authority to call Light System program.

```rust
declare_id!("PROGRAM_ID");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("PROGRAM_ID");
```

**`Program_ID`**: The on-chain address of your program to derive address.

**`CPISigner`**: Configuration struct for CPI's to Light System Program. Contains your program ID, the derived CPI authority PDA, and PDA bump.

#### Account Data Structure

Define your compressed account struct:

```rust
#[derive(
    Clone, 
    Debug, 
    Default, 
    BorshSerialize, // AnchorSerialize
    BorshDeserialize, // AnchorDeserialize 
    LightHasher, 
    LightDiscriminator
)]
pub struct DataAccount {
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String,
}
```

`DataAccount` defines your account's data structure.

* `#[hash]` fields define the what's included in the compressed account hash.
* Changing any `#[hash]` field creates a new account hash. Requires creating a new compressed account via CPI with validity proof. Old hash becomes invalid.
* Non-`#[hash]` fields can be updated without creating new accounts

Compression Derives:

* `LightHasher` generates compressed account hash from `DataAccount`.
* `LightDiscriminator` gives struct unique type ID for deserialization. Required to distinguish `DataAccount` from other compressed account types.

</details>
{% endstep %}

{% step %}
### Instruction Data for `update_compressed_account`

The `update_compressed_account` instruction requires the following inputs:

```rust
pub struct InstructionData {
    proof: ValidityProof, // client fetches with `getValidityProof()`
    my_compressed_account: MyCompressedAccount, // client fetches with `getCompressedAccount()`
    account_meta: CompressedAccountMeta,
    nested_data: NestedData,
}
```

**Parameters:**

* `ValidityProof`: A zero-knowledge proof to validate inclusion of the existing compressed account in the state tree. Fetched by the client via `getValidityProof()` with current account hash.
* `my_compressed_account`: Current account data structure to validate ownership and acccount data. Fetched by client via `getCompressedAccount()`. Must match on-chain account data.
* `account_meta`: Current account's state tree position metadata to locate and nullify existing account hash. Metadata must match current on-chain state, obtained from `getCompressedAccount()` response metadata field.
* `nested_data`: Updates the custom data field defined in `DataAccount`. Non-`#[hash]` fields in the account structure. Constructed by client with modified field values.

The instruction data references two Merkle trees. Both are maintained by the protocol. You can specify any Merkle tree listed in [_Addresses_](https://www.zkcompression.com/resources/addresses-and-urls).

**State trees** are referenced to:

* locate the existing account hash with the inclusion proof from `getValidityProof()`
* nullify the account hash in the state tree, and
* append the new account hash with modified output state.

**Address trees** are referenced to

* verify the account address matches derivation from the transaction's seeds and program ID, and
* verify the address in `CompressedAccountMeta` matches the address stored in the address tree
{% endstep %}

{% step %}
### Initialize Compressed Account

Initialize the compressed account data structure using the derived address from Step 5.

```rust
let owner = crate::ID;
let mut my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_mut(
            &owner,
            &account_meta,
            my_compressed_account,
        )?;

        my_compressed_account.nested = nested_data;
```

**Parameters for `LightAccount::new_mut()`:**

* `&owner`: Program ID to set authority for CPI to Light System program.
* `account_meta`: Current account's state tree position metadata defined in _Step 2 Instruction Data for `update_compressed_account`_
* `my_compressed_account` current account data defined in _Step 2 Instruction Data for `update_compressed_account`_.

**Field assignments:**

* `my_compressed_account.nested`: Updates the `nested` field in `MyCompressedAccount` struct with new `NestedData` values.
{% endstep %}

{% step %}
### CPI

Invoke the Light System program to update the compressed account using

1. `proof` from _Step 2_ _Instruction Data for `update_compressed_account`_, and
2. `my_compressed_account` from _Step 3_ _Initialize Compressed Account_.

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.signer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

InstructionDataInvokeCpiWithReadOnly::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Parameters for `CpiAccounts::new()`:**

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and signer
* `ctx.remaining_accounts`: Account slice containing Light System program and merkle tree accounts\[^1]. Generated via client's `getValidityProof()` RPC call.
* `LIGHT_CPI_SIGNER`: Program signer derived at compile time via `derive_light_cpi_signer!()` macro

**Parameters for `InstructionDataInvokeCpiWithReadOnly::new_cpi()`:**

* `LIGHT_CPI_SIGNER`: Program signer authority for CPI authentication with Light System program.
* `proof`: Zero-knowledge proof from instruction input to validate account inclusion in state tree.
{% endstep %}

{% step %}
### That's it!

Now that you understand the concepts to create a compressed account, start building with the create account example below.
{% endstep %}
{% endstepper %}

## Update Account Example

Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% hint style="success" %}
Find the [source code](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) here.
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
`declare_id!` and `#[program]` follow [standard anchor](https://www.anchor-lang.com/docs/basics/program-structure) patterns.
{% endhint %}

```rust
#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::{prelude::*, Discriminator};
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{
        CpiAccounts, CpiSigner, InstructionDataInvokeCpiWithReadOnly, InvokeLightSystemProgram,
        LightCpiInstruction,
    },
    derive_light_cpi_signer,
    instruction::{
        account_meta::{CompressedAccountMeta, CompressedAccountMetaBurn},
        PackedAddressTreeInfo, ValidityProof,
    },
    LightDiscriminator,
    LightHasher,
};

declare_id!("2tzfijPBGbrR5PboyFUFKzfEoLTwdDSHUjANCw929wyt");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("2tzfijPBGbrR5PboyFUFKzfEoLTwdDSHUjANCw929wyt");

#[program]
pub mod sdk_anchor_test {
    use super::*;

    pub fn update_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateNestedData<'info>>,
        proof: ValidityProof,
        my_compressed_account: MyCompressedAccount,
        account_meta: CompressedAccountMeta,
        nested_data: NestedData,
    ) -> Result<()> {
        let mut my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_mut(
            &crate::ID,
            &account_meta,
            my_compressed_account,
        )?;

        my_compressed_account.nested = nested_data;

        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            crate::LIGHT_CPI_SIGNER,
        );
        InstructionDataInvokeCpiWithReadOnly::new_cpi(LIGHT_CPI_SIGNER, proof)
            .with_light_account(my_compressed_account)?
            .invoke(light_cpi_accounts)?;

        Ok(())
    }
}

#[event]
#[derive(Clone, Debug, Default, LightHasher, LightDiscriminator)]
pub struct MyCompressedAccount {
    #[hash]
    pub name: String,
    pub nested: NestedData,
}

#[derive(LightHasher, Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct NestedData {
    pub one: u16,
    pub two: u16,
    pub three: u16,
    pub four: u16,
    pub five: u16,
    pub six: u16,
    pub seven: u16,
    pub eight: u16,
    pub nine: u16,
    pub ten: u16,
    pub eleven: u16,
    pub twelve: u16,
}

impl Default for NestedData {
    fn default() -> Self {
        Self {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9,
            ten: 10,
            eleven: 11,
            twelve: 12,
        }
    }
}

#[derive(Accounts)]
pub struct UpdateNestedData<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```
{% endtab %}

{% tab title="Native" %}

{% endtab %}

{% tab title="Pinocchio" %}

{% endtab %}
{% endtabs %}

## Next Steps

