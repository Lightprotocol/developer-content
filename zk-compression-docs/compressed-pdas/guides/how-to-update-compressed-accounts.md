---
description: >-
  Guide to update compressed accounts in Solana programs with full code
  examples.
hidden: true
---

# How to Update Compressed Accounts

## Overview

Compressed accounts are updated via CPI to the Light System Program. &#x20;

The update of a compressed account follows a UTXO pattern, unlike regular Solana accounts that overwrite data in place. Each update of a compressed account&#x20;

* consumes the existing account hash and
* produces a new account hash with updated data.
* The existing account hash is nullified to prevent double spending.

{% hint style="success" %}
Find [full code examples at the end](how-to-update-compressed-accounts.md#full-code-example) for Anchor and native Rust.
{% endhint %}

## Implementation Guide

This guide will cover the components of a Solana program that updates compressed accounts.\
Here is the complete flow:&#x20;

<figure><picture><source srcset="../../.gitbook/assets/Untitled (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/image (29).png" alt=""></picture><figcaption><p>Update Compressed Account Complete Flow. Program-side highlighted.</p></figcaption></figure>

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
    current_message: String,
    new_message: String,
}
```

1. **Validity Proof**

* Define `proof` to include the proof that the account exists in the state tree.
* Clients fetch a validity proof with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input state and output state tree (stores updated account hash)**

* Define `account_meta: CompressedAccountMeta` to reference the existing account and specify the state tree to store the updated account hash:
  * `tree_info: PackedStateTreeInfo`: References the existing account hash in the state tree.
  * `address`: The account's derived address.
  * `output_state_tree_index`: References the state tree account that will store the updated account hash.

{% hint style="info" %}
Clients fetch the current account with `getCompressedAccount()` and populate `CompressedAccountMeta` with the account's metadata.
{% endhint %}

3. **Current account data**

* Define fields to include the current account data passed by the client.
* This depends on your program logic. This example includes `current_message` and `new_message` fields.&#x20;
  * `new_message` contains the the new data that will replace the `data` field of the compressed account after the update. &#x20;
{% endstep %}

{% step %}
### Update Compressed Account

Load the compressed account and update it with `LightAccount::new_mut()`.

{% hint style="success" %}
`new_mut()`:

* hashes the current account data as input state and
* lets your program define the output state.
{% endhint %}

{% code overflow="wrap" %}
```rust
let mut my_compressed_account
        = LightAccount::<'_, MyCompressedAccount>::new_mut(
    &ID,
    account_meta,
    MyCompressedAccount {
        owner: *signer_key,
        message: current_message,
    },
)?;

my_compressed_account.message = new_message;
```
{% endcode %}

**Pass these parameters to `new_mut()`:**

* `&ID`: The program's ID that owns the compressed account.
* `&account_meta`: The `CompressedAccountMeta` from instruction data (_Step 2_) that identifies the existing account and specifies the output state tree.
* `MyCompressedAccount { ... }`: The current account data. The SDK hashes this input state for verification by the Light System Program.

**The SDK creates:**

* A `LightAccount` wrapper similar to Anchor's `Account`.
* `new_mut()` lets the program modify the output state. This example sets `message` to `new_message`.

{% hint style="info" %}
`new_mut()` only hashes the input state. The Light System Program verifies that input hash exists in a state tree and creates the output hash in _Step 4._&#x20;
{% endhint %}
{% endstep %}

{% step %}
### Light System Program CPI

Invoke the Light System Program to update the compressed account.

{% hint style="success" %}
The Light System Program

* validates the account exists in state tree,
* nullifies the existing account hash in the state tree, and
* appends the updated account hash to the state tree.
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

* `new_cpi()` initializes the CPI instruction with the `proof` to prove that the account exists in the specified state tree - _in the Instruction Data (Step 2)._
* `with_light_account` adds the `LightAccount`  with the modified compressed account data _- defined in Step 3_
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts`.
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first, or simply run:

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
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/anchor/programs/counter/src/lib.rs#L71).
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

declare_id!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");

#[program]
pub mod anchor_program_update {

    use super::*;
    use light_sdk::cpi::{
        v1::LightSystemProgramCpi, InvokeLightSystemProgram, LightCpiInstruction,
    };

    /// Updates an existing compressed account's message
    pub fn update<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        account_meta: CompressedAccountMeta,
        current_message: String,
        new_message: String,
    ) -> Result<()> {
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            crate::LIGHT_CPI_SIGNER,
        );

        let mut my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_mut(
            &crate::ID,
            &account_meta,
            MyCompressedAccount {
                owner: ctx.accounts.signer.key(),
                message: current_message,
            },
        )?;

        my_compressed_account.message = new_message.clone();

        msg!(
            "Updated compressed account message to: {}",
            my_compressed_account.message
        );

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

{% tab title="Native Rust" %}
{% hint style="info" %}
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/native/src/lib.rs#L197).
{% endhint %}

{% code overflow="wrap" %}
```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey;
use light_sdk::{
    account::LightAccount,
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
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPq");

entrypoint!(process_instruction);

#[repr(u8)]
pub enum InstructionType {
    Update = 0,
}

impl TryFrom<u8> for InstructionType {
    type Error = LightSdkError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(InstructionType::Update),
            _ => panic!("Invalid instruction discriminator."),
        }
    }
}

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator, LightHasher,
)]
pub struct MyCompressedAccount {
    #[hash]
    pub owner: Pubkey,
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
        InstructionType::Update => {
            let instruction_data =
                UpdateInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            update(accounts, instruction_data)
        }
    }
}

pub fn update(
    accounts: &[AccountInfo],
    instruction_data: UpdateInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let my_compressed_account = LightAccount::<'_, MyCompressedAccount>::new_mut(
        &ID,
        &instruction_data.account_meta,
        MyCompressedAccount {
            owner: *signer.key,
            message: instruction_data.current_message,
        },
        MyCompressedAccount {
            owner: *signer.key,
            message: instruction_data.new_message,
        },
    )?;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(my_compressed_account)?
        .invoke(light_cpi_accounts)?;

    Ok(())
}
```
{% endcode %}
{% endtab %}
{% endtabs %}



## Next steps

Build a client for your program or learn how to close compressed accounts.

{% columns %}
{% column %}
{% content-ref url="../client-library/" %}
[client-library](../client-library/)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="how-to-close-compressed-accounts.md" %}
[how-to-close-compressed-accounts.md](how-to-close-compressed-accounts.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}

[^1]: The [Anchor](https://www.anchor-lang.com/) framework reserves the first 8 bytes of a _regular account's data field_ for the discriminator.
