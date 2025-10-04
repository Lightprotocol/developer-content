---
description: >-
  Complete guide to update compressed accounts in Solana programs with the
  light-sdk. Includes step-by-step guide and full code examples.
hidden: true
---

# How to Update Compressed Accounts

Compressed accounts are updated via CPI to the Light System Program.  Find [full code examples at the end](how-to-update-compressed-accounts.md#full-code-example) for Anchor, native Rust, and Pinocchio.

{% hint style="success" %}
Compressed account updates follow a UTXO pattern, unlike regular Solana accounts that overwrite data in place:

* each update consumes the old account hash (input) and
* produces a new hash with modified data (output).&#x20;

The old hash is nullified to prevent double spending.
{% endhint %}

<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch current account data 
   ├─ Fetch validity proof (proves that account exists)
   ├─ Build instruction with proof, current data, new data and metadata
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>      ├─ Modify compressed account data (output)
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify input hash 
         ├─ Nullify input hash 
         ├─ Create output hash with updated data
         └─ Complete atomic account update
</code></pre>

{% stepper %}
{% step %}
### Program Setup

The dependencies, constants and compressed account struct are identical for compressed account creation and updates.

<details>

<summary>Dependencies, Constants, Compressed Account</summary>

#### Dependencies

Add dependencies to your program.

```toml
[dependencies]
light-sdk = "0.13.0"
// anchor_lang = "0.31.1"
// light-sdk-pinocchio = "0.13.0"
// pinocchio = "0.9"
```

* The `light-sdk` provides macros, wrappers and CPI interface to create and interact with compressed accounts.&#x20;
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
    account_meta: CompressedAccountMeta,
    new_value: u64,
}
```

1. **Inclusion Proof**

* `ValidityProof` proves that the account exists in the state tree (inclusion).  Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify existing account and output state tree**

* `CompressedAccountMeta` identifies the existing compressed account and specifies the output state tree with these fields:
  * `tree_info: PackedStateTreeInfo` locates the old account hash (merkle tree pubkey index, leaf index, root index) for nullification.
  * `address` specifies the account's derived address.
  * `output_state_tree_index` specifies the state tree that will store the updated compressed account hash.

3. **Update account data**

* `new_value` specifies updated data for the compressed account. This depends on your program logic.

{% hint style="info" %}
Packed structs like  `PackedStateTreeInfo` use indices to point to `remaining_accounts` to reduce transaction size. The instruction data references these accounts with `u8` indices instead of full 32 byte pubkeys.
{% endhint %}
{% endstep %}

{% step %}
### Load Compressed Account

Load the compressed account with `LightAccount::new_mut()`. `new_mut()` hashes the current account data and lets your program define the output state.

{% hint style="info" %}
Compressed accounts store hashes on-chain, not full data. Programs reconstruct account data from client-provided values to verify the input hash.
{% endhint %}

<pre class="language-rust"><code class="lang-rust">let mut my_compressed_account
        = LightAccount::&#x3C;'_, DataAccount>::new_mut(
<strong>    &#x26;crate::ID,
</strong><strong>    &#x26;account_meta,
</strong><strong>    DataAccount {
</strong><strong>        owner: *signer.key,
</strong><strong>        message: current_message, 
</strong><strong>    },
</strong>)?;

<strong>my_compressed_account.message = new_message;
</strong></code></pre>

**Parameters for `LightAccount::new_mut()`:**

* `crate::ID` specifies the program's ID that owns the compressed account.
* `account_meta` identifies the existing compressed account and specifies the output state tree from the instruction data (_Step 2_).
* `DataAccount` contains the current account data. This input state is hashed by `new_mut()`.

When `new_mut()` returns, modify the account fields to define the output state. The example shows `my_compressed_account.message = new_message`.

{% hint style="info" %}
The output state is hashed in the next step via CPI by the Light System Program. `new_mut()` only hashes the input state.&#x20;
{% endhint %}
{% endstep %}

{% step %}
### Light System Program CPI

The Light System Program CPI nullifies the old and creates the updated compressed account hash.

Build the CPI instruction with

1. `proof` from _Step 4_ _Instruction Data_, and
2. the updated data in `my_compressed_account` from _Step 5_ _Load Compressed Account_.

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

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer.
* `ctx.remaining_accounts`: `AccountInfo` slice [with Light System accounts](#user-content-fn-1)[^1].
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**CPI instruction** :

* `new_cpi()` initializes the CPI instruction with the `proof` from _Step 4_ to prove inclusion of the compressed account.
* `with_light_account` adds the modified compressed account from _Step 5_ to the CPI instruction data.
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts`.

{% hint style="info" %}
The Light System Program

* validates the inclusion proof (account exists in state tree),
* nullifies the old account hash in the state tree (input), and
* appends the updated account hash to the state tree (output).
{% endhint %}
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% hint style="warning" %}
For errors see [this page](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
Find the [source code for this example here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/anchor/programs/counter/src/lib.rs#L71).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::{prelude::*, AnchorDeserialize, Discriminator};
use light_sdk::{
    account::LightAccount,
    cpi::{v1::CpiAccounts, CpiSigner},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMeta, ValidityProof},
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

    pub fn increment_counter<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        counter_value: u64,
        account_meta: CompressedAccountMeta,
    ) -> Result<()> {
        let mut counter = LightAccount::<'_, CounterAccount>::new_mut(
            &crate::ID,
            &account_meta,
            CounterAccount {
                owner: ctx.accounts.signer.key(),
                value: counter_value,
            },
        )?;

        msg!("counter {}", counter.value);

        counter.value = counter.value.checked_add(1).ok_or(CustomError::Overflow)?;

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

#[error_code]
pub enum CustomError {
    #[msg("No authority to perform this action")]
    Unauthorized,
    #[msg("Counter overflow")]
    Overflow,
    #[msg("Counter underflow")]
    Underflow,
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
    #[hash]
    pub owner: Pubkey,
    pub value: u64,
}
```
{% endtab %}

{% tab title="Native" %}
{% hint style="info" %}
Find the [source code for this example here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/native/src/lib.rs#L197).
{% endhint %}

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
    instruction::{account_meta::CompressedAccountMeta, ValidityProof},
    LightDiscriminator,
};
use solana_program::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

entrypoint!(process_instruction);

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator,
)]
pub struct CounterAccount {
    #[hash]
    pub owner: Pubkey,
    pub value: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct IncrementCounterInstructionData {
    pub proof: ValidityProof,
    pub counter_value: u64,
    pub account_meta: CompressedAccountMeta,
}

#[derive(Debug, Clone)]
pub enum CounterError {
    Unauthorized,
    Overflow,
    Underflow,
}

impl From<CounterError> for ProgramError {
    fn from(e: CounterError) -> Self {
        match e {
            CounterError::Unauthorized => ProgramError::Custom(1),
            CounterError::Overflow => ProgramError::Custom(2),
            CounterError::Underflow => ProgramError::Custom(3),
        }
    }
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if program_id != &crate::ID {
        return Err(ProgramError::IncorrectProgramId);
    }

    let instruction_data = IncrementCounterInstructionData::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    increment_counter(accounts, instruction_data)
}

pub fn increment_counter(
    accounts: &[AccountInfo],
    instuction_data: IncrementCounterInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let mut counter = LightAccount::<'_, CounterAccount>::new_mut(
        &ID,
        &instuction_data.account_meta,
        CounterAccount {
            owner: *signer.key,
            value: instuction_data.counter_value,
        },
    )?;

    counter.value = counter.value.checked_add(1).ok_or(CounterError::Overflow)?;

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
Find the [source code for this example here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/pinocchio/src/lib.rs#L199).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey_array;
use light_sdk_pinocchio::{
    account::LightAccount,
     cpi::{
        v1::{CpiAccounts, LightSystemProgramCpi},
        InvokeLightSystemProgram, LightCpiInstruction,
    },
    derive_light_cpi_signer,
    instruction::account_meta::CompressedAccountMeta,
    CpiSigner, LightDiscriminator, ValidityProof,
};
use pinocchio::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey_array!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

entrypoint!(process_instruction);

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator,
)]
pub struct CounterAccount {
    #[hash]
    pub owner: Pubkey,
    pub value: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct IncrementCounterInstructionData {
    pub proof: ValidityProof,
    pub counter_value: u64,
    pub account_meta: CompressedAccountMeta,
}

#[derive(Debug, Clone)]
pub enum CounterError {
    Unauthorized,
    Overflow,
    Underflow,
}

impl From<CounterError> for ProgramError {
    fn from(e: CounterError) -> Self {
        match e {
            CounterError::Unauthorized => ProgramError::Custom(1),
            CounterError::Overflow => ProgramError::Custom(2),
            CounterError::Underflow => ProgramError::Custom(3),
        }
    }
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if program_id != &crate::ID {
        return Err(ProgramError::IncorrectProgramId);
    }

    let instruction_data = IncrementCounterInstructionData::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    increment_counter(accounts, instruction_data)
}

pub fn increment_counter(
    accounts: &[AccountInfo],
    instruction_data: IncrementCounterInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let mut counter = LightAccount::<'_, CounterAccount>::new_mut(
        &ID,
        &instruction_data.account_meta,
        CounterAccount {
            owner: *signer.key(),
            value: instruction_data.counter_value,
        },
    )?;

    counter.value = counter.value.checked_add(1).ok_or(CounterError::Overflow)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(counter)?
        .invoke(light_cpi_accounts)?;

    Ok(())
}
```
{% endtab %}
{% endtabs %}

### Next steps

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

[^1]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Solana System program
