---
description: >-
  Learn about the structure of programs with compressed accounts, including
  Light SDK integration and key components that extend Anchor programs for
  operations with compressed accounts.
---

# Program Structure

Custom programs can use compressed accounts with familiar Anchor patterns. The Light SDK's main macros include:

* `declare_id!` & `derive_light_cpi_signer!`: Specifies Program ID  and authorizes Light System Program CPI
* `#[program]`: Specifies module for the program's instruction logic to interact with compressed accounts (Standard Anchor module)
* `LightHasher` & `LightDiscriminator`: Traits for compressed account serialization and identification
* `ValidityProof` parameter: ZK proof validation for interactions with compressed accounts
* `#[hash]` attribute: Field-level control over what data is hashed to a Merkle tree

### Example Program

The program below includes a single instruction `create_compressed_account` that creates a compressed account with derived address and stores custom data. It showcases the basic structure and key differences from standard Anchor programs.

```rust
#![allow(unexpected_cfgs)]

use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};
// Light SDK imports for compressed account operations
use light_sdk::{
    account::LightAccount, // Compressed account abstraction with serialization methods
    address::v1::derive_address, // Deterministic address derivation from seeds and trees
    cpi::{CpiAccounts, CpiInputs, CpiSigner}, // Simplified CPI interface for Light System Program
    derive_light_cpi_signer, // Macro to derive PDA signer for Light System Program CPIs
    instruction::{PackedAddressTreeInfo, ValidityProof}, // ZK proof structures and Merkle tree metadata
    LightDiscriminator, LightHasher, // Traits for compressed account hash computation and discriminators
};

declare_id!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

// PDA signer derived from program ID for authorized Light System Program CPIs
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

#[program]
pub mod zk_compression_program {
    use super::*;

    pub fn create_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>,
        proof: ValidityProof, // ZK validity proof verifying Merkle tree state consistency
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

        // Derive deterministic address for compressed account
        let (address, address_seed) = derive_address(
            &[b"data", ctx.accounts.signer.key().as_ref()],
            &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?,
            &crate::ID,
        );

        // Create and populate compressed account
        let mut data_account = LightAccount::<'_, DataAccount>::new_init(
            &crate::ID,
            Some(address),
            output_state_tree_index,
        );
        data_account.owner = ctx.accounts.signer.key();
        data_account.message = message;

        // Package data with validity proof and execute CPI
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

// Compressed account data structure with hash-enabled fields
#[derive(Clone, Debug, Default, AnchorSerialize, AnchorDeserialize, LightHasher, LightDiscriminator)]
pub struct DataAccount {
    #[hash] // Included in compressed account hash for Merkle tree
    pub owner: Pubkey,
    #[hash] // Included in compressed account hash for Merkle tree
    pub message: String,
}
```

### declare\_id! and derive\_light\_cpi\_signer!

ZK compression programs use the standard Anchor [`declare_id!`](https://docs.rs/anchor-lang/latest/anchor_lang/macro.declare_id.html) macro alongside the Light SDK's `derive_light_cpi_signer!` macro to establish program identity and CPI authorization.

```rust
use light_sdk::{cpi::CpiSigner, derive_light_cpi_signer};

// [!code highlight]
declare_id!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

// [!code highlight:2]
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");
```

The `derive_light_cpi_signer!` macro creates a Program Derived Address (PDA) that serves as the program's signature for Cross Program Invocations (CPIs) to the Light System Program. This signer enables your program to create, update, and manage compressed accounts.

**Key Requirements:**

* The program ID string must match exactly between `declare_id!` and `derive_light_cpi_signer!`
* The CPI signer constant is used in all operations with compressed account operations

### #\[program] attribute

The [`#[program]`](https://docs.rs/anchor-lang/latest/anchor_lang/attr.program.html) attribute works identically in ZK compression programs, but instruction signatures include additional parameters for compressed account operations.

```rust
// [!code highlight]
#[program]
pub mod zk_compression_program {
    use super::*;

    // [!code highlight:8]
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

#### Instruction Parameters

ZK compression instructions typically include these specialized parameters:

* **`ValidityProof`**: ZK proof verifying the legitimacy of compressed account operations
* **`PackedAddressTreeInfo`**: Metadata for address Merkle tree operations
* **`output_state_tree_index`**: Specifies which state tree will store the account hash. State tree's are fungible and maintained by the protocol.
* **Custom data**: Regular instruction parameters (strings, numbers, etc.)

All compressed account operations require a CPI to the Light System Program, which handles the actual Merkle tree updates and proof verification.

### Light SDK Traits

ZK compression programs use specialized traits from the Light SDK to enable compressed account functionality. These traits replace Anchor's standard `#[account]` attribute for compressed data structures.

#### LightHasher & LightDiscriminator

```rust
use light_sdk::{LightDiscriminator, LightHasher};

// [!code highlight:2]
#[derive(Clone, Debug, Default, AnchorSerialize, AnchorDeserialize,
         LightHasher, LightDiscriminator)]
pub struct DataAccount {
    // [!code highlight]
    #[hash] // Included in Merkle tree hash computation
    pub owner: Pubkey,
    // [!code highlight]
    #[hash] // Included in Merkle tree hash computation
    pub message: String,
}
```

**`LightHasher`**: Implements Poseidon hashing for compressed account data. Poseidon hashes are more efficient for generation of zero-knowledge proofs than SHA-256.

**`LightDiscriminator`**: Creates unique identifiers for compressed account types, similar to Anchor's account discriminators but optimized for compressed storage.

#### #\[hash] attribute

The `#[hash]` attribute controls which fields are included in the compressed account's Merkle tree hash:

* **Fields with `#[hash]`**: Included in the account hash stored in state trees
* **Fields without `#[hash]`**: Stored with account data but not part of the hash

```rust
#[derive(LightHasher, LightDiscriminator)]
pub struct ExampleAccount {
    #[hash]
    pub critical_data: u64,    // Part of Merkle tree hash
    pub metadata: String,      // Stored but not hashed
}
```

This granular control optimizes proof generation by only hashing fields critical to proof validity of compressed state.

### ValidityProof Parameter

Every compressed account operation requires a `ValidityProof` parameter to verify the legitimacy of the operation.

```rust
use light_sdk::instruction::ValidityProof;

pub fn create_compressed_account<'info>(
    ctx: Context<'_, '_, '_, 'info, CreateCompressedAccount<'info>>,
    // [!code highlight]
    proof: ValidityProof, // ZK validity proof verifying Merkle tree state consistency
    // ... other parameters
) -> Result<()> {
    // Proof is passed to Light System Program for verification
}
```

`ValidityProof` replaces direct account reads by cryptographically proving:

* Account existence and state in Merkle trees
* Permission to perform the requested operation
* Consistency of Merkle tree state transitions

Clients can fetch validity proofs from RPC providers that support the ZK Compression RPC methods.

### Key Differences from Standard Anchor

#### 1. **No Direct Account Storage**

* Only hashes are stored in on-chain accounts to verify compressed account data. Rent exemption not required for compressed accounts.
* Compressed account data can be stored off-chain without losing Solana's security
* Account retrieval requires proof generation and verification with every transaction. This increases compute unit consumption.

#### 2. **CPI Pattern**

* All compressed operations invoke the Light System Program
* Programs cannot directly modify compressed accounts
* CPI authorization through `derive_light_cpi_signer!` PDA

#### 3. **Proof-Based Validation**

* `ValidityProof` replaces direct account deserialization
* Zero-knowledge proofs verify account state and permissions
* No automatic account constraint validation

#### 4. **State Management**

* Accounts updates create new output state in a Merkle tree
* Input accounts are nullified after operations
* The Solana ledger tracks global state changes

### Development Workflow

#### Dependencies

```toml
[dependencies]
anchor-lang = "0.30.1"
light-sdk = "0.12.0"
```

#### Import Pattern

```rust
use anchor_lang::prelude::*;
use light_sdk::{
    account::LightAccount,
    address::v1::derive_address,
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer,
    instruction::{PackedAddressTreeInfo, ValidityProof},
    LightDiscriminator, LightHasher,
};
```

### Next Steps

learn about testing (...) ZK compression programs require:

* Light Protocol test validator with compression programs
* Validity proof generation in test clients
* Merkle tree state management during testing
