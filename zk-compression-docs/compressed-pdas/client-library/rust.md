---
description: >-
  Build a Rust client with LightClient or LightProgramTest to create, update,
  and close compressed accounts. Includes a step-by-step implementation guide
  and full code examples.
---

# Rust

The Rust Client SDK provides two abstractions to create or interact with compressed accounts:

* **For local testing**, use `light-program-test`.
  * `light-program-test` is a local test environment for Solana programs that use compressed accounts or tokens.
  * It creates an in-process Solana VM via [LiteSVM](https://github.com/LiteSVM/LiteSVM) with auto-funded payer, local prover server and in-memory indexer. Requires Light CLI for program binaries.
* **For devnet and mainnet** use `light-client`
  * `light-client` provides the core RPC abstraction layer for Rust applications
  * It includes an RPC client with Photon indexer support for Devnet and Mainnet to fetch compressed account data and validity proofs.
* `LightClient` and `LightProgramTest` implement the same [`Rpc`](https://docs.rs/light-client/latest/light_client/rpc/trait.Rpc.html) and [`Indexer`](https://docs.rs/light-client/latest/light_client/indexer/trait.Indexer.html) traits. Seamlessly switch between `light-program-test`, local test validator, and public Solana networks.

{% hint style="info" %}
Find full code examples for a counter program [at the end for Anchor, native Rust and Pinocchio](rust.md#full-code-example).
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

## Implementation Guide

{% stepper %}
{% step %}
### Dependencies

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
Connect to local, devnet or mainnet with `LightClient`.

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
    Some(vec![("counter", counter::ID)])
);
let mut rpc = LightProgramTest::new(config).await.unwrap();
let payer = rpc.get_payer().insecure_clone();
```
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Tree Configuration

Before creating a compressed account, your client must select two Merkle trees:

* an address tree to derive and store the account address and
* a state tree to store the account hash.

{% hint style="success" %}
The protocol maintains these Merkle trees at fixed addresses. You don't need to initialize custom trees. See the [addresses for Merkle trees here](https://www.zkcompression.com/resources/addresses-and-urls).
{% endhint %}

```rust
let address_tree_info = rpc.get_address_tree_v1();
let state_tree_info = rpc.get_random_state_tree_info().unwrap();
```

Fetch metadata of trees with:

* `get_address_tree_v1()` to return the public key and other metadata in the `TreeInfo` struct for the address tree.
  * Used to derive addresses with `derive_address()` and
  * for `get_validity_proof()` to prove the address does not exist yet.
* `get_random_state_tree_info()` to return the public key and other metadata in the `TreeInfo` struct for a random state tree to store the compressed account hash.
  * Selecting a random state tree prevents write-lock contention on state trees and increases throughput.
  * Account hashes can move to different state trees after each state transition.
  * Best practice is to minimize different trees per transaction. Still, programs must support this since trees may fill up over time.

{% hint style="info" %}
The `TreeInfo` struct contains metadata for a Merkle tree:

* `tree`: Merkle tree account pubkey
* `queue`: Queue account pubkey. Under the hood, hashes and addresses are inserted into a queue before being asynchronously inserted to its Merkle tree. The client and custom program do not interact with the queue.
* `tree_type`: Identifies tree version (StateV1, AddressV1) and account for hash insertion
* `cpi_context` includes an optional CPI context account for shared proof verification of multiple programs
{% endhint %}
{% endstep %}

{% step %}
### Derive Address

Derive a persistent address as unique identifier for your compressed account with `derive_address()`.

```rust
use light_sdk::address::v1::derive_address;

let (address, _) = derive_address(
    &[b"my-seed"],
    &address_tree_info.tree,
    &program_id,
);
```

**Pass these parameters**:

* `&[b"my-seed"]`: Arbitrary byte slices that uniquely identify the account
* `&address_tree_info.tree` to specify the tree pubkey. This parameter ensures an address is unique to an address tree. Different trees produce different addresses from identical seeds.
* `ProgramID` to specify the program owner pubkey.

{% hint style="info" %}
Use the same `address_tree_info.tree` for both `derive_address()` and all subsequent operations on that account in your client and program.

* To create a compressed account, pass the address to `get_validity_proof()` to prove the address does not exist yet, or
* to update/close, use the address to fetch the current account with `get_compressed_account(address)`.
{% endhint %}
{% endstep %}

{% step %}
### Validity Proof

Fetch a zero-knowledge proof (Validity proof) from your RPC provider that supports ZK Compression. What is proved depends on the operation:

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

**Pass these parameters**:

* Leave (`vec![]`) empty for compressed account creation, since no compressed account exists yet to reference.
* Specify in (`vec![AddressWithTree]`) the new address to create with its address tree.

The RPC returns `ValidityProofWithContext` with

* the non-inclusion `proof`, passed to the program in the instruction data. The Light System Program verifies the `proof` against the current Merkle root,
* `addresses` contains the tree metadata for your address (tree, root, leaf index), and
* an empty `accounts` field for create operations.
{% endtab %}

{% tab title="Update & Close" %}
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

**Pass these parameters**:

* Specify in (`vec![hash]`) the hash of the existing compressed account to prove its existence in the state tree.
* Leave (`vec![]`) empty, since the proof verifies the account hash exists in a state tree, not the address in an address tree.

The RPC returns `ValidityProofWithContext` with

* the inclusion `proof`, passed to the program in the instruction data. The Light System Program verifies the `proof` against the current Merkle root during the CPI,
* `accounts` contains the tree metadata for the account hash (tree, root, leaf index), and
* an empty `addresses` field to update/close compressed accounts.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Pack Accounts

Compressed account instructions require packing accounts into the `remaining_accounts` array.

{% hint style="info" %}
**Understanding "Packed" terminology:**

* **Packed structs** (e.g. `PackedStateTreeInfo`) contain account **indices** (u8) instead of 32 byte pubkeys to reduce instruction size. The indices point to the `remaining_accounts` array.
* **Non-Packed structs** contain full pubkeys. RPC methods return full pubkeys.
{% endhint %}

#### 1. Initialize Account Packer

```rust
let mut remaining_accounts = PackedAccounts::default();
```

`PackedAccounts::default()` creates a helper struct with three empty vectors:

1. `pre_accounts` includes the signers, fee payer, and any program-specific accounts.
2. `system_accounts` includes eight accounts the Light System program requires to create or interact with compressed accounts.
3. `packed_accounts` includes Merkle tree and queue accounts returned from the `getValidityProof()` response in the previous step.

You will populate the vectors in the next steps.

```
[pre_accounts] [system_accounts] [packed_accounts]
       ↑               ↑                 ↑
    Signers,      Light system      state trees,
   fee payer        accounts       address trees

```

#### 2. Add Light System Accounts

Add the Light System accounts your program needs to create and interact with compressed via CPI to the Light System Program.

```rust
let config = SystemAccountMetaConfig::new(counter::ID);
remaining_accounts.add_system_accounts(config);
```

* Pass your program ID in `SystemAccountMetaConfig::new(counter::ID)` to derive the CPI signer PDA
* Call `add_system_accounts(config)` - the SDK will populate the `system_accounts` vector with 8 Light System Program accounts in the sequence below.

<details>

<summary><em>System Accounts List</em></summary>

| # | Account                           | Purpose                                                                                                                                                                                        |
| - | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Light System Program[^1]          | Verifies validity proofs and executes CPI calls to create or interact with compressed accounts                                                                                                 |
| 2 | CPI Signer[^2]                    | <p>- Signs CPI calls from your program to Light System Program<br>- PDA verified by Light System Program during CPI<br>- Derived from your program ID</p>                                      |
| 3 | Registered Program PDA            | <p>- Proves your program can interact with Account Compression Program<br>- Prevents unauthorized programs from modifying compressed account state</p>                                         |
| 4 | Noop Program[^3]                  | <p>- Logs compressed account state to Solana ledger<br>- Indexers parse transaction logs to reconstruct compressed account state</p>                                                           |
| 5 | Account Compression Authority[^4] | Signs CPI calls from Light System Program to Account Compression Program                                                                                                                       |
| 6 | Account Compression Program[^5]   | <p>- Writes to state and address tree accounts<br>- Client and program do not directly interact with this program</p>                                                                          |
| 7 | Invoking Program                  | <p>Your program's ID, used by Light System Program to:<br>- Derive the CPI Signer PDA<br>- Verify the CPI Signer matches your program ID<br>- Set the owner of created compressed accounts</p> |
| 8 | System Program[^6]                | Solana System Program to create accounts or transfer lamports                                                                                                                                  |

</details>

#### 3. Pack Tree Accounts from Validity Proof

`getValidityProof()` returns pubkeys and other metadata of Merkle trees. With `pack_tree_infos`, you will convert the pubkeys to u8 indices that reference positions in `remaining_accounts` to optimize your instruction data.

{% tabs %}
{% tab title="Create" %}
```rust
let packed_address_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .address_trees;
```

* `pack_tree_infos(&mut remaining_accounts)` extracts Merkle tree pubkeys from validity proof and adds them to `remaining_accounts`
* `.address_trees` returns `Vec<PackedAddressTreeInfo>` that specifies where to create the address:
  * `address_merkle_tree_pubkey_index` points to the address tree account in `remaining_accounts`
  * `address_queue_pubkey_index` points to the address queue account in `remaining_accounts`
  * `root_index` specifies the Merkle root to verify the address does not exist in the address tree
{% endtab %}

{% tab title="Update & Close" %}
```rust
let packed_state_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .state_trees
    .unwrap();
```

* `pack_tree_infos(&mut remaining_accounts)` extracts Merkle tree pubkeys from validity proof and adds them to `remaining_accounts`
* `.state_trees` returns `PackedStateTreeInfos` that points to the existing account hash:
  * `merkle_tree_pubkey_index` points to the state tree account in `remaining_accounts`
  * `leaf_index` specifies which leaf position contains the account hash
  * `root_index` specifies the Merkle root to verify the existing account hash exists
{% endtab %}
{% endtabs %}

#### 4. Add Output State Tree

```rust
let output_state_tree_index = rpc
    .get_random_state_tree_info()?
    .pack_output_tree_index(&mut remaining_accounts)?;
```

* `get_random_state_tree_info()` returns the pubkey and other metadata of a state tree to store the new account hash.
* With `pack_output_tree_index(&mut remaining_accounts)`, you will convert the pubkey to u8 indices that reference positions in `remaining_accounts` to optimize your instruction data.

#### Summary

You initialized the `PackedAccounts::default()` helper struct to merge the following accounts into the `remaining_accounts` array for the instruction data:

* Light System accounts to create and interact with compressed accounts via the Light System Program.
* Tree accounts from the validity proof to prove address non-existence (create), or existence of the account hash (update/close).
* The output state tree to store the new account hash.

The accounts receive a sequential u8 index. Instruction data references accounts via these indices in this order.
{% endstep %}

{% step %}
### Instruction Data

Build your instruction data with the validity proof, tree account indices, and complete account data.

{% hint style="info" %}
Compressed account data must be passed in instruction data, unlike regular Solana accounts where programs read data on-chain. The program hashes this data and the Light System Program verifies the hash against the root in a Merkle tree account.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```rust
let instruction_data = counter::instruction::CreateCounter {
    proof: rpc_result.proof,
    address_tree_info: packed_address_tree_accounts[0],
    output_state_tree_index,
};
```

1. **Non-inclusion Proof**

* `ValidityProof` proves that the address does not exist yet in the specified address tree (non-inclusion). Clients fetch proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify Merkle trees to store address and account hash**

* `PackedAddressTreeInfo` specifies the index to the address tree account used to derive the address. The index points to the address tree account in `remaining_accounts`.
* `output_state_tree_index` points to the state tree account in `remaining_accounts` that will store the compressed account hash.

3. **Add new value**

* The counter program intializes the account to 0, wherefore no new value needs to be added.
* If your program requires initial data, add custom fields to your instruction struct.
{% endtab %}

{% tab title="Update" %}
```rust
let instruction_data = counter::instruction::IncrementCounter {
    proof: rpc_result.proof,
    counter_value: current_counter_value,
    account_meta: CompressedAccountMeta {
        tree_info: packed_state_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_state_tree_accounts.output_tree_index,
    },
};
```

1. **Inclusion Proof**

* `ValidityProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash and output state tree**

* `CompressedAccountMeta` points to the input hash and specifies the output state tree with these fields:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index) so the Light System Program can mark it as nullified
  * `address` specifies the account's derived address
  * `output_state_tree_index` points to the state tree that will store the updated compressed account hash

3. **Add current counter value**

* `counter_value`: Current value to verify the input state before incrementing.
{% endtab %}

{% tab title="Close" %}
```rust
let instruction_data = counter::instruction::CloseCounter {
    proof: rpc_result.proof,
    counter_value: current_counter_value,
    account_meta: CompressedAccountMeta {
        tree_info: packed_state_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_state_tree_accounts.output_tree_index,
    },
};
```

1. **Inclusion Proof**

* `ValidityProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash and output state tree**

* `CompressedAccountMeta` points to the input hash and specifies the output state tree:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index).
  * `address` specifies the account's derived address.
  * `output_state_tree_index` points to the state tree that will store the output hash with zero values.

3. **Add current counter value**

* `counter_value`: Current value to verify the input state before closing.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Instruction

Build a standard Solana `Instruction` struct with your `program_id`, `accounts`, and `data` from Step 7. You will create an account vector with all program-specific, Light System, and Merkle tree accounts from `PackedAccounts` (Step 6).

<pre class="language-rust"><code class="lang-rust">let accounts = counter::accounts::AnchorAccounts { // for non-Anchor build Vec

    signer: payer.pubkey(), 
};                                                                            

let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas(); 

<strong>let instruction = Instruction {
</strong><strong>    program_id: counter::ID,
</strong><strong>    accounts: [
</strong>        accounts.to_account_metas(Some(true)),
        remaining_accounts_metas,
    ]
    .concat(),
<strong>    data: instruction_data.data(),
</strong>};
</code></pre>

**What to include in the `accounts`:**

1. **Create your program-specific accounts struct** with any accounts required by your program in `AnchorAccounts`, or manually build `Vec<AccountMeta>` - it won't interfere with compression-related accounts.
2. **Extract Light System accounts** by calling `remaining_accounts.to_account_metas()` to return `account_metas` with the indeces for the Light System and Merkle tree accounts, packed in Step 6.
3. **Merge all account indices into one vector** with `.concat()`:

* `accounts.to_account_metas(Some(true))` converts your Anchor struct to `Vec<AccountMeta>` (Anchor auto-generates this method)
* `remaining_accounts_metas` returns the merged account vector with indweices for the Light System accounts + tree accounts indices.

```
[0]    Your program accounts (from `AnchorAccounts`)
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues (from validity proof)
```

<details>

<summary>What are the <code>_, _</code> values in <code>let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();</code> `?</summary>

```rust
let (remaining_accounts_metas, _, _) = remaining_accounts.to_account_metas();
```

You can safely ignore the two `usize` values.

* The client only requires `Vec<AccountMeta>`
* `_, _` are passed by the SDK under the hood for your program.

{% hint style="info" %}
**Here is what happens:** The two `usize` values are offset indices returned by `to_account_metas()`: \* `system_accounts_start_offset`: Index in vector where Light System accounts start \* `packed_accounts_start_offset`: Index in vector pointing to the first Merkle tree or queue account

1. Your program extracts `system_accounts_start_offset` from the instruction data to slice the accounts array before passing it to `CpiAccounts::new()`.
2. `CpiAccounts::new()` requires the accounts slice to start at the Light System Program.

* If you pass the full array without offsets, `CpiAccounts` expects the Light System accounts to start at position 0, while it's actually at 1.
* This would lead to the `InvalidCpiAccountsOffset` error. See this page for help with debugging.
{% endhint %}

</details>
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

The full code examples below show how to create a counter with Anchor, native Rust, and Pinocchio.

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% hint style="success" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/anchor/programs/counter/tests/test.rs#L33).
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
```
{% endtab %}

{% tab title="Native Rust" %}
{% hint style="success" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/native/tests/test.rs#L39).
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

    let accounts = counter::accounts::AnchorAccounts {
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

{% tab title="Pinocchio" %}
{% hint style="success" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/pinocchio/tests/test.rs#L32).
{% endhint %}

```rust
#![cfg(feature = "test-sbf")]

use borsh::{BorshDeserialize, BorshSerialize};
use counter::{
    CounterAccount, CreateCounterInstructionData,
};
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, AddressWithTree, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::address::v1::derive_address;
use light_sdk::instruction::{
    account_meta::{CompressedAccountMeta, CompressedAccountMetaClose},
    PackedAccounts, SystemAccountMetaConfig,
};
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};

#[tokio::test]
async fn test_counter() {
    let config = ProgramTestConfig::new(true, Some(vec![("counter", counter::ID.into())]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let address_tree_pubkey = address_tree_info.tree;

    // Create counter
    let (address, _) = derive_address(
        &[b"counter", payer.pubkey().as_ref()],
        &address_tree_pubkey,
        &counter::ID.into(),
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
        .value;
    assert_eq!(compressed_counter.address.unwrap(), address);
}

pub async fn create_counter(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    merkle_tree_pubkey: &Pubkey,
    address_tree_pubkey: Pubkey,
    address: [u8; 32],
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(counter::ID.into());
    let mut accounts = PackedAccounts::default();
    accounts.add_pre_accounts_signer(payer.pubkey());
    accounts.add_system_accounts(system_account_meta_config);

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
    let (accounts, _, _) = accounts.to_account_metas();

    let instruction_data = CreateCounterInstructionData {
        proof: rpc_result.proof,
        address_tree_info: packed_address_tree_info,
        output_state_tree_index: output_merkle_tree_index,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: counter::ID.into(),
        accounts,
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
```
{% endtab %}
{% endtabs %}

## Next Steps

Start building programs to create, update, or close compressed accounts.

{% content-ref url="../guides/" %}
[guides](../guides/)
{% endcontent-ref %}

[^1]: `SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7`

[^2]: PDA derived from your program ID with seed `b"cpi_authority"`

[^3]: `noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV`

[^4]: PDA derived from Light System Program ID with seed `b"cpi_authority"`. Pubkey: `HZH7qSLcpAeDqCopVU4e5XkhT9j3JFsQiq8CmruY3aru`

[^5]: `compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq`

[^6]: `11111111111111111111111111111111`
