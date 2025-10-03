---
description: >-
  Complete guide to a Solana program that updates compressed accounts using
  Light SDK and `update_compressed_account()` instruction handler.
hidden: true
---

# How to Update Compressed Accounts

Updating a [compressed account](https://www.zkcompression.com/learn/core-concepts/compressed-account-model) works similar to Bitcoin's UTXO model:&#x20;

* each update consumes an input (old hash) and produces an output (new hash).&#x20;
* The old account is nullified to prevent double spending.&#x20;

Find [full code examples at the end](how-to-update-compressed-accounts.md#full-code-example) for Anchor, native Rust, and Pinocchio.

<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch proof that account exists with `getValidityProof`
   ├─ Build instruction with proof, current data and metadata
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>      ├─ Modify compressed account data (output)
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify and nullify input hash 
         ├─ Create new compressed account hash with updated data (output hash) 
         └─ Complete atomic account update
</code></pre>

{% stepper %}
{% step %}
### Program Setup

<details>

<summary>Dependencies, Program Constant, Account Data Structure</summary>

#### Dependencies

```toml
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
```

* The `light-sdk` provides macros, wrappers and CPI interface to interact with compressed accounts. Builds on top of the Solana SDK.
* Use `borsh` for native Rust, or use `AnchorSerialize` for Anchor programs.

#### Account Data Structure

Define your compressed account struct:

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

**Derives:**

* `LightAccount` requires `borsh` or `AnchorSerialize` to be implemented.
* `LightDiscriminator` gives struct unique type ID (8 bytes) for deserialization. This helps programs distinguish `DataAccount` from other compressed account types.

The `DataAccount` struct defines the data structure of the compressed account.

#### Program Constants

Set program address and derive the CPI authority PDA to call Light System Program.

```rust
declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
```

**`CPISigner`**: Configuration struct for CPIs to Light System Program. The CPI must be signed with a PDA derived by your program with the seed `b"authority"` . `derive_light_cpi_signer!` derives this PDA for you at compile time.

{% hint style="info" %}
The Light System Program uses the PDA and its bump to perform its signer check.
{% endhint %}

</details>
{% endstep %}

{% step %}
### Define Instruction Data

```rust
pub struct InstructionData {
    proof: ValidityProof,
    account_meta: CompressedAccountMeta,
    // Current account data
}
```

**Parameters:**

* For compressed account updates, `ValidityProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).
* `CompressedAccountMeta` identifies the existing compressed account and specifies the output state tree. Contains:
  * `tree_info: PackedStateTreeInfo` specifies indices to the state tree account (leaf index, root index, tree pubkey index).
  * The account's `address`
  * `output_state_tree_index` specifies which state tree will store the updated compressed account hash
* Current account data includes fields from your program's account structure. Used by the program to reconstruct the current account hash for proof verification.

{% hint style="info" %}
**Account indices are used to reduce transaction size.** The client uses the `PackedAccounts` abstraction to generate indices for `remaining_accounts`. The instruction data references these accounts with `u8` indices instead of full 32 byte pubkeys.
{% endhint %}
{% endstep %}

{% step %}
### Load Compressed Account

Load the existing compressed account with:

<pre class="language-rust"><code class="lang-rust">let mut my_compressed_account
        = LightAccount::&#x3C;'_, MyCompressedAccount>::new_mut(
<strong>    &#x26;crate::ID,
</strong><strong>    &#x26;account_meta,
</strong><strong>    MyCompressedAccount {
</strong><strong>        owner: *signer.key,
</strong><strong>        message: current_message,
</strong><strong>    },
</strong>)?;
<strong>my_compressed_account.message = new_message;
</strong></code></pre>

**Parameters for `LightAccount::new_mut()`:**

* `&crate::ID`: The program that owns this compressed account.
* `&account_meta` identifies which existing compressed account to update and specifies the output state tree. Contains the `CompressedAccountMeta` from instruction data (_Step 4_).
* `MyCompressedAccount` contains the current account data defined in _Step 4_ as input. The input state is hashed and used for verification against the current on-chain state.

**Here's where you update account data** based on your program's instruction handler. In this example its `my_compressed_account.message`.

{% hint style="info" %}
In this step, `new_mut()` hashes the input state immediately for proof verification and produces output state. Output state is hashed during the CPI by the Light System Program in the next step.
{% endhint %}
{% endstep %}

{% step %}
### Light System Program CPI

The CPI nullifies the old and creates an updated compressed account hash.

Invoke the Light System program with:

1. `proof` from _Step 4_ _Instruction Data for `update_compressed_account`_, and
2. the updated data in `my_compressed_account` from _Step 5_ _Load Compressed Account_.

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

LightSystemProgramCpiV1::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Parameters for `CpiAccounts::new()`:**

`CpiAccounts` parses accounts consistent with `PackedAccounts` in the client and converts them for the Light System Program CPI:

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer
* `ctx.remaining_accounts`: `AccountInfo` slice [with Light System accounts](#user-content-fn-1)[^1]
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants

**CPI flow:**

* `LightSystemProgramCpiV1::new_cpi()` initializes CPI with `proof` from Step 4 to validate inclusion of the existing compressed account
* `with_light_account()` adds the modified compressed account (input and output states) to the CPI instruction data
* `invoke()` calls the Light System Program with packed accounts

{% hint style="info" %}
The Light System Program:

* Validates the inclusion proof (account exists in state tree)
* Nullifies the old account hash in the state tree (input)
* Appends the updated account hash to the state tree (output)
{% endhint %}
{% endstep %}
{% endstepper %}

## Full Code Example

Now that you understand the concepts to update a compressed account, start building with the counter program below.

Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.

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
`declare_id!` and `#[program]` follow [standard anchor](https://www.anchor-lang.com/docs/basics/program-structure) patterns.
{% endhint %}

Find the source code for this example [here](https://github.com/Lightprotocol/program-examples/blob/dc0f79a0542c4e4370652bafa0be2d481e30a952/counter/anchor/programs/counter/src/lib.rs#L73).

```rust
#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::{prelude::*, AnchorDeserialize, Discriminator};
use light_sdk::{
    account::LightAccount,
    cpi::{CpiAccounts, CpiSigner},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMeta, ValidityProof},
    LightDiscriminator, LightHasher,
};

declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

#[program]
pub mod counter {

    use super::*;
    use light_sdk::cpi::{InvokeLightSystemProgram, LightCpiInstruction, LightSystemProgramCpiV1};

    pub fn increment_counter<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        counter_value: u64,
        account_meta: CompressedAccountMeta,
    ) -> Result<()> {
        // LightAccount::new_mut will create an account with input state and output state.
        // The input state is hashed immediately when calling new_mut().
        // Modifying the account will modify the output state that when converted to_account_info()
        // is hashed with poseidon hashes, serialized with borsh
        // and created with invoke_light_system_program by invoking the light-system-program.
        // The hashing scheme is the account structure derived with LightHasher.
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

        LightSystemProgramCpiV1::new_cpi(LIGHT_CPI_SIGNER, proof)
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
#[derive(Clone, Debug, Default, LightDiscriminator, LightHasher)]
pub struct CounterAccount {
    #[hash]
    pub owner: Pubkey,
    pub value: u64,
}
```
{% endtab %}

{% tab title="Native" %}
{% hint style="info" %}
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/dc0f79a0542c4e4370652bafa0be2d481e30a952/counter/native/src/lib.rs#L200).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey;
use light_sdk::{
    account::LightAccount,
    cpi::{CpiAccounts, CpiSigner, LightSystemProgramCpiV1},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMeta, ValidityProof},
    LightDiscriminator, LightHasher,
};
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

entrypoint!(process_instruction);

#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator, LightHasher)]
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
            owner: *signer.key,
            value: instruction_data.counter_value,
        },
    )?;

    counter.value = counter.value.checked_add(1).ok_or(CounterError::Overflow)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    LightSystemProgramCpiV1::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(counter)?
        .invoke(light_cpi_accounts)?;

    Ok(())
}
```
{% endtab %}

{% tab title="Pinocchio" %}
{% hint style="info" %}
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/dc0f79a0542c4e4370652bafa0be2d481e30a952/counter/pinocchio/src/lib.rs#L202).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey_array;
use light_sdk_pinocchio::{
    account::LightAccount,
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer,
    instruction::account_meta::CompressedAccountMeta,
    LightDiscriminator, LightHasher, ValidityProof,
};
use pinocchio::{
    account_info::AccountInfo,
    entrypoint,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub const ID: Pubkey = pubkey_array!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

entrypoint!(process_instruction);

#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator, LightHasher)]
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
    )
    .map_err(ProgramError::from)?;

    counter.value = counter.value.checked_add(1).ok_or(CounterError::Overflow)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let cpi_inputs = CpiInputs::new(
        instruction_data.proof,
        vec![counter.to_account_info().map_err(ProgramError::from)?],
    );
    cpi_inputs
        .invoke_light_system_program(light_cpi_accounts)
        .map_err(ProgramError::from)?;

    Ok(())
}
```
{% endtab %}
{% endtabs %}

### Next steps

{% content-ref url="how-to-close-compressed-accounts.md" %}
[how-to-close-compressed-accounts.md](how-to-close-compressed-accounts.md)
{% endcontent-ref %}

[^1]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Solana System program
