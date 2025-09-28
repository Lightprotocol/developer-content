---
description: >-
  Complete guide to a Solana program that closes compressed accounts using Light
  SDK and `close_compressed_account()` instruction handler.
hidden: true
---

# How to Close Compressed Accounts

This guide shows you how to write a Solana program that closes compressed accounts with the `close_compressed_account` instruction.

The stepper below walks through each implementation step. You can find a working [full code example at the end](how-to-close-compressed-accounts.md#complete-program-example).

A compressed account is closed by the program, when called by a client.

The client

1. creates [instruction with proof and data](#user-content-fn-1)[^1]upon
2. then sends transaction to your program. Learn here how to call your program from a client.

Your program

1. loads the existing account with current data and
2. performs a CPI from your custom program to the Light System program

The Light System program closes the compressed account permanently. The address of a closed account cannot be reused.

{% hint style="success" %}
Unlike with regular accounts, compressed accounts no rent can be reclaimed after closing.
{% endhint %}

## Get Started

To build a program that closes compressed accounts, you'll need to:

1. Set up Light SDK dependencies and specify on-chain address with `declare_id!`,
2. Define account struct with `LightHasher` and `LightDiscriminator` derives, and
3. Implement `close_compressed_account` instruction within the `#[program]` module.

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
    // ZK proof for merkle inclusion/non-inclusion verification and account metadata for closing
    instruction::{account_meta::CompressedAccountMetaClose, PackedAddressTreeInfo, ValidityProof},
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
### Implement `close_compressed_account` Instruction

Implement the instruction to load existing account data and nullify via Light System CPI.

```rust
#[program]
pub mod close_compressed_account {
    use super::*;

    pub fn close_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CloseCompressedAccount<'info>>, // standard Anchor context
        proof: ValidityProof, // ZK proof verifying existing account inclusion
        account_meta: CompressedAccountMetaClose, // Contains current account metadata for closing
        current_message: String,
    ) -> Result<()> {
        // Create CPI accounts struct
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer and transaction signer for CPI
            ctx.remaining_accounts, // merkle tree and system accounts required for Light System program CPI
            LIGHT_CPI_SIGNER, // program signer
        );

        // Initialize compressed account wrapper for closing existing account with current data
        let data_account = LightAccount::<'_, DataAccount>::new_close(
            &crate::ID,
            &account_meta, // current account metadata for nullification
            DataAccount {
                owner: ctx.accounts.signer.key(),
                message: current_message,
            },
        )?;

        // Package validity proof and account data for nullification
        let cpi_inputs = CpiInputs::new(
            proof, // ZK proof for existing account inclusion
            vec![data_account.to_account_info()?], // account info for Light System nullification
        );

        // Invoke light system program to close compressed account
        cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CloseCompressedAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```
{% endstep %}

{% step %}
### Success!

You've implemented a program that closes compressed accounts via Light System program CPI.
{% endstep %}
{% endstepper %}

## Complete Program Example

Copy the complete example and build with `anchor build`. Find the source code [here](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update).

{% hint style="info" %}
Make sure you have your developer environment set up first:

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
    // ZK proof for merkle inclusion/non-inclusion verification and account metadata for closing
    instruction::{account_meta::CompressedAccountMetaClose, PackedAddressTreeInfo, ValidityProof},
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
pub mod close_compressed_account {
    use super::*;

    pub fn close_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CloseCompressedAccount<'info>>, // standard Anchor context
        proof: ValidityProof, // ZK proof verifying existing account inclusion
        account_meta: CompressedAccountMetaClose, // Contains current account metadata for closing
        current_message: String,
    ) -> Result<()> {
        // Create CPI accounts struct
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer and transaction signer for CPI
            ctx.remaining_accounts, // merkle tree and system accounts required for Light System program CPI
            LIGHT_CPI_SIGNER, // program signer
        );

        // Initialize compressed account wrapper for closing existing account with current data
        let data_account = LightAccount::<'_, DataAccount>::new_close(
            &crate::ID,
            &account_meta, // current account metadata for nullification
            DataAccount {
                owner: ctx.accounts.signer.key(),
                message: current_message,
            },
        )?;

        // Package validity proof and account data for nullification
        let cpi_inputs = CpiInputs::new(
            proof, // ZK proof for existing account inclusion
            vec![data_account.to_account_info()?], // account info for Light System nullification
        );

        // Invoke light system program to close compressed account
        cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CloseCompressedAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```

## Next steps

Learn how to Call Your Program from a Client Learn how to Create Compressed Accounts Learn how to Update Compressed Accounts

[^1]: Instruction:

    * `ValidityProof` for the existing account
    * `CompressedAccountMetaClose` containing current account metadata
    * Current account data to close
