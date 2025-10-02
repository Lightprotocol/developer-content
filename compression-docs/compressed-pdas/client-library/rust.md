---
description: >-
  Build a Rust client to create, update, and close compressed accounts using
  `LightProgramTest` and `light-sdk`. Includes a step-by-step guide and full
  code examples.
---

# Rust

Learn how to build a Rust client to create, update, and close compressed accounts. Find a [full code example](rust.md#full-code-example) at the end with counter programs in Anchor and native Rust.

### What you will learn

This guide breaks down each client implementation step:

1. **Dependencies**: Add `light-program-test`, `light-sdk`, and serialization libraries to test and interact with compressed accounts.
2. **Environment**: Set up test validator with `LightProgramTest` that provides prover, indexer, and auto-funded payer.
3. **Tree Configuration**: Fetch address and state tree public keys from the test environment.
4. **Derive persistent address** from seeds, address tree, and program ID to set a unique identifier to your compressed account.
5. **Validity Proof**: Fetch zero-knowledge proof from RPC that proves address doesn't exist (create) or account hash exists (update/close).
6. **Pack Accounts**: Combine program accounts with Light System Program infrastructure accounts with u8 indices instead of pubkeys to reduce instruction size.
7. **Instruction Data**: Build instruction with validity proof, packed tree indices, and custom account data.

### Client Flow Overview

```
𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Derive unique address for the compressed account (create only)
   ├─ Get validity proof from RPC
   │  ├─ Create: Prove address doesn't exist (non-inclusion)
   │  ├─ Update/Close: Prove account exists (inclusion)
   ├─ Prepare address and state tree accounts for the transaction
   ├─ Build instruction with proof and account data
   └─ Send transaction
      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Re-derive the address
      ├─ Parse address and state tree accounts from transaction
      ├─ Initialize compressed account with data and metadata
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify address non-existence proof
         ├─ Register address in address merkle tree
         ├─ Create compressed account hash in state merkle tree
         └─ Complete atomic account creation
```

## Get Started

{% stepper %}
{% step %}
### Dependencies

{% hint style="info" %}
* For testing, `LightProgramTest` provides a validator with auto-funded keypair and all infrastructure.
* For production, use `LightClient` with your filesystem wallet at `~/.config/solana/id.json`.
{% endhint %}



```toml
[dev-dependencies]
light-program-test = "0.13.0"
light-test-utils = "0.13.0"
light-sdk = "0.13.0"
tokio = { version = "1.0", features = ["full"] }
solana-sdk = "2.0"
anchor-lang = "0.30"  # if using Anchor programs
```

**`light-program-test`** is a local test environment for Solana programs using compressed accounts and tokens. It creates an in-process Solana VM optimized for compressed account testing via [LiteSVM](https://github.com/LiteSVM/LiteSVM). Includes built-in prover and in-memory indexer.

**`light-test-utils`**: Helper utilities to test compressed accounts.

**`light-sdk`**: Builds on Solana SDK for compressed accounts. Provides macros, wrappers and utilities to derive addresses, pack accounts, and build instructions.
{% endstep %}

{% step %}
### Environment

In-process test validator. Auto-funded payer, no external setup required.

{% tabs %}
{% tab title="V2" %}
{% hint style="success" %}
**V2 uses batched merkle trees** that provide better performance with >70% less compute unit consumption. Recommended for new development.
{% endhint %}

```rust
let config = ProgramTestConfig::new_v2(
    true,
    Some(vec![("create_and_update", create_and_update::ID)])
);
let mut rpc = LightProgramTest::new(config).await.unwrap();
let payer = rpc.get_payer().insecure_clone();
```

**`ProgramTestConfig::new_v2()`**: Registers your program with V2 batched merkle trees.

**`LightProgramTest::new()`**: Starts a local test validator. Returns RPC client that calls Light System program and merkle trees. Starts indexer to query current compressed account state.

**`get_payer()`**: Returns a pre-funded keypair that `LightProgramTest` created when initialized.
{% endtab %}

{% tab title="V1" %}
```rust
let config = ProgramTestConfig::new(
    true,
    Some(vec![("create_and_update", create_and_update::ID)])
);
let mut rpc = LightProgramTest::new(config).await.unwrap();
let payer = rpc.get_payer().insecure_clone();
```

{% hint style="info" %}
**V1 trees** are the legacy implementation. Use for backward compatibility with older programs.
{% endhint %}

**`ProgramTestConfig::new()`**: Registers your program with V1 merkle trees.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Tree Configuration

Before creating a compressed account, the client must choose:

1. address tree to derive the account's unique address
2. which state tree will store the account's hash

```
ZK Compression's Merkle-Trees 

  ├─ ADDRESS TREE  
     ├─ stores persistent addresses for accounts
     └─ NOT fungible: Tree choice affects the derived address

  ├─ STATE TREE
     ├─ stores compressed account hashes
     └─ Fungible: Any tree works, doesn't affect the hash
```

{% hint style="success" %}
The protocol maintains Merkle trees, so you don't need to initialize your own tree. You can specify any Merkle tree listed in [_Addresses_](https://www.zkcompression.com/resources/addresses-and-urls).
{% endhint %}

```rust
let address_tree_info = rpc.get_address_tree_v1();
let state_tree_info = rpc.get_random_state_tree_info().unwrap();
```

**`get_address_tree_v1()`**: Returns public key of address tree. Used for `derive_address()` calls and to prove this address does not exist yet in this tree with `get_validity_proof`.

**`get_random_state_tree_info()`**: Returns public key of state tree to store the compressed account hash. Tree choice does not affect account hash.
{% endstep %}

{% step %}
### Derive Address (Create only)

Derive a persistent address for the compressed account as unique identifier. The address is computed from seeds, the address tree, and the program ID.

{% hint style="warning" %}
This step is only required for **create** operations. Update and close operations use the existing account's address.
{% endhint %}

```rust
use light_sdk::address::v1::derive_address;

let (address, _) = derive_address(
    &[b"my-seed"],
    &address_tree_info.tree,
    &program_id,
);
```

**`derive_address()`**: Computes a deterministic 32-byte address from the inputs.

**Parameters**:

* `&[b"my-seed"]`: Arbitrary byte slices that uniquely identify the account
* `&address_tree_info.tree` specifies the tree pubkey where this address will be registered. An address is unique to an address tree.
* `ProgramID`: The program that owns this account
{% endstep %}

{% step %}
### Validity Proof

Fetch a zero-knowledge proof (Validity proof) from your RPC provider that supports ZK Compression. The proof type depends on the operation:

* To create a compressed account, you must prove the **address doesn't already exist** in the address tree (_non-inclusion proof_).
* To update or close a compressed account, you must **prove the account hash exists** in a state tree (_inclusion proof_).

{% hint style="info" %}
[Here's a full guide](https://www.zkcompression.com/resources/json-rpc-methods/getvalidityproof) to the `get_validity_proof()` method.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```rust
let rpc_result = rpc
    .get_validity_proof(
        vec![], 
        vec![AddressWithTree {
            address: *address,
            tree: address_tree_info.tree,
        }],
        None,
    )
    .await?
    .value;
```

**Parameters**:

* (`vec![]`) is empty for compressed account creation, since no compressed account exists yet to reference.
* (`vec![AddressWithTree]`) specifies the new address to create with its address tree.

The RPC returns `ValidityProofWithContext` with

* the non-inclusion `proof`, passed to the program in the instruction data. The Light System Program verifies the `proof` against the current Merkle root.
* `addresses` contains the tree metadata for your address (tree, root, leaf index)
* an empty `accounts` field for create operations
{% endtab %}

{% tab title="Update & Close:" %}
{% hint style="info" %}
**Update and Close** use identical proof mechanisms. The difference is in your program's instruction handler.
{% endhint %}

```rust
let hash = compressed_account.hash;

let rpc_result = rpc
    .get_validity_proof(
        vec![hash],  
        vec![],
        None,
    )
    .await?
    .value;
```

The `compressed_account.hash` contains the hash that's currently in the state tree. The indexer searches for this value to generate the proof.

**Parameters**:

* (`vec![hash]`) contains the hash of the existing compressed account to prove its existence in the state tree.
* (`vec![]`) is empty for update/close operations, since the address already exists from account creation.

The RPC returns `ValidityProofWithContext` with

* the inclusion `proof`, passed to the program in the instruction data. The Light System Program verifies the `proof` against the current Merkle root.
* `accounts` contains the tree metadata for the account hash (tree, root, leaf index) for the Light System program to nullify.
* an empty `addresses` field for update/close operations.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Pack Accounts

Pack the account metadata for the transaction. Combines your program's accounts with Light System Program accounts needed to create, update, and close compressed accounts.

{% hint style="info" %}
**Understanding "Packed" terminology:**

* **Packed structs** (e.g., `PackedAddressTreeInfo`, `PackedStateTreeInfo`) contain account **indices** (u8) instead of pubkeys to reduce instruction size.
* Non-Packed structs: Contain full pubkeys for use in the client. These are returned by RPC methods.
* `PackedAccounts` is a helper that deduplicates accounts and assigns sequential indices to create Packed\* structs.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```rust
let mut remaining_accounts = PackedAccounts::default();
let config = SystemAccountMetaConfig::new(create_and_update::ID);
remaining_accounts.add_system_accounts(config);

let packed_address_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .address_trees;

let output_state_tree_index = rpc
    .get_random_state_tree_info()?
    .pack_output_tree_index(&mut remaining_accounts)?;

let accounts = create_and_update::accounts::GenericAnchorAccounts {
    signer: payer.pubkey(),
};
let accounts = [
    accounts.to_account_metas(None),
    remaining_accounts.to_account_metas().0,
]
.concat();
```
{% endtab %}

{% tab title="Update & Close" %}
```rust
let mut remaining_accounts = PackedAccounts::default();
let config = SystemAccountMetaConfig::new(create_and_update::ID);
remaining_accounts.add_system_accounts(config);

let packed_state_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .state_trees
    .unwrap();

let output_state_tree_index = rpc
    .get_random_state_tree_info()?
    .pack_output_tree_index(&mut remaining_accounts)?;

let accounts = create_and_update::accounts::GenericAnchorAccounts {
    signer: payer.pubkey(),
};
let accounts = [
    accounts.to_account_metas(None),
    remaining_accounts.to_account_metas().0,
]
.concat();
```
{% endtab %}
{% endtabs %}

**1. Initialize account packer** with `PackedAccounts::default()`. This creates a helper struct that collects Light System Program account metadata.

**2. Add Light System Program** [**infrastructure accounts**](#user-content-fn-1)[^1]

* `SystemAccountMetaConfig::new(program_id)` configures which program will invoke the Light System Program.
* `add_system_accounts(config)` adds infrastructure accounts needed for CPIs

**3. Pack tree accounts from the validity proof**

* `pack_tree_infos(&mut remaining_accounts)` extracts public keys of Merkle tree accounts from the validity proof and adds them to `remaining_accounts`.
  * For `create`: address tree + state tree accounts
  * For `update`/`close`: only state tree accounts
* This method returns a struct with the respective packed tree info
  * use `.address_trees` for `create`
  * use `.state_trees` for `update`/`close`

**4. Add output state tree**

* `get_random_state_tree_info()` picks a state tree to write the account hash to.
* `pack_output_tree_index(&mut remaining_accounts)` adds public key of the output state tree to `remaining_accounts` and returns an index for the instruction data.

**5. Your program's accounts**

* **`GenericAnchorAccounts`** contains your program's required accounts. This is defined in your Anchor program's `#[derive(Accounts)]` struct.
* Without Anchor, manually create `Vec<AccountMeta>` with your program's accounts
* In this example, it contains only a signer account. Your program may require PDAs, token accounts, or other accounts.

**6. Combine your accounts and `remaining_accounts`**

* **`.to_account_metas(None)`** converts your program accounts to `Vec<AccountMeta>` (Anchor auto-generates this method).
* **`.to_account_metas().0`** converts Light System accounts to `Vec<AccountMeta>`. The `.0` extracts the vector from the tuple.
* **`.concat()`** merges both arrays into a single `Vec<AccountMeta>`.

The packed accounts are then used in your instruction data.
{% endstep %}

{% step %}
### Instruction Data

Build the instruction data with the proof, packed tree info, and your custom data.

{% tabs %}
{% tab title="Create" %}
```rust
let instruction_data = create_and_update::instruction::CreateCompressedAccount {
    proof: rpc_result.proof,
    address_tree_info: packed_address_tree_accounts[0],
    output_state_tree_index,
    message,
};
```
{% endtab %}

{% tab title="Update" %}
```rust
let instruction_data = create_and_update::instruction::UpdateCompressedAccount {
    proof: rpc_result.proof,
    account_meta: CompressedAccountMeta {
        tree_info: packed_state_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_state_tree_accounts.output_tree_index,
    },
    message,
};
```
{% endtab %}

{% tab title="Close" %}
```rust
let instruction_data = create_and_update::instruction::CloseCompressedAccount {
    proof: rpc_result.proof,
    account_meta: CompressedAccountMeta {
        tree_info: packed_state_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_state_tree_accounts.output_tree_index,
    },
};
```
{% endtab %}
{% endtabs %}

**`proof`** verifies the address (create) or account hash (update/close) against the current Merkle root, fetched from RPC in _Step 5_.

**`address_tree_info`** (Create only): u8 index to the address tree from _Step 6_ (`packed_address_tree_accounts[0]`). Points to the tree where the new address will be registered.

**`output_state_tree_index`** (Create only): u8 index from _Step 6_ to the state tree where the account hash will be written. For Update/Close, this field is inside `account_meta`.

**`account_meta`** (Update/Close only): Metadata struct from _Step 6_ containing:

* `tree_info`: u8 index to the state tree holding the current account hash
* `address`: The compressed account's 32-byte address (from _Step 4_)

**`message`**: Your custom account data (Create/Update only). Omitted for Close operations.

{% hint style="info" %}
Account indices reduce transaction size. The client packs accounts in Step 6. Instruction data references these accounts with u8 indices instead of full 32-byte pubkeys.
{% endhint %}
{% endstep %}

{% step %}
### That's it!

You've assembled all components needed for ZK Compression. Creating the `Instruction` and sending the transaction follows standard Solana patterns.
{% endstep %}
{% endstepper %}

## Full Code Example

Now that you understand the concepts to build a Rust Client, start testing. The full code examples below walk you through the complete lifecycle of a counter program: create, increment, decrement, reset, close.

{% tabs %}
{% tab title="Anchor" %}
{% hint style="info" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/anchor/programs/counter/tests/test.rs).
{% endhint %}

```rust
#![cfg(feature = "test-sbf")]

use anchor_lang::{AnchorDeserialize, InstructionData, ToAccountMetas};
use counter::CounterAccount;
use light_client::indexer::{CompressedAccount, TreeInfo};
use light_program_test::{
    program_test::LightProgramTest, AddressWithTree, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::{
    address::v1::derive_address,
    instruction::{account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig},
};
use solana_sdk::{
    instruction::Instruction,
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_counter() {
    let config = ProgramTestConfig::new(true, Some(vec![("counter", counter::ID)]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();

    let (address, _) = derive_address(
        &[b"counter", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &counter::ID,
    );

    // Create the counter.
    create_counter(&mut rpc, &payer, &address, address_tree_info)
        .await
        .unwrap();

    // Check that it was created correctly.
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(compressed_account.leaf_index, 0);
    let counter = &compressed_account.data.as_ref().unwrap().data;
    let counter = CounterAccount::deserialize(&mut &counter[..]).unwrap();
    assert_eq!(counter.value, 0);

    // Increment the counter.
    increment_counter(&mut rpc, &payer, &compressed_account)
        .await
        .unwrap();

    // Check that it was incremented correctly.
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();

    assert_eq!(compressed_account.leaf_index, 1);
    let counter = &compressed_account.data.as_ref().unwrap().data;
    let counter = CounterAccount::deserialize(&mut &counter[..]).unwrap();
    assert_eq!(counter.value, 1);

    // Decrement the counter.
    decrement_counter(&mut rpc, &payer, &compressed_account)
        .await
        .unwrap();

    // Check that it was decremented correctly.
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();

    assert_eq!(compressed_account.leaf_index, 2);

    let counter = &compressed_account.data.as_ref().unwrap().data;
    let counter = CounterAccount::deserialize(&mut &counter[..]).unwrap();
    assert_eq!(counter.value, 0);

    // Reset the counter.
    reset_counter(&mut rpc, &payer, &compressed_account)
        .await
        .unwrap();

    // Check that it was reset correctly.
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    let counter = &compressed_account.data.as_ref().unwrap().data;
    let counter = CounterAccount::deserialize(&mut &counter[..]).unwrap();
    assert_eq!(counter.value, 0);

    // Close the counter.
    close_counter(&mut rpc, &payer, &compressed_account)
        .await
        .unwrap();

    // Check that it was closed correctly (account data should be default).
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(compressed_account.data, Some(Default::default()));
}

async fn create_counter<R>(
    rpc: &mut R,
    payer: &Keypair,
    address: &[u8; 32],
    address_tree_info: TreeInfo,
) -> Result<Signature, RpcError>
where
    R: Rpc + Indexer,
{
    let mut remaining_accounts = PackedAccounts::default();
    let config = SystemAccountMetaConfig::new(counter::ID);
    remaining_accounts.add_system_accounts(config)?;

    let rpc_result = rpc
        .get_validity_proof(
            vec![],
            vec![AddressWithTree {
                tree: address_tree_info.tree,
                address: *address,
            }],
            None,
        )
        .await?
        .value;
    let output_state_tree_index = rpc
        .get_random_state_tree_info()?
        .pack_output_tree_index(&mut remaining_accounts)?;
    let packed_address_tree_info = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .address_trees[0];

    let instruction_data = counter::instruction::CreateCounter {
        proof: rpc_result.proof,
        address_tree_info: packed_address_tree_info,
        output_state_tree_index,
    };

    let accounts = counter::accounts::GenericAnchorAccounts {
        signer: payer.pubkey(),
    };

    let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: [
            accounts.to_account_metas(Some(true)),
            remaining_accounts_metas,
        ]
        .concat(),
        data: instruction_data.data(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

#[allow(clippy::too_many_arguments)]
async fn increment_counter<R>(
    rpc: &mut R,
    payer: &Keypair,
    compressed_account: &CompressedAccount,
) -> Result<Signature, RpcError>
where
    R: Rpc + Indexer,
{
    let mut remaining_accounts = PackedAccounts::default();
    let config = SystemAccountMetaConfig::new(counter::ID);
    remaining_accounts.add_system_accounts(config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_tree_accounts = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let account_meta = CompressedAccountMeta {
        tree_info: packed_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_tree_accounts.output_tree_index,
    };

    let instruction_data = counter::instruction::IncrementCounter {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta,
    };

    let accounts = counter::accounts::GenericAnchorAccounts {
        signer: payer.pubkey(),
    };

    let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: [
            accounts.to_account_metas(Some(true)),
            remaining_accounts_metas,
        ]
        .concat(),
        data: instruction_data.data(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

#[allow(clippy::too_many_arguments)]
async fn decrement_counter<R>(
    rpc: &mut R,
    payer: &Keypair,
    compressed_account: &CompressedAccount,
) -> Result<Signature, RpcError>
where
    R: Rpc + Indexer,
{
    let mut remaining_accounts = PackedAccounts::default();
    let config = SystemAccountMetaConfig::new(counter::ID);
    remaining_accounts.add_system_accounts(config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(Vec::from(&[hash]), vec![], None)
        .await?
        .value;

    let packed_tree_accounts = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let account_meta = CompressedAccountMeta {
        tree_info: packed_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_tree_accounts.output_tree_index,
    };

    let instruction_data = counter::instruction::DecrementCounter {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta,
    };

    let accounts = counter::accounts::GenericAnchorAccounts {
        signer: payer.pubkey(),
    };

    let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: [
            accounts.to_account_metas(Some(true)),
            remaining_accounts_metas,
        ]
        .concat(),
        data: instruction_data.data(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn reset_counter<R>(
    rpc: &mut R,
    payer: &Keypair,
    compressed_account: &CompressedAccount,
) -> Result<Signature, RpcError>
where
    R: Rpc + Indexer,
{
    let mut remaining_accounts = PackedAccounts::default();
    let config = SystemAccountMetaConfig::new(counter::ID);
    remaining_accounts.add_system_accounts(config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(Vec::from(&[hash]), vec![], None)
        .await?
        .value;

    let packed_merkle_context = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let account_meta = CompressedAccountMeta {
        tree_info: packed_merkle_context.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_merkle_context.output_tree_index,
    };

    let instruction_data = counter::instruction::ResetCounter {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta,
    };

    let accounts = counter::accounts::GenericAnchorAccounts {
        signer: payer.pubkey(),
    };

    let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: [
            accounts.to_account_metas(Some(true)),
            remaining_accounts_metas,
        ]
        .concat(),
        data: instruction_data.data(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn close_counter<R>(
    rpc: &mut R,
    payer: &Keypair,
    compressed_account: &CompressedAccount,
) -> Result<Signature, RpcError>
where
    R: Rpc + Indexer,
{
    let mut remaining_accounts = PackedAccounts::default();
    let config = SystemAccountMetaConfig::new(counter::ID);
    remaining_accounts.add_system_accounts(config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(Vec::from(&[hash]), vec![], None)
        .await
        .unwrap()
        .value;

    let packed_tree_infos = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let account_meta = CompressedAccountMeta {
        tree_info: packed_tree_infos.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_tree_infos.output_tree_index,
    };

    let instruction_data = counter::instruction::CloseCounter {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta,
    };

    let accounts = counter::accounts::GenericAnchorAccounts {
        signer: payer.pubkey(),
    };

    let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: [
            accounts.to_account_metas(Some(true)),
            remaining_accounts_metas,
        ]
        .concat(),
        data: instruction_data.data(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}
```
{% endtab %}

{% tab title="Native Rust" %}
{% hint style="success" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/native/tests/test.rs).
{% endhint %}

```rust
#![cfg(feature = "test-sbf")]

use borsh::{BorshDeserialize, BorshSerialize};
use counter::{
    CloseCounterInstructionData, CounterAccount, CreateCounterInstructionData,
    DecrementCounterInstructionData, IncrementCounterInstructionData, ResetCounterInstructionData,
};
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, AddressWithTree, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::address::v1::derive_address;
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};

#[tokio::test]
async fn test_counter() {
    let config = ProgramTestConfig::new(true, Some(vec![("counter", counter::ID)]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let address_tree_pubkey = address_tree_info.tree;

    // Create counter
    let (address, _) = derive_address(
        &[b"counter", payer.pubkey().as_ref()],
        &address_tree_pubkey,
        &counter::ID,
    );
    let merkle_tree_pubkey = rpc.get_random_state_tree_info().unwrap().tree;

    create_counter(
        &payer,
        &mut rpc,
        &merkle_tree_pubkey,
        address_tree_pubkey,
        address,
    )
    .await
    .unwrap();

    // Get the created counter
    let compressed_counter = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(compressed_counter.address.unwrap(), address);

    // Test increment
    increment_counter(&payer, &mut rpc, &compressed_counter)
        .await
        .unwrap();

    let compressed_counter = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();

    // Test decrement
    decrement_counter(&payer, &mut rpc, &compressed_counter)
        .await
        .unwrap();

    let compressed_counter = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();

    // Test reset
    reset_counter(&payer, &mut rpc, &compressed_counter)
        .await
        .unwrap();

    let compressed_counter = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();

    // Test close
    close_counter(&payer, &mut rpc, &compressed_counter)
        .await
        .unwrap();

    // Check that it was closed correctly (account data should be default).
    let closed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(closed_account.data, Some(Default::default()));
}

pub async fn create_counter(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    merkle_tree_pubkey: &Pubkey,
    address_tree_pubkey: Pubkey,
    address: [u8; 32],
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(counter::ID);
    let mut accounts = PackedAccounts::default();
    accounts.add_pre_accounts_signer(payer.pubkey());
    accounts.add_system_accounts(system_account_meta_config)?;

    let rpc_result = rpc
        .get_validity_proof(
            vec![],
            vec![AddressWithTree {
                address,
                tree: address_tree_pubkey,
            }],
            None,
        )
        .await?
        .value;

    let output_merkle_tree_index = accounts.insert_or_get(*merkle_tree_pubkey);
    let packed_address_tree_info = rpc_result.pack_tree_infos(&mut accounts).address_trees[0];
    let (account_metas, _, _) = accounts.to_account_metas();

    let instruction_data = CreateCounterInstructionData {
        proof: rpc_result.proof,
        address_tree_info: packed_address_tree_info,
        output_state_tree_index: output_merkle_tree_index,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: account_metas,
        data: [
            &[counter::InstructionType::CreateCounter as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}

pub async fn increment_counter(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(counter::ID);
    let mut accounts = PackedAccounts::default();
    accounts.add_pre_accounts_signer(payer.pubkey());
    accounts.add_system_accounts(system_account_meta_config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_accounts = rpc_result
        .pack_tree_infos(&mut accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let meta = CompressedAccountMeta {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_accounts.output_tree_index,
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = IncrementCounterInstructionData {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta: meta,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: account_metas,
        data: [
            &[counter::InstructionType::IncrementCounter as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}

pub async fn decrement_counter(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(counter::ID);
    let mut accounts = PackedAccounts::default();
    accounts.add_pre_accounts_signer(payer.pubkey());
    accounts.add_system_accounts(system_account_meta_config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_accounts = rpc_result
        .pack_tree_infos(&mut accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let meta = CompressedAccountMeta {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_accounts.output_tree_index,
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = DecrementCounterInstructionData {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta: meta,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: account_metas,
        data: [
            &[counter::InstructionType::DecrementCounter as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}

pub async fn reset_counter(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(counter::ID);
    let mut accounts = PackedAccounts::default();
    accounts.add_pre_accounts_signer(payer.pubkey());
    accounts.add_system_accounts(system_account_meta_config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_accounts = rpc_result
        .pack_tree_infos(&mut accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let meta = CompressedAccountMeta {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_accounts.output_tree_index,
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = ResetCounterInstructionData {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta: meta,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: account_metas,
        data: [
            &[counter::InstructionType::ResetCounter as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}

pub async fn close_counter(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(counter::ID);
    let mut accounts = PackedAccounts::default();
    accounts.add_pre_accounts_signer(payer.pubkey());
    accounts.add_system_accounts(system_account_meta_config)?;

    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_accounts = rpc_result
        .pack_tree_infos(&mut accounts)
        .state_trees
        .unwrap();

    let counter_account =
        CounterAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let meta_close = CompressedAccountMeta {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_accounts.output_tree_index,
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = CloseCounterInstructionData {
        proof: rpc_result.proof,
        counter_value: counter_account.value,
        account_meta: meta_close,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: counter::ID,
        accounts: account_metas,
        data: [
            &[counter::InstructionType::CloseCounter as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}
{% hint style="info" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/native/tests/test.rs).
{% endhint %}
```
{% endtab %}
{% endtabs %}

## Next Steps

{% content-ref url="../create-a-program-with-compressed-pdas/" %}
[create-a-program-with-compressed-pdas](../create-a-program-with-compressed-pdas/)
{% endcontent-ref %}



[^1]: 

    * Light System Program - SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7

    - CPI Authority - Program-derived authority PDA

    * Registered Program PDA - Registration account for your program

    - Noop Program - For transaction logging

    * Account Compression Authority - Authority for merkle tree operations

    - Account Compression Program - SPL Account Compression program

    * Invoking Program - Your program's address

    - System Program - Solana System program
