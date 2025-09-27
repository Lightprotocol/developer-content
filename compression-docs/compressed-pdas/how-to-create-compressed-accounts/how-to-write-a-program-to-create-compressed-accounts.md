---
description: >-
  Complete guide to a Solana program that creates compressed accounts using
  Light SDK and `create_compressed_account()` instruction handler.
hidden: true
---

# How to write a Program to Create Compressed Accounts

This guide shows you how to write a Solana program that creates compressed accounts with the `create_compressed_account` instruction.

A compressed account is created by the program, when called by a client.

The client

1. creates [instruction with proof and data](#user-content-fn-1)[^1]
2. then sends transaction to your program. Learn here how to call your program from a client.

Your program

1. derives a deterministic address and
2. performs a CPI from your custom program to the Light System program

The Light System program creates the compressed account.

{% hint style="success" %}
Your program calls the Light System program to create compressed accounts via CPI, similar to the System program to create regular accounts.
{% endhint %}

## Get Started

To build a program that creates compressed accounts, you'll need to:

1. Set up Light SDK dependencies, specify on-chain address with `declare_id!`,
2. Define account struct with `LightHasher` and `LightDiscriminator` derives, and
3. Implement `create_compressed_account` instruction in the  `#[program]` attribute.

The stepper below walks through each implementation step. You can find a [full code example at the end](how-to-write-a-program-to-create-compressed-accounts.md#complete-program-example).&#x20;

{% hint style="info" %}
`declare_id!` and `#[program]` follow [standard anchor](https://www.anchor-lang.com/docs/basics/program-structure) patterns.&#x20;
{% endhint %}

{% stepper %}
{% step %}
### Prerequisites

Set up Light SDK dependencies, import essential types , and configure program constants with `declare_id!`.

<details>

<summary>Dependencies, Imports, Program Constants</summary>

Add Light SDK and Anchor framework dependencies to your `Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.31.1"
light-sdk = "0.13.0"
borsh = "0.10.0"
```

Import the essential types and macros:

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
    // ZK proof for merkle inclusion/non-inclusion verification
    instruction::{PackedAddressTreeInfo, ValidityProof}, 
    // Traits for account type discrimination and Poseidon hash derivation
    LightDiscriminator, LightHasher, 
};
```

Set up your program ID and CPI authority for Light System program calls&#x20;

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

Define your compressed account struct with the required derives.

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
### Implement `create_compressed_account` Instruction

Implement the instruction to derive addresses and creates compressed accounts via Light System CPI.

{% hint style="warning" %}
Address must be derived identically to how the client that derived it. The validity proof must include the exact address being created. Otherwise you will get the error 0x179B (6043 / `ProofVerificationFailed`)
{% endhint %}

```rust
    #[program]
    pub mod create_compressed_account {
        use super::*;

        pub fn create_compressed_account<'info>(
            ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>, // standard Anchor context
            proof: ValidityProof, // ZK proof verifying address non-inclusion
            address_tree_info: PackedAddressTreeInfo, // Specifies address tree to use for derivation
            output_state_tree_index: u8, // Specifies state tree to store the new account
            message: String,
        ) -> Result<()> {
            // Create CPI accounts struct
            let light_cpi_accounts = CpiAccounts::new(
                ctx.accounts.signer.as_ref(), // fee payer and transaction signer for CPI 
                ctx.remaining_accounts, // merkle tree and system accounts required for Light System program CPI 
                LIGHT_CPI_SIGNER, // program signer
            );

            // Derive deterministic address from seeds and address tree
            // must match client-side derivation
            let (address, address_seed) = derive_address(
                &[SEED, ctx.accounts.signer.key().as_ref()],
                &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?, // merkle tree pubkey for final address computation
                &crate::ID,
            );

            // Initialize compressed account wrapper with owner, address, and output state tree index
            let mut data_account = LightAccount::<'_, DataAccount>::new_init(
                &crate::ID,
                Some(address),
                output_state_tree_index, // specifies which state tree will store account
            );
            data_account.owner = ctx.accounts.signer.key();
            data_account.message = message;

            // Package validity proof, compressed account data, and address registration params
            let cpi_inputs = CpiInputs::new_with_address(
                proof, // ZK proof for address non-inclusion
                vec![data_account.to_account_info()?], // compressed account info for Light System
                vec![address_tree_info.into_new_address_params_packed(address_seed)], // packed address registration parameters
            );

            // Invoke light system program to create compressed account
            cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;

            Ok(())
        }
}

#[derive(Accounts)]
pub struct CreateCompressedAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```
{% endstep %}

{% step %}
### Success!

You've implemented a program that creates compressed accounts via Light System program CPI.
{% endstep %}
{% endstepper %}

## Create Account Example

Copy the complete example and built with `anchor build`. Find the [source code](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) here.

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
    // ZK proof for merkle inclusion/non-inclusion verification
    instruction::{PackedAddressTreeInfo, ValidityProof},
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
pub mod create_compressed_account {
    use super::*;

    pub fn create_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>, // standard Anchor context
        proof: ValidityProof, // ZK proof verifying address non-inclusion
        address_tree_info: PackedAddressTreeInfo, // Specifies address tree to use for derivation
        output_state_tree_index: u8, // Specifies state tree to store the new account
        message: String,
    ) -> Result<()> {
        // Create CPI accounts struct
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer and transaction signer for CPI
            ctx.remaining_accounts, // merkle tree and system accounts required for Light System program CPI
            LIGHT_CPI_SIGNER, // program signer
        );

        // Derive deterministic address from seeds and address tree
        // must match client-side derivation
        let (address, address_seed) = derive_address(
            &[SEED, ctx.accounts.signer.key().as_ref()],
            &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?, // merkle tree pubkey for final address computation
            &crate::ID,
        );

        // Initialize compressed account wrapper with owner, address, and output state tree index
        let mut data_account = LightAccount::<'_, DataAccount>::new_init(
            &crate::ID,
            Some(address),
            output_state_tree_index, // specifies which state tree will store account
        );
        data_account.owner = ctx.accounts.signer.key();
        data_account.message = message;

        // Package validity proof, compressed account data, and address registration params
        let cpi_inputs = CpiInputs::new_with_address(
            proof, // ZK proof for address non-inclusion
            vec![data_account.to_account_info()?], // compressed account info for Light System
            vec![address_tree_info.into_new_address_params_packed(address_seed)], // packed address registration parameters
        );

        // Invoke light system program to create compressed account
        cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateCompressedAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```

## Next steps

Learn how to Call Your Program from a Client Learn how to Update Compressed Accounts Learn how to Close Compressed Accounts

[^1]: Instruction:

    * `ValidityProof` for the new address
    * `PackedAddressTreeInfo` containing tree metadata
    * `output_tree_index` specifying which state tree to use
    * Account data to store
