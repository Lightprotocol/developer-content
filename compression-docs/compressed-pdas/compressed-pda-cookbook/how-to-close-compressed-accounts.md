---
description: >-
  Complete guide to a Solana program that closes compressed accounts using Light
  SDK and close_compressed_account()`instruction handler.
hidden: true
---

# How to Close Compressed Accounts

Compressed accounts are closed via CPI to the Light System Program.&#x20;

When a compressed account is closed, it's output hash consists of zero bytes to mark it as closed. Closed compressed accounts can be [reinitialized](how-to-reinitialize-compressed-accounts.md) at the same address with `new_empty()`.

{% hint style="success" %}
Compressed accounts are rent-free. No rent can be reclaimed after closing compressed accounts.
{% endhint %}

Find [full code examples of a counter program at the end](how-to-close-compressed-accounts.md#full-code-example) for Anchor, native Rust, and Pinocchio.

<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
├─ Fetch current account data
├─ Fetch validity proof (proves that account exists)
├─ Build instruction with proof, current data and metadata
└─ Send transaction
    │
<strong>  𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>    ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>    │
</strong><strong>    └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>       ├─ Verify input hash
       ├─ Nullify input hash
       └─ Append zero-byte hash to state tree (marks account as closed)
</code></pre>

{% stepper %}
{% step %}
### Program Setup

{% hint style="success" %}
Dependencies, constants, and account struct is defined once and reused for all operations (create, update, close).
{% endhint %}

<details>

<summary>Dependencies, Constants, Compressed Account</summary>

#### Dependencies

Add dependencies to your program.

```toml
[dependencies]
light-sdk = "0.13.0"
anchor_lang = "0.31.1"
```

```toml
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
solana-sdk = "2.2"
```

```toml
[dependencies]
light-sdk-pinocchio = "0.13.0"
borsh = "0.10.0"
pinocchio = "0.9"
```

* The `light-sdk` provides macros, wrappers and CPI interface to create and interact with compressed accounts.
* Add the serialization library (`borsh` for native Rust, or use `AnchorSerialize`).

#### Constants

Set program address and derive the CPI authority PDA to call the Light System program.

```rust
declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
```

**`CPISigner`** is the configuration struct for CPI's to the Light System Program.

* CPI to the Light System program must be signed with a PDA derived by your program with the seed `b"authority"`
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
pub struct DataAccount {
    pub owner: Pubkey,
    pub message: String,
}
```

These traits are derived besides the standard traits (`Clone`, `Debug`, `Default`):

* `borsh` or `AnchorSerialize` to serialize account data.
* `LightDiscriminator` implements a unique type ID (8 bytes) to distinguish account types. The default compressed account layout enforces a discriminator in its _own field_, [not the first 8 bytes of the data field](#user-content-fn-1)[^1].

{% hint style="info" %}
The traits listed above are required for `LightAccount`. `LightAccount` wraps `DataAccount` to set the discriminator and create the compressed account's data hash.
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
    current_value: u64,
}
```

1. **Inclusion Proof**

* `ValidityProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash and output state tree**

* [`CompressedAccountMeta`](#user-content-fn-2)[^2] points to the input hash and output state tree

3. **Current data for close**

* `current_value` includes the current data to hash and verify the input state. This depends on your program logic.
{% endstep %}

{% step %}
### Close Compressed Account

Close the compressed account with `LightAccount::new_close()`. `new_close()` hashes the current account data as input state and creates output state with zero bytes and zero discriminator (`DEFAULT_DATA_HASH`).

```rust
let my_compressed_account = LightAccount::<'_, DataAccount>::new_close(
    &crate::ID,
    &account_meta,
    DataAccount {
        owner: *signer.key,
        message: current_message,
    },
)?;
```

**Parameters for `LightAccount::new_close()`:**

* `crate::ID` specifies the program ID that owns the compressed account.
* `account_meta` locates the existing account hash for nullification from Instruction Data (_Step 2_).
* `DataAccount` contains the current account data. This input state is hashed by `new_close()` and verified during CPI.

`new_close` sets the flag `should_remove_data = true` to enforce the `DEFAULT_DATA_HASH` output during the CPI in the next step.
{% endstep %}

{% step %}
### Light System Program CPI

The Light System Program CPI closes the compressed account and creates the `DEFAULT_DATA_HASH`.

{% hint style="info" %}
The Light System Program

* validates the account exists in state tree with `proof`,
* nullifies the input account hash, and
* appends the `DEFAULT_DATA_HASH` with zero discriminator and zero bytes to the state tree.
{% endhint %}

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Set up `CpiAccounts::new()`:**

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer
* `ctx.remaining_accounts`: `AccountInfo` slice with Light System and packed tree accounts\[^2].
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Build and invoke the CPI instruction**:

* `new_cpi()` initializes the CPI instruction with the `proof` to prove the compressed account exists in the state tree (inclusion) _- defined in the Instruction Data (Step 2)._
* `with_light_account` adds the `LightAccount` wrapper configured to close the account with the `should_remove_data = true` flag _- defined in Step 3_.
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts`.
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first, or simply run:

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
Find the source code for this example [here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/anchor/programs/counter/src/lib.rs#L167).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::{prelude::*, AnchorDeserialize, Discriminator};
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{v1::CpiAccounts, CpiSigner},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator,
};

declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

#[program]
pub mod counter {

    use super::*;
    use light_sdk::cpi::{
        v1::LightSystemProgramCpi, InvokeLightSystemProgram, LightCpiInstruction,
    };

    pub fn close_counter<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        counter_value: u64,
        account_meta: CompressedAccountMeta,
    ) -> Result<()> {
        // LightAccount::new_close() creates an account with only input state and no output state.
        // By providing no output state, the account is closed after the instruction.
        // A closed account can be reinitialized with LightAccount::new_empty().
        let counter = LightAccount::<'_, CounterAccount>::new_close(
            &crate::ID,
            &account_meta,
            CounterAccount {
                owner: ctx.accounts.signer.key(),
                value: counter_value,
            },
        )?;

        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            crate::LIGHT_CPI_SIGNER,
        );

        LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
            .with_light_account(counter)?
            .invoke(light_cpi_accounts)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct GenericAnchorAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

// declared as event so that it is part of the idl.
#[event]
#[derive(Clone, Debug, Default, LightDiscriminator)]
pub struct CounterAccount {
    pub owner: Pubkey,
    pub value: u64,
}
```
{% endtab %}

{% tab title="Native" %}
{% hint style="info" %}
Find the source code for this example [here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/native/src/lib.rs#L277).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

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
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator,
};
use solana_program::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
};
pub const ID: Pubkey = pubkey!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

entrypoint!(process_instruction);

#[repr(u8)]
pub enum InstructionType {
    CloseCounter = 0,
}

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator,
)]
pub struct CounterAccount {
    pub owner: Pubkey,
    pub value: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CloseCounterInstructionData {
    pub proof: ValidityProof,
    pub counter_value: u64,
    pub account_meta: CompressedAccountMeta,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if program_id != &crate::ID {
        return Err(ProgramError::IncorrectProgramId);
    }
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }

    let discriminator = InstructionType::try_from(instruction_data[0])
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match discriminator {
        InstructionType::CloseCounter => {
            let instuction_data =
                CloseCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            close_counter(accounts, instuction_data)
        }
    }
}

pub fn close_counter(
    accounts: &[AccountInfo],
    instuction_data: CloseCounterInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let counter = LightAccount::<'_, CounterAccount>::new_close(
        &ID,
        &instuction_data.account_meta,
        CounterAccount {
            owner: *signer.key,
            value: instuction_data.counter_value,
        },
    )?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instuction_data.proof)
        .with_light_account(counter)?
        .invoke(light_cpi_accounts)?;

    Ok(())
}
```
{% endtab %}

{% tab title="Pinocchio" %}
{% hint style="info" %}
Find the source code for this example [here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/pinocchio/src/lib.rs#L280).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey_array;
use light_sdk_pinocchio::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{
        v1::{CpiAccounts, LightSystemProgramCpi},
        InvokeLightSystemProgram, LightCpiInstruction,
    },
    derive_light_cpi_signer,
    error::LightSdkError,
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo},
    CpiSigner, LightDiscriminator, ValidityProof,
};
use pinocchio::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey_array!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

entrypoint!(process_instruction);

#[repr(u8)]
pub enum InstructionType {
    CloseCounter = 0,
}

impl TryFrom<u8> for InstructionType {
    type Error = LightSdkError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(InstructionType::CloseCounter),
            _ => panic!("Invalid instruction discriminator."),
        }
    }
}

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator,
)]
pub struct CounterAccount {
    pub owner: Pubkey,
    pub value: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CloseCounterInstructionData {
    pub proof: ValidityProof,
    pub counter_value: u64,
    pub account_meta: CompressedAccountMeta,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if program_id != &crate::ID {
        return Err(ProgramError::IncorrectProgramId);
    }
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }

    let discriminator = InstructionType::try_from(instruction_data[0])
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match discriminator {
        InstructionType::CloseCounter => {
            let instruction_data =
                CloseCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            close_counter(accounts, instruction_data)
        }
    }
}

pub fn close_counter(
    accounts: &[AccountInfo],
    instruction_data: CloseCounterInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let counter = LightAccount::<'_, CounterAccount>::new_close(
        &ID,
        &instruction_data.account_meta,
        CounterAccount {
            owner: *signer.key(),
            value: instruction_data.counter_value,
        },
    )?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(counter)?
        .invoke(light_cpi_accounts)?;

    Ok(())
}
```
{% endtab %}
{% endtabs %}

## Next Steps

{% columns %}
{% column %}
{% content-ref url="../client-library/" %}
[client-library](../client-library/)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="how-to-reinitialize-compressed-accounts.md" %}
[how-to-reinitialize-compressed-accounts.md](how-to-reinitialize-compressed-accounts.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}

[^1]: The [Anchor](https://www.anchor-lang.com/) framework reserves the first 8 bytes of a _regular account's data field_ for the discriminator.

[^2]: 

    * `tree_info: PackedStateTreeInfo` points to the existing account hash (merkle tree pubkey index, leaf index, root index) for nullification

    - `address` specifies the account's derived address

    * `output_state_tree_index` points to the state tree that will store the output hash with a zero-byte hash to mark the account as closed (the `DEFAULT_DATA_HASH`).
