---
description: >-
  Complete guide to a Solana program that creates compressed accounts using
  Light SDK and `create_compressed_account()` instruction handler.
hidden: true
---

# How to Create Compressed Accounts

Learn how to create compressed accounts in Solana programs. This guide breaks down each implementation step. Find a working [full code example at the end](how-to-create-compressed-accounts.md#create-account-example) for Anchor, native Rust, and Pinocchio.

```
Compressed Account Creation Flow
│
├─ CLIENT
│  ├─ 1. Generate instruction with proof and data
│  │  ├─ ValidityProof (getValidityProof() RPC)
│  │  ├─ PackedAddressTreeInfo
│  │  ├─ output_state_tree_index
│  │  └─ Custom data (message)
│  │
│  └─ 2. Send transaction to program
│
├─ YOUR PROGRAM
│  ├─ 1. Derive address
│  │
│  ├─ 2. Initialize Compressed Account Data
│  │
│  └─ 3. Light System Program CPI
      ├─ Verify proof (proves address does not exist yet) 
      └─ Create Compressed Account in State Tree
```



## Get Started

Set up your program and use the `light-sdk` to create compressed accounts:

light-sdk bundles (...) utilities&#x20;

like solana-program for Solana



1. Configure [instruction data](how-to-create-compressed-accounts.md#instruction-data-for-create_compressed_account),
2. [derive an address](how-to-create-compressed-accounts.md#derive-address) and [initialize the compressed account](how-to-create-compressed-accounts.md#initialize-compressed-account), and
3. [CPI Light System program](how-to-create-compressed-accounts.md#cpi).

{% hint style="success" %}
Your program calls the Light System program to create compressed accounts via CPI, similar to the System program to create regular accounts.
{% endhint %}

{% stepper %}
{% step %}
### Prerequisites

Set up dependencies, constants, and compressed account data structure.

<details>

<summary>Dependencies, Constants, Account Data Structure</summary>

#### Dependencies

Set up `light-sdk` dependencies.

```toml
[dependencies]
light-sdk = "0.13.0"
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

#### Account Data Structure

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
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String,
}
```

`DataAccount` defines your account's data structure.

* `#[hash]` fields define the what's included in the compressed account hash.
* Changing any `#[hash]` field creates a new account hash. Requires creating a new compressed account via CPI with validity proof. Old hash becomes invalid.
* Non-`#[hash]` fields can be updated without creating new accounts

Compression Derives:

* `LightHasher` generates compressed account hash from `DataAccount`.
* `LightDiscriminator` gives struct unique type ID for deserialization. Required to distinguish `DataAccount` from other compressed account types.

</details>
{% endstep %}

{% step %}
### Instruction Data for `create_compressed_account`

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

* `ValidityProof`: Proves  that an address does not exist yet (non-inclusion) in the specified address tree. Clients fetch validity proofs from their rpc provider with `getValidityProof()` .
* `PackedAddressTreeInfo`: Specifies the index to address tree account. The address tree is necessary to derive the address with `derive_address() and create it via cpi to the light system program`.
* `output_state_tree_index`: Specifies which state tree will store the compressed account hash and its index (`u8`).

Account packing:

The indices in the instruction data point to accounts packed in the client. This way we avoid sending the same account multiple times in the instruction. The client has a helper method to create packed accounts. In anchor programs packed accounts are passed in the remaining accounts slice.

The instruction data references two Merkle trees. Both are maintained by the protocol. You can specify any Merkle tree listed in [_Addresses_](https://www.zkcompression.com/resources/addresses-and-urls)_._

* **Address trees** are used to derive and store addresses for compressed accounts.
* **State trees** store compressed account hashes and are fungible.
{% endstep %}

{% step %}
### Derive Address

Derive the compressed account address with the same parameters the client used for proof generation:

<pre class="language-rust"><code class="lang-rust">let address_merkle_tree_pubkey =
    address_tree_info.get_tree_pubkey(&#x26;light_cpi_accounts)?;
let custom_seeds = [SEED, ctx.accounts.signer.key().as_ref()];
let program_id = crate::ID;
<strong>let (address, address_seed) = derive_address(
</strong><strong>                &#x26;custom_seeds,
</strong><strong>                &#x26;address_merkle_tree_pubkey,
</strong><strong>                &#x26;program_id, 
</strong><strong>            );
</strong><strong>            
</strong></code></pre>

If your program requires global uniqueness over all address trees, the used address Merkle tree needs to be checked:

```rust
pub const ALLOWED_ADDRESS_TREE: Pubkey = pubkey!("amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2");

  let address_tree = light_cpi_accounts.tree_pubkeys().unwrap()
          [address_tree_info.address_merkle_tree_pubkey_index as usize];

      if address_tree != ALLOWED_ADDRESS_TREE { 
          return Err(ProgramError::IhavenvalidAccountData.into());
      }
```

**Parameters:**

* `&custom_seeds`: Array with program `SEED` and signer pubkey. Client must use identical seeds.
* `&address_merkle_tree_pubkey`: Pubkey of address tree retrieved via `get_tree_pubkey()`. Must match tree selected by client.
* `&program_id`: The program's on-chain address. The client must use same program ID.

The parameters return:

* the final 32-byte `address` that we assign to our new compressed account, and
* the 32-byte `address_seed`  the Light System program CPI uses to check and create the address. The address sees is passed to the light system program as part of new address params together with additional metadata to verify the validity proof.
{% endstep %}

{% step %}
### Initialize Compressed Account

Initialize the compressed account data structure with the derived address from [_Step 3_](how-to-create-compressed-accounts.md#derive-address).

<pre class="language-rust"><code class="lang-rust">let owner = crate::ID;
let mut data_account = LightAccount::&#x3C;'_, DataAccount>::new_init(
<strong>    &#x26;owner,
</strong><strong>    Some(address),
</strong>    output_state_tree_index,
);
data_account.owner = ctx.accounts.signer.key();
data_account.message = message;
</code></pre>

**Parameters for `LightAccount::new_init()`:**

* `&owner`: of the compressed account. A compressed account is owned by the program that creates it. The light system program checks that only the owner program can update the compressed accounts data.
* `Some(address)`: The address that is assigned to the compressed account (derived in [_Step 3_](how-to-create-compressed-accounts.md#derive-address)_)_. Addresses are persistent unique identifiers for compressed accounts. The account hash is an additional unique identifier but changes with every write to the account. If your account does not need a persistent unique id you can create the compressed account without an address. For example compressed token accounts do not need addresses.\
  For Solana pda like behavior your compressed account needs an address.
* `output_state_tree_index` specifies the state tree that will store the compressed account. We use the index passed in with instruction data, defined in [_Step 2_](how-to-create-compressed-accounts.md#instruction-data-for-create_compressed_account) _Instruction Data._

**Initialize compressed account data:**

This is custom depending on your compressed account struct.

For this example it looks like this:

* `data_account.owner`
* `data_account.message`
{% endstep %}

{% step %}
### CPI

Invoke the Light System program to create the compressed account with the

1. `proof` from [_Step 2_](how-to-create-compressed-accounts.md#instruction-data-for-create_compressed_account) _Instruction Data for `create_compressed_account`_,
2. `address_seed` from [_Step 3_](how-to-create-compressed-accounts.md#derive-address) _Derive Address, and_
3. `data_account` from [_Step 4_](how-to-create-compressed-accounts.md#initialize-compressed-account) _Initialize Compressed Account._

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
* `ctx.remaining_accounts`: Account slice containing Light System program and merkle tree accounts. Generated via client's `getValidityProof()` RPC call.
* `LIGHT_CPI_SIGNER`: Your program as CPI signer defined in Constants.

**Parameters for `CpiInputs::new_with_address()`:**

* `proof`: Zero-knowledge proof from instruction input to validate address non-inclusion.
* with\_light\_account
  * `vec![data_account.to_account_info()?]`: Compressed account information from `LightAccount` wrapper.
* with\_new\_addresses
  * `vec![address_tree_info.into_new_address_params_packed(address_seed)]`: Address registration parameters using address\_seed from `derive_address()`.
* ```
      .invoke(light_cpi_accounts)?;
          account info
  ```

Under the hood:

1. 'with\_light\_account'&#x20;
   1. hashes the account state, this is the data hash that is used to create the compressed account hash. The compressed account hash is appended to the state Merkle tree. To update your compressed account your program will produce the exact same data hash to prove that the account exists with the current state.
   2.
{% endstep %}

{% step %}
### That's it!

Now that you understand the concepts to create a compressed account, start building with the create account example below.
{% endstep %}
{% endstepper %}

### Create Account Example

Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first:

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprograms
```

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

### Next steps

Learn how to Call Your Program from a Client Learn how to Update Compressed Accounts Learn how to Close Compressed Accounts
