---
description: >-
  Complete guide to a Solana program that updates compressed accounts using
  Light SDK and `update_compressed_account()` instruction handler.
hidden: true
---

# How to Write a Program that Updates Compressed Accounts

This guide shows you how to write a Solana program that updates compressed accounts with the `update_compressed_account` instruction.

The stepper below walks through each implementation step. You can find a working [full code example at the end.](how-to-write-a-program-that-updates-compressed-accounts.md#update-account-example)

A compressed account is updated by the program, when called by a client.

The client

1. creates [instruction with proof and data](#user-content-fn-1)[^1],
2. then sends transaction to your program. Learn here how to call your program from a client.

Your program

1. loads the current account state and
2. performs a CPI from your custom program to the Light System program

The Light System program nullifies the old account and creates a new one with updated data.

{% hint style="success" %}
Regular accounts update their data fields when state changes. Compressed accounts are identified by their hash. When compressed account state changes, the hash changes, so a new account needs to be created. The old account is nullified to prevent double spending.
{% endhint %}

## Get Started

To build a program that updates compressed accounts, you'll need to:

1. Set up Light SDK dependencies and import required types,
2. Define account struct with `LightHasher` and `LightDiscriminator` derives, and
3. Implement `update_compressed_account` instruction with `new_mut()` for existing account data.

{% hint style="info" %}
`declare_id!` and `#[program]` follow [standard anchor](https://www.anchor-lang.com/docs/basics/program-structure) patterns.
{% endhint %}

{% stepper %}
{% step %}
### Prerequisites

Set up Light SDK dependencies, import essential types, and configure program constants with `declare_id!`.

<details>

<summary>Dependencies, Imports, Program Constants</summary>

Add Light SDK and Anchor framework dependencies to your `Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.31.1"
light-sdk = "0.13.0"
borsh = "0.10.0"
```

Import the essential types and macros.

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

Set up your program ID and CPI authority for Light System program calls.

```rust
declare_id!("YOUR_PROGRAM_ID");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("YOUR_PROGRAM_ID");

pub const SEED: &[u8] = b"your_seed";
```

</details>
{% endstep %}

{% step %}
### Account Data Structure

Define your compressed account struct with the required derives:

```rust
#[derive(Clone, Debug, Default, BorshSerialize, BorshDeserialize, LightHasher, LightDiscriminator)]
pub struct DataAccount {
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String,
}
```

Add `#[hash]` to fields with data types greater than 31 bytes (like Pubkeys) and fields you want verified in proofs.
{% endstep %}

{% step %}
### Implement `update_compressed_account` Instruction

Implement the instruction to load existing account data and update to new state via Light System CPI.

```rust
#[program]
pub mod update_compressed_account {
    use super::*;

    pub fn update_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateCompressedAccount<'info>>, // standard Anchor context
        proof: ValidityProof, // ZK proof verifying existing account inclusion
        account_meta: CompressedAccountMeta, // Contains current account metadata and state tree index
        current_message: String,
        new_message: String,
    ) -> Result<()> {
        // Create CPI accounts struct
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer and transaction signer for CPI
            ctx.remaining_accounts, // merkle tree and system accounts required for Light System program CPI
            LIGHT_CPI_SIGNER, // program signer
        );

        // Initialize compressed account wrapper for existing account with current data
        let mut data_account = LightAccount::<'_, DataAccount>::new_mut(
            &crate::ID,
            &account_meta, // current account metadata containing state tree index
            DataAccount {
                owner: ctx.accounts.signer.key(),
                message: current_message,
            },
        )?;

        // Update account with new data
        data_account.message = new_message;

        // Package validity proof and updated account data
        let cpi_inputs = CpiInputs::new(
            proof, // ZK proof for existing account inclusion
            vec![data_account.to_account_info()?], // updated account info for Light System
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

You've implemented a program that updates compressed accounts via Light System program CPI.
{% endstep %}
{% endstepper %}

## Update Account Example

Copy the complete example and built with `anchor build`. Find the [source code](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) here.

{% hint style="success" %}
Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first:

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

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

declare_id!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

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
        ctx: Context<'_, '_, '_, 'info, UpdateCompressedAccount<'info>>, // standard Anchor context
        proof: ValidityProof, // ZK proof verifying existing account inclusion
        account_meta: CompressedAccountMeta, // Contains current account metadata and state tree index
        current_message: String,
        new_message: String,
    ) -> Result<()> {
        // Create CPI accounts struct
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer and transaction signer for CPI
            ctx.remaining_accounts, // merkle tree and system accounts required for Light System program CPI
            LIGHT_CPI_SIGNER, // program signer
        );

        // Initialize compressed account wrapper for existing account with current data
        let mut data_account = LightAccount::<'_, DataAccount>::new_mut(
            &crate::ID,
            &account_meta, // current account metadata containing state tree index
            DataAccount {
                owner: ctx.accounts.signer.key(),
                message: current_message,
            },
        )?;

        // Update account with new data
        data_account.message = new_message;

        // Package validity proof and updated account data
        let cpi_inputs = CpiInputs::new(
            proof, // ZK proof for existing account inclusion
            vec![data_account.to_account_info()?], // updated account info for Light System
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

## Next steps

Learn how to Call Your Program from a Client Learn how to Create Compressed Accounts Learn how to Close Compressed Accounts

[^1]: Instructions:

    * `ValidityProof` for the existing account

    - `CompressedAccountMeta` containing current account metadata

    * Current account data to update

    - New account data to store
