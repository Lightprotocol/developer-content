---
description: >-
  Build a Rust client to create, update, and close compressed accounts using
  LightProgramTest with the light-sdk crate. Includes a step-by-step
  implementation guide and full code examples.
---

# Rust

Learn how to build a Rust client to test compressed accounts with `LightProgramTest`. For devnet and mainnet rust clients use `LightClient` .

{% hint style="success" %}
Find [full code examples for a counter program](rust.md#full-code-example) at the end for create, update and close.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Derive unique compressed account address
</strong><strong>   ├─ Fetch validity proof (proves that address doesn't exist)
</strong><strong>   ├─ Pack accounts and build instruction
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Derive and check address
      ├─ Initialize compressed account
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify validity proof (non-inclusion)
         ├─ Create address (address tree)
         ├─ Create compressed account (state tree)
         └─ Complete atomic account creation
</code></pre>
{% endtab %}

{% tab title="Update" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch current account data
</strong><strong>   ├─ Fetch validity proof (proves that account exists)
</strong><strong>   ├─ Build instruction with proof, current data, new data and metadata
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing compressed account hash (input hash)
      ├─ Modify compressed account data (output)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify and nullify input hash
         ├─ Create new compressed account hash with updated data (output hash)
         └─ Complete atomic account update
</code></pre>
{% endtab %}

{% tab title="Close" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch current account data
</strong><strong>   ├─ Fetch validity proof (proves that account exists)
</strong><strong>   ├─ Build instruction with proof, current data and metadata
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing compressed account hash (input hash)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify input hash
         ├─ Nullify input hash
         └─ Create DEFAULT_DATA_HASH with zero discriminator (output)
</code></pre>
{% endtab %}

{% tab title="Reinitialize" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch closed account metadata
</strong><strong>   ├─ Fetch validity proof (proves closed account hash exists)
</strong><strong>   ├─ Build instruction with proof and new data
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing closed account hash (input hash)
      ├─ Initialize account with new data (output)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify input hash exists
         ├─ Nullify input hash
         ├─ Create new account with new hash and default values at same address
         └─ Complete atomic account reinitialization
</code></pre>
{% endtab %}

{% tab title="Burn" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch current account data
</strong><strong>   ├─ Fetch validity proof (proves that account exists)
</strong><strong>   ├─ Build instruction with proof and current data
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing compressed account hash (input hash)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify input hash
         ├─ Nullify input hash (permanent)
         └─ No output state created
</code></pre>
{% endtab %}
{% endtabs %}

{% stepper %}
{% step %}
### Dependencies

```toml
[dev-dependencies]
light-program-test = "0.13.0"
light-test-utils = "0.13.0"
light-sdk = "0.13.0"
tokio = { version = "1.0", features = ["full"] }
solana-sdk = "2.0"
anchor-lang = "0.30"  # if using Anchor programs
```

Add `light-program-test`, `light-sdk`, and `borsh` to test and interact with compressed accounts.

* **`light-program-test`:** A local test environment for Solana programs that use compressed accounts and tokens. It creates an in-process Solana VM via [LiteSVM](https://github.com/LiteSVM/LiteSVM) with built-in prover and in-memory indexer.
* **`light-sdk`**: Provides macros, wrappers and CPI interface to create and interact with compressed accounts
{% endstep %}

{% step %}
### Environment

Set up test environment with `LightProgramTest` that provides prover, indexer, and auto- funded payer.

```rust
let config = ProgramTestConfig::new_v2(
    true,
    Some(vec![("create_and_update", create_and_update::ID)])
);
let mut rpc = LightProgramTest::new(config).await.unwrap();
let payer = rpc.get_payer().insecure_clone();
```
{% endstep %}

{% step %}
### Tree Configuration

Before creating a compressed account, the client must choose two Merkle trees: - an address tree to derive the account address and

* a state tree to store the account hash.

**Address tree**: Stores the account addresses of compressed accounts.

* The tree pubkey becomes an input to address derivation: `hash(address_tree_pubkey || address_seed)`.
* Different address trees produce different addresses from identical seeds.
* Address trees are NOT fungible. The client must use the same tree for `derive_address()` and `getValidityProof()` calls.

**State tree's** store the compressed account hashes.

* State trees are fungible. Tree choice does not affect the account hash.

{% hint style="success" %}
The protocol maintains Merkle trees at fixed addresses. You don't need to initialize custom trees. See [Addresses](https://www.zkcompression.com/resources/addresses-and-urls) for available trees.
{% endhint %}

```rust
let address_tree_info = rpc.get_address_tree_v1();
let state_tree_info = rpc.get_random_state_tree_info().unwrap();
```

* `get_address_tree_v1()` returns the address tree pubkey. It's used
* to derive an address for a compressed account with `derive_address()`
* for `getValidityProof()` to prove the address does not exist yet in this tree with .
* `get_random_state_tree_info()` returns `TreeInfo` (pubkey, queue, cpi conetxt...) for a state tree to store the compressed account hash.
{% endstep %}

{% step %}
### Derive Address (Create only)

Derive a persistent address from seeds, address tree, and program ID as unique identifier for your compressed account.

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
* `&address_tree_info.tree` specifies the tree pubkey where this address will be registered. An address is unique to a n address tree.
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

Compressed account instructions require packing accounts into the `remaining_accounts` array. Packed structs contain `u8` indices instead of full 32-byte pubkeys to reduce transaction size.

{% hint style="info" %}
**Understanding "Packed" terminology:**

* **Packed structs** (e.g., `PackedAddressTreeInfo`, `PackedStateTreeInfo`) contain account **indices** (u8) instead of pubkeys to reduce instruction size. The indices point to the `remaining_accounts` array.
* **Non-Packed structs** contain full pubkeys for client use. RPC methods return these.
* **`PackedAccounts`** deduplicates accounts and assigns sequential indices to create Packed structs.
{% endhint %}

#### 1. Initialize Account Packer

```rust
let mut remaining_accounts = PackedAccounts::default();
```

* `PackedAccounts::default()` initializes a helper struct that collects and organizes Light System Program account metadata. The struct tracks which index each pubkey receives.

```
[pre_accounts] [system_accounts] [packed_accounts]
       ↑                ↑                  ↑
    Signers,       Light system      Merkle trees,
    fee payer      program accts     address trees
                                     (deduplicated)

```

#### 2. Add Light System Accounts

The "system accounts" are infrastructure accounts are added to `remaining_accounts.system_accounts`. These accounts are required for the Light System Program to verify proofs and execute CPI's.

```rust
let config = SystemAccountMetaConfig::new(create_and_update::ID);
remaining_accounts.add_system_accounts(config);
```

* `SystemAccountMetaConfig::new(program_id)` stores your program's ID to derive the CPI signer PDA
* `add_system_accounts(config)` extends the system\_accounts vector with 8 Light System Program accounts in this exact sequence:

| # | Account                       | Purpose                                                 | Derivation/Address                                                             |
| - | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1 | Light System Program          | Verifies proofs and creates compressed accounts         | `SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7`                                  |
| 2 | CPI Signer                    | Your program's authority to invoke Light System Program | PDA: `[b"authority", invoking_program_id]`                                     |
| 3 | Registered Program PDA        | Proves your program is authorized                       | PDA derived from `[LIGHT_SYSTEM_PROGRAM_ID]` under Account Compression Program |
| 4 | Noop Program                  | Logs compressed account data for indexers               | SPL Noop Program                                                               |
| 5 | Account Compression Authority | Authority for merkle tree writes                        | PDA derived from `[CPI_AUTHORITY_PDA_SEED]` under Light System Program         |
| 6 | Account Compression Program   | Manages state trees and address trees                   | SPL Account Compression Program                                                |
| 7 | Invoking Program              | Your program's ID                                       | `config.self_program`                                                          |
| 8 | System Program                | Solana System Program                                   | `11111111111111111111111111111111`                                             |

#### 3. Pack Tree Accounts from Validity Proof

The validity proof response from `getValidityProof()` contains different context metadata based on the operation. `pack_tree_infos` extracts and deduplicates the relevant tree pubkeys from this context and returns u8 indices wrapped in Packed structs.

{% tabs %}
{% tab title="Create" %}
```rust
let packed_address_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .address_trees;
```

* `pack_tree_infos(&mut remaining_accounts)` extracts Merkle tree pubkeys from validity proof and adds them to `remaining_accounts`
* `.address_trees` returns `Vec<PackedAddressTreeInfo>` that specifies where to create the address:
  * `address_merkle_tree_pubkey_index` (u8) points to the address tree account in `remaining_accounts`
  * `address_queue_pubkey_index` (u8) points to the address queue account in `remaining_accounts`
  * `root_index` (u16) specifies which Merkle root to verify the non-inclusion proof against
{% endtab %}

{% tab title="Update & Close" %}
```rust
let packed_state_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .state_trees
    .unwrap();
```

* `pack_tree_infos(&mut remaining_accounts)` extracts Merkle tree pubkeys from validity proof and adds them to `remaining_accounts`
* `.state_trees` returns `PackedStateTreeInfos` that points to the existing account hash so the Light System Program can mark it as nullified:
  * `merkle_tree_pubkey_index` (u8) points to the state tree account in `remaining_accounts`
  * `leaf_index` (u32) specifies which leaf position contains the account hash
  * `root_index` (u16) specifies which historical Merkle root to verify the proof against
{% endtab %}
{% endtabs %}

#### 4. Add Output State Tree

```rust
let output_state_tree_index = rpc
    .get_random_state_tree_info()?
    .pack_output_tree_index(&mut remaining_accounts)?;
```

* `get_random_state_tree_info()` selects a state tree to write the account hash
* `pack_output_tree_index(&mut remaining_accounts)` adds the output state tree pubkey to `remaining_accounts` and returns its u8 index for instruction data.

#### Summary

You initialized the `PackedAccounts::default()` helper struct to merge the following accounts into the `remaining_accounts` array for the instruction data:

* Light System accounts are required for the for the Light System Program to verify proofs and execute CPI's.
* Tree accounts from validity proof prove address non-existence (create) or prove existence of the account hash (update/close).
* The output state tree stores the new account hash.

The accounts receive a sequential u8 index. Instruction data references accounts via these indices in this order.
{% endstep %}

{% step %}
### Instruction Data

Build instruction data with the validity proof, tree account indices, complete account data and metadata.

{% hint style="info" %}
Unlike regular Solana accounts where programs read data on-chain, compressed account data must be passed in instruction data. The program hashes this data and the Light System Program verifies the hash against the root in a Merkle tree account.
{% endhint %}

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

1. **Non-inclusion Proof**

* `ValidityProof` proves that the address does not exist yet in the specified address tree (non-inclusion). Clients fetch proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify Merkle trees to store address and account hash**

* `PackedAddressTreeInfo` specifies the index to the address tree account used to derive the address. The index points to the address tree account in `remaining_accounts`.
* `output_state_tree_index` points to the state tree account in `remaining_accounts` that will store the compressed account hash.

3. **Custom account data**

* `message` defines data to include in the compressed account.
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

1. **Inclusion Proof**

* `ValidityProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash and output state tree**

* `CompressedAccountMeta` points to the input hash and specifies the output state tree with these fields:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index) so the Light System Program can mark it as nullified
  * `address` specifies the account's derived address
  * `output_state_tree_index` points to the state tree that will store the updated compressed account hash

3. **Custom data for update**

* `message`: New data to update in the compressed account.
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
    current_value: u64,
};
```

1. **Inclusion Proof**

* `ValidityProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash and output state tree**

* `CompressedAccountMeta` points to the input hash and specifies the output state tree:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index) for nullification
  * `address` specifies the account's derived address
  * `output_state_tree_index` points to the state tree that will store the output hash with zero values (`DEFAULT_DATA_HASH`)

{% hint style="info" %}
Account indices reduce transaction size. Instruction data references the `remaining_accounts` array with u8 indices instead of full 32-byte pubkeys. The client packs accounts in Step 6.
{% endhint %}

3. **Current data for close**

* `current_value` includes the current data to hash and verify the input state.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Instruction

Build the instruction from the `PackedAccounts` (Step 6) and instruction data (Step 7).

```rust
let accounts = counter::accounts::GenericAnchorAccounts {
    signer: payer.pubkey(),
};

let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();
let instruction = Instruction {
    program_id: your_program::ID,
    accounts: [
        accounts.to_account_metas(Some(true)),
        remaining_accounts_metas,
    ].concat(),                        
    data: instruction_data.data(),   
};
```

The `Instruction` struct packages three components:

1. `program_id`: Your program's on-chain address
2. The `accounts` array contains your program accounts with Light System accounts and tree accounts from the validity proof:

* **Create your program's accounts struct** - `GenericAnchorAccounts` mirrors your on-chain `#[derive(Accounts)]` struct. Include only signers, PDAs, and program-specific accounts.
* **Extract Light System accounts** - `remaining_accounts.to_account_metas()` returns `(Vec<AccountMeta>, usize, usize)`. The tuple contains the account vector and offset values for indexing.

{% hint style="info" %}
For non-Anchor programs, create `Vec<AccountMeta>` directly instead of using `.to_account_metas()`.
{% endhint %}

* **Merge into single array** - `.concat()` combines both vectors:
  * `accounts.to_account_metas(Some(true))` converts your Anchor struct to `Vec<AccountMeta>` (Anchor auto-generates this method)
  * `remaining_accounts_metas` contains Light System accounts + tree accounts from Step 6

**Final account order:**

```
[0]    Your program accounts (from `GenericAnchorAccounts`)
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues (from validity proof)
```

Your program receives account `[0]` via `ctx.accounts` and accounts `[1..]` via `ctx.remaining_accounts`.

3. `data` must contain borsh-serialized instruction data with the validity proof, tree indices, and account data
{% endstep %}

{% step %}
### Send Transaction

Submit the instruction to the network.

```rust
rpc.create_and_send_transaction(&[instruction],
  &payer.pubkey(), &[payer])
      .await?;
```
{% endstep %}
{% endstepper %}

## Full Code Example

The full code examples below walk you through the complete lifecycle of a counter program: create, increment, decrement, reset, close.

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Create" %}
{% hint style="success" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/9cdeea7e655463afbfc9a58fb403d5401052e2d2/counter/anchor/programs/counter/tests/test.rs#L117).
{% endhint %}

```rust
```
{% endtab %}

{% tab title="Update" %}
{% hint style="success" %}
Find the source code here.
{% endhint %}

```rust
```
{% endtab %}

{% tab title="Close" %}
{% hint style="success" %}
Find the source Code here.
{% endhint %}

```rust
```
{% endtab %}
{% endtabs %}

## Next Steps

{% content-ref url="../create-a-program-with-compressed-pdas.md" %}
[create-a-program-with-compressed-pdas.md](../create-a-program-with-compressed-pdas.md)
{% endcontent-ref %}

