---
description: >-
  Guide to reinitialize compressed accounts in Solana programs with full code
  examples.
---

# How to Reinitialize Compressed Accounts

## Overview

Compressed accounts are reinitialized via CPI to the Light System Program.

An empty compressed account can be reinitialized

* with an account hash marked as empty with zero values and zero discriminator
* to create a new account hash at the same address with new values.

{% hint style="success" %}
Find [full code examples of a counter program at the end](how-to-reinitialize-compressed-accounts.md#full-code-example) for Anchor and native Rust.
{% endhint %}

## Implementation Guide

This guide will cover the components of a Solana program that reinitializes compressed accounts.\
Here is the complete flow to reinitialize compressed accounts:&#x20;

<figure><picture><source srcset="../../.gitbook/assets/Untitled (5).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/image (28).png" alt=""></picture><figcaption><p>Reinitialize Compressed Account Complete Flow. Program-side highlighted.</p></figcaption></figure>

{% stepper %}
{% step %}
### Program Setup

<details>

<summary>Dependencies, Constants, Compressed Account</summary>

#### Dependencies

Add dependencies to your program.

```toml
[dependencies]
light-sdk = "0.15.0"
anchor_lang = "0.31.1"
```

```toml
[dependencies]
light-sdk = "0.15.0"
borsh = "0.10.0"
solana-program = "2.2"
```

* The `light-sdk` provides macros, wrappers and CPI interface to create and interact with compressed accounts.
* Add the serialization library (`borsh` for native Rust, or use `AnchorSerialize`).

#### Constants

Set program address and derive the CPI authority PDA to call the Light System program.

{% code overflow="wrap" %}
```rust
declare_id!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");
```
{% endcode %}

**`CPISigner`** is the configuration struct for CPI's to the Light System Program.

* CPIs to the Light System program must be signed with a PDA derived by your program with the seed `b"authority"`
* `derive_light_cpi_signer!` derives the CPI signer PDA for you at compile time.

#### Compressed Account

Define your compressed account struct.

```rust
#[derive(
    Clone,
    Debug,
    Default,
    BorshSerialize, // AnchorSerialize
    BorshDeserialize, // AnchorDeserialize
    LightDiscriminator
)]
pub struct MyCompressedAccount {
    pub owner: Pubkey,
    pub message: String,
}
```

You derive

* the standard traits (`Clone`, `Debug`, `Default`),
* `borsh` or `AnchorSerialize` to serialize account data, and
* `LightDiscriminator` to implements a unique type ID (8 bytes) to distinguish account types. The default compressed account layout enforces a discriminator in its _own field_, [not the first 8 bytes of the data field](#user-content-fn-1)[^1].

{% hint style="info" %}
The traits listed above are required for `LightAccount`. `LightAccount` wraps `MyCompressedAccount` in Step 3 to set the discriminator and create the compressed account's data.&#x20;
{% endhint %}

</details>
{% endstep %}

{% step %}
### Instruction Data

Define the instruction data with the following parameters:

```rust
pub struct InstructionData {
    proof: ValidityProof,
    account_meta: CompressedAccountMeta,
}
```

1. **Validity Proof**

* Define `proof` to include the proof that the closed account with zero values exists in the state tree.
* Clients fetch a validity proof with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input state and output state tree (stores new account hash)**

* `CompressedAccountMeta` points to the closed account hash and output state tree to store the new account hash:
  * `tree_info: PackedStateTreeInfo`: References the existing account hash in the state tree.
  * `address`: The account's derived address.
  * `output_state_tree_index`: References the state tree account that will store the new compressed account hash.

{% hint style="info" %}
Reinitialization does not require `current_value` parameters. `new_empty()` automatically uses the closed account as input.
{% endhint %}
{% endstep %}

{% step %}
### Reinitialize Closed Account

Reinitialize the closed account with `LightAccount::new_empty()`.

{% hint style="info" %}
`new_empty()`

1. reconstructs the closed account hash with zero values as input, and
2. creates output state with default-initialized values.

You can set custom values in the same transaction:

1. Reinitialize with `new_empty()`, and
2. Update with `new_mut()` to set custom values.
{% endhint %}

{% code overflow="wrap" %}
```rust
let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_empty(
    &ID,
    account_meta,
)?;
```
{% endcode %}

**Pass these parameters to `new_empty()`:**

* `&ID`: The program's ID that owns the compressed account.
* `account_meta`: The `CompressedAccountMeta` from instruction data (_Step 2_) that identifies the existing account and specifies the output state tree.

**The SDK creates:**

* A `LightAccount` wrapper with account data automatically initialized to default values using the `Default` trait.
* This creates a zero-initialized instance: `Pubkey` as all zeros, `u64` as `0`, `String` as empty.

{% hint style="info" %}
`new_empty()` reconstructs the closed account hash with zero values. The Light System Program verifies the closed account hash and creates the output hash in _Step 4_.&#x20;
{% endhint %}
{% endstep %}

{% step %}
### Light System Program CPI

Invoke the Light System Program to reinitialize the compressed account.

{% hint style="info" %}
The Light System Program

* validates the closed account hash exists in state tree,
* nullifies the closed account hash, and
* appends the new account hash with provided values to the state tree.
{% endhint %}

```rust
let light_cpi_accounts = CpiAccounts::new(
    fee_payer,
    remaining_accounts,
    LIGHT_CPI_SIGNER,
);

LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Set up `CpiAccounts::new()`:**

* `fee_payer`: Fee payer and transaction signer
* `remaining_accounts`: `AccountInfo` slice with Light System and packed tree accounts.
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Build the CPI instruction**:

* `new_cpi()` initializes the CPI instruction with the `proof` to prove the closed account hash exists in the state tree _- defined in the Instruction Data (Step 2)._
* `with_light_account` adds the `LightAccount` configured with the closed account hash as input and provided values as output _- defined in Step 3_.
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts`.
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
Find the source code for this example here.
{% endhint %}

{% code overflow="wrap" %}
```rust
#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};
use light_sdk::{
    account::LightAccount,
    cpi::{v1::CpiAccounts, CpiSigner},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMeta, ValidityProof},
    LightDiscriminator,
};

declare_id!("2Txp954YU4HmX8ZpqHVq7PCLf8pMkHfYoNWxtB9mL5gW");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");

#[program]
pub mod anchor_program_reinit {

    use super::*;
    use light_sdk::cpi::{
        v1::LightSystemProgramCpi, InvokeLightSystemProgram, LightCpiInstruction,
    };

    /// Reinitializes a closed compressed account
    pub fn reinit<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        account_meta: CompressedAccountMeta,
    ) -> Result<()> {
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            crate::LIGHT_CPI_SIGNER,
        );

        let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_empty(
            &crate::ID,
            &account_meta,
        )?;

        msg!("Reinitializing closed compressed account");

        LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
            .with_light_account(my_compressed_account)?
            .invoke(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct GenericAnchorAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(
    Clone,
    Debug,
    Default,
    AnchorSerialize,
    AnchorDeserialize,
    LightDiscriminator
)]
pub struct MyCompressedAccount {
    pub owner: Pubkey,
    pub message: String,
}
```
{% endcode %}
{% endtab %}

{% tab title="Native" %}
{% code overflow="wrap" %}
```rust
#![allow(unexpected_cfgs)]

#[cfg(feature = "test-sbf")]
pub mod tests;

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey;
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{
        v1::{CpiAccounts, LightSystemProgramCpi},
        CpiSigner, InvokeLightSystemProgram, LightCpiInstruction,
    },
    derive_light_cpi_signer,
    error::LightSdkError,
    instruction::{account_meta::CompressedAccountMeta, ValidityProof},
    LightDiscriminator, LightHasher,
};
use solana_program::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");
pub const LIGHT_CPI_SIGNER: CpiSigner = derive_light_cpi_signer!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

#[derive(Debug, BorshSerialize, BorshDeserialize)]
pub enum InstructionType {
    Reinit,
}

#[derive(Debug, BorshSerialize, BorshDeserialize)]
pub struct ReinitInstructionData {
    pub proof: ValidityProof,
    pub account_meta: CompressedAccountMeta,
}

#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator, LightHasher)]
pub struct MyCompressedAccount {
    #[hash]
    pub owner: Pubkey,
    pub message: String,
}

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    let (instruction_type, rest) = instruction_data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match InstructionType::try_from_slice(&[*instruction_type])
        .map_err(|_| ProgramError::InvalidInstructionData)?
    {
        InstructionType::Reinit => reinit(accounts, rest)?,
    }

    Ok(())
}

fn reinit(accounts: &[AccountInfo], instruction_data: &[u8]) -> Result<(), LightSdkError> {
    let instruction_data =
        ReinitInstructionData::try_from_slice(instruction_data).map_err(|_| LightSdkError::ParseError)?;

    let (signer, remaining_accounts) = accounts
        .split_first()
        .ok_or(ProgramError::InvalidAccountData)?;

    let cpi_accounts = CpiAccounts::new(signer, remaining_accounts, LIGHT_CPI_SIGNER);

    let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_empty(
        &ID,
        &instruction_data.account_meta,
    )?;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(my_compressed_account)?
        .invoke(cpi_accounts)?;

    Ok(())
}

```
{% endcode %}
{% endtab %}
{% endtabs %}

## Next Steps

Build a client for your program or learn how to burn compressed accounts.

{% columns %}
{% column %}
{% content-ref url="../client-library/" %}
[client-library](../client-library/)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="how-to-burn-compressed-accounts.md" %}
[how-to-burn-compressed-accounts.md](how-to-burn-compressed-accounts.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}

[^1]: The [Anchor](https://www.anchor-lang.com/) framework reserves the first 8 bytes of a _regular account's data field_ for the discriminator.
