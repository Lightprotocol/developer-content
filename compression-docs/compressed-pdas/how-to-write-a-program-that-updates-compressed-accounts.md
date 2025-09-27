---
description: >-
  Complete guide to implementing a Solana program that updates compressed
  accounts using Light SDK and `update_compressed_account()` instruction
  handler.
---

# How to Write a Program that Updates Compressed Accounts

This guide shows you how to write a Solana program that updates compressed accounts. Compressed accounts are updated with the `update_compressed_account` instruction.

A compressed account is updated by the program, when called by a client.

The client

1. creates instruction with proof and data:
   * ValidityProof for the existing account
   * CompressedAccountMeta containing current account metadata
   * Current account data to update
   * New account data to store
2. then sends transaction to your program. Learn here how to call your program from a client.

Your program

1. recreates the existing account with current data and
2. performs a CPI from your custom program to the Light System program

The Light System program nullifies the old account and creates a new one with updated data.

{% hint style="success" %}
Regular accounts update their data fields when state changes. Compressed accounts are identified by their hash. When compressed account state changes, the hash changes, so a new account is created. The old account is nullified to prevent double spending.
{% endhint %}

## Get Started

{% stepper %}
{% step %}
### Setup Dependencies & Import Required Modules

Add Light SDK and Anchor framework dependencies to your `Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.31.1"
light-sdk = "0.13.0"
borsh = "0.10.0"
```

<details>

<summary>Import the essential types and macros</summary>

```rust
use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
use light_sdk::{
    // Wrapper for hashing and serialization for compressed accounts
    account::LightAccount,
    // Derives address from provided seeds. Returns address and a singular seed
    address::v1::derive_address,
    // Structures for calling Light System program via CPI
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    // Macro that computes PDA signer with "cpi_authority" seed at compile time
    derive_light_cpi_signer,
    // ZK proof for merkle inclusion/non-inclusion verification and account metadata
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof},
    // Traits for account type discrimination and Poseidon hash derivation
    LightDiscriminator, LightHasher,
};
```

</details>
{% endstep %}

{% step %}
### Define Program Constants

Set up your program ID and CPI authority for Light System program calls. Works identical to [`declare_id!`](https://docs.rs/anchor-lang/latest/anchor_lang/macro.declare_id.html) with Anchor.

```rust
declare_id!("YOUR_PROGRAM_ID");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("YOUR_PROGRAM_ID");

pub const SEED: &[u8] = b"your_seed";
```
{% endstep %}

{% step %}
### Create Account Data Structure

Define your compressed account data with proper serialization and hashing traits:

```rust
#[derive(Clone, Debug, Default, BorshSerialize, BorshDeserialize, LightHasher, LightDiscriminator)]
pub struct DataAccount {
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String,
}
```

The `#[hash]` attribute specifies which fields are included in the compressed account's hash in the Merkle tree leaf.
{% endstep %}

{% step %}
### Implement `update_compressed_account` Instruction

Implement the instruction to recreate existing accounts and update compressed accounts via Light System CPI. The [`#[program]`](https://docs.rs/anchor-lang/latest/anchor_lang/attr.program.html) attribute works identically, with special traits in the instruction data.

{% hint style="warning" %}
**Important:** Account must be recreated with identical data before updating. The validity proof must include the exact current account state. Otherwise you will get the error 0x179B (6043 / `ProofVerificationFailed`)
{% endhint %}

```rust
#[program]
pub mod update_compressed_account {
    use super::*;

    pub fn update_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateCompressedAccount<'info>>,
        proof: ValidityProof,
        account_meta: CompressedAccountMeta,
        current_message: String,
        new_message: String,
    ) -> Result<()> {
        // Create CPI accounts struct with fee payer, remaining accounts, and program signer
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            LIGHT_CPI_SIGNER,
        );

        // Initialize compressed account wrapper for updating existing account with current data
        let mut data_account = LightAccount::<'_, DataAccount>::new_mut(
            &crate::ID,
            &account_meta,
            DataAccount {
                owner: ctx.accounts.signer.key(),
                message: current_message,
            },
        )?;

        // Update account with new data
        data_account.message = new_message;

        // Package validity proof and serialized account data
        let cpi_inputs = CpiInputs::new(
            proof,
            vec![data_account.to_account_info()?],
        );

        // Invoke light system program to update compressed account
        cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateCompressedAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```
{% endstep %}

{% step %}
### Success!

You've implemented a program that updates compressed accounts.
{% endstep %}
{% endstepper %}

## Complete Update Account Program Example

```rust
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator, LightHasher,
};

declare_id!("YOUR_PROGRAM_ID");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("YOUR_PROGRAM_ID");

pub const SEED: &[u8] = b"your_seed";

#[derive(Clone, Debug, Default, BorshSerialize, BorshDeserialize, LightHasher, LightDiscriminator)]
pub struct DataAccount {
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String,
}

#[program]
pub mod update_compressed_account {
    use super::*;

    pub fn update_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateCompressedAccount<'info>>,
        proof: ValidityProof,
        account_meta: CompressedAccountMeta,
        current_message: String,
        new_message: String,
    ) -> Result<()> {
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            LIGHT_CPI_SIGNER,
        );

        let mut data_account = LightAccount::<'_, DataAccount>::new_mut(
            &crate::ID,
            &account_meta,
            DataAccount {
                owner: ctx.accounts.signer.key(),
                message: current_message,
            },
        )?;

        data_account.message = new_message;

        let cpi_inputs = CpiInputs::new(
            proof,
            vec![data_account.to_account_info()?],
        );
        cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateCompressedAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```

## Next steps

Learn how to Call Your Program from a Client Learn how to Create Compressed Accounts Learn how to Close Compressed Accounts
