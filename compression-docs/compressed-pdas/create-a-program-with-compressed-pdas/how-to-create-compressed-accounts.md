---
description: >-
  Complete guide to a Solana program that creates compressed accounts using
  Light SDK and `create_compressed_account()` instruction handler.
hidden: true
---

# How to Create Compressed Accounts

Learn how to create compressed accounts in Solana programs. Find a [full code example at the end](how-to-create-compressed-accounts.md#create-account-example) for Anchor, native Rust, and Pinocchio.

This guide breaks down compressed account creation in 7 implementation steps:

1. [Set up dependencies](how-to-create-compressed-accounts.md#dependencies) for `light-sdk` and serialization/deserialization of compressed accounts.

* Provides macros, wrappers and CPI interface to interact with compressed accounts.

2. [Define program constants](how-to-create-compressed-accounts.md#constants) to derive an address (Step 5) and CPI calls to the Light System program (Step 7).
3. [Define the Account Data Structure](how-to-create-compressed-accounts.md#account-data-structure) for your compressed account.
4. Build the [instruction data](how-to-create-compressed-accounts.md#define-instruction-data-for-create_compressed_account):
   * Include validity proof to prove the derived address does not yet exist in the address tree. Client fetches proof with `getValidityProof()` from RPC provider and passes to program.
   * Specify address and state tree indices where address and compressed account hash are stored.
   * Add the account's custom data.
5. [Derive an address](how-to-create-compressed-accounts.md#derive-address) from seeds and address tree public key to set a unique identifier to your compressed account. Adds PDA functionality to your compressed account.
6. [​Initialize Compressed Account](how-to-create-compressed-accounts.md#initialize-compressed-account) with `LightAccount::new_init()` to wrap its data structure and metadata. Abstracts serialization and `data_hash` generation for your CPI in Step 7.
7. Create the compressed account via [CPI to Light System Program](how-to-create-compressed-accounts.md#cpi).

{% hint style="success" %}
Your program calls the Light System Program via CPI to create compressed accounts, similar to how programs call the System Program to create regular accounts.&#x20;
{% endhint %}

### Create Compressed Account Flow

```
CLIENT
   ├─ 1. Derive address for new account
   │     └─ from program ID, custom seeds, address tree
   │
   ├─ 2. Fetch non-inclusion proof from RPC provider with `getValidityProof()`
   │     └─ proves address does NOT exist in address tree yet
   │
   ├─ 3. Pack merkle tree accounts
   │     ├─ Fetch address tree and state tree accounts
   │     └─ Includes index pointing to which address tree account 
   │        to use from remaining_accounts
   │
   └─ 4. Build transaction with instruction data
         ├─ ValidityProof (non-inclusion proof from step 2)
         ├─ PackedAddressTreeInfo (index of address in tree)
         ├─ output_state_tree_index (which state tree will store account hash)
         └─ Custom account data (message, owner fields, etc.)
            │
            PROGRAM receives instruction data
            │
            ├─ 5. Re-Derive address
            │     ├─ use same seeds as client
            │     └─ returns the address and address_seed for proof verification
            │
            ├─ 6. Initialize compressed account with LightAccount::new_init()
            │     ├─ wraps data with Metadata (owner, address, tree index)
            │     ├─ set account data fields (owner, message, etc.)
            │     └─ abstracts data_hash generation for CPI
            │
            └─ 7. Light System Program CPI
                   ├─ verify non-inclusion proof (proves address doesn't exist)
                   ├─ register address in address tree
                   └─ create compressed account hash in state tree
```

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

* The `light-sdk` provides macros, wrappers and CPI interface to interact with compressed accounts.
* Add the serialization library (`borsh` for native Rust, or Anchor's built-in serialization).
{% endstep %}

{% step %}
### Constants

Set program address and CPI authority to call Light System program in Step 7.

```rust
declare_id!("PROGRAM_ID");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("PROGRAM_ID");
```

**`Program_ID`**: The on-chain address of your program to derive address.

**`CPISigner`**: Configuration struct for CPI's to Light System Program. Contains your program ID, the derived CPI authority PDA, and PDA bump.
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
    LightHasher, 
    LightDiscriminator
)]
pub struct DataAccount {
    pub owner: Pubkey,
    pub message: String,
}
```

`DataAccount` defines the data structure of the compressed account you will create. Changing any value in the `DataAccount` struct updates the compressed account hash.

**Derives:**

* For serialization use `BorshSerialize`/ `BorshDeserialize`, or `AnchorSerialize`/ `AnchorDeserialize` for Anchor programs
* `LightDiscriminator` gives struct unique type ID (8 bytes) for deserialization. Required to distinguish `DataAccount` from other compressed account types.
{% endstep %}

{% step %}
### Define Instruction Data for `create_compressed_account`

The `create_compressed_account` instruction requires the following inputs:

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
* `&address_tree_pubkey`: Pubkey of address tree retrieved via `get_tree_pubkey()`.
* `&program_id`: The program's on-chain address.

The parameters return:

* The final 32-byte `address` for the created compressed account. Combines `address_seed` + `address_tree_pubkey`.
* A 32-byte `address_seed` the Light System program CPI uses to verify `ValidityProof` and create the address. Combines `program_id` and `SEED`. The `address_seed` is passed to the Light System Program as part of new address params together with additional metadata to verify the `proof` from Step 2.

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

Initialize the compressed account data structure with the derived address from Step 3.

```rust
let owner = crate::ID;
let mut my_compressed_account 
        = LightAccount::<'_, MyCompressedAccount>::new_mut(
    &owner,
    Some(address),
    my_compressed_account,
)?;

my_compressed_account.name = name;
my_compressed_account.nested = nested_data;
```

**Parameters for `LightAccount::new_init`:**

* The `&owner` of the compressed account is the program that creates it. The Light System Program checks that only the `&owner` can update the compressed account data.
* `Some(address)` is the address assigned to the compressed account (derived in _Step 3_). `None` for accounts without persistent IDs.
* `output_state_tree_index` specifies the state tree that will store the compressed account hash. We use the index passed in _Step 2_.

**Initialize compressed account data:** This is custom depending on your compressed account struct. In this example the data is:

* my\_compressed\_account.name = name;
* my\_compressed\_account.nested = nested\_data;
{% endstep %}

{% step %}
### CPI

Invoke the Light System program to create the compressed account and address

1. `proof` from _Step 2_ _Instruction Data for `create_compressed_account`_,
2. `address_seed` from _Step 3_ _Derive Address_, and
3. `my_compressed_account` from _Step 4_ _Initialize Compressed Account_.

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.signer.as_ref(),
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

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and signer
* `ctx.remaining_accounts`: Account slice [with Light System program and merkle tree accounts](#user-content-fn-1)[^1]. Fetched by client with `getValidityProof()` from RPC provider that supports ZK Compression (Helius, Triton).
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Parameters for `CpiInputs::new_with_address()`:**

Initializes CPI instruction data with `proof` from Step 2 to validate address non-inclusion.

* `with_light_account` converts the compressed account for the CPI call to instruction data format from `LightAccount`.

<details>

<summary>Under the hood of `with_light_account`</summary>

\- The parameter calls \`to\_account\_info()\` to get the \`data\_hash\` of an account - the \`data\_hash, owner, leaf\_index, merkle\_tree\_pubkey, lamports, address, discriminator\` is used to create the compressed account hash - The compressed account hash is appended to state tree.

</details>
{% endstep %}

{% step %}
### That's it!

Now that you understand the concepts to create a compressed account, start building with the create account example below.
{% endstep %}
{% endstepper %}

## Create Account Example

Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first. See [this page](../../resources/errors/), if you run into any errors.

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% hint style="success" %}
Find the [source code](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) here.
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
`declare_id!` and `#[program]` follow [standard anchor](https://www.anchor-lang.com/docs/basics/program-structure) patterns.
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer,
    instruction::{PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator, LightHasher,
};

declare_id!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

pub const SEED: &[u8] = b"your_seed";

#[derive(Clone, Debug, Default, BorshSerialize, BorshDeserialize, LightHasher, LightDiscriminator)]
pub struct DataAccount {
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String,
}

#[program]
pub mod create_compressed_account {
    use super::*;

    pub fn create_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>,
        proof: ValidityProof,
        address_tree_info: PackedAddressTreeInfo,
        output_state_tree_index: u8,
        message: String,
    ) -> Result<()> {
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            LIGHT_CPI_SIGNER,
        );

        let (address, address_seed) = derive_address(
            &[SEED, ctx.accounts.signer.key().as_ref()],
            &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?,
            &crate::ID,
        );

        let mut data_account = LightAccount::<'_, DataAccount>::new_init(
            &crate::ID,
            Some(address),
            output_state_tree_index,
        );
        data_account.owner = ctx.accounts.signer.key();
        data_account.message = message;

        let cpi_inputs = CpiInputs::new_with_address(
            proof,
            vec![data_account.to_account_info()?],
            vec![address_tree_info.into_new_address_params_packed(address_seed)],
        );

        cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateCompressedAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```
{% endtab %}

{% tab title="Native" %}

{% endtab %}

{% tab title="Pinchocchio" %}

{% endtab %}
{% endtabs %}

## Next steps

Learn how to Call Your Program from a Client Learn how to Update Compressed Accounts Learn how to Close Compressed Accounts

[^1]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Standard Solana System program
