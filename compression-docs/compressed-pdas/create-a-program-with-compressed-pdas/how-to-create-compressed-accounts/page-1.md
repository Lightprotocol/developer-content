# Page 1

This guide shows you how to write a Solana program that creates compressed accounts.

The stepper below walks through each implementation step. You can find a working full code example at the end.

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
│     └─ Include ctx.remaining_accounts
│
├─ YOUR PROGRAM
│  ├─ 1. Derive deterministic address
│  │  ├─ derive_address([SEED, signer], tree_pubkey, program_id)
│  │  └─ Returns: address, address_seed
│  │
│  ├─ 2. Initialize account structure
│  │  ├─ LightAccount::new_init(&owner, address, output_state_tree_index)
│  │  └─ Set: data_account.owner, data_account.message
│  │
│  └─ 3. Execute CPI
│     ├─ CpiAccounts::new(fee_payer, remaining_accounts, LIGHT_CPI_SIGNER)
│     ├─ CpiInputs::new_with_address(proof, account_info, address_params)
│     └─ invoke_light_system_program()
│
└─ LIGHT SYSTEM PROGRAM
   ├─ Verify proof
   ├─ Register address in address tree
   ├─ Store account hash in state tree
   └─ Complete transaction
```

**Compressed Account Creation Flow**

The client

1. creates [instruction with proof and data](#user-content-fn-1)[^1]
2. then sends transaction to your program. Learn here how to call your program from a client.

Your program

1. derives a deterministic address and
2. performs a CPI from your custom program to the Light System program

The Light System program creates the compressed account.

{% hint style="success" %}
Your program calls the Light System program to create compressed accounts via CPI, similar to the System program to create regular accounts.
{% endhint %}

## Get Started

To build a program that creates compressed accounts, you'll need to:

1. Set up Light SDK dependencies and specify on-chain address with `declare_id!`,
2. Define account struct with `LightHasher` and `LightDiscriminator` derives, and
3. Implement instruction within the `#[program]` module.

{% stepper %}
{% step %}
### Dependencies

Set up `light-sdk` dependencies.

```toml
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
```
{% endstep %}

{% step %}
### Constants

Define program identity and CPI authority for Light System program calls.

```rust
declare_id!("PROGRAM_ID");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("PROGRAM_ID");

pub const SEED: &[u8] = b"your_seed";
```

**`Program_ID`**: The on-chain address of your program to derive address.

**`CPISigner`**: Configuration struct for CPI's to Light System Program. Contains your program ID (32 bytes), the derived CPI authority PDA (32 bytes), and PDA bump (1 byte).

**`Seed`**: Custom seed to derive address. Derived address by program must match derived address by client. Otherwise you will get error 0x179B (6043 / `ProofVerificationFailed`).
{% endstep %}

{% step %}
### Account Data Structure

Define your compressed account struct:

```rust
#[derive(Clone, 
    Debug, 
    Default, 
    BorshSerialize, // AnchorSerialize
    BorshDeserialize, // AnchorDeserialize 
    LightHasher, 
    LightDiscriminator
)
]
pub struct DataAccount {
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String, // custom data
/// pub counter: u64, // mutable data
}
```

`DataAccount`: Define your account's data structure.

* \#\[hash] fields define the identity of your account.
* Account hash changes when any #\[hash] field changes. Requires proof of account ownership.
* Non-#\[hash] fields can be updated without creating new accounts

Compression Derives:

* `LightHasher` generates compressed account hash from `DataAccount`.
* `LightDiscriminator` gives struct unique type ID for deserialization. Required to distinguish DataAccount from other compressed account types.
{% endstep %}

{% step %}
### Instruction Data for `create_compressed_account`

The `create_compressed_account` instruction requires the following inputs:

```rust
pub struct InstructionData {
            proof: ValidityProof,
            address_tree_info: PackedAddressTreeInfo,
            output_state_tree_index: u8,
            message: String, // crroesponds to DataAccount
}
```

The transaction interacts with two Merkle trees, both are maintained by the protocol

* **Address trees** are used to derive and store addresses for compressed accounts.
  * An address derived from a specified address tree is unique within that tree. Multiple address trees exist, and the same address seeds can be reused across different trees.
  * If your program just requires addresses to identify accounts but not uniqueness over all address trees, the used address Merkle tree does not need to be checked.
* **State trees** store compressed account hashes and are fungible.

**Parameters:**

* `ValidityProof`: A zero-knowledge proof that validates non-inclusion of an address in the specified address tree. It's generated by the client via `getValidityProof()` with empty input accounts array. See this page, if you run into 0x179B/6043 (`ProofVerificationFailed`)
* `PackedAddressTreeInfo`: Specifies pubkey of address tree to derive the adress with `derive_address()`. Ensure client and program reference the same address tree. Otherwise derivation fails with error 0x1777/6007 (`DeriveAddressError`).
* `output_state_tree_index`: Specifies which state tree will store the compressed account hash and its index (`u8`). State trees are fungible - find their addresses here.
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
</strong><strong>                &#x26;program_id, // must match client
</strong><strong>            );
</strong></code></pre>

**Parameters:**

* `&custom_seeds`: Array with program `SEED` and signer pubkey. Client must use identical seeds or derivation fails with error 0x1777/6007 (`DeriveAddressError`).
* `&address_merkle_tree_pubkey`: Pubkey of address tree retrieved via `get_tree_pubkey()`. Must match tree selected by client.
* `&program_id`: The program's on-chain address (`crate::ID`). The client must use same program ID.

The parameters return:

* the final 32-byte `address` where the compressed account will be created, and
* the 32-byte intermediate `address_seed` used in the Light System program CPI via `into_new_address_params_packed()` below.
{% endstep %}

{% step %}
### Initialize Compressed Account

Initialize the compressed account data structure using the derived address.

```rust
let owner = crate::ID;
let mut data_account = LightAccount::<'_, DataAccount>::new_init(
        &owner,
        Some(address), // derived with derive_address
        output_state_tree_index, // configured in create_account instruction
    );
    data_account.owner = ctx.accounts.signer.key();
    data_account.message = message;

```

**Parameters for `LightAccount`:**

* `&owner`: Program ID (`crate::ID`) to set account owner for Light System program.
* `Some(address)`: The derived address from the previous step where the compressed account will be created.
* `output_state_tree_index` to specify which state tree will store the compressed account hash and its index (defined in the `create_compressed_account` instruction)

**Field assignments:**

* `data_account.owner`: Sets the transaction signer as the account's data owner (different from `&owner` above).
* `data_account.message`: Populates the custom data field defined in `DataAccount` struct.
{% endstep %}

{% step %}
### CPI

Invoke the Light System program to create the compressed account using

1. `proof` from `InstructionData`,
2. `data_account` from previous step, and
3. `address_seed` from `derive_address()`.

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts, // included in getValidityProof() by client
    LIGHT_CPI_SIGNER,
);

let cpi_inputs = CpiInputs::new_with_address(
    proof,
    vec![data_account.to_account_info()?],
    vec![address_tree_info.into_new_address_params_packed(address_seed)],
);

cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;
```

**Parameters for `CpiAccounts::new()`:**

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and signer
* `ctx.remaining_accounts`: Account slice containing Light System program and merkle tree accounts. Generated via client's `getValidityProof()` RPC call.
* `LIGHT_CPI_SIGNER`: Program signer derived at compile time via `derive_light_cpi_signer!()` macro

**Parameters for `CpiInputs::new_with_address()`:**

* `proof`: Zero-knowledge proof from instruction input to validate address non-inclusion.
* `vec![data_account.to_account_info()?]`: Compressed account information from `LightAccount` wrapper.
* `vec![address_tree_info.into_new_address_params_packed(address_seed)]`: Address registration parameters using address\_seed from `derive_address()`.
{% endstep %}

{% step %}
### That's it!

Now that you understand the concepts to create a compressed account, start building with the create account example below.
{% endstep %}
{% endstepper %}

### Create Account Example

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
Copy the complete example and built with `anchor build`.&#x20;

{% hint style="info" %}
`declare_id!` and `#[program]` follow [standard anchor](https://www.anchor-lang.com/docs/basics/program-structure) patterns.
{% endhint %}

```rust
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
use light_sdk::{
    // Wrapper for hashing and serialization for compressed accounts
    account::LightAccount,
    // Derives address from provided seeds. Returns address and a singular seed
    address::v1::derive_address,
    // Structures for calling Light System program via CPI
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    // Macro that computes PDA signer with "cpi_authority" seed at compile time
    derive_light_cpi_signer,
    // ZK proof for merkle inclusion/non-inclusion verification
    instruction::{PackedAddressTreeInfo, ValidityProof},
    // Traits for account type discrimination and Poseidon hash derivation
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
        ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>, // standard Anchor context
        proof: ValidityProof, // ZK proof verifying address non-inclusion
        address_tree_info: PackedAddressTreeInfo, // Specifies address tree to use for derivation
        output_state_tree_index: u8, // Specifies state tree to store the new account
        message: String,
    ) -> Result<()> {
        // Create CPI accounts struct
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer and transaction signer for CPI
            ctx.remaining_accounts, // merkle tree and system accounts required for Light System program CPI
            LIGHT_CPI_SIGNER, // program signer
        );

        // Derive deterministic address from seeds and address tree
        // must match client-side derivation
        let (address, address_seed) = derive_address(
            &[SEED, ctx.accounts.signer.key().as_ref()],
            &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?, // merkle tree pubkey for final address computation
            &crate::ID,
        );

        // Initialize compressed account wrapper with owner, address, and output state tree index
        let mut data_account = LightAccount::<'_, DataAccount>::new_init(
            &crate::ID,
            Some(address),
            output_state_tree_index, // specifies which state tree will store account
        );
        data_account.owner = ctx.accounts.signer.key();
        data_account.message = message;

        // Package validity proof, compressed account data, and address registration params
        let cpi_inputs = CpiInputs::new_with_address(
            proof, // ZK proof for address non-inclusion
            vec![data_account.to_account_info()?], // compressed account info for Light System
            vec![address_tree_info.into_new_address_params_packed(address_seed)], // packed address registration parameters
        );

        // Invoke light system program to create compressed account
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

[^1]: Instruction:

    * `ValidityProof` for the new address
    * `PackedAddressTreeInfo` containing tree metadata
    * `output_tree_index` specifying which state tree to use
    * Account data to store
