---
description: >-
  Complete guide to create compressed accounts using Light SDK with the
  `create_compressed_account()` instruction. Includes program structure, CPI
  setup, and address derivation.
hidden: true
---

# How to Create Compressed Accounts

The `create_compressed_account()` instruction creates new compressed accounts with derived addresses.

The instruction creates performs these operations:

1. **Light System Program CPI Setup** - Validate and organize accounts for CPI calls
2. **Deterministic Address Generation** - Derive 32-byte address and seed from input parameters
3. **Compressed Account Structure Creation** - Initialize LightAccount wrapper and populate with data fields
4. **State Tree Insertion** - Package account data with validity proof and execute CPI to update Merkle trees

{% code title="create-compressed-account.rs" %}
```rust
pub fn create_compressed_account<'info>(
    ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
    proof: ValidityProof, // ZK proof for compressed account creation
    address_tree_info: PackedAddressTreeInfo, // Address Merkle tree metadata
    output_state_tree_index: u8, // Target state Merkle tree index (0-255)
    message: String,
) -> Result<()> {
    // Initialize Light System Program CPI accounts
    let light_cpi_accounts = CpiAccounts::new(
        ctx.accounts.signer.as_ref(), // fee payer
        ctx.remaining_accounts, // Light Protocol system accounts
        crate::LIGHT_CPI_SIGNER,
    );

    // Derive deterministic address from seeds
    let (address, address_seed) = derive_address(
        &[b"seed", ctx.accounts.signer.key().as_ref()],
        &address_tree_info.get_tree_pubkey(&light_cpi_accounts)?,
        &crate::ID,
    );

    // Create LightAccount wrapper with derived address
    let mut data_account = LightAccount::<'_, DataAccount>::new_init(
        &crate::ID, // owner program ID
        Some(address), // derived address
        output_state_tree_index, // target state tree
    );

    // Package account data and validity proof for Light System Program CPI
    let cpi_inputs = CpiInputs::new_with_address(
        proof,
        vec![data_account.to_account_info()?],
        vec![address_tree_info.into_new_address_params_packed(address_seed)],
    );

    // Execute CPI to insert account hash into state tree
    cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;
    Ok(())
}
```
{% endcode %}

### Full Code Example

{% stepper %}
{% step %}
#### Prerequisites

{% hint style="info" %}
This guide demonstrates on-chain program development with ZK compression. You'll need Rust, Anchor framework, and Light Protocol test validator.
{% endhint %}

<details>

<summary>Prerequisites &#x26; Setup</summary>

#### Development Environment

```bash
# Install Rust and Anchor
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

#### Light Protocol Dependencies

```toml
# Cargo.toml
[dependencies]
anchor-lang = "0.30.1"
light-sdk = "0.12.0"
borsh = "1.5.1"
```

#### Test Validator Setup

```bash
# Install Light Protocol CLI
npm install -g @lightprotocol/zk-compression-cli

# Start local test validator with ZK compression
light test-validator
```

</details>
{% endstep %}

{% step %}
#### Program Structure

Create the complete Anchor program with Light SDK integration:

{% code title="lib.rs" %}
```rust
// Allow unstable configuration flags during Light SDK development
#![allow(unexpected_cfgs)]

use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};
// Borsh serialization for deterministic compressed account data encoding
use borsh::{BorshDeserialize, BorshSerialize};
use light_sdk::{
    account::LightAccount, // Compressed account abstraction with serialization methods
    address::v1::derive_address, // Deterministic address derivation from seeds and trees
    cpi::{CpiAccounts, CpiInputs, CpiSigner},
    derive_light_cpi_signer, // Macro to derive PDA signer for Light System Program CPIs
    instruction::{account_meta::CompressedAccountMeta, PackedAddressTreeInfo, ValidityProof}, // ZK proof structures and Merkle tree metadata
    LightDiscriminator, LightHasher, // Traits for compressed account hash computation and discriminators
};

declare_id!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

// PDA signer derived from program ID for authorized Light System Program CPIs
pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("HNqStLMpNuNJqhBF1FbGTKHEFbBLJmq8RdJJmZKWz6jH");

// Seed constant for deterministic compressed account address derivation
pub const FIRST_SEED: &[u8] = b"first";

#[program]
pub mod create_and_update {
    use super::*;

    pub fn create_compressed_account<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof, // ZK validity proof verifying Merkle tree state consistency
        address_tree_info: PackedAddressTreeInfo, // Address Merkle tree metadata and insertion parameters
        output_state_tree_index: u8, // Target state Merkle tree index for account hash insertion (0-255)
        message: String,
    ) -> Result<()> {
        // Step 1: Validate and organize Light System Program CPI accounts
        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(), // fee payer and transaction authority
            ctx.remaining_accounts, // Light Protocol infrastructure accounts (Merkle trees, compression programs)
            crate::LIGHT_CPI_SIGNER, // PDA signer for authorized Light System Program CPI
        );

        // Step 2: Derive deterministic 32-byte address and seed from input parameters
        let (address, address_seed) = derive_address(
            &[FIRST_SEED, ctx.accounts.signer.key().as_ref()], // seed array for deterministic address generation
            &address_tree_info // address Merkle tree parameters
                .get_tree_pubkey(&light_cpi_accounts)
                .map_err(|_| ErrorCode::AccountNotEnoughKeys)?,
            &crate::ID, // program ID as derived address owner
        );

        // Step 3: Initialize uninitialized LightAccount structure for data serialization
        let mut data_account = LightAccount::<'_, DataAccount>::new_init(
            &crate::ID, // program ID as compressed account owner
            Some(address), // derived address for compressed account location in address tree
            output_state_tree_index, // target state Merkle tree index for account hash insertion
        );

        // Step 4: Set compressed account data fields (serialized off-chain, hash stored on-chain)
        data_account.owner = ctx.accounts.signer.key();
        data_account.message = message;

        msg!("Compressed account address: {}", address);
        msg!("State tree index: {}", output_state_tree_index);
        msg!("Address tree: {}", address_tree_info.get_tree_pubkey(&light_cpi_accounts)?);

        // Step 5: Serialize account data and package with address parameters for CPI
        let cpi_inputs = CpiInputs::new_with_address(
            proof, // ZK validity proof verifying operation legitimacy
            vec![data_account.to_account_info().map_err(ProgramError::from)?], // serialized compressed account data for hashing
            vec![address_tree_info.into_new_address_params_packed(address_seed)], // packed address insertion parameters with derived seed
        );

        // Step 6: Execute CPI to hash account data and update both state and address Merkle trees
        cpi_inputs
            .invoke_light_system_program(light_cpi_accounts)
            .map_err(ProgramError::from)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct GenericAnchorAccounts<'info> {
    #[account(mut)] // mutable for fee payment
    pub signer: Signer<'info>,
}

// Compressed account data structure with hash-enabled fields
#[derive(Clone, Debug, Default, LightHasher, LightDiscriminator)]
pub struct DataAccount {
    #[hash] // included in compressed account hash
    pub owner: Pubkey,
    #[hash] // included in compressed account hash
    pub message: String,
}
```
{% endcode %}
{% endstep %}

{% step %}
#### Build and Test

Build the program and verify it compiles correctly:

```bash
# Build the program
anchor build

# Run tests (if available)
anchor test
```

**Success!** You've created a ZK compression program that can create compressed accounts with derived addresses. The program demonstrates:

* **Light SDK Integration**: Using CpiAccounts, CpiInputs, and LightAccount
* **Address Derivation**: Deterministic address generation from seeds
* **Data Storage**: Custom DataAccount struct with owner and message fields
* **ZK Proof Handling**: ValidityProof verification through Light System Program CPI
{% endstep %}
{% endstepper %}

### Next Steps

Learn how to update existing compressed accounts

&#x20;\>page link>
