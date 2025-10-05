---
description: >-
  Complete guide to a Solana program that closes compressed accounts using Light
  SDK and close_compressed_account()`instruction handler.
hidden: true
---

# How to Close Compressed Accounts

Compressed accounts are closed via CPI to the Light System Program.&#x20;

Once closed, you can reinitialize a compressed account or permanently burn it. A burned account cannot be reinitialized. Compressed accounts are rent-free, wherefore no rent can be reclaimed after closing compressed account.

{% hint style="success" %}
Find [full code examples of a counter program at the end](how-to-close-compressed-accounts.md#full-code-example) for Anchor, native Rust, and Pinocchio.
{% endhint %}

{% tabs %}
{% tab title="Close" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch current account data
   ├─ Fetch validity proof (proves that account exists)
   ├─ Build instruction with proof, current data and metadata
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify input hash
         ├─ Nullify input hash
         └─ Create DEFAULT_DATA_HASH with zero discriminator (output)
</code></pre>
{% endtab %}

{% tab title="Reinitialize" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch closed account metadata
   ├─ Fetch validity proof (proves DEFAULT_DATA_HASH exists)
   ├─ Build instruction with proof and new data
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing closed account hash (input hash)
</strong><strong>      ├─ Initialize account with zero data
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify DEFAULT_DATA_HASH exists
         ├─ Nullify DEFAULT_DATA_HASH
         ├─ Create new account hash with default values
         └─ Complete atomic account reinitialization
</code></pre>
{% endtab %}

{% tab title="Burn" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch current account data
   ├─ Fetch validity proof (proves that account exists)
   ├─ Build instruction with proof and current data
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify input hash
         ├─ Nullify input hash (permanent)
         └─ No output state created
</code></pre>
{% endtab %}
{% endtabs %}

{% stepper %}
{% step %}
### Program Setup

The dependencies, constants and compressed account struct are identical for create, update and closing of compressed accounts.

<details>

<summary>Dependencies, Constants, Compressed Account</summary>

#### Dependencies

Add dependencies to your program.

```toml
// Anchor
[dependencies]
light-sdk = "0.13.0"
anchor_lang = "0.31.1"
```

```toml
// Native Rust
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
solana-sdk = "2.2"
```

```toml
// Pinocchio
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

Besides the standard traits (`Clone`, `Debug`, `Default`), the following are required:

* `borsh` or `AnchorSerialize` to serialize account data.
* `LightDiscriminator` trait gives struct unique type ID (8 bytes) to distinguish account types.

{% hint style="info" %}
The traits are required for `LightAccount`. `LightAccount` wraps `DataAccount` to set the discriminator and create the compressed account's data hash.
{% endhint %}

</details>
{% endstep %}

{% step %}
### Instruction Data

Define the instruction data with the following parameters:

```rust
pub struct InstructionData {
    proof: ValidityProof,
    my_compressed_account: MyCompressedAccount,
    account_meta: CompressedAccountMeta, // CompressedAccountMetaBurn
}
```

**`close_compressed_account` Parameters:**

*
{% endstep %}

{% step %}
### Close Compressed Account

Close the compressed account with `LightAccount::new_close()`. `new_close()` hashes the current account data as input state and creates output state with zero's.

{% hint style="info" %}
A closed account can be reinitialized with `new_empty`.
{% endhint %}

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
* `account_meta` points to the existing account hash for nullification defined in  `CompressedAccountMeta` (_Step 2_)
* `DataAccount` contains the current account data. This input state is hashed by `new_close()` and verified during CPI.

{% hint style="info" %}
`new_close()` creates output state with `DEFAULT_DATA_HASH` and zero discriminator. The Light System Program nullifies the old account hash and creates the new hash.
{% endhint %}
{% endstep %}

{% step %}
### Reinitialize Closed Account

A compressed account can be reinitialized after close with `LightAccount::new_empty()`. This creates a new account at the same address with default values, effectively "reopening" a previously closed account.

{% hint style="info" %}
Closed accounts have `DEFAULT_DATA_HASH` with zero discriminator. `new_empty()` uses this constant as input to prove the account is closed. The Light System Program verifies the input hash and nullifies it to create a new account at the same addres&#x73;_._
{% endhint %}

```rust
let my_compressed_account = LightAccount::<'_, DataAccount>::new_empty(
    &crate::ID,
    &account_meta,
    DataAccount::default(),
)?;
```

**Parameters for `LightAccount::new_empty()`:**

* `&crate::ID`: Program ID to set authority for CPI to Light System program.
* `&account_meta`: Account's state tree position metadata for the closed account address, defined in _Step 2_ Instruction Data.
* `DataAccount::default()` contains default values for the reinitialized account data structure.
{% endstep %}

{% step %}
### Burn Compressed Account

A compressed account can be burned after reinitialize or close with `LightAccount::new_burn()`. A burned compressed account's address can't be reinitialized.

```rust
let my_compressed_account = LightAccount::<'_, DataAccount>::new_burn(
    &crate::ID,
    &account_meta, // use CompressedAccountMetaBurn in instruction data
    DataAccount::default(),
)?;
```

**Parameters for `LightAccount::new_burn()`:**

* `crate::ID` specifies the program's ID that owns the compressed account.
* `&account_meta` identifies the existing compressed account's state tree position via `CompressedAccountMetaBurn` (_Step 2 Instruction Data for `close_compressed_account`_).
* `DataAccount::default()`contains default values for burn.
{% endstep %}

{% step %}
### Light System Program CPI

The CPI pattern for `new_close`, `new_empty` and `new_burn` are identical. Invoke the Light System program to perform the respective operation on the compressed account with

1. `proof` from _Step 2_ _Instruction Data_, and
2. `my_compressed_account` from _Step 3_ _Initialize Compressed Account_.

<details>

<summary>CPI Context and Instruction</summary>

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

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and signer
* `ctx.remaining_accounts`: `AccountInfo` slice with Light System accounts\[^1].
* `LIGHT_CPI_SIGNER`: Your program as CPI signer defined in Constants.

**CPI instruction** :

* `new_cpi()` initializes the CPI instruction with the `proof` from _Step 4_ to prove inclusion of the compressed account.
* `with_light_account` adds the respective account wrapper to the CPI instruction data:
  * `new_close()` with current data to nullify
  * `new_empty()` with default values for creation
  * `new_burn()` with default values for permanent burn
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts`.

</details>

{% hint style="info" %}
**Light System Program operations:**
{% endhint %}

<table><thead><tr><th width="120.250732421875">Operation</th><th>Validates Proof</th><th>Nullifies Input</th><th>Creates Output</th></tr></thead><tbody><tr><td><code>new_close()</code></td><td>Account exists in state tree</td><td>Existing<br>account hash</td><td>Closed Account Hash<br>(with zeros as value)</td></tr><tr><td><code>new_empty()</code></td><td>Account is closed</td><td>Closed Account Hash</td><td>New hash with default values</td></tr><tr><td><code>new_burn()</code></td><td>Account exists in state tree</td><td>Existing<br>account hash</td><td>No output state</td></tr></tbody></table>
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.

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

{% endcolumn %}

{% column %}

{% endcolumn %}
{% endcolumns %}
