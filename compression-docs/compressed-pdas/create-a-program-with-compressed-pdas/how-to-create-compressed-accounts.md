---
description: >-
  Complete guide to a Solana program that creates compressed accounts using
  Light SDK and `create_compressed_account()` instruction handler.
hidden: true
---

# How to Create Compressed Accounts

Learn how to create compressed accounts in Solana programs. Find a full code example at the end for Anchor, native Rust, and Pinocchio. light-sdk = { version = "0.13.0", features = \["anchor", "v2"] }

This guide breaks down compressed account creation in 6 implementation steps:

1. [Prerequisites](how-to-create-compressed-accounts.md#prerequisites) - Set up dependencies and program constants
2. Define the [Account Data Structure](how-to-create-compressed-accounts.md#account-data-structure)  of the compressed account. Produces the `data_hash`.
3. Build the [instruction Data](how-to-create-compressed-accounts.md#define-instruction-data-for-create_compressed_account):

* fetch a proof from the RPC provider that the address does not exist yet &#x20;
* &#x20;specify [address and state tree](#user-content-fn-1)[^1] indices where address and compressed account hash are stored
* &#x20;add the account's custom data.

4. [Derive a unique address](how-to-create-compressed-accounts.md#derive-address) from seeds and address tree public key.

* Multiple seeds are hashed into a single 32 bytes seed for address creation.&#x20;
* Addresses are optional, unique identifiers for compressed accounts. Only required for PDA like functionality, not for e.g. token accounts.

5. [Initialize Compressed Account](how-to-create-compressed-accounts.md#initialize-compressed-account) with `LightAccount`

* This creates a wrapper around a compressed account similar to anchor Account.&#x20;
* `LightAccount` abstracts hashing of compressed account data

6. [CPI to Light System Program](how-to-create-compressed-accounts.md#cpi) to create the compressed account.

{% hint style="success" %}
Your program calls the Light System Program via CPI to create compressed accounts, similar to how programs call the System Program to create regular accounts.&#x20;
{% endhint %}

```
// add end to end flow
```

## Get Started

{% stepper %}
{% step %}
### Prerequisites

Set up dependencies and program constants.

#### Dependencies

Set up `light-sdk` dependencies. Use `borsh` or for serialization/deserialization of compressed accounts, when you are not using Anchor.

```toml
[dependencies]
light-sdk = { version = "0.13.0", features = ["anchor", "v2"] }
borsh = "0.10.0"
```

#### Constants

Set program address and CPI authority to call Light System program.

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
* `LightHasher` generates compressed account hash from `DataAccount`.
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

The instruction data includes indices (`u8`, 1 byte each) instead of full pubkeys (32 bytes) to reduce transaction size:

* `PackedAddressTreeInfo` specifies the index to the address tree account that is used to derive the adress with `derive_address()` via CPI to the Light System Program. Must point to valid address merkle tree account in `CpiAccounts`. The client has a helper method to pass the index position of address merkle tree in the transaction's remaining accounts.
* `output_state_tree_index` specifies which state tree will store the compressed account hash and its index.
* `message`: Data to include in the compressed account. This varies by program logic. Used as seed for `derive_address()`.

The client packs accounts into the instructions `accounts` (`remaining_accounts` for Anchor programs). This avoids sending the same account multiple times in the instruction.
{% endstep %}

{% step %}
### Derive Address

Derive the compressed account address with the same parameters as the client.

{% hint style="info" %}
Addresses are persistent unique identifiers for compressed accounts, but optional. The account hash is an additional unique identifier but changes with every write to the account.

* For Solana PDA like behavior your compressed account needs an address.
* If your account does not need a persistent unique identifier, you can create the compressed account without an address. For example compressed token accounts do not need addresses. Learn how to create token accounts here.
{% endhint %}

<pre class="language-rust"><code class="lang-rust">let address_merkle_tree_pubkey =
    address_tree_info.get_tree_pubkey(&#x26;light_cpi_accounts)?;
let custom_seeds = [SEED, ctx.accounts.signer.key().as_ref()];
let program_id = crate::ID;
<strong>let (address, address_seed) = derive_address(
</strong><strong>                &#x26;custom_seeds,
</strong><strong>                &#x26;address_tree_pubkey,
</strong><strong>                &#x26;program_id, 
</strong><strong>            );
</strong></code></pre>

**Parameters:**

* `&custom_seeds`: Array with program `SEED` and signer pubkey. Client must use identical seeds.
* `&address_tree_pubkey`: Pubkey of address tree retrieved via `get_tree_pubkey()`. Must match tree selected by client.
* `&program_id`: The program's on-chain address. The client must use same program ID.

The parameters return:

* The final 32-byte `address` for the created compressed account. Combines `address_seed` + `address_tree_pubkey`. The `address_tree_pubkey` ensures uniqueness to both program and tree.
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

**Initialize compressed account data:** This is custom depending on your compressed account struct. For this example it looks like this:

* my\_compressed\_account.name = name;
* my\_compressed\_account.nested = nested\_data;
{% endstep %}

{% step %}
### CPI

Invoke the Light System program to create the compressed account using

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
* `ctx.remaining_accounts`: Account slice [with Light System program and merkle tree accounts](#user-content-fn-2)[^2]. Fetched by client with `getValidityProof()` from RPC provider that supports ZK Compression (Helius, Triton).
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

Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.

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

[^1]: Both Merkle trees are maintained by the protocol:

    * **State trees** store compressed account hashes and are fungible.
    * **Address trees** are used to derive and store addresses for compressed accounts.

    You can specify any Merkle tree listed in [_Addresses_](https://www.zkcompression.com/resources/addresses-and-urls).

[^2]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Standard Solana System program
