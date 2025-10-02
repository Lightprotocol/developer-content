---
description: >-
  Complete guide to create compressed accounts in Solana programs with the
  `light-sdk`. Includes a step-by-step guide and full code examples.
hidden: true
---

# How to Create Compressed Accounts

Learn how to create compressed accounts in Solana programs. Find [full code examples of a counter program at the end](how-to-create-compressed-accounts.md#create-account-example) for Anchor, native Rust, and Pinocchio.

{% hint style="success" %}
Your program calls the Light System Program via CPI to create compressed accounts, similar to how programs call the System Program to create regular accounts. \
Learn more on the Compressed Account Model [here](../../learn/core-concepts/compressed-account-model.md).
{% endhint %}

### What you will learn

This guide breaks down 7 implementation steps to create one compressed account:

1. [**Set up dependencies**](how-to-create-compressed-accounts.md#dependencies) for `light-sdk` and serialization library. The `light-sdk` provides abstractions to handle compressed accounts and uses `borsh` to serialize account data.
2. [**Define program constants**](how-to-create-compressed-accounts.md#constants)
3. [**Define the Account Data Structure**](how-to-create-compressed-accounts.md#account-data-structure) for your compressed account.
4. **Define the** [**instruction data**](how-to-create-compressed-accounts.md#define-instruction-data-for-create_compressed_account):
   * Include the validity proof to prove the derived address does not yet exist in the address tree.  Client fetches proof with `getValidityProof()` from RPC provider and passes to program.
   * Specify address and state tree indices where address and compressed account hash are stored.
   * Add custom data to the account .
5. [**Derive an address**](how-to-create-compressed-accounts.md#derive-address) from seeds and address tree public key to set a unique identifier to your compressed account. Adds PDA functionality to your compressed account.
6. [**​Initialize Compressed Account**](how-to-create-compressed-accounts.md#initialize-compressed-account) with `LightAccount::new_init()`. `LightAccount` abstracts data serialization, data hashing and the type conversion for the Light System Program CPI instruction data.
7. [**CPI to Light System Program**](how-to-create-compressed-accounts.md#cpi) to create the compressed account and its address.

### Complete Creation Flow of Compressed Accounts

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
* Add the serialization library (`borsh` for native Rust, or use `AnchorSerialize`).&#x20;
{% endstep %}

{% step %}
### Program Constants

Set program address and derive the CPI authority PDA to call Light System program.

```rust
declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
```

**`CPISigner`**: Configuration struct for CPI's to Light System Program. The CPI to the Light System program must be signed with a PDA derived by your program with the seed `b"authority"` . `derive_light_cpi_signer!` derives this PDA for you at compile time.

{% hint style="info" %}
The Light System uses the PDA and its bump to perform its signer check.
{% endhint %}
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

* `LightAccount` requires `borsh` or `AnchorSerialize` to be implemented. Wraps your custom data in _Step 6,_ when you initialize the account.
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
* `PackedAddressTreeInfo` specifies the index to the address tree account that is used to derive the address with `derive_address()` via CPI to the Light System Program. Must point to the correct address tree `AccountInfo` in `CpiAccounts`.
* `output_state_tree_index` specifies which state tree will store the compressed account.
* `message`: Data to include in the compressed account. This depends on your program logic.

{% hint style="info" %}
**Account indices are used to reduce transaction size.** The client uses the `PackedAccounts`  abstraction to generate indices for `remaining_accounts`. The instruction data references these accounts with `u8` indices instead of full 32 byte pubkeys.
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

* In this example, the `&custom_seeds` array contains program `SEED` and signer pubkey.&#x20;
* `&address_tree_pubkey` is the public key of the address merkle tree account retrieved via `get_tree_pubkey()`. The index passed in the instruction data is not sufficient to derive an address.
* `&program_id`: The program's on-chain address set in constants _(Step 2)_

The parameters return:

* The 32-byte `address` for the created compressed account. Combines `address_seed` + `address_tree_pubkey`. This ensures addresses are unique to both the program and the specific address tree.  An address can not be created again in the same tree.
* A 32-byte `address_seed` the Light System program CPI uses to verify `ValidityProof` and create the address. Combines `program_id` and `SEED`. The `address_seed` is passed to the Light System Program as part of new address params together with additional metadata to verify the `proof` from Step 4.

Check the address tree to ensure global uniqueness of the derived address. Without this check, the same seeds on different address trees produce different addresses. Use this pattern for user profiles, token mints, or singleton configs that require global uniqueness.

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

Initialize the compressed account data structure with the derived address from _Step 5_ and instruction data from _Step 4_.&#x20;

<pre class="language-rust"><code class="lang-rust">let owner = crate::ID;
let mut my_compressed_account 
        = LightAccount::&#x3C;'_, MyCompressedAccount>::new_init(
<strong>    &#x26;owner,
</strong><strong>    Some(address),
</strong><strong>    discriminator,
</strong><strong>    output_state_tree_index,
</strong>)?;

my_compressed_account.name = name;
<strong>my_compressed_account.nested = nested_data;
</strong></code></pre>

The `LightAccount` wraps the custom data (`MyCompressedAccount`) compression metadata (owner, address, discriminator, output\_tree\_index).

**Parameters for `LightAccount::new_init`:**

* The `&owner` of the compressed account is the program that creates it. Only `&owner` can update the compressed account data.
* `Some(address)` is the address assigned to the compressed account (derived in _Step 5_).
* `output_state_tree_index` specifies the state tree that will store the compressed account hash. We use the index passed in the instruction data (_Step 4)_.

**Initialize compressed account data:** This is custom depending on your compressed account struct (_Step 3_). In this example the data is:

* my\_compressed\_account.name = name;
* my\_compressed\_account.nested = nested\_data;
{% endstep %}

{% step %}
### CPI

The CPI creates the compressed account, its address and hash.

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

`CpiAccounts` parses accounts consisten with `PackedAccounts` in the client and convertes them for the Light System Program CPI:

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer
* `ctx.remaining_accounts`: `AccountInfo` slice [with Light System accounts](#user-content-fn-1)[^1].
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Parameters for `CpiInputs::new_with_address()`:**

Initializes CPI instruction data with `proof` from Step 4 to validate address non-inclusion.

* The Light System Program verifies the `proof` against the address tree's Merkle root
* `with_light_account` adds the compressed account data from `LightAccount` to the CPI instruction data.
* `with_new_addresses` adds the address seed and metadata to the CPI instruction data.&#x20;
* `invoke(light_cpi_accounts)` calls the Light System Program with packed accounts.

{% hint style="info" %}
The Light System Program&#x20;

* validates address non-inclusion proof,
* adds the address to the address tree, and
* appends the compressed account hash to the state tree.
{% endhint %}
{% endstep %}

{% step %}
### That's it!
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
For errors see [this page](../../resources/error-cheatsheet/).
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
{% hint style="info" %}
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/native/src/lib.rs#L160).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey;
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiSigner, LightSystemProgramCpiV1},
    derive_light_cpi_signer,
    instruction::{PackedAddressTreeInfo, ValidityProof},
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
pub struct CreateCounterInstructionData {
    pub proof: ValidityProof,
    pub address_tree_info: PackedAddressTreeInfo,
    pub output_state_tree_index: u8,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if program_id != &crate::ID {
        return Err(ProgramError::IncorrectProgramId);
    }

    let instruction_data = CreateCounterInstructionData::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    create_counter(accounts, instruction_data)
}

pub fn create_counter(
    accounts: &[AccountInfo],
    instruction_data: CreateCounterInstructionData,
) -> Result<(), ProgramError> {
    let signer = accounts.first().ok_or(ProgramError::NotEnoughAccountKeys)?;

    let light_cpi_accounts = CpiAccounts::new(signer, &accounts[1..], LIGHT_CPI_SIGNER);

    let (address, address_seed) = derive_address(
        &[b"counter", signer.key.as_ref()],
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
    counter.owner = *signer.key;
    counter.value = 0;

    LightSystemProgramCpiV1::new_cpi(LIGHT_CPI_SIGNER, instruction_data.proof)
        .with_light_account(counter)?
        .with_new_addresses(&[new_address_params])
        .invoke(light_cpi_accounts)?;

    Ok(())
}
```
{% endtab %}

{% tab title="Pinchocchio" %}
{% hint style="info" %}
Find the source code [here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/pinocchio/src/lib.rs#L161).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use borsh::{BorshDeserialize, BorshSerialize};
use light_macros::pubkey_array;
use light_sdk_pinocchio::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer,
    instruction::PackedAddressTreeInfo,
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
pub struct CreateCounterInstructionData {
    pub proof: ValidityProof,
    pub address_tree_info: PackedAddressTreeInfo,
    pub output_state_tree_index: u8,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    if program_id != &crate::ID {
        return Err(ProgramError::IncorrectProgramId);
    }

    let instruction_data = CreateCounterInstructionData::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    create_counter(accounts, instruction_data)
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
    8. System Program - Solana System program
