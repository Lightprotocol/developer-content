---
description: >-
  Complete guide to create compressed accounts in Solana programs with the
  `light-sdk`. Includes a step-by-step guide and full code examples.
hidden: true
---

# How to Create Compressed Accounts

Learn how to create compressed accounts in Solana programs. Find [full code examples at the end](how-to-create-compressed-accounts.md#create-account-example) for Anchor, native Rust, and Pinocchio.

### Overview to Compressed Accounts

Solana programs can use compressed accounts to store data without paying for rent-exemption. To store data in a compressed account, the data is hashed and committed to a state Merkle tree

* Compressed accounts and addressess are created via CPI to the Light System Program.&#x20;

Compressed accounts provide the same functionality as Solana accounts. Key differences are how accounts are identified and stored:

* Each compressed account can be identified by its hash.
* Each write to a compressed account changes its hash
* All compressed accounts are stored in the leaf of state Merkle trees.
* An address can optionally be set as persistent unique identifier. Addresses are stored in separate address Merkle trees.

{% hint style="success" %}
Your program calls the Light System Program via CPI to create compressed accounts, similar to how programs call the System Program to create regular accounts. \
Learn more on the Compressed Account Model [here](../../learn/core-concepts/compressed-account-model.md).
{% endhint %}

### What you will learn

This guide breaks down 7 implementation steps to create one compressed account:

1. [**Set up dependencies**](how-to-create-compressed-accounts.md#dependencies) for `light-sdk` and serialization library. The `light-sdk` provides macros, account wrapper and CPI interface to interact with compressed accounts.
2. [**Define program constants**](how-to-create-compressed-accounts.md#constants)
3. [**Define the Account Data Structure**](how-to-create-compressed-accounts.md#account-data-structure) for your compressed account.
4. **Define the** [**instruction data**](how-to-create-compressed-accounts.md#define-instruction-data-for-create_compressed_account):
   * Include validity proof to prove the derived address does not yet exist in the address tree. Client fetches proof with `getValidityProof()` from RPC provider and passes to program.
   * Specify address and state tree indices where address and compressed account hash are stored.
   * Add custom data to  account's custom data.
5. [**Derive an address**](how-to-create-compressed-accounts.md#derive-address) from seeds and address tree public key to set a unique identifier to your compressed account. Adds PDA functionality to your compressed account.
6. [**​Initialize Compressed Account**](how-to-create-compressed-accounts.md#initialize-compressed-account) with `LightAccount::new_init()` to wrap its data structure and metadata. `LightAccount` abstracts serialization and hashing for the CPI.
7. Create the compressed account via [**CPI to Light System Program**](how-to-create-compressed-accounts.md#cpi).

<details>

<summary>Complete Create Compressed Account Flow (Client -> Program -> CPI)</summary>

<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Derive unique address for the compressed account
   ├─ Fetch proof that address doesn't exist yet with `getValidityProof()`
   ├─ Prepare address and state tree accounts for the transaction
   ├─ Build instruction with proof and account data
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Re-derive the address
</strong><strong>      ├─ Parse address and state tree accounts from transaction
</strong><strong>      ├─ Initialize compressed account with data and metadata
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify address non-existence proof
         ├─ Register address in address merkle tree
         ├─ Create compressed account hash in state merkle tree
         └─ Complete atomic account creation
</code></pre>

</details>

## Get Started

{% stepper %}
{% step %}
### Dependencies

Add dependencies to your program.

```toml
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
```

* The `light-sdk` provides macros, wrappers and CPI interface to interact with compressed accounts. Builds on top of the Solana SDK.
* Add the serialization library (`borsh` for native Rust, or Anchor's built-in serialization).&#x20;
{% endstep %}

{% step %}
### Constants

Set program address and CPI authority to call Light System program.

```rust
declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
```

**`Program_ID`**: The on-chain address of your program to derive address.

**`CPISigner`**: Configuration struct for CPI's to Light System Program. Contains your program ID, the CPI authority PDA derived with `derive_light_cpi_signer!`, and PDA bump.
{% endstep %}

{% step %}
### Account Data Structure

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

* For serialization use `BorshSerialize`/ `BorshDeserialize`, or `AnchorSerialize`/ `AnchorDeserialize` for Anchor programs
* `LightDiscriminator` gives struct unique type ID (8 bytes) for deserialization. This helps programs distinguish `DataAccount` from other compressed account types.

The `DataAccount` struct defines the data structure of the compressed account you will create.
{% endstep %}

{% step %}
### Define Instruction Data for `create_compressed_account`

```rust
pub struct InstructionData {
    proof: ValidityProof,
    address_tree_info: PackedAddressTreeInfo,
    output_state_tree_index: u8,
    message: String,
}
```

**Parameters:**

* For compressed account creation, `ValidityProof` proves that an address does not exist yet in the specified address tree (non-inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).
* `PackedAddressTreeInfo` specifies the index to the address tree account that is used to derive the adress with `derive_address()` via CPI to the Light System Program. Must point to valid `AccountInfo` in `CpiAccounts`.
* `output_state_tree_index` specifies which state tree will store the compressed account hash.
* `message`: Data to include in the compressed account. This depends on your program logic. Used as seed for `derive_address()`.

{% hint style="info" %}
**Account indices are used to reduce transaction size.** The client packs accounts once to `accounts` (`remaining_accounts` for Anchor programs). The instruction data references these accounts with `u8` indices instead of full 32 byte pubkeys.
{% endhint %}
{% endstep %}

{% step %}
### Derive Address

Derive the address as persistent unique identifier for the compressed account.

{% hint style="info" %}
By default, addresses are optional for compressed accounts. The account hash is an additional unique identifier but changes with every write to the account.

* For Solana PDA like behavior your compressed account needs an address as persistent identifier.
* For example compressed token accounts do not need addresses. Learn how to create compressed token accounts [here](../../compressed-tokens/cookbook/how-to-create-compressed-token-accounts.md).
{% endhint %}

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

**Parameters:**

* `&custom_seeds`: Array with program `SEED` and signer pubkey.&#x20;
* `&address_tree_pubkey` is the public key of the address merkle tree account retrieved via `get_tree_pubkey()`. The index passed in the instruction data is not sufficient to derive an address.
* `&program_id`: The program's on-chain address set in constants _(Step 2)_

The parameters return:

* The 32-byte `address` for the created compressed account. Combines `address_seed` + `address_tree_pubkey`. This ensures addresses are unique to\
  both the program and the specific address tree.
* A 32-byte `address_seed` the Light System program CPI uses to verify `ValidityProof` and create the address. Combines `program_id` and `SEED`. The `address_seed` is passed to the Light System Program as part of new address params together with additional metadata to verify the `proof` from Step 4.

Your program can require global uniqueness of the derived address. In that case the address tree needs to be checked:

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

Initialize the compressed account data structure with the derived address from _Step 5_.

<pre class="language-rust"><code class="lang-rust">let owner = crate::ID;
let mut my_compressed_account 
        = LightAccount::&#x3C;'_, MyCompressedAccount>::new_init(
<strong>    &#x26;owner,
</strong><strong>    Some(address),
</strong><strong>    discriminator,
</strong><strong>    output_state_tree_index,
</strong>)?;

<strong>my_compressed_account.name = name;
</strong><strong>my_compressed_account.nested = nested_data;
</strong></code></pre>

The `LightAccount` wraps the custom data (name, nested\_data) and compression metadata (owner, address, discriminator, output\_tree\_index).

<details>

<summary>What `LightAccount` abstracts for you</summary>

`LightAccount` handles all of this automatically with the CPI:

```rust
// 1. Create your data structure
let data = MyCompressedAccount { name, nested };

// 2. Serialize to bytes
let serialized = data.try_to_vec()?;

// 3. Hash the serialized data
let data_hash = sha256(serialized)?;

// 4. Compute discriminator
let discriminator = compute_discriminator("MyCompressedAccount");

// 5. Build compressed account info
let compressed_account_info = CompressedAccountInfo {
    data_hash,
    owner: crate::ID,
    address: Some(address),
    discriminator,
    lamports: 0,
    output: Some(OutAccountInfo {
        output_merkle_tree_index: output_state_tree_index,
        discriminator,
        ..Default::default()
    }),
    input: None,
};

// 6. Manually construct CPI inputs
let cpi_inputs = CpiInputs {
    proof,
    compressed_accounts: vec![compressed_account_info],
    new_address_params: vec![NewAddressParams {
        address_seed,
        address_merkle_tree_pubkey_index: address_tree_info.address_merkle_tree_pubkey_index,
        address_queue_pubkey_index: address_tree_info.address_queue_pubkey_index,
        address_merkle_tree_root_index: 0,
    }],
    ..Default::default()
};

// 7. Invoke Light System Program
invoke_cpi(cpi_inputs, light_cpi_accounts)?;
```

</details>

**Parameters for `LightAccount::new_init`:**

* The `&owner` of the compressed account is the program that creates it. The Light System Program checks that only the `&owner` can update the compressed account data.
* `Some(address)` is the address assigned to the compressed account (derived in _Step 5_).
* `output_state_tree_index` specifies the state tree that will store the compressed account hash. We use the index passed in the instruction data (_Step 4)_.

**Initialize compressed account data:** This is custom depending on your compressed account struct (_Step 3_). In this example the data is:

* my\_compressed\_account.name = name;
* my\_compressed\_account.nested = nested\_data;
{% endstep %}

{% step %}
### CPI

Here is where the compressed account, its address and hash are created.

Invoke the Light System program with&#x20;

1. `proof` from [_Step 4_](how-to-create-compressed-accounts.md#define-instruction-data-for-create_compressed_account) _Instruction Data for `create_compressed_account`_,
2. `address_seed` from [_Step 5_](how-to-create-compressed-accounts.md#derive-address) _Derive Address_, and
3. `my_compressed_account` from [_Step 6_](how-to-create-compressed-accounts.md#initialize-compressed-account) _Initialize Compressed Account_.

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

**Parameters for `CpiAccounts::new()`:**

This struct organizes all accounts needed for the Light System Program CPI:

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer
* `ctx.remaining_accounts`: `AccountInfo` slice [with Light System program and merkle tree accounts](#user-content-fn-1)[^1].
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Parameters for `CpiInputs::new_with_address()`:**

Initializes CPI instruction data with `proof` from Step 4 to validate address non-inclusion.

* The Light System Program verifies the `proof` against the address tree's Merkle root
* `with_light_account` adds the instruction data from `LightAccount` to the CPI inputs.
* `with_new_addresses` registers new address in address tree with `address_seed` from _Step 3 `derive_address()`_. Light System Program also validates address non-inclusion proof using `address_seed`.
* `invoke(light_cpi_accounts)` calls the Light System Program with packed accounts.
{% endstep %}

{% step %}
### That's it!

With successful CPI, the Light System Program creates your compressed account and

* adds the address to the address tree
* appends the compressed account hash to the state tree.
{% endstep %}
{% endstepper %}

## Full Code Example

Now that you understand the concepts to create a compressed account, start building with the create account example below.

Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.&#x20;

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% hint style="warning" %}
For errors see [this page](../../resources/errors/).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
`declare_id!` and `#[program]` follow [standard anchor](https://www.anchor-lang.com/docs/basics/program-structure) patterns.
{% endhint %}

Find the source code for this example [here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/anchor/programs/counter/src/lib.rs#L25).

```rust
#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::{prelude::*, AnchorDeserialize, Discriminator};
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiSigner},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator, LightHasher,
};

declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

#[program]
pub mod counter {

    use super::*;
    use light_sdk::cpi::{InvokeLightSystemProgram, LightCpiInstruction, LightSystemProgramCpiV1};

    pub fn create_counter<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        address_tree_info: PackedAddressTreeInfo,
        output_state_tree_index: u8,
    ) -> Result<()> {
        // LightAccount::new_init will create an account with empty output state (no input state).
        // Modifying the account will modify the output state that when converted to_account_info()
        // is hashed with poseidon hashes, serialized with borsh
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

        LightSystemProgramCpiV1::new_cpi(LIGHT_CPI_SIGNER, proof)
            .with_light_account(counter)?
            .with_new_addresses(&[new_address_params])
            .invoke(light_cpi_accounts)?;

        Ok(())
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
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/native/src/lib.rs#L160).

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey;
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{
        CpiAccounts, 
        CpiSigner, 
        InvokeLightSystemProgram, 
        LightCpiInstruction,
        LightSystemProgramCpiV1,
    },
    derive_light_cpi_signer,
    error::LightSdkError,
    instruction::{account_meta::
        CompressedAccountMeta, 
        PackedAddressTreeInfo, 
        ValidityProof},
    LightDiscriminator, 
    LightHasher,
};
use solana_program::{
    account_info::AccountInfo, entrypoint, 
    program_error::ProgramError, 
    pubkey::Pubkey,
};
pub const ID: Pubkey 
    = pubkey!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
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
            _ => panic!("Invalid instruction discriminator."),
        }
    }
}

#[derive(
    Debug, 
    Default, 
    Clone, 
    BorshSerialize, 
    BorshDeserialize, 
    LightDiscriminator, 
    LightHasher,
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

    LightSystemProgramCpiV1::new_cpi(LIGHT_CPI_SIGNER, instuction_data.proof)
        .with_light_account(counter)?
        .with_new_addresses(&[new_address_params])
        .invoke(light_cpi_accounts)?;

    Ok(())
}
```
{% endtab %}

{% tab title="Pinchocchio" %}
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/pinocchio/src/lib.rs#L161).

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey_array;
use light_sdk_pinocchio::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer,
    error::LightSdkError,
    instruction::{
        account_meta::{CompressedAccountMeta, CompressedAccountMetaClose},
        PackedAddressTreeInfo,
    },
    LightDiscriminator, LightHasher, ValidityProof,
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
    Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator, LightHasher,
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
    pub account_meta: CompressedAccountMetaClose,
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
        InstructionType::IncrementCounter => {
            let instruction_data =
                IncrementCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            increment_counter(accounts, instruction_data)
        }
        InstructionType::DecrementCounter => {
            let instruction_data =
                DecrementCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            decrement_counter(accounts, instruction_data)
        }
        InstructionType::ResetCounter => {
            let instruction_data =
                ResetCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            reset_counter(accounts, instruction_data)
        }
        InstructionType::CloseCounter => {
            let instruction_data =
                CloseCounterInstructionData::try_from_slice(&instruction_data[1..])
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
            close_counter(accounts, instruction_data)
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

    let cpi = CpiInputs::new_with_address(
        instruction_data.proof,
        vec![counter.to_account_info().map_err(ProgramError::from)?],
        vec![new_address_params],
    );
    cpi.invoke_light_system_program(light_cpi_accounts)
        .map_err(ProgramError::from)?;

    Ok(())
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

pub fn decrement_counter(
    accounts: &[AccountInfo],
    instruction_data: DecrementCounterInstructionData,
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

    counter.value = counter
        .value
        .checked_sub(1)
        .ok_or(CounterError::Underflow)?;

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

pub fn reset_counter(
    accounts: &[AccountInfo],
    instruction_data: ResetCounterInstructionData,
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

    counter.value = 0;

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
    )
    .map_err(ProgramError::from)?;

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

## Next steps

{% content-ref url="how-to-update-compressed-accounts.md" %}
[how-to-update-compressed-accounts.md](how-to-update-compressed-accounts.md)
{% endcontent-ref %}

[^1]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Standard Solana System program
