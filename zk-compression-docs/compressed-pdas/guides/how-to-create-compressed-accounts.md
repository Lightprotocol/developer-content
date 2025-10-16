---
description: >-
  Guide to create compressed accounts in Solana programs with full code
  examples.
hidden: true
---

# How to Create Compressed Accounts

## Overview

Compressed accounts and addresses are created via CPI to the Light System Program. Solana programs use compressed and regular accounts in the same program.&#x20;

* A compressed accounts has two identifiers: the account hash and its address (optional). Regular Solana accounts can be identified by its address.
* The account hash is not persistent and changes with every write to the account.
* For Solana PDA like behavior your compressed account needs an address as persistent identifier. \
  Fungible state like [compressed token accounts](../../compressed-tokens/guides/how-to-create-compressed-token-accounts.md) do not need addresses.

{% hint style="success" %}
Find [full code examples of a counter program at the end](how-to-create-compressed-accounts.md#full-code-example) for Anchor and native Rust.
{% endhint %}

## Implementation Guide

This guide will cover the components of a Solana program that creates compressed accounts. Here is the complete flow to create compressed accounts:&#x20;

<figure><img src="../../.gitbook/assets/image (30).png" alt=""><figcaption><p>Creation Compressed Account Complete Flow. Program-side highlighted.</p></figcaption></figure>

{% stepper %}
{% step %}
### Dependencies

Add dependencies to your program.

{% tabs %}
{% tab title="Anchor" %}
```toml
[dependencies]
light-sdk = "0.15.0"
anchor_lang = "0.31.1"
```
{% endtab %}

{% tab title="Native Rust" %}
```toml
[dependencies]
light-sdk = "0.15.0"
borsh = "0.10.0"
solana-program = "2.2"
```
{% endtab %}
{% endtabs %}

* The `light-sdk` provides macros, wrappers and CPI interface to create and interact with compressed accounts.
* Add the serialization library (`borsh` for native Rust, or use `AnchorSerialize`).
{% endstep %}

{% step %}
### Constants

Set program address and derive the CPI authority PDA to call the Light System program.

```rust
declare_id!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("rent4o4eAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
```

**`CPISigner`** is the configuration struct for CPIs to the Light System Program.

* CPI to the Light System program must be signed with a PDA derived by your program with the seed `b"authority"`
* `derive_light_cpi_signer!` derives the CPI signer PDA for you at compile time.
{% endstep %}

{% step %}
### Compressed Account

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
pub struct MyCompressedAccount {
    pub owner: Pubkey,
    pub message: String,
}
```
{% endtab %}

{% tab title="Native Rust" %}
```rust
#[derive(
    Clone,
    Debug,
    Default,
    BorshSerialize,
    BorshDeserialize,
    LightDiscriminator
)]
pub struct MyCompressedAccount {
    pub owner: Pubkey,
    pub message: String,
}
```
{% endtab %}
{% endtabs %}

Define your compressed account struct and derive

* the standard traits (`Clone`, `Debug`, `Default`),
* `borsh` or `AnchorSerialize` to serialize account data, and
* `LightDiscriminator` to implements a unique type ID (8 bytes) to distinguish account types. The default compressed account layout enforces a discriminator in its _own field_, not the first 8 bytes of the data field\[^1].

{% hint style="info" %}
The traits listed above are required for `LightAccount`. `LightAccount` wraps `my-compressed-account` in Step 7 to set the discriminator and create the compressed account's data.
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

1. **Validity Proof**

* Define `proof` to include the proof that the address does not exist yet in the specified address tree (non-inclusion).
* Clients fetch a validity proof with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify Merkle trees to store address and account hash**

* Define `address_tree_info: PackedAddressTreeInfo` to reference the address tree account used to derive the address in the next step.
* Define `output_state_tree_index` to reference the state tree account that stores the compressed account hash.

{% hint style="info" %}
Clients pack accounts into the `remaining_accounts` array to reduce transaction size. Packed structs like `PackedAddressTreeInfo` contain account indices (u8) instead of 32 byte pubkeys. The indices point to the account in the `remaining_accounts` to retrieve the public key and other metadata.
{% endhint %}

3. **Initial account data**

* Define fields for your program logic. Clients pass the initial values.
* This example includes the `message` field.
{% endstep %}

{% step %}
### Derive Address

Derive the address as a persistent unique identifier for the compressed account.

<pre class="language-rust"><code class="lang-rust">let address_merkle_tree_pubkey =
    address_tree_info.get_tree_pubkey(&#x26;light_cpi_accounts)?;

let custom_seeds = [SEED, ctx.accounts.signer.key().as_ref()];

<strong>let (address, address_seed) = derive_address(
</strong><strong>    &#x26;custom_seeds,
</strong><strong>    &#x26;address_tree_pubkey,
</strong><strong>    &#x26;crate::ID,
</strong><strong>);
</strong></code></pre>

**Unpack the tree pubkey:**

* Call `get_tree_pubkey()` to retrieve the address tree pubkey from `address_tree_info`. The packed struct contains the index of the address tree that points to the pubkey in the `remaining_accounts` array.

**Pass these parameters to `derive_address()`:**

* `&custom_seeds`: Arbitrary byte slices that uniquely identify the account. This example uses `SEED` and the signer's pubkey.
* `&address_tree_pubkey`: The pubkey of the address tree where the address will be created. This parameter ensures an address is unique to an address tree. Different trees produce different addresses from identical seeds.
* `&crate::ID`: Your program's ID.

**The SDK returns:**

* `address`: The derived address for the compressed account
* `address_seed`: Pass this to the Light System Program CPI in _Step 8_ to create the address in the address tree

{% hint style="info" %}
The address is created via CPI to the Light System Program in _Step 8_.
{% endhint %}
{% endstep %}

{% step %}
### Address Tree Check

Ensure global uniqueness of an address by verifying that the address tree pubkey matches the program's tree constant.

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

Initialize the compressed account struct with `LightAccount::new_init()`.

{% hint style="success" %}
`new_init()` creates a `LightAccount` instance similar to anchor `Account` and lets your program define the initial account data.
{% endhint %}

<pre class="language-rust"><code class="lang-rust">let owner = crate::ID;
let mut my_compressed_account
        = LightAccount::&#x3C;'_, MyCompressedAccount>::new_init(
<strong>    &#x26;owner,
</strong><strong>    Some(address),
</strong><strong>    output_state_tree_index,
</strong>)?;

<strong>my_compressed_account.owner = ctx.accounts.signer.key();
</strong><strong>my_compressed_account.data = data.to_string();
</strong></code></pre>

**Pass these parameters to `new_init()`:**

* `&owner`: The program's ID that owns the compressed account.
* `Some(address)`: The derived address from _Step 5_. Pass `None` for accounts without addresses.
* `output_state_tree_index`: The state tree index from instruction data (_Step 4_) to identify the state tree that will store the compressed account hash.

**The SDK creates:**

* A `LightAccount` wrapper similar to Anchor's `Account.`
* `new_init()` lets the program set the initial  data.  This example sets:
  * `owner` to the signer's pubkey
  * `data` to an arbitrary string
{% endstep %}

{% step %}
### Light System Program CPI

Invoke the Light System Program to create the compressed account and its address.

{% hint style="info" %}
The Light System Program

* verifies the validity proof against the address tree's Merkle root,
* inserts the address into the address tree, and
* appends the new account hash to the state tree.
{% endhint %}

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
* `ctx.remaining_accounts`: `AccountInfo` slice with Light System and packed tree accounts.
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Build the CPI instruction**:

* `new_cpi()` initializes the CPI instruction with the `proof` to prove that an address does not exist yet in the specified address tree (non-inclusion) _- defined in the Instruction Data (Step 4)._
* `with_light_account` adds the `LightAccount` with the initial compressed account data to the CPI instruction _- defined in Step 7_.
* `with_new_addresses` adds the `address_seed` and metadata to the CPI instruction data - returned by `derive_address` _in Step 5_.
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts.`
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first, or simply run:

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
Find the [source code for this example ](https://github.com/Lightprotocol/program-examples/blob/4e4432ef01146a937a112ec3afe56d180b9f5316/counter/native/src/lib.rs#L160)[here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/anchor/programs/counter/src/lib.rs#L27).
{% endhint %}

```rust
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
Find the [source code for this example here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/native/src/lib.rs#L160).
{% endhint %}

```rust
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
{% endtabs %}

## Next steps

Build a client for your program or learn how to update compressed accounts.

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
