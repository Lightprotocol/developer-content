---
description: >-
  Guide to reinitialize compressed accounts in Solana programs with full code
  examples.
---

# How to Reinitialize Compressed Accounts

## Overview

Compressed accounts are reinitialized via CPI to the Light System Program.

An empty compressed account can be reinitialized

* with an account hash marked as empty with zero values and zero discriminator
* to create a new account hash at the same address with new values.

{% hint style="success" %}
Find [full code examples of a counter program at the end](how-to-reinitialize-compressed-accounts.md#full-code-example) for Anchor and native Rust.
{% endhint %}

## Implementation Guide

This guide will cover the components of a Solana program that reinitializes compressed accounts.\
Here is the complete flow to reinitialize compressed accounts:&#x20;

<figure><picture><source srcset="../../.gitbook/assets/Untitled (5).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/image (28).png" alt=""></picture><figcaption><p>Reinitialize Compressed Account Complete Flow. Program-side highlighted.</p></figcaption></figure>

{% stepper %}
{% step %}
### Program Setup

<details>

<summary>Dependencies, Constants, Compressed Account</summary>

#### Dependencies

Add dependencies to your program.

```toml
[dependencies]
light-sdk = "0.15.0"
anchor_lang = "0.31.1"
```

```toml
[dependencies]
light-sdk = "0.15.0"
borsh = "0.10.0"
solana-program = "2.2"
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

* CPIs to the Light System program must be signed with a PDA derived by your program with the seed `b"authority"`
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
pub struct MyCompressedAccount {
    pub owner: Pubkey,
    pub message: String,
}
```

You derive

* the standard traits (`Clone`, `Debug`, `Default`),
* `borsh` or `AnchorSerialize` to serialize account data, and
* `LightDiscriminator` to implements a unique type ID (8 bytes) to distinguish account types. The default compressed account layout enforces a discriminator in its _own field_, not the first 8 bytes of the data field\[^1].

{% hint style="info" %}
The traits listed above are required for `LightAccount`. `LightAccount` wraps `MyCompressedAccount` in Step 3 to set the discriminator and create the compressed account's data.
{% endhint %}

</details>
{% endstep %}

{% step %}
### Instruction Data

Define the instruction data with the following parameters:

```rust
pub struct InstructionData {
    proof: ValidityProof,
    account_meta: CompressedAccountMeta,
}
```

1. **Validity Proof**

* Define `proof` to include the proof that the account exists in the state tree.
* Clients fetch a validity proof with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input state and output state tree (stores new account hash)**

* `CompressedAccountMeta` points to the closed account hash and output state tree to store the new account hash:
  * `tree_info: PackedStateTreeInfo`: References the existing account hash in the state tree.
  * `address`: The account's derived address.
  * `output_state_tree_index`: References the state tree account that will store the new compressed account hash.

{% hint style="info" %}
Reinitialization does not require `current_value` parameters. `new_empty()` automatically uses the closed account as input.
{% endhint %}
{% endstep %}

{% step %}
### Reinitialize Closed Account

Reinitialize the closed account with `LightAccount::new_empty()`.

{% hint style="info" %}
`new_empty()`

1. reconstructs the closed account hash with zero values, and
2. creates output state with provided initial values.
{% endhint %}

```rust
let my_compressed_account 
        = LightAccount::<'_, MyCompressedAccount>::new_empty(
    &crate::ID,
    &account_meta,
    MyCompressedAccount::default(),
)?;
```

**Pass these parameters to `new_empty()`:**

* `crate::ID`: The program's ID that owns the compressed account.
* `account_meta`: The `CompressedAccountMeta` from instruction data (_Step 2_) that identifies the existing account and specifies the output state tree.

**The SDK creates:**

* A `LightAccount` wrapper with account data initialized via `MyCompressedAccount::default()`.
* The `Default` trait creates a zero-initialized instance (`Pubkey` as all zeros, `u64` as `0`, `String` as empty).
* Programs can modify these values after `new_empty()` returns, similar to `new_mut()` when updating compressed accounts.

{% hint style="info" %}
`new_empty()` reconstructs the closed account hash with zero values. The Light System Program verifies the closed account hash and creates the output hash in _Step 4_.&#x20;
{% endhint %}
{% endstep %}

{% step %}
### Light System Program CPI

Invoke the Light System Program to reinitialize the compressed account.

{% hint style="info" %}
The Light System Program

* validates the closed account hash exists in state tree,
* nullifies the closed account hash, and
* appends the new account hash with provided values to the state tree.
{% endhint %}

```rust
let light_cpi_accounts = CpiAccounts::new(
    fee_payer,
    remaining_accounts,
    LIGHT_CPI_SIGNER,
);

LightSystemProgramCpi::new_cpi(LIGHT_CPI_SIGNER, proof)
    .with_light_account(my_compressed_account)?
    .invoke(light_cpi_accounts)?;
```

**Set up `CpiAccounts::new()`:**

* `fee_payer`: Fee payer and transaction signer
* `remaining_accounts`: `AccountInfo` slice with Light System and packed tree accounts.
* `LIGHT_CPI_SIGNER`: Your program's CPI signer defined in Constants.

**Build the CPI instruction**:

* `new_cpi()` initializes the CPI instruction with the `proof` to prove the closed account hash exists in the state tree _- defined in the Instruction Data (Step 2)._
* `with_light_account` adds the `LightAccount` configured with the closed account hash as input and provided values as output _- defined in Step 3_.
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
Find the source code for this example here.
{% endhint %}

```rust
```
{% endtab %}

{% tab title="Native" %}

{% endtab %}
{% endtabs %}

## Next Steps

Build a client for your program or learn how to burn compressed accounts.

{% columns %}
{% column %}
{% content-ref url="../client-library/" %}
[client-library](../client-library/)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="how-to-burn-compressed-accounts.md" %}
[how-to-burn-compressed-accounts.md](how-to-burn-compressed-accounts.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}
