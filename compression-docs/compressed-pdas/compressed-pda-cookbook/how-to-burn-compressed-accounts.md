---
description: >-
  Complete guide to permanently burn compressed accounts in Solana programs with
  the light-sdk crate. Includes step-by-step guide and full code examples.
---

# How to Burn Compressed Accounts

Compressed accounts are permanently burned via CPI to the Light System Program. A burned account cannot be reinitialized.&#x20;

Burning a compressed account

* consumes the existing account hash (input), and
* produces no output state.

{% hint style="success" %}
Find [full code examples of a counter program at the end](how-to-burn-compressed-accounts.md#full-code-example) for Anchor, native Rust, and Pinocchio.
{% endhint %}

<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch current account data
   ├─ Fetch validity proof (proves that account exists)
   ├─ Build instruction with proof and current data
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify input hash
         ├─ Nullify input hash (permanent)
         ├─ No output state created
         └─ Complete atomic state transition
</code></pre>

{% stepper %}
{% step %}
### Program Setup

{% hint style="info" %}
The compressed account struct is defined once and reused for all operations (create, update, close, reinitialize, burn).
{% endhint %}

<details>

<summary>Dependencies, Constants, Compressed Account</summary>

#### Dependencies

Add dependencies to your program.

```toml
[dependencies]
light-sdk = "0.13.0"
anchor_lang = "0.31.1"
```

```toml
[dependencies]
light-sdk = "0.13.0"
borsh = "0.10.0"
solana-sdk = "2.2"
```

```toml
[dependencies]
light-sdk-pinocchio = "0.13.0"
borsh = "0.10.0"
pinocchio = "0.9"
```

* The `light-sdk` provides macros, wrappers and CPI interface to create and interact with compressed accounts.
* Add the serialization library (`borsh` for native Rust, or use `AnchorSerialize`).

#### Constants

Set program address and derive the CPI authority PDA to call the Light System program.

```rust
declare_id!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");

pub const LIGHT_CPI_SIGNER: CpiSigner =
    derive_light_cpi_signer!("GRLu2hKaAiMbxpkAM1HeXzks9YeGuz18SEgXEizVvPqX");
```

**`CPISigner`** is the configuration struct for CPI's to the Light System Program.

* CPI to the Light System program must be signed with a PDA derived by your program with the seed `b"authority"`
* `derive_light_cpi_signer!` derives the CPI signer PDA for you at compile time.

#### Compressed Account

Define your compressed account struct.

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

These traits are derived besides the standard traits (`Clone`, `Debug`, `Default`):

* `borsh` or `AnchorSerialize` to serialize account data.
* `LightDiscriminator` implements a unique type ID (8 bytes) to distinguish account types. The default compressed account layout enforces a discriminator in its _own field_, [not the first 8 bytes of the data field](#user-content-fn-1)[^1].

{% hint style="info" %}
The traits listed above are required for `LightAccount`. `LightAccount` wraps `DataAccount` to set the discriminator and create the compressed account's data hash.
{% endhint %}

</details>
{% endstep %}

{% step %}
### Instruction Data

Define the instruction data with the following parameters:

```rust
pub struct InstructionData {
    proof: ValidityProof,
    account_meta: CompressedAccountMetaBurn,
    current_value: u64,
}
```

1. **Inclusion Proof**

* `ValidityProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash**

* `CompressedAccountMetaBurn` points to the existing account hash so the Light System Program can nullify it permanently:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash (merkle tree pubkey index, leaf index, root index)
  * `address` specifies the account's derived address

{% hint style="info" %}
Burn does not specify an output state tree. `CompressedAccountMetaBurn` omits `output_state_tree_index` because no output state is created.
{% endhint %}

3. **Current account data**

* `current_value`: Current account data to verify the input state. This depends on your program logic.
{% endstep %}

{% step %}
### Burn Compressed Account

Burn the compressed account with `LightAccount::new_burn()`.

{% hint style="info" %}
`new_burn()`

1. hashes the current account data as input state and
2. creates no output state to burn the account permanently.&#x20;

No account can be reinitialized at this address in the future.
{% endhint %}

```rust
let my_compressed_account = LightAccount::<'_, DataAccount>::new_burn(
    &crate::ID,
    &account_meta,
    DataAccount {
        owner: *signer.key,
        message: current_message,
    },
)?;
```

**Parameters for `LightAccount::new_burn()`:**

* `crate::ID` specifies the program ID that owns the compressed account.
* `account_meta` points to the existing account hash for the Light System Program to nullify permanently - defined in the _Instruction Data (Step 2)_.
* `DataAccount` contains the current account data. This input state is hashed by `new_burn()` and verified during CPI.
{% endstep %}

{% step %}
### Light System Program CPI

The Light System Program CPI burns the compressed account permanently.

{% hint style="info" %}
The Light System Program

* validates the account exists in state tree with `proof`,
* nullifies the account hash permanently, and
* creates no output state.
{% endhint %}

```rust
let light_cpi_accounts = CpiAccounts::new(
    ctx.accounts.fee_payer.as_ref(),
    ctx.remaining_accounts,
    crate::LIGHT_CPI_SIGNER,
);

LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Set up `CpiAccounts::new()`:**

* `ctx.accounts.fee_payer.as_ref()`: Fee payer and transaction signer
* `ctx.remaining_accounts`: `AccountInfo` slice [with Light System and packed tree accounts](#user-content-fn-2)[^2].
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Build and invoke the CPI instruction**:

* `new_cpi()` initializes the CPI instruction with the `proof` to prove the account exists in the state tree (inclusion) _- defined in the Instruction Data (Step 2)._
* `with_light_account` adds the `LightAccount` wrapper configured to burn the account _- defined in Step 3_.
* `invoke(light_cpi_accounts)` calls the Light System Program with `CpiAccounts`.
{% endstep %}
{% endstepper %}

## Full Code Example

The counter programs below implement all steps from this guide. Make sure you have your [developer environment](https://www.zkcompression.com/compressed-pdas/create-a-program-with-compressed-pdas#start-building) set up first.

```bash
npm -g i @lightprotocol/zk-compression-cli
light init testprogram
```

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
Find the source code for this example [here](https://github.com/Lightprotocol/program-examples/blob/main/counter/anchor/programs/counter/src/lib.rs).
{% endhint %}

```rust
#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use anchor_lang::{prelude::*, AnchorDeserialize, Discriminator};
use light_sdk::{
    account::LightAccount,
    cpi::{v1::CpiAccounts, CpiSigner},
    derive_light_cpi_signer,
    instruction::{account_meta::CompressedAccountMetaBurn, ValidityProof},
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

    pub fn burn_counter<'info>(
        ctx: Context<'_, '_, '_, 'info, GenericAnchorAccounts<'info>>,
        proof: ValidityProof,
        counter_value: u64,
        account_meta: CompressedAccountMetaBurn,
    ) -> Result<()> {
        let counter = LightAccount::<'_, CounterAccount>::new_burn(
            &crate::ID,
            &account_meta,
            CounterAccount {
                owner: ctx.accounts.signer.key(),
                value: counter_value,
            },
        )?;

        let light_cpi_accounts = CpiAccounts::new(
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
            crate::LIGHT_CPI_SIGNER,
        );

        LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
            .with_light_account(counter)?
            .invoke(light_cpi_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct GenericAnchorAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

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

{% endtab %}

{% tab title="Pinocchio" %}

{% endtab %}
{% endtabs %}

## Next Steps

{% columns %}
{% column %}
{% content-ref url="../client-library/" %}
[client-library](../client-library/)
{% endcontent-ref %}
{% endcolumn %}

{% column %}

{% endcolumn %}
{% endcolumns %}

[^1]: The [Anchor](https://www.anchor-lang.com/) framework reserves the first 8 bytes of a _regular account's data field_ for the discriminator.

[^2]: 1. Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
    2. CPI Authority - Program-derived authority PDA
    3. Registered Program PDA - Registration account for your program
    4. Noop Program - For transaction logging
    5. Account Compression Authority - Authority for merkle tree operations
    6. Account Compression Program - SPL Account Compression program
    7. Invoking Program - Your program's address
    8. System Program - Solana System program
