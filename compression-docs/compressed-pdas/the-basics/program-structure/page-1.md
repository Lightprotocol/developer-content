# Page 1

Solana programs using Light Protocol extend Anchor macros with Light-specific imports and account types. These programs invoke the Light System Program to perform Merkle tree insertions and nullifications for compressed accounts.

The main components in Light Protocol programs include:

* `declare_id!`: Standard Anchor macro to specify the program's on-chain address
* `derive_light_cpi_signer!`: Computes PDA using "cpi\_authority" seed for Light System Program CPI
* Light SDK imports: `LightAccount`, `CpiAccounts`, `CpiInputs`, `ValidityProof`, and address derivation functions
* `#[program]`: Standard Anchor module containing instruction handlers
* `LightAccount`: Wrapper to abstract compressed account data hashing and serialization
* `ValidityProof` parameter: ZK proof struct required for all compressed account instruction handlers
* `LightHasher` and `LightDiscriminator`: Required traits for compressed account data structs with `#[hash]` attribute

## Example Program

Let's examine a program that demonstrates ZK compression fundamentals to understand the basic structure and key differences from standard Anchor programs.

The program below includes a single instruction `create_compressed_account` that creates a compressed account with derived address and stores custom data.

```rust
#![allow(unexpected_cfgs)]

use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer,
    instruction::{PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator, LightHasher,
};

declare_id!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

pub const LIGHT_CPI_SIGNER: CpiSigner = // Derives CPI authority PDA at compile time
    derive_light_cpi_signer!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

#[program]
pub mod zk_compression_program {
    use super::*;

    pub fn create_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>,
        proof: ValidityProof, // ZK proof for Merkle tree state consistency
        address_tree_info: PackedAddressTreeInfo, // Address tree metadata for insertion
        output_state_tree_index: u8, // Target state tree for account hash
        message: String,
    ) -> Result<()> {
        // Setup CPI accounts for Light System Program
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer
            ctx.remaining_accounts, // Light Protocol system accounts
            crate::LIGHT_CPI_SIGNER,
        );

        // Derive deterministic address from seeds
        let (address, address_seed) = derive_address(
            &[b"data", ctx.accounts.signer.key().as_ref()],
            &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?,
            &crate::ID,
        );

        // Create compressed account wrapper
        let mut data_account = LightAccount::<'_, DataAccount>::new_init(
            &crate::ID, 
            Some(address), // derived address
            output_state_tree_index,
        );
        data_account.owner = ctx.accounts.signer.key();
        data_account.message = message;

        // Package data for Light System Program CPI
        let cpi_inputs = CpiInputs::new_with_address(
            proof,
            vec![data_account.to_account_info()?], // output accounts to create
            vec![address_tree_info.into_new_address_params_packed(address_seed)], // new addresses
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

#[derive(Clone, Debug, Default, AnchorSerialize, AnchorDeserialize, LightHasher, LightDiscriminator)]
pub struct DataAccount { // hashes included in Poseidon hash for Merkle tree leaf
    #[hash]
    pub owner: Pubkey,
    #[hash]
    pub message: String,
}
```

For Comparison, this is a Standard Anchor Program Structure that includes a single instruction called `initialize` that creates a new account (`NewAccount`) and initializes it with a `u64` value.

<details>

<summary>Standard Anchor Program Structure</summary>

```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data; // Direct on-chain data access
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)] // 8-byte Anchor discriminator + 8-byte u64 data field
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>, // Only signer required, no remaining_accounts
    pub system_program: Program<'info, System>, // Direct system program call
}

#[account] // Stores data on-chain, no hashing
pub struct NewAccount {
    data: u64, // No #[hash] attributes needed
}
```

</details>

### declare\_id! & derive\_light\_cpi\_signer!

ZK compression uses the standard Anchor [`declare_id!`](https://docs.rs/anchor-lang/latest/anchor_lang/macro.declare_id.html) macro to establish program identity alongside the Light SDK's `derive_light_cpi_signer!` macro for Light System Program CPI authorization.

```rust
use light_sdk::{cpi::CpiSigner, derive_light_cpi_signer};

declare_id!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

pub const LIGHT_CPI_SIGNER: CpiSigner = // Contains program_id [u8; 32], cpi_signer [u8; 32], bump u8
    derive_light_cpi_signer!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");
```

The `derive_light_cpi_signer!` macro computes a PDA at compile time using "cpi\_authority" seed that serves as the program's CPI signature for Light System Program invocation. This signer allows your program to create, update, and manage compressed accounts.

{% hint style="info" %}
The program ID string must match exactly between `declare_id!` and `derive_light_cpi_signer!`. The CPI signer constant is used in all CPI operations with compressed accounts.
{% endhint %}

### #\[program] attribute

The [`#[program]`](https://docs.rs/anchor-lang/latest/anchor_lang/attr.program.html) attribute works identically in ZK compression programs, but instruction signatures include additional parameters for compressed account operations:

```rust
#[program]
pub mod zk_compression_program {
    use super::*;

    pub fn create_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>,
        proof: ValidityProof, // Required for all compressed operations
        address_tree_info: PackedAddressTreeInfo, // Merkle tree parameters
        output_state_tree_index: u8, // Target tree selection
        message: String, // Custom instruction data
    ) -> Result<()> {
        // Compressed account operations require CPI to Light System Program
        Ok(())
    }
}
```

<details>

<summary>Standard Anchor Program Module</summary>

```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data; // Direct on-chain data access
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)] // 8-byte discriminator + 8-byte u64
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>, // Only signer required, no remaining_accounts
    pub system_program: Program<'info, System>, // Direct system program call
}

#[account] // Stores data on-chain, no hashing
pub struct NewAccount {
    data: u64, // No #[hash] attributes needed
}
```

</details>

#### Instruction Context

ZK compression instruction context uses the same `Context` type as standard Anchor with key differences in how accounts are accessed. The Context type provides the instruction with access to the following non-argument inputs:

```rust
#[program]
pub mod zk_compression_program {
    use super::*;
​
    pub fn create_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>,
        proof: ValidityProof, // ZK validity pr
        // oof verifying Merkle tree state consistency
        address_tree_info: PackedAddressTreeInfo, // Address Merkle tree metadata and insertion parameters
        output_state_tree_index: u8, // Target state Merkle tree index for account hash insertion
        message: String,
    ) -> Result<()> {
        // Setup Light System Program CPI accounts
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts, // Light Protocol infrastructure accounts
            crate::LIGHT_CPI_SIGNER,
        );
​
        // Derive deterministic address for compressed account
        let (address, address_seed) = derive_address(
            &[b"data", ctx.accounts.signer.key().as_ref()],
            &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?,
            &crate::ID,
        );
​
        // Create and populate compressed account
        let mut data_account = LightAccount::<'_, DataAccount>::new_init(
            &crate::ID,
            Some(address),
            output_state_tree_index,
        );
        data_account.owner = ctx.accounts.signer.key();
        data_account.message = message;
​
        // Package data with validity proof and execute CPI
        let cpi_inputs = CpiInputs::new_with_address(
            proof,
            vec![data_account.to_account_info()?],
            vec![address_tree_info.into_new_address_params_packed(address_seed)],
        );
​
        cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;
        Ok(())
    }
}
```

The Context fields are used as follows:

* **`ctx.accounts`** - Contains only minimal accounts (typically just `signer`), not the compressed accounts
* **`ctx.remaining_accounts`** - Contains all 8 Light Protocol system accounts required for Merkle tree operations
  1. **Fee payer** (signer, writable) - Transaction fee payer
  2. **Authority/CPI Signer** (signer, readonly) - Derived CPI authority PDA
  3. **Registered Program PDA** (readonly) - Program registration account
  4. **Noop Program** (readonly) - No-op program for logging
  5. **Account Compression Program** (readonly) - Merkle tree operations
  6. **Account Compression Authority PDA** (readonly) - Compression program authority
  7. **Light System Program** (readonly) - Core compressed account program
  8. **System Program** (readonly) - Solana system program
* **Account access pattern** - Compressed accounts accessed via `LightAccount` wrapper, not direct `ctx.accounts` field access
* **CPI requirement** - All compressed operations require CPI to Light System Program via `ctx.remaining_accounts`

Additional parameters are included for compressed account operations and must be provided when the instruction is invoked:

* **`ValidityProof`** - Zero-knowledge proof for Merkle tree state consistency, supporting inclusion proofs (existing accounts), non-inclusion proofs (new addresses), or combined proofs
* **`PackedAddressTreeInfo`** - Address Merkle tree metadata containing:
  * **`address_merkle_tree_pubkey_index: u8`** - Index to address Merkle tree account in remaining\_accounts
  * **`address_queue_pubkey_index: u8`** - Index to address queue account in remaining\_accounts
  * **`root_index: u16`** - Index of root in address tree's root history array
* **`output_state_tree_index`** - Index of Merkle tree in the account array for storing the account hash

<details>

<summary>Standard Anchor Context Structure</summary>

```rust
pub struct Context<'a, 'b, 'c, 'info, T: Bumps> {
    /// Currently executing program id.
    pub program_id: &'a Pubkey,
    /// Deserialized accounts.
    pub accounts: &'b mut T,
    /// Remaining accounts given but not deserialized or validated.
    /// Be very careful when using this directly.
    pub remaining_accounts: &'c [AccountInfo<'info>],
    /// Bump seeds found during constraint validation. This is provided as a
    /// convenience so that handlers don't have to recalculate bump seeds or
    /// pass them in as arguments.
    /// Type is the bumps struct generated by #[derive(Accounts)]
    pub bumps: T::Bumps,
}
```

</details>
