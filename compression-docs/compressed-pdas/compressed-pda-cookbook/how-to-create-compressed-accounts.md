---
description: >-
  Complete guide to create compressed accounts in Solana programs with the
  light-sdk crate. Includes a step-by-step guide and full code examples.
hidden: true
---

# How to Create Compressed Accounts

Compressed accounts and addresses are created via CPI to the Light System Program.

Compressed accounts are identified by its address (optional) and account hash. The account hash is not persistent and changes with every write to the account.

* For Solana PDA like behavior your compressed account needs an address as persistent identifier.
* For example compressed token accounts do not need addresses. Learn [how to create compressed token accounts here](../../compressed-tokens/cookbook/how-to-create-compressed-token-accounts.md).

{% hint style="success" %}
Find [full code examples of a counter program at the end](how-to-create-compressed-accounts.md#full-code-example) for Anchor, native Rust, and Pinocchio.
{% endhint %}

{% tabs %}
{% tab title="Create Compressed Account Complete Flow" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Derive unique compressed account address
   ├─ Fetch validity proof (proves that address doesn't exist)
   ├─ Pack accounts and build instruction
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Derive and check address
</strong><strong>      ├─ Initialize compressed account
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify validity proof (non-inclusion)
         ├─ Create address (address tree)
         ├─ Create compressed account (state tree)
         └─ Complete atomic account creation
</code></pre>
{% endtab %}
{% endtabs %}

{% stepper %}
{% step %}
### Dependencies

Add dependencies to your program.

{% tabs %}
{% tab title="Anchor" %}
```toml
[dependencies]
light-sdk = "0.13.0"
anchor_lang = "0.31.1"
```
{% endtab %}

{% tab title="Native Rust" %}
```toml
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
solana-program   = "2.2"
```
{% endtab %}

{% tab title="Pinocchio" %}
```toml
[dependencies]
light-sdk-pinocchio = "0.13.0"
borsh = "0.10.0"
pinocchio = "0.9
```
{% endtab %}
{% endtabs %}

* The `light-sdk` provides macros, wrappers and CPI interface to create and interact with compressed accounts.&#x20;
* Add the serialization library (`borsh` for native Rust, or use `AnchorSerialize`).&#x20;
{% endstep %}

{% step %}
### Constants

Set program address and derive the CPI authority PDA to call the Light System program.

```rust
declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
```

**`CPISigner`** is the configuration struct for CPI's to the Light System Program.&#x20;

* CPI to the Light System program must be signed with a PDA derived by your program with the seed `b"authority"`&#x20;
* `derive_light_cpi_signer!` derives the CPI signer PDA for you at compile time.
{% endstep %}

{% step %}
### Compressed Account

Define your compressed account struct.&#x20;

{% tabs %}
{% tab title="Anchor" %}
```rust
#[derive(
    Clone, 
    Debug, 
    Default, 
    AnchorSerialize,
    AnchorDeserialize,
    LightDiscriminator
)]
pub struct DataAccount {
    pub owner: Pubkey,
    pub message: String,
}
```
{% endtab %}

{% tab title="Native Rust/ Pinocchio" %}
```rust
#[derive(
    Clone, 
    Debug, 
    Default, 
    BorshSerialize,
    BorshDeserialize,
    LightDiscriminator
)]
pub struct DataAccount {
    pub owner: Pubkey,
    pub message: String,
}
```
{% endtab %}
{% endtabs %}

These traits are derived besides the standard traits (`Clone`, `Debug`, `Default`):

* `borsh` or `AnchorSerialize` to serialize account data.
* `LightDiscriminator` implements a unique type ID (8 bytes) to distinguish account types. The default compressed account layout enforces a discriminator in its _own field_, [not the first 8 bytes of the data field](#user-content-fn-1)[^1].

{% hint style="info" %}
The traits listed above are required for `LightAccount`. `LightAccount` wraps `DataAccount` in Step 7 to set the discriminator and create the compressed account's data.
{% endhint %}
{% endstep %}

{% step %}
### Instruction Data

Define the instruction data with the following parameters:

```rust
pub struct InstructionData {
    proof: ValidityProof,
    address_tree_info: PackedAddressTreeInfo,
    output_state_tree_index: u8,
    message: String,
}
```

1. **Non-inclusion Proof**

* `ValidityProof` proves that an address does not exist yet in the specified address tree (non-inclusion).  Clients fetch proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify Merkle trees to store address and account hash**

* `PackedAddressTreeInfo` specifies the index to the address tree account that is used to derive the address in _Step 5_. The index must point to the correct address tree `AccountInfo` in `CpiAccounts`.
* `output_state_tree_index` points to the state tree `AccountInfo` that will store the compressed account hash.

3. **Custom account data**

* `message` defines data to include in the compressed account. This depends on your program logic.

{% hint style="info" %}
Packed structs like `PackedAddressTreeInfo` use indices to point to `remaining_accounts` to reduce transaction size. The instruction data references these accounts with `u8` indices instead of full 32 byte pubkeys.
{% endhint %}
{% endstep %}

{% step %}
### Derive Address

Derive the address as persistent unique identifier for the compressed account.

<pre class="language-rust"><code class="lang-rust">let address_merkle_tree_pubkey =
    address_tree_info.get_tree_pubkey(&#x26;light_cpi_accounts)?;
    
let custom_seeds = [SEED, ctx.accounts.signer.key().as_ref()];

let program_id = crate::ID;
<strong>let (address, address_seed) = derive_address(
</strong><strong>    &#x26;custom_seeds,
</strong><strong>    &#x26;address_tree_pubkey,
</strong><strong>    &#x26;program_id, 
</strong><strong>);
</strong></code></pre>

**Parameters for `derive_address`:**

* In this example, the `&custom_seeds` array contains `SEED` and signer pubkey.&#x20;
* `&address_tree_pubkey` is the public key of the address Merkle tree account retrieved via `get_tree_pubkey()`.
* `&program_id`: The program's on-chain address set in constants _(Step 2)._

{% hint style="info" %}
The address is created via CPI to the Light System Program in _Step 8_.
{% endhint %}

The parameters return:

* The `address`, derived with `address_seed` + `address_tree_pubkey`.
* The `address_seed`, which is passed to the Light System Program to create the address (_Step 8)_.
{% endstep %}

{% step %}
### Address Tree Check

Verify that the address tree pubkey matches the program's tree constant to ensure global uniqueness of an address.

{% hint style="info" %}
Every address is unique, but the same seeds can be used to create different addresses in different address trees. To enforce that a compressed PDA can only be created once with the same seed, you must check the address tree pubkey.
{% endhint %}

```rust
pub const ALLOWED_ADDRESS_TREE: Pubkey = pubkey!("amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2");

let address_tree = light_cpi_accounts.tree_pubkeys().unwrap()
    [address_tree_info.address_merkle_tree_pubkey_index as usize];

if address_tree != ALLOWED_ADDRESS_TREE { 
    return Err(ProgramError::InvalidAccountData.into());
}
```
{% endstep %}

{% step %}
### Initialize Compressed Account

Initialize the compressed account struct with `LightAccount::new_init()`. `new_init()` creates a `LightAccount` instance similar to anchor `Account` and lets your program define the initial account data.

<pre class="language-rust"><code class="lang-rust">let owner = crate::ID;
let mut my_compressed_account 
        = LightAccount::&#x3C;'_, DataAccount>::new_init(
<strong>    &#x26;owner,
</strong><strong>    Some(address),
</strong><strong>    output_state_tree_index,
</strong>)?;

<strong>my_compressed_account.owner = ctx.accounts.signer.key();
</strong><strong>my_compressed_account.data = data.to_string();
</strong></code></pre>

Parameters for `LightAccount::new_init()`: &#x20;

* `owner` specifies the program's ID that owns the compressed account.
* The `address` assigned to the compressed account (derived in _Step 5_).
* `output_state_tree_index` points to the state tree `AccountInfo` that will store the compressed account hash. We use the index passed in the instruction data (_Step 4)_.

After initialization, set custom account fields defined in your compressed account struct in `DataAccount` (_Step 3_). In this example:

* `my_compressed_account.owner` is set to the signer's pubkey
* `my_compressed_account.data` is set to custom string.
{% endstep %}

{% step %}
### Light System Program CPI

The Light System Program CPI creates the compressed account and its address.

{% hint style="info" %}
The Light System Program&#x20;

* verifies the `proof` against the address tree's Merkle root,
* adds the address to the address tree, and
* appends the compressed account hash to the state tree.
{% endhint %}

Build the CPI instruction with&#x20;

1. `proof` from _Instruction Data_,
2. `address_seed` from [_Step 5_](how-to-create-compressed-accounts.md#derive-address) _Derive Address_, and
3. `my_compressed_account` from [_Step 7_](how-to-create-compressed-accounts.md#initialize-compressed-account) _Initialize Compressed Account_.

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .with_new_addresses(&[
        address_tree_info.into_new_address_params_packed(address_seed)
    ])
    .invoke(light_cpi_accounts)?;
```

**Set up `CpiAccounts::new()`:**

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer
* `ctx.remaining_accounts`: `AccountInfo` slice [with Light System and packed tree accounts](#user-content-fn-2)[^2].
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Build the CPI instruction**:

* `new_cpi()` initializes the CPI instruction with the `proof` to prove  that an address does not exist yet in the specified address tree (non-inclusion) _- defined in the Instruction Data (Step 4)._
* `with_light_account` adds `LightAccount` with the initial compressed account data from  to the CPI instruction _- defined in Step 7_.
* `with_new_addresses` adds the `address_seed` (_Step 5_) and metadata to the CPI instruction data
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts.`
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.&#x20;

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](../../resources/error-cheatsheet/).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
Find the [source code for this example ](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/native/src/lib.rs#L160)[here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/native/src/lib.rs#L160).
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

    pub fn create_counter<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        address_tree_info: PackedAddressTreeInfo,
        output_state_tree_index: u8,
    ) -> Result<()> {
        // LightAccount::new_init will create an account with empty output state (no input state).
        // Modifying the account will modify the output state that when converted to_account_info()
        // is hashed with SHA256, serialized with borsh
        // and created with invoke_light_system_program by invoking the light-system-program.
        // The hashing scheme is the account structure derived with LightHasher.
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            crate::LIGHT_CPI_SIGNER,
        );

        let (address, address_seed) = derive_address(
            &[b"counter", ctx.accounts.signer.key().as_ref()],
            &address_tree_info
                .get_tree_pubkey(&light_cpi_accounts)
                .map_err(|_| ErrorCode::AccountNotEnoughKeys)?,
            &crate::ID,
        );

        let new_address_params = address_tree_info.into_new_address_params_packed(address_seed);

        let mut counter = LightAccount::<'_, CounterAccount>::new_init(
            &crate::ID,
            Some(address),
            output_state_tree_index,
        );

        counter.owner = ctx.accounts.signer.key();
        counter.value = 0;

        LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
            .with_light_account(counter)?
            .with_new_addresses(&[new_address_params])
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
    #[hash]
    pub owner: Pubkey,
    pub value: u64,
}
```
{% endtab %}

{% tab title="Native" %}
{% hint style="info" %}
Find the [source code for this example here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/native/src/lib.rs#L160).
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
    CreateCounter = 0,
}

impl TryFrom<u8> for InstructionType {
    type Error = LightSdkError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(InstructionType::CreateCounter),
        }
    }
}

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator,
)]
pub struct CounterAccount {
    #[hash]
    pub owner: Pubkey,
    pub value: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CreateCounterInstructionData {
    pub proof: ValidityProof,
    pub address_tree_info: PackedAddressTreeInfo,
    pub output_state_tree_index: u8,
}

#[derive(Debug, Clone)]
pub enum CounterError {
    Unauthorized,
    Overflow,
    Underflow,
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
        InstructionType::CreateCounter => {
            let instuction_data =
                CreateCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            create_counter(accounts, instuction_data)
        }
    }
}

pub fn create_counter(
    accounts: &[AccountInfo],
    instuction_data: CreateCounterInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let (address, address_seed) = derive_address(
        &[b"counter", signer.key.as_ref()],
        &instuction_data
            .address_tree_info
            .get_tree_pubkey(&light_cpi_accounts)
            .map_err(|_| ProgramError::NotEnoughAccountKeys)?,
        &ID,
    );

    let new_address_params = instuction_data
        .address_tree_info
        .into_new_address_params_packed(address_seed);

    let mut counter = LightAccount::<'_, CounterAccount>::new_init(
        &ID,
        Some(address),
        instuction_data.output_state_tree_index,
    );
    counter.owner = *signer.key;
    counter.value = 0;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instuction_data.proof)
        .with_light_account(counter)?
        .with_new_addresses(&[new_address_params])
        .invoke(light_cpi_accounts)?;

    Ok(())
}

```
{% endtab %}

{% tab title="Pinchocchio" %}
{% hint style="info" %}
Find the [source code for this example here](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/pinocchio/src/lib.rs#L161).
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
    CreateCounter = 0,
    IncrementCounter = 1,
    DecrementCounter = 2,
    ResetCounter = 3,
    CloseCounter = 4,
}

impl TryFrom<u8> for InstructionType {
    type Error = LightSdkError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(InstructionType::CreateCounter),
            1 => Ok(InstructionType::IncrementCounter),
            2 => Ok(InstructionType::DecrementCounter),
            3 => Ok(InstructionType::ResetCounter),
            4 => Ok(InstructionType::CloseCounter),
            _ => panic!("Invalid instruction discriminator."),
        }
    }
}

#[derive(
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator,
)]
pub struct CounterAccount {
    #[hash]
    pub owner: Pubkey,
    pub value: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CreateCounterInstructionData {
    pub proof: ValidityProof,
    pub address_tree_info: PackedAddressTreeInfo,
    pub output_state_tree_index: u8,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct IncrementCounterInstructionData {
    pub proof: ValidityProof,
    pub counter_value: u64,
    pub account_meta: CompressedAccountMeta,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct DecrementCounterInstructionData {
    pub proof: ValidityProof,
    pub counter_value: u64,
    pub account_meta: CompressedAccountMeta,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct ResetCounterInstructionData {
    pub proof: ValidityProof,
    pub counter_value: u64,
    pub account_meta: CompressedAccountMeta,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CloseCounterInstructionData {
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
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }

    let discriminator = InstructionType::try_from(instruction_data[0])
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match discriminator {
        InstructionType::CreateCounter => {
            let instruction_data =
                CreateCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            create_counter(accounts, instruction_data)
        }
    }
}

pub fn create_counter(
    accounts: &[AccountInfo],
    instruction_data: CreateCounterInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let (address, address_seed) = derive_address(
        &[b"counter", signer.key().as_ref()],
        &instruction_data
            .address_tree_info
            .get_tree_pubkey(&light_cpi_accounts)
            .map_err(|_| ProgramError::NotEnoughAccountKeys)?,
        &ID,
    );

    let new_address_params = instruction_data
        .address_tree_info
        .into_new_address_params_packed(address_seed);

    let mut counter = LightAccount::<'_, CounterAccount>::new_init(
        &ID,
        Some(address),
        instruction_data.output_state_tree_index,
    );

    counter.owner = *signer.key();
    counter.value = 0;

    LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(counter)?
        .with_new_addresses(&[new_address_params])
        .invoke(light_cpi_accounts)?;

    Ok(())
}

```
{% endtab %}
{% endtabs %}

## Next steps

{% columns %}
{% column %}
{% content-ref url="../client-library/" %}
[client-library](../client-library/)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="how-to-update-compressed-accounts.md" %}
[how-to-update-compressed-accounts.md](how-to-update-compressed-accounts.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}

[^1]: The [Anchor](https://www.anchor-lang.com/) framework reserves the first 8 bytes of a _regular account's data field_ for the discriminator.

[^2]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Solana System program
