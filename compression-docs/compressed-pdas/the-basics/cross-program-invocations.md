# Cross Program Invocations

Programs invoke the light system program via CPI to create, update, or close compressed accounts. Light CPI requires validity proofs to verify compressed account state changes.

{% hint style="info" %}
See [source code](https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/sdk/src/cpi/mod.rs) for complete implementation details.
{% endhint %}

## CPI Workflow

Compressed account CPI calls follow this pattern:

```rust
// 1. Derive CPI signer
const LIGHT_CPI_SIGNER: CpiSigner = derive_light_cpi_signer!("YOUR_PROGRAM_ID");

// 2. Create CPI accounts
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts,
    LIGHT_CPI_SIGNER,
);

// 3. Initialize compressed account wrapper
let mut account = LightAccount::<'_, MyData>::new_init(&crate::ID, address, output_state_tree_index);
account.account = my_data;

// 4. Bundle proof and account data
let cpi_inputs = CpiInputs::new(proof, vec![account.to_account_info()?]);

// 5. Invoke light system program to create compressed account
cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;
```

### `derive_light_cpi_signer!()`

Computes CPI signer and bump seed at compile time for your program.

```rust
const LIGHT_CPI_SIGNER: CpiSigner = derive_light_cpi_signer!("YOUR_PROGRAM_ID");
```

### `CpiAccounts::new()`

Creates CPI accounts struct containing fee payer, remaining accounts, and CPI signer.

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts,
    LIGHT_CPI_SIGNER,
);
```

* `fee_payer: &T` - Transaction fee payer
* `ctx.remaining_accounts` - [System accounts](#user-content-fn-1)[^1] required for Light System program CPI
* `cpi_signer: CpiSigner` - Program signer for CPI calls

### `LightAccount::new_init()`

Creates compressed account wrapper for new accounts with owner, address, and output state tree index.

```rust
let mut account = LightAccount::<'_, MyData>::new_init(&crate::ID, address, output_state_tree_index);
account.account = my_data;
```

* `address` - Optional deterministic address for the account
* `output_state_tree_index` - Index of output Merkle tree to store the account

### `CpiInputs::new()`

Packages validity proof and serialized account data for light system program.

```rust
let cpi_inputs = CpiInputs::new(proof, vec![account.to_account_info()?]);
```

* `proof` - ZK proof verifying merkle inclusion of existing accounts and non-inclusion of new addresses
* `vec![account.to_account_info()?]` - Serialized compressed account data

### `invoke_light_system_program()`

Creates instruction and invokes light system program with signer seeds and bump.

```rust
cpi_inputs.invoke_light_system_program(light_cpi_accounts)?;
```

## Next Steps

See [create-and-update example](https://github.com/Lightprotocol/program-examples/tree/main/create-and-update) for complete usage.

[^1]: 

    ```
    - LightSystemProgram, 
    - Authority,
    - RegisteredProgramPda,
    - NoopProgram,
    - AccountCompressionAuthority,
    - AccountCompressionProgram, 
    - InvokingProgram, 
    - SolPoolPda, 
    - DecompressionRecipient, 
    - SystemProgram, 
    - CpiContext
    ```
