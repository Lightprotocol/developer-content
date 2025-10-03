---
description: >-
  Complete guide to create compressed accounts in Solana programs with the
  light-sdk. Includes a step-by-step guide and full code examples.
hidden: true
---

# How to Create Compressed Accounts

Compressed accounts and addresses are created via CPI to the Light System Program.&#x20;

Find [full code examples of a counter program at the end](how-to-create-compressed-accounts.md#create-account-example) for Anchor, native Rust, and Pinocchio.

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
```
{% endtab %}

{% tab title="Pinocchio" %}
```toml
[dependencies]
light-sdk-pinocchio = "0.13.0"
borsh = "0.10.0"
pinocchio = "0.8.4
```
{% endtab %}
{% endtabs %}

* The `light-sdk` provides macros, wrappers and CPI interface to interact with compressed accounts.&#x20;
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
* `derive_light_cpi_signer!` derives this PDA for you at compile time.
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
    BorshSerialize, // AnchorSerialize
    BorshDeserialize, // AnchorDeserialize 
    LightDiscriminator
)]
pub struct DataAccount {
    pub owner: Pubkey,
    pub message: String,
}
```
{% endtab %}
{% endtabs %}

Besides the standard traits (`Clone`, `Debug`, `Default`), the following are required:

* `borsh` or `AnchorSerialize` to serialize account data.
* `LightDiscriminator` trait gives struct unique type ID (8 bytes) for deserialization

{% hint style="info" %}
The traits are required for `LightAccount`. `LightAccount` wraps `DataAccount` in Step 7 to set the discriminator and create the compressed account's data hash.       &#x20;
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

* `ValidityProof` proves that an address does not exist yet in the specified address tree (non-inclusion).  This proof is [passed by the client](#user-content-fn-1)[^1].

2. **Specify Merkle trees to store address and account hash**

* `PackedAddressTreeInfo` specifies the index to the address tree account that is used to derive the address in _Step 5_. The index must point to the correct address tree `AccountInfo` in `CpiAccounts`.
* `output_state_tree_index` specifies which state tree will store the compressed account. hash.

3. **Custom account data**

* `message`: Data to include in the compressed account. This depends on your program logic.

{% hint style="info" %}
Packed structs use indices to point to `remaining_accounts` to reduce transaction size. The instruction data references these accounts with `u8` indices instead of full 32 byte pubkeys.
{% endhint %}
{% endstep %}

{% step %}
### Derive Address

Derive the address as persistent unique identifier for the compressed account.

{% hint style="info" %}
Compressed accounts are identified by its hash and optionally by an address. The account hash is not persistent and changes with every write to the account.

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

**Parameters for `derive_address`:**

* In this example, the `&custom_seeds` array contains program `SEED` and signer pubkey.&#x20;
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

Verify the address tree pubkey matches the program's tree constant to ensure global uniqueness of an address.

{% hint style="info" %}
An address is by default only unique to the program and the specific address tree. Without this check, the same seeds can be used in different address trees.
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

Initialize the compressed account struct with `LightAccount::new_init()`.

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

`LightAccount` creates a wrapper struct for the custom data (`DataAccount`) and metadata:

* The `owner` is the program ID that owns the compressed account.
* The `address` assigned to the compressed account (derived in _Step 5_).
* `output_state_tree_index` specifies the state tree that will store the compressed account hash. We use the index passed in the instruction data (_Step 4)_.

After initialization, set custom account fields defined in your compressed account struct in `DataAccount` (_Step 3_).

* `my_compressed_account.owner` is set to the signer's pubkey
* `my_compressed_account.data` is set to custom string data
{% endstep %}

{% step %}
### Light System Program CPI

The Light System Program CPI creates the compressed account and its hash.

Build the CPI instruction with&#x20;

1. `proof` from [_Step 4_](how-to-create-compressed-accounts.md#define-instruction-data-for-create_compressed_account) _Instruction Data_,
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

**Parameters for `CpiAccounts::new()`:**

`CpiAccounts` parses accounts consistent with `PackedAccounts` in the client and converts them for the CPI:

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer
* `ctx.remaining_accounts`: `AccountInfo` slice [with Light System and packed tree accounts](#user-content-fn-2)[^2].
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**CPI instruction builder**:

* `new_cpi()` initializes the CPI instruction with the `proof` from _Step 4_.
* `with_light_account` adds the compressed account data from `LightAccount` (Step 7) to the CPI instruction data
* `with_new_addresses` adds the `address_seed` (_Step 5_) and metadata to the CPI instruction data
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts.`

{% hint style="info" %}
The Light System Program&#x20;

* verifies the `proof` against the address tree's Merkle root,
* adds the address to the address tree, and
* appends the compressed account hash to the state tree.
{% endhint %}
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
Find the source code for this example [here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/anchor/programs/counter/src/lib.rs#L25).
{% endhint %}

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
    LightDiscriminator,
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

[^1]: Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

[^2]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Solana System program
