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
Here is the complete flow to reinitialize compressed accounts:

<figure><picture><source srcset="../../.gitbook/assets/program-reinit (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/program-reinit.png" alt=""></picture><figcaption></figcaption></figure>

{% stepper %}
{% step %}
### Program Setup

<details>

<summary>Dependencies, Constants, Compressed Account</summary>

#### Dependencies

Add dependencies to your program.

{% code overflow="wrap" %}
```toml
[dependencies]
light-sdk = "0.16.0"
anchor_lang = "0.31.1"
```
{% endcode %}

{% code overflow="wrap" %}
```toml
[dependencies]
light-sdk = "0.16.0"
borsh = "0.10.0"
solana-program = "2.2"
```
{% endcode %}

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
{% endcode %}

You derive

* the standard traits (`Clone`, `Debug`, `Default`),
* `borsh` or `AnchorSerialize` to serialize account data, and
* `LightDiscriminator` to implements a unique type ID (8 bytes) to distinguish account types. The default compressed account layout enforces a discriminator in its _own field_, [not the first 8 bytes of the data field](#user-content-fn-1)[^1].

{% hint style="info" %}
The traits listed above are required for `LightAccount`. `LightAccount` wraps `MyCompressedAccount` in Step 3 to set the discriminator and create the compressed account's data.
{% endhint %}

</details>
{% endstep %}

{% step %}
### Instruction Data

Define the instruction data with the following parameters:

{% code overflow="wrap" %}
```rust
pub struct InstructionData {
    proof: ValidityProof,
    account_meta: CompressedAccountMeta,
}
```
{% endcode %}

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

{% hint style="success" %}
`new_empty()`

1. reconstructs the closed account hash with zero values as input, and
2. creates output state with default-initialized values.

You can set custom values in the same transaction:

1. Reinitialize with `new_empty()`, and
2. Update with `new_mut()` to set custom values.
{% endhint %}

{% code overflow="wrap" %}
```rust
let my_compressed_account = LightAccount::<MyCompressedAccount>::new_empty(
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

{% hint style="success" %}
`new_empty()` reconstructs the closed account hash with zero values. The Light System Program verifies the closed account hash and creates the output hash in _Step 4_.
{% endhint %}
{% endstep %}

{% step %}
### Light System Program CPI

Invoke the Light System Program to reinitialize the compressed account.

{% hint style="success" %}
The Light System Program

* validates the closed account hash exists in state tree,
* nullifies the closed account hash, and
* appends the new account hash with provided values to the state tree.
{% endhint %}

{% code overflow="wrap" %}
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
{% endcode %}

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

{% code overflow="wrap" %}
```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```
{% endcode %}

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

#[cfg(any(test, feature = "test-helpers"))]
pub mod test_helpers;

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey;
use light_sdk::{
    account::sha::LightAccount,
    address::v1::derive_address,
    cpi::{
        v1::{CpiAccounts, LightSystemProgramCpi},
        CpiSigner, InvokeLightSystemProgram, LightCpiInstruction,
    },
    derive_light_cpi_signer,
    error::LightSdkError,
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator,
};
use solana_program::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey!("2m6LXA7E6kMSkK6QHq2WCznD6kvhDcVFqEKpETKAQxYe");
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("2m6LXA7E6kMSkK6QHq2WCznD6kvhDcVFqEKpETKAQxYe");

entrypoint!(process_instruction);

#[repr(u8)]
#[derive(Debug)]
pub enum InstructionType {
    Create = 0,
    Update = 1,
}

impl TryFrom<u8> for InstructionType {
    type Error = LightSdkError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(InstructionType::Create),
            1 => Ok(InstructionType::Update),
            _ => panic!("Invalid instruction discriminator."),
        }
    }
}

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator,
)]
pub struct MyCompressedAccount {
    pub owner: Pubkey,
    pub message: String,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CreateInstructionData {
    pub proof: ValidityProof,
    pub address_tree_info: PackedAddressTreeInfo,
    pub output_state_tree_index: u8,
    pub message: String,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct UpdateInstructionData {
    pub proof: ValidityProof,
    pub account_meta: CompressedAccountMeta,
    pub current_message: String,
    pub new_message: String,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if program_id != &ID {
        return Err(ProgramError::IncorrectProgramId);
    }
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }

    let discriminator = InstructionType::try_from(instruction_data[0])
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match discriminator {
        InstructionType::Create => {
            let instruction_data =
                CreateInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            create(accounts, instruction_data)
        }
        InstructionType::Update => {
            let instruction_data =
                UpdateInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            update(accounts, instruction_data)
        }
    }
}

pub fn create(
    accounts: &[AccountInfo],
    instruction_data: CreateInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let (address, address_seed) = derive_address(
        &[b"message", signer.key.as_ref()],
        &instruction_data
            .address_tree_info
            .get_tree_pubkey(&light_cpi_accounts)
            .map_err(|_| ProgramError::NotEnoughAccountKeys)?,
        &ID,
    );

    let new_address_params = instruction_data
        .address_tree_info
        .into_new_address_params_packed(address_seed);

    let mut my_compressed_account = LightAccount::<MyCompressedAccount>::new_init(
        &ID,
        Some(address),
        instruction_data.output_state_tree_index,
    );
    my_compressed_account.owner = *signer.key;
    my_compressed_account.message = instruction_data.message;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(my_compressed_account)?
        .with_new_addresses(&[new_address_params])
        .invoke(light_cpi_accounts)?;

    Ok(())
}

pub fn update(
    accounts: &[AccountInfo],
    instruction_data: UpdateInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let mut my_compressed_account = LightAccount::<MyCompressedAccount>::new_mut(
        &ID,
        &instruction_data.account_meta,
        MyCompressedAccount {
            owner: *signer.key,
            message: instruction_data.current_message,
        },
    )?;

    // Update the account data with new message
    my_compressed_account.account.message = instruction_data.new_message;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(my_compressed_account)?
        .invoke(light_cpi_accounts)?;

    Ok(())
```
{% endcode %}
{% endtab %}

{% tab title="Native" %}
{% code overflow="wrap" %}
```rust
#![allow(unexpected_cfgs)]

#[cfg(any(test, feature = "test-helpers"))]
pub mod test_helpers;

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey;
use light_sdk::{
    account::sha::LightAccount,
    address::v1::derive_address,
    cpi::{
        v1::{CpiAccounts, LightSystemProgramCpi},
        CpiSigner, InvokeLightSystemProgram, LightCpiInstruction,
    },
    derive_light_cpi_signer,
    error::LightSdkError,
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator,
};
use solana_program::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey!("C9WiPUaQ5PRjEWg7vUmgekfuQtAgFZFhn12ytXEMDr8y");
pub const LIGHT_CPI_SIGNER: CpiSigner = derive_light_cpi_signer!("C9WiPUaQ5PRjEWg7vUmgekfuQtAgFZFhn12ytXEMDr8y");

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

#[derive(Debug, BorshSerialize, BorshDeserialize)]
pub enum InstructionType {
    Create,
    Close,
    Reinit,
}

#[derive(Debug, BorshSerialize, BorshDeserialize)]
pub struct CreateInstructionData {
    pub proof: ValidityProof,
    pub address_tree_info: PackedAddressTreeInfo,
    pub output_state_tree_index: u8,
    pub message: String,
}

#[derive(Debug, BorshSerialize, BorshDeserialize)]
pub struct CloseInstructionData {
    pub proof: ValidityProof,
    pub account_meta: CompressedAccountMeta,
    pub current_message: String,
}

#[derive(Debug, BorshSerialize, BorshDeserialize)]
pub struct ReinitInstructionData {
    pub proof: ValidityProof,
    pub account_meta: CompressedAccountMeta,
}

#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator)]
pub struct MyCompressedAccount {
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
        InstructionType::Create => create(accounts, rest)?,
        InstructionType::Close => close(accounts, rest)?,
        InstructionType::Reinit => reinit(accounts, rest)?,
    }

    Ok(())
}

fn create(accounts: &[AccountInfo], instruction_data: &[u8]) -> Result<(), LightSdkError> {
    let instruction_data =
        CreateInstructionData::try_from_slice(instruction_data).map_err(|_| LightSdkError::Borsh)?;

    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let (address, address_seed) = derive_address(
        &[b"message", signer.key.as_ref()],
        &instruction_data
            .address_tree_info
            .get_tree_pubkey(&light_cpi_accounts)
            .map_err(|_| ProgramError::NotEnoughAccountKeys)?,
        &ID,
    );

    let new_address_params = instruction_data
        .address_tree_info
        .into_new_address_params_packed(address_seed);

    let mut my_compressed_account = LightAccount::<MyCompressedAccount>::new_init(
        &ID,
        Some(address),
        instruction_data.output_state_tree_index,
    );
    my_compressed_account.owner = *signer.key;
    my_compressed_account.message = instruction_data.message;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(my_compressed_account)?
        .with_new_addresses(&[new_address_params])
        .invoke(light_cpi_accounts)?;

    Ok(())
}

fn close(accounts: &[AccountInfo], instruction_data: &[u8]) -> Result<(), LightSdkError> {
    let instruction_data =
        CloseInstructionData::try_from_slice(instruction_data).map_err(|_| LightSdkError::Borsh)?;

    let (signer, remaining_accounts) = accounts
        .split_first()
        .ok_or(ProgramError::InvalidAccountData)?;

    let cpi_accounts = CpiAccounts::new(signer, remaining_accounts, LIGHT_CPI_SIGNER);

    let my_compressed_account = LightAccount::<MyCompressedAccount>::new_close(
        &ID,
        &instruction_data.account_meta,
        MyCompressedAccount {
            owner: *signer.key,
            message: instruction_data.current_message,
        },
    )?;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(my_compressed_account)?
        .invoke(cpi_accounts)?;

    Ok(())
}

fn reinit(accounts: &[AccountInfo], instruction_data: &[u8]) -> Result<(), LightSdkError> {
    let instruction_data =
        ReinitInstructionData::try_from_slice(instruction_data).map_err(|_| LightSdkError::Borsh)?;

    let (signer, remaining_accounts) = accounts
        .split_first()
        .ok_or(ProgramError::InvalidAccountData)?;

    let cpi_accounts = CpiAccounts::new(signer, remaining_accounts, LIGHT_CPI_SIGNER);

    let my_compressed_account = LightAccount::<MyCompressedAccount>::new_empty(
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
