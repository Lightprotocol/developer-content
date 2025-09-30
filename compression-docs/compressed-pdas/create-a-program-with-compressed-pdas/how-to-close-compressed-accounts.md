---
description: >-
  Complete guide to a Solana program that closes compressed accounts using Light
  SDK and `close_compressed_account()` instruction handler.
hidden: true
---

# How to Close Compressed Accounts

Learn how to close compressed accounts in Solana programs. This guide breaks down each implementation step to close, reinitialize, or permanently burn a compressed account. Find a [full code example](how-to-close-compressed-accounts.md#close-account-example) at the end for Anchor, native Rust, and Pinocchio.

### Compressed Account Close Flow

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
      ├─ Create closed account structure
      │  ├─ LightAccount::new_close() with current state
      │  ├─ Mark account for nullification
      │  └─ Prepare account closure
      │
      └─ 4. Light System Program CPI
         ├─ Verify inclusion proof (proves account exists)
         ├─ Nullify account hash in state tree
         ├─ No new account creation
         └─ Complete atomic state transition
```

## Get Started

Set up your program and use the `light-sdk` to close compressed accounts:

1. [Configure instruction data](how-to-close-compressed-accounts.md#instruction-data-for-close_compressed_account),
2. initialize the [compressed account](how-to-close-compressed-accounts.md#initialize-compressed-account), and
3. [invoke](how-to-close-compressed-accounts.md#cpi) the Light System program.

Once closed, you can [reinitialize](how-to-close-compressed-accounts.md#reinitialize-closed-account) a compressed account or [permanently burn](how-to-close-compressed-accounts.md#burn-compressed-account) it. A burned account cannot be reinitialized.

{% hint style="success" %}
No rent can be reclaimed after closing compressed account, unlike with regular accounts.
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
### Instruction Data for `close_compressed_account`

The `close_compressed_account` instruction requires the following inputs:

```rust
pub struct InstructionData {
    proof: ValidityProof, 
    my_compressed_account: MyCompressedAccount,
    account_meta: CompressedAccountMeta,
}
```

**`close_compressed_account` Parameters:**

* `ValidityProof`: A zero-knowledge proof to validate inclusion of the existing compressed account in the state tree. Fetched by the client via `getValidityProof()` with current account hash.
* `my_compressed_account`: Current account data structure to validate ownership and account data. Fetched by client via `getCompressedAccount()`. Must match on-chain account data.
* `account_meta`: Current account's state tree position metadata to locate and nullify existing account hash. Metadata must match current on-chain state, obtained from `getCompressedAccount()` response metadata field.

The instruction data references s**tate trees** to:

* locate the existing account hash using the inclusion proof from `getValidityProof()`
* nullify the account hash in the state tree. No new compressed account hash is created, since `close` does not have output state.

{% hint style="info" %}
You can specify any Merkle tree listed in [_Addresses_](https://www.zkcompression.com/resources/addresses-and-urls)_._
{% endhint %}
{% endstep %}

{% step %}
### Initialize Compressed Account

Initialize the compressed account wrapper for the existing account:

```rust
let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_close(
    &crate::ID,
    &account_meta,
    my_compressed_account,
)?;
```

**Parameters for `LightAccount::new_close()`:**

* `&owner`: Program ID to set authority for CPI to Light System program.
* `account_meta`: Current account's state tree position metadata defined in [_Step 2_](how-to-close-compressed-accounts.md#instruction-data-for-close_compressed_account) _Instruction Data for `close_compressed_account`_
* `my_compressed_account` current account data defined in [_Step 2_](how-to-close-compressed-accounts.md#instruction-data-for-close_compressed_account) _Instruction Data for `close_compressed_account`_.
{% endstep %}

{% step %}
### Reinitialize Closed Account

A compressed account can be reinitialized after close using `LightAccount::new_empty()`. This creates a new account at the same address with default values, effectively "reopening" a previously closed account.

```rust
let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_empty(
    &crate::ID,
    &account_meta,
    MyCompressedAccount::default(),
)?;

let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.signer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

InstructionDataInvokeCpiWithReadOnly::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Parameters for `LightAccount::new_empty()`:**

* `&crate::ID`: Program ID to set authority for CPI to Light System program.
* `&account_meta`: Account's state tree position metadata for the closed account address, defined in [_Step 2_](how-to-close-compressed-accounts.md#instruction-data-for-close_compressed_account) _Instruction Data for `close_compressed_account`_.
* `MyCompressedAccount::default()`: Default values for the reinitialized account data structure.
{% endstep %}

{% step %}
### Burn Compressed Account

A compressed account can be burned after reinitialize or close using `LightAccount::new_burn()`. A burned compressed account can't be reinitialized.

```rust
let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_burn(
    &crate::ID,
    &account_meta, // CompressedAccountMetaBurn type required in instruction data
    my_compressed_account,
)?;

let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.signer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

InstructionDataInvokeCpiWithReadOnly::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Parameters for `LightAccount::new_burn()`:**

* `&crate::ID`: Program ID to set authority for CPI to Light System program.
* `&account_meta`: Account's state tree position metadata using `CompressedAccountMetaBurn` type, instead of `CompressedAccountMeta` in [_Step 2_](how-to-close-compressed-accounts.md#instruction-data-for-close_compressed_account) _Instruction Data for `close_compressed_account`_.
* `MyCompressedAccount::default()`: Account data structure for the burn operation.
{% endstep %}

{% step %}
### CPI

The CPI pattern for `new_close`, `new_empty` and `new_burn` is identical. Invoke the Light System program to perform the respective operation on the compressed account using

1. `proof` from [_Step 2_](how-to-close-compressed-accounts.md#instruction-data-for-close_compressed_account) _Instruction Data for `close_compressed_account`_, and
2. `my_compressed_account` from [_Step 3_](how-to-close-compressed-accounts.md#initialize-compressed-account) _Initialize Compressed Account_.

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

InstructionDataInvokeCpiWithReadOnly::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Parameters for `CpiAccounts::new()`:**

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and signer
* `ctx.remaining_accounts`: Account slice containing Light System program and merkle tree accounts. Generated via client's `getValidityProof()` RPC call.
* `LIGHT_CPI_SIGNER`: Your program as CPI signer defined in [Constants](how-to-close-compressed-accounts.md#prerequisites).

**Parameters for `InstructionDataInvokeCpiWithReadOnly::new_cpi()`:**

* `LIGHT_CPI_SIGNER`: Your program as CPI signer defined in [Constants](how-to-close-compressed-accounts.md#prerequisites).
* `proof`: Validate account inclusion in state tree. from _Step 2_ _Instruction Data for `close_compressed_account`_.

**Parameters for `.with_light_account()`:**

* `my_compressed_account`: Compressed account wrapper from `LightAccount::new_close()`, `new_empty()`, or `new_burn()` from [_Step 3_ _Initialize Compressed Account_](how-to-close-compressed-accounts.md#initialize-compressed-account).

**Parameters for `.invoke()`:**

* `light_cpi_accounts`: CPI account configuration from `CpiAccounts::new()`. Executes the CPI call to Light System program to nullify compressed account hash.
{% endstep %}

{% step %}
### That's it!

Now that you understand the concepts to close, reinitialize, and burn compressed accounts, start building with the examples below.
{% endstep %}
{% endstepper %}

## Close Account Example

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

    pub fn close_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateNestedData<'info>>,
        proof: ValidityProof,
        my_compressed_account: MyCompressedAccount,
        account_meta: CompressedAccountMeta,
    ) -> Result<()> {
        let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_close(
            &crate::ID,
            &account_meta,
            my_compressed_account,
        )?;

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

    pub fn reinit_closed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateNestedData<'info>>,
        proof: ValidityProof,
        account_meta: CompressedAccountMeta,
    ) -> Result<()> {
        let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_empty(
            &crate::ID,
            &account_meta,
            MyCompressedAccount::default(),
        )?;

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

    pub fn burn_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateNestedData<'info>>,
        proof: ValidityProof,
        account_meta: CompressedAccountMetaBurn,
    ) -> Result<()> {
        let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_burn(
            &crate::ID,
            &account_meta,
            MyCompressedAccount::default(),
        )?;

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
