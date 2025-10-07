---
description: >-
  Build a Rust client with LightClient or LightProgramTest to create, update,
  and close compressed accounts. Includes a step-by-step implementation guide
  and full code examples.
---

# Rust

The Rust Client SDK provides two abstractions to create or interact with compressed accounts:

* **For local testing, use** [**`light-program-test`**](https://docs.rs/light-program-test)**.**
  * `light-program-test` is a local test environment for Solana programs that use compressed accounts and tokens.
  * It creates an in-process Solana VM via [LiteSVM](https://github.com/LiteSVM/LiteSVM) with auto-funded payer, local prover server and in-memory indexer. Requires Light CLI for program binaries.
* **For test-validator, devnet and mainnet use** [**`light-client`**](https://docs.rs/light-client).
  * `light-client` provides the core RPC abstraction layer for Rust applications
  * It includes an RPC client with Photon indexer API support for Devnet and Mainnet to fetch compressed account data and validity proofs.

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
{% endtabs %}

{% stepper %}
{% step %}
### Dependencies

{% hint style="info" %}
`LightClient` implements the same [`Rpc`](https://docs.rs/light-client/latest/light_client/rpc/trait.Rpc.html) and [`Indexer`](https://docs.rs/light-client/latest/light_client/indexer/trait.Indexer.html) traits as `LightProgramTest`. Seamlessly switch between `light-program-test`, local test validator, and public Solana networks.
{% endhint %}

{% tabs %}
{% tab title="LightClient" %}
```toml
[dependencies]
light-client = "0.13.1"
light-sdk = "0.13.0"
tokio = { version = "1.0", features = ["full"] }
solana-program = "2.2"
anchor-lang = "0.31.1"  # if using Anchor programs
```
{% endtab %}

{% tab title="LightProgramTest" %}
```toml
[dependencies]
light-program-test = "0.13.0"
light-test-utils = "0.13.0"
light-sdk = "0.13.0"
tokio = { version = "1.0", features = ["full"] }
solana-program = "2.2"
anchor-lang = "0.31.1"  # if using Anchor programs
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The [`light-sdk`](https://docs.rs/light-sdk) provides abstractions similar to Anchor's `Account` type. It provides macros, wrappers and CPI interface to create and interact with compressed accounts on Solana.
{% endhint %}
{% endstep %}

{% step %}
### Environment

{% tabs %}
{% tab title="LightClient" %}
{% tabs %}
{% tab title="Mainnet" %}
```rust
use light_client::{LightClient, LightClientConfig};
use solana_sdk::signature::read_keypair_file;

let config = LightClientConfig::new(
    "https://api.mainnet-beta.solana.com".to_string(),
    Some("https://mainnet.helius.xyz".to_string()),
    Some("YOUR_API_KEY".to_string())
);

let mut client = LightClient::new(config).await?;

client.payer = read_keypair_file("~/.config/solana/id.json")?;
```
{% endtab %}

{% tab title="Devnet" %}
```rust
use light_client::{LightClient, LightClientConfig};
use solana_sdk::signature::read_keypair_file;

let config = LightClientConfig::new(
    "https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY".to_string(),
);

let mut client = LightClient::new(config).await?;

client.payer = read_keypair_file("~/.config/solana/id.json")?;
```

* For Helius devnet RPC: Use the standard RPC endpoint. The endpoint serves both standard RPC and Photon indexer API.
{% endtab %}

{% tab title="Localnet" %}
```rust
use light_client::{LightClient, LightClientConfig};
use solana_sdk::signature::read_keypair_file;

let config = LightClientConfig::local();

let mut client = LightClient::new(config).await?;

client.payer = read_keypair_file("~/.config/solana/id.json")?;
```

* Requires running `light test-validator` locally
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="LightProgramTest" %}
For testing, `LightProgramTest` provides a validator with auto-funded keypair and all infrastructure.

```rust
let config = ProgramTestConfig::new_v2(
    true,
    Some(vec![("create_and_update", create_and_update::ID)])
);
let mut rpc = LightProgramTest::new(config).await.unwrap();
let payer = rpc.get_payer().insecure_clone();
```
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Tree Configuration

Before creating a compressed account, the client must select two Merkle trees:

* an address tree to derive and store the account address and
* a state tree to store the account hash.

{% hint style="success" %}
The protocol maintains Merkle trees at fixed addresses. You don't need to initialize custom trees. See the [addresses for Merkle trees here](https://www.zkcompression.com/resources/addresses-and-urls).
{% endhint %}

```rust
let address_tree_info = rpc.get_address_tree_v1();
let state_tree_info = rpc.get_random_state_tree_info().unwrap();
```

* `get_address_tree_v1()` returns `TreeInfo` with metadata for the address tree.
  * Used to derive addresses with `derive_address()` and&#x20;
  * for `get_validity_proof()` to prove the address does not exist yet.
* `get_random_state_tree_info()` returns `TreeInfo` with metadata for a state tree to store the compressed account hash.

{% hint style="info" %}
The `TreeInfo` struct contains metadata for a Merkle tree:

* `tree`: Merkle tree account pubkey
* `queue`: Queue account pubkey. Existing hashes are inserted in a queue. A Forester node appends these hashes in batches to Merkle trees asynchronously
* `tree_type`: Identifies tree version (StateV1, AddressV1)&#x20;
* `cpi_context`: allows multiple programs to share proof verification (Optional)

The `pack_output_tree_index()` method selects the correct account into `PackedAccounts` and returns its u8 index.
{% endhint %}

{% hint style="info" %}
* **State trees are fungible**: Account hashes can move to different state trees after each state transition. Best practice is to minimize different trees per transaction, but programs must support this since trees can fill up.
* **Address trees are not fungible**: Different address trees produce different addresses from identical seeds. Use the same address tree for `derive_address()` and all operations on that account.
{% endhint %}
{% endstep %}

{% step %}
### Derive Address

Derive a persistent address from seeds, address tree, and program ID as unique identifier for your compressed account.

```rust
use light_sdk::address::v1::derive_address;

let (address, _) = derive_address(
    &[b"my-seed"],
    &address_tree_info.tree,
    &program_id,
);
```

`derive_address()`: Computes a deterministic 32-byte address from the inputs.

**Parameters**:

* `&[b"my-seed"]`: Arbitrary byte slices that uniquely identify the account
* `&address_tree_info.tree` specifies the tree pubkey where this address will be registered. An address is unique to an address tree.
* `ProgramID`: The program that owns this account

{% hint style="info" %}
For create, pass the address to `get_validity_proof()` to prove non-existence. For update/close, use the address to fetch the current account with `get_compressed_account(address)`.
{% endhint %}
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
* (`vec![]`) is empty because the proof verifies the account hash exists in a state tree, not the address in an address tree.

The RPC returns `ValidityProofWithContext` with

* the inclusion `proof`, passed to the program in the instruction data. The Light System Program verifies the `proof` against the current Merkle root.
* `accounts` contains the tree metadata for the account hash (tree, root, leaf index) for the Light System program to nullify.
* an empty `addresses` field for update/close operations.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Pack Accounts

Compressed account instructions require packing accounts into the <kbd>packed\_accounts</kbd> array.&#x20;

{% hint style="info" %}
**Understanding "Packed" terminology:**

* **Packed structs** (e.g., `PackedAddressTreeInfo`) contain account **indices** (u8) instead of pubkeys to reduce transaction size. The indices point to the `packed_accounts` array.
* **Non-Packed structs** contain full pubkeys for client use. RPC methods return these.
* **`PackedAccounts`** deduplicates accounts and assigns sequential indices to create Packed structs.
{% endhint %}

#### 1. Initialize Account Packer

```rust
let mut packed_accounts = PackedAccounts::default();
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

The "system accounts" are infrastructure accounts are added to `packed_accounts.system_accounts`. These accounts are required for the Light System Program to verify proofs and execute CPI's.

```rust
let config = SystemAccountMetaConfig::new(create_and_update::ID);
packed_accounts.add_system_accounts(config);
```

* `SystemAccountMetaConfig::new(program_id)` stores your program's ID to derive the CPI signer PDA
* `add_system_accounts(config)` extends the system\_accounts vector with 8 Light System Program accounts in this exact sequence:

<details>

<summary><em>System Accounts List</em></summary>

| # | Account                       | Purpose                                                 | Derivation/Address                                                             |
| - | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1 | Light System Program          | Verifies proofs and creates compressed accounts         | `SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7`                                  |
| 2 | CPI Signer                    | Your program's authority to invoke Light System Program | PDA derived from `[b"authority", invoking_program_id]`                         |
| 3 | Registered Program PDA        | Proves your program is authorized                       | PDA derived from `[LIGHT_SYSTEM_PROGRAM_ID]` under Account Compression Program |
| 4 | Noop Program                  | Logs compressed account data for indexers               | SPL Noop Program                                                               |
| 5 | Account Compression Authority | Authority for merkle tree writes                        | PDA derived from `[CPI_AUTHORITY_PDA_SEED]` under Light System Program         |
| 6 | Account Compression Program   | Manages state trees and address trees                   | SPL Account Compression Program                                                |
| 7 | Invoking Program              | Your program's ID                                       | `config.self_program`                                                          |
| 8 | System Program                | Solana System Program                                   | `11111111111111111111111111111111`                                             |

</details>

#### 3. Pack Tree Accounts from Validity Proof

The validity proof response from `getValidityProof()` contains different context metadata based on the operation. `pack_tree_infos` extracts and deduplicates the relevant tree pubkeys from this context and returns u8 indices wrapped in Packed structs.

{% tabs %}
{% tab title="Create" %}
```rust
let packed_address_tree_accounts = rpc_result
    .pack_tree_infos(&mut packed_accounts)
    .address_trees;
```

* `pack_tree_infos(&mut packed_accounts)` extracts Merkle tree pubkeys from validity proof and adds them to `packed_accounts`
* `.address_trees` returns `Vec<PackedAddressTreeInfo>` that specifies where to create the address:
  * `address_merkle_tree_pubkey_index` (u8) points to the address tree account in `packed_accounts`
  * `address_queue_pubkey_index` (u8) points to the address queue account in `packed_accounts`
  * `root_index` (u16) specifies which Merkle root to verify the non-inclusion proof against
{% endtab %}

{% tab title="Update & Close" %}
```rust
let packed_state_tree_accounts = rpc_result
    .pack_tree_infos(&mut packed_accounts)
    .state_trees
    .unwrap();
```

* `pack_tree_infos(&mut packed_accounts)` extracts Merkle tree pubkeys from validity proof and adds them to `packed_accounts`
* `.state_trees` returns `PackedStateTreeInfos` that points to the existing account hash so the Light System Program can mark it as nullified:
  * `merkle_tree_pubkey_index` (u8) points to the state tree account in `packed_accounts`
  * `leaf_index` (u32) specifies which leaf position contains the account hash
  * `root_index` (u16) specifies which historical Merkle root to verify the proof against
{% endtab %}
{% endtabs %}

#### 4. Add Output State Tree

```rust
let output_state_tree_index = rpc
    .get_random_state_tree_info()?
    .pack_output_tree_index(&mut packed_accounts)?;
```

* `get_random_state_tree_info()` selects a state tree to store the account hash in
* `pack_output_tree_index(&mut packed_accounts)` adds the output state tree pubkey to `packed_accounts` and returns its u8 index for instruction data.

#### Summary

You initialized the `PackedAccounts::default()` helper struct to merge the following accounts into the `packed_accounts` array for the instruction data:

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

* `PackedAddressTreeInfo` specifies the index to the address tree account used to derive the address. The index points to the address tree account in `PackedAccounts`.
* `output_state_tree_index` points to the state tree account in `PackedAccounts` that will store the compressed account hash.

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

<pre class="language-rust"><code class="lang-rust">let accounts = counter::accounts::AnchorAccounts {
    signer: payer.pubkey(),
};

let (remaining_accounts_metas, _, _) = packed_accounts.to_account_metas();
<strong>let instruction = Instruction {
</strong><strong>    program_id: your_program::ID,
</strong><strong>    accounts: [
</strong>        accounts.to_account_metas(Some(true)),
        remaining_accounts_metas,
    ].concat(),
<strong>    data: instruction_data.data(),
</strong>};
</code></pre>

**What to include in the `accounts`:**

1. **Create your program's accounts struct** - `AnchorAccounts` mirrors your on-chain `#[derive(Accounts)]` struct. Include anything you need - it won't interfere with compression-related accounts.
2. **Extract Light System accounts** - `packed_accounts.to_account_metas()` returns `(Vec<AccountMeta>, usize, usize)`. The tuple contains the account vector and offset values for indexing.
3. **Merge into one vector** - `.concat()` combines both vectors:

* `accounts.to_account_metas(Some(true))` converts your Anchor struct to `Vec<AccountMeta>` (Anchor auto-generates this method)
* `remaining_accounts_metas` contains Light System accounts + tree accounts from Step 6 and returns:
  * `account_metas`: The merged account vector
  * `system_accounts_start_offset`: Index in vector where Light System Program starts
  * `packed_accounts_start_offset`: Index in vector pointing to the first Merkle tree or queue account

{% hint style="info" %}
`CpiAccounts::new()` requires the accounts slice to start at the Light System Program. Use `system_accounts_start_offset` to slice correctly: `&ctx.remaining_accounts[offset..]`. If you pass the full array from index 0, `CpiAccounts` expects the Light System Program at position 0, while it's actually at `system_accounts_start_offset`. See Debug InvalidCpiAccountsOffset for help with debugging.
{% endhint %}

**Final account order:**

```
[0]    Your program accounts (from `AnchorAccounts`)
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues (from validity proof)
```
{% endstep %}

{% step %}
### Send Transaction

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

{% content-ref url="../../../zk-compression-docs/compressed-pdas/guides/" %}
[guides](../../../zk-compression-docs/compressed-pdas/guides/)
{% endcontent-ref %}

