---
description: >-
  Build a Rust client with to create or interact with compressed accounts.
  Includes a step-by-step implementation guide and full code examples.
---

# Rust

The Rust Client SDK provides two test environments:

* **For local testing, use** [**`light-program-test`**](https://docs.rs/light-program-test)**.**
  * `light-program-test` is a local test environment.
  * Initializes a [LiteSVM](https://github.com/LiteSVM/LiteSVM) optimized for ZK Compression with auto-funded payer, local prover server and TestIndexer to generate proofs instantly. Requires Light CLI for program binaries.
  * Use for unit and integration tests of your program or client code.
* **For devnet and mainnet use** [**`light-client`**](https://docs.rs/light-client)
  * `light-client` is an RPC client for compressed accounts and tokens. Find a [full list of JSON RPC methods here](https://www.zkcompression.com/resources/json-rpc-methods).
  * Connects to Photon indexer to query compressed accounts and prover service to generate validity proofs.
* `LightClient` and `LightProgramTest` implement the same [`Rpc`](https://docs.rs/light-client/latest/light_client/rpc/trait.Rpc.html) and [`Indexer`](https://docs.rs/light-client/latest/light_client/indexer/trait.Indexer.html) traits. Seamlessly switch between `light-program-test`, local test validator, and public Solana networks.

{% hint style="success" %}
Find full code examples [at the end for Anchor and native Rust](rust.md#full-code-example).
{% endhint %}

## Implementation Guide

{% tabs %}
{% tab title="Create" %}
<figure><picture><source srcset="../../.gitbook/assets/create.png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/create-dark.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Update" %}
<figure><picture><source srcset="../../.gitbook/assets/update-dark.png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/update.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Close" %}
<figure><picture><source srcset="../../.gitbook/assets/close-dark.png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/close.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Reinitialize" %}
<figure><picture><source srcset="../../.gitbook/assets/reinit-dark.png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/reinit.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Burn" %}
<figure><picture><source srcset="../../.gitbook/assets/burn-dark.png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/burn.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}
{% endtabs %}

{% stepper %}
{% step %}
### Dependencies

{% tabs %}
{% tab title="LightClient" %}
```toml
[dependencies]
light-client = "0.15.0"
light-sdk = "0.15.0"
tokio = { version = "1", features = ["full"] }
solana-program = "2.2"
anchor-lang = "0.31.1"  # if using Anchor programs
```
{% endtab %}

{% tab title="LightProgramTest" %}
```toml
[dependencies]
light-program-test = "0.15.0"
light-sdk = "0.15.0"
tokio = { version = "1", features = ["full"] }
solana-program = "2.2"
anchor-lang = "0.31.1"  # if using Anchor programs
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The [`light-sdk`](https://docs.rs/light-sdk) provides abstractions similar to Anchor's `Account`: macros, wrappers and CPI interface to create and interact with compressed accounts in Solana programs.
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

let config = LightClientConfig::devnet(
    Some("https://devnet.helius-rpc.com".to_string()),
    Some("YOUR_API_KEY".to_string())
);

let mut client = LightClient::new(config).await?;

client.payer = read_keypair_file("~/.config/solana/id.json")?;
```

* For Helius devnet: The endpoint serves both standard RPC and Photon indexer API.
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
    Some(vec![("program_create", program_create::ID)])
);
let mut rpc = LightProgramTest::new(config).await.unwrap();
let payer = rpc.get_payer().insecure_clone();
```
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Tree Configuration

Before creating a compressed account, your client must fetch metadata of two Merkle trees:

* an address tree to derive and store the account address and
* a state tree to store the compressed account hash.

{% hint style="success" %}
The protocol maintains Merkle trees. You don't need to initialize custom trees. Find the [addresses for Merkle trees here](https://www.zkcompression.com/resources/addresses-and-urls).
{% endhint %}

```rust
let address_tree_info = rpc.get_address_tree_v1();
let output_state_tree_info = rpc.get_random_state_tree_info().unwrap();
```

Fetch metadata of trees with:

* `get_address_tree_v1()` to return the `TreeInfo` struct with the public key and other metadata for the address tree.
  * Used to derive addresses with `derive_address()` and
  * for `get_validity_proof()` to prove the address does not exist yet.

{% hint style="info" %}
Only needed to create new addresses. Other interactions with compressed accounts use the existing address.
{% endhint %}

* `get_random_state_tree_info()` to return the `TreeInfo` struct with the public key and other metadata for a random state tree to store the compressed account hash.
  * Use this pubkey of the state tree for all outputs of a transaction.

{% hint style="info" %}
`TreeInfo` contains pubkeys and other metadata of a Merkle tree:

* `tree`: Merkle tree account pubkey
* `queue`: Queue account pubkey
  * Buffers insertions before they are added to the Merkle tree
  * Only the Light System Program interacts with the queue.
* `tree_type`: Identifies tree version (StateV1, AddressV2) and account for hash insertion
* `cpi_context`: Optional CPI context account for batched operations across multiple programs (may be null)
  * Allows a single zero-knowledge proof to verify compressed accounts from different programs in one instruction
  * First program caches its signer checks, second program reads them and combines instruction data
  * Reduces instruction data size and compute unit costs when multiple programs interact with compressed accounts
* `next_tree_info`: The tree to use for the next operation when the current tree is full (may be null)
  * When set, use this tree as output tree.
  * The protocol creates new trees, once existing trees fill up.
{% endhint %}
{% endstep %}

{% step %}
### Derive Address

Derive a persistent address as a unique identifier for your compressed account with `derive_address()`.

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
* To update/close, use the address to fetch the current account with `get_compressed_account(address)`.
{% endhint %}
{% endstep %}

{% step %}
### Validity Proof

Fetch a validity proof from your RPC provider that supports ZK Compression (Helius, Triton, ...). The proof type depends on the operation:

* To create a compressed account, you must prove the **address doesn't already exist** in the address tree.
* To update or close a compressed account, you must **prove its account hash exists** in a state tree.
* You can **combine multiple operations in one proof** to optimize compute cost and instruction data.

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

* Leave (`vec![]`) empty to create compressed accounts, since no compressed account exists yet to reference.
* Specify in (`vec![AddressWithTree]`) the new address to create with its address tree.

The RPC returns `ValidityProofWithContext` with

* `proof` to prove that the address does not exist in the address tree, passed to the program in your instruction data.
* `addresses` with the public key and metadata of the address tree to pack accounts in the next step.
* An empty `accounts` field, since you do not reference an existing account, when you create a compressed account.
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

* `proof` with the proof that the account hash exists in the state tree, passed to the program in your instruction data.
* `accounts` with the public key and metadata of the state tree to pack accounts in the next step.
* An empty `addresses` field, since you passed no metadata to create an address, when you update or close a compressed account.
{% endtab %}

{% tab title="Combined Proof" %}
**Advantages of combined proofs**:

* You only add one validity proof with 128 bytes in size instead of two to your instruction data.
* Reduction of compute unit consumption by at least 100k, since combined proofs are verified in a single CPI by the Light System Program.

```rust
let hash = compressed_account.hash;

let rpc_result = rpc
    .get_validity_proof(
        vec![hash],
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

* Specify in (`vec![hash]`) the hash of the existing compressed account to prove its existence in the state tree.
* Specify in (`vec![AddressWithTree]`) the new address to create with its address tree.

The RPC returns `ValidityProofWithContext` with

* `proof` with a single combined proof that verifies both the account hash exists in the state tree and the address does not exist in the address tree, passed to the program in your instruction data.
* `addresses` with the public key and metadata of the address tree to pack accounts in the next step.
* `accounts` with the public key and metadata of the state tree to pack accounts in the next step.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Pack Accounts

Compressed account instructions require packing accounts into an array.

{% hint style="info" %}
**"Packing" accounts optimizes instruction size:**

* **Packed structs** contain account **indices** (u8) instead of 32 byte pubkeys. The indices point to the `remainingAccounts` array.
* **Non-Packed structs** contain full pubkeys. RPC methods return full pubkeys.

You will pass this array in the instruction data.
{% endhint %}

#### 1. Initialize PackedAccounts

{% tabs %}
{% tab title="Anchor" %}
```rust
let mut remaining_accounts = PackedAccounts::default();
```
{% endtab %}

{% tab title="Native" %}
```rust
let mut accounts = PackedAccounts::default();
```
{% endtab %}
{% endtabs %}

`PackedAccounts::default()` creates a helper struct with three empty vectors that you'll populate in the next steps:

1. `pre_accounts`: program-specific accounts (optional and not typically used with Anchor)
2. `system_accounts`: eight Light System accounts required to create or interact with compressed accounts
3. `packed_accounts`: Merkle tree and queue accounts from the validity proof

```
[pre_accounts] [system_accounts] [packed_accounts]
       ↑               ↑                ↑
    Signers,    Light System      state trees,
   fee payer      accounts      address trees

```

#### 2. Add Light System Accounts

Add the Light System accounts your program needs to create and interact with compressed accounts.

{% tabs %}
{% tab title="Anchor" %}
```rust
let config = SystemAccountMetaConfig::new(program_create::ID);
remaining_accounts.add_system_accounts(config);
```

* Pass your program ID in `SystemAccountMetaConfig::new(program_create::ID)` to derive the CPI signer PDA
* Call `add_system_accounts(config)` - the SDK will populate the `system_accounts` vector with 8 Light System accounts in the sequence below.
{% endtab %}

{% tab title="Native" %}
```rust
let config = SystemAccountMetaConfig::new(native_program::ID);
accounts.add_pre_accounts_signer(payer.pubkey());
accounts.add_system_accounts(config)?;
```

* Add the signer to `pre_accounts` with `add_pre_accounts_signer(payer.pubkey())`
* Pass your program ID in `SystemAccountMetaConfig::new()` to derive the CPI signer PDA
* Call `add_system_accounts(config)?`, the SDK will populate the `system_accounts` vector with 8 Light System accounts in the sequence below.
{% endtab %}
{% endtabs %}

<details>

<summary><em>System Accounts List</em></summary>

| # | Account                            | Purpose                                                                                                                                                                                        |
| - | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Light System Program\[^1]          | Verifies validity proofs and executes CPI calls to create or interact with compressed accounts                                                                                                 |
| 2 | CPI Signer\[^2]                    | <p>- Signs CPI calls from your program to Light System Program<br>- PDA verified by Light System Program during CPI<br>- Derived from your program ID</p>                                      |
| 3 | Registered Program PDA             | <p>- Proves your program can interact with Account Compression Program<br>- Prevents unauthorized programs from modifying compressed account state</p>                                         |
| 4 | Noop Program\[^3]                  | <p>- Logs compressed account state to Solana ledger<br>- Indexers parse transaction logs to reconstruct compressed account state</p>                                                           |
| 5 | Account Compression Authority\[^4] | Signs CPI calls from Light System Program to Account Compression Program                                                                                                                       |
| 6 | Account Compression Program\[^5]   | <p>- Writes to state and address tree accounts<br>- Client and program do not directly interact with this program</p>                                                                          |
| 7 | Invoking Program                   | <p>Your program's ID, used by Light System Program to:<br>- Derive the CPI Signer PDA<br>- Verify the CPI Signer matches your program ID<br>- Set the owner of created compressed accounts</p> |
| 8 | System Program\[^6]                | Solana System Program to create accounts or transfer lamports                                                                                                                                  |

</details>

#### 3. Pack Tree Accounts from Validity Proof

`getValidityProof()` returns pubkeys and other metadata of Merkle trees. With `pack_tree_infos`, you will convert the pubkeys to u8 indices that reference accounts in the accounts array to optimize your instruction data.

{% tabs %}
{% tab title="Anchor" %}
{% tabs %}
{% tab title="Create" %}
```rust
let packed_accounts = rpc_result.pack_tree_infos(&mut remaining_accounts);
```

Call `pack_tree_infos(&mut remaining_accounts)` to extract tree pubkeys and add them to the accounts array.

The returned `PackedTreeInfos` contains `.address_trees` as `Vec<PackedAddressTreeInfo>`:

* `address_merkle_tree_pubkey_index`: Points to the address tree account
* `address_queue_pubkey_index`: Points to the address queue account
  * The queue buffers new addresses before they are inserted into the address tree
* `root_index`: The Merkle root index from the validity proof
  * Specifies which historical root to verify the address does not exist in the tree
{% endtab %}

{% tab title="Update, Close" %}
```rust
let packed_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .state_trees
    .unwrap();
```

Call `pack_tree_infos(&mut remaining_accounts)` to extract tree pubkeys and add them to the accounts array.

The returned `PackedTreeInfos` contains `.state_trees` as `Option<PackedStateTreeInfos>`:

* `merkle_tree_pubkey_index`: Points to the state tree account
* `queue_pubkey_index`: Points to the nullifier queue account
  * The queue tracks nullified (spent) account hashes to prevent double-spending
* `leaf_index`: The leaf position in the Merkle tree from the validity proof
  * Specifies which leaf contains your account hash to verify it exists in the tree
* `root_index`: The Merkle root index from the validity proof
  * Specifies which historical root to verify the account hash against
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="Native" %}
{% tabs %}
{% tab title="Create" %}
```rust
let output_state_tree_index = accounts.insert_or_get(*merkle_tree_pubkey);
let packed_address_tree_info = rpc_result.pack_tree_infos(&mut accounts).address_trees[0];
```

* Use `insert_or_get()` to add the output state tree pubkey and get its index
* Call `pack_tree_infos(&mut accounts)` to extract address tree info

The returned `PackedAddressTreeInfo` contains:

* `address_merkle_tree_pubkey_index`: Points to the address tree account
* `address_queue_pubkey_index`: Points to the address queue account
  * The queue buffers new addresses before they are inserted into the address tree
* `root_index`: The Merkle root index from the validity proof
  * Specifies which historical root to verify the address does not exist in the tree
{% endtab %}

{% tab title="Close, Reinit, Burn" %}
```rust
let packed_accounts = rpc_result
    .pack_tree_infos(&mut accounts)
    .state_trees
    .unwrap();
```

Call `pack_tree_infos(&mut accounts)` to extract tree pubkeys and add them to the accounts array.

The returned `PackedStateTreeInfos` contains:

* `merkle_tree_pubkey_index`: Points to the state tree account
* `queue_pubkey_index`: Points to the nullifier queue account
  * The queue tracks nullified (spent) account hashes to prevent double-spending
* `leaf_index`: The leaf position in the Merkle tree from the validity proof
  * Specifies which leaf contains your account hash to verify it exists in the tree
* `root_index`: The Merkle root index from the validity proof
  * Specifies which historical root to verify the account hash against
{% endtab %}
{% endtabs %}
{% endtab %}
{% endtabs %}

#### 4. Add Output State Tree (Create Only)

{% hint style="info" %}
This step only applies when you create accounts and use **Anchor**.

* With native Rust, the output tree index is added using `insert_or_get()` in Step 3.
* For other interactions with compressed accounts (using both Anchor and Native), the output tree is included in the packed tree accounts from Step 3.
{% endhint %}

```rust
let output_state_tree_index = output_state_tree_info
    .pack_output_tree_index(&mut remaining_accounts)?;
```

* Use `output_state_tree_info` variable from Step 3 with the `TreeInfo` metadata for the randomly selected state tree
* Call `pack_output_tree_index(&mut remaining_accounts)` to convert the tree pubkey to a u8 index

#### 5. Summary

You initialized `PackedAccounts::default()` to merge accounts into an array to optimize instruction data:

* Light System accounts to create and interact with compressed accounts via the Light System Program
* Tree accounts from the validity proof to prove an address does not exist (create) or existence of the account hash (update/close)
* The output state tree to store the new compressed account hash

The accounts receive a sequential u8 index. Instruction data references accounts via these indices in this order.
{% endstep %}

{% step %}
### Instruction Data

Build your instruction data with the validity proof, tree account indices, and complete account data.

{% hint style="info" %}
Compressed account data must be passed in instruction data because only the Merkle root hash is stored on-chain. Regular accounts store full data on-chain for programs to read data directly.

The program hashes this data and the Light System Program verifies the hash against the root in a Merkle tree account to ensure its correctness.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```rust
let instruction_data = program_create::instruction::Create {
    proof: rpc_result.proof,
    address_tree_info: packed_accounts.address_trees[0],
    output_state_tree_index,
    message,
};
```

1. **Validity Proof**

* Add the `ValidityProof` you fetched with `getValidityProof()` from your RPC provider to prove that the address does not exist yet in the specified address tree.

2. **Specify Merkle trees to store address and account hash**

Include the Merkle tree metadata packed in Step 6:

* `PackedAddressTreeInfo` specifies the index to the address tree account used to derive the address. The index points to the address tree account in `remaining_accounts`.
* `output_state_tree_index` points to the state tree account in `remaining_accounts` that will store the compressed account hash.

3. **Pass initial account data**

* This example passes `message` as the initial data for the compressed account.
* Add custom fields to your instruction struct for any initial data your program requires.
{% endtab %}

{% tab title="Update" %}
```rust
let instruction_data = anchor_program_update::instruction::Update {
    proof: rpc_result.proof,
    account_meta: CompressedAccountMeta {
        tree_info: packed_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_tree_accounts.output_tree_index,
    },
    current_message: current_account.message,
    new_message,
};
```

1. **Validity Proof**

* Add the `ValidityProof` you fetched with `getValidityProof()` from your RPC provider to prove the account exists in the state tree.

2. **Specify input hash and output state tree**

Include the Merkle tree metadata packed in Step 6:

* `CompressedAccountMeta` points to the input hash and specifies the output state tree with these fields:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash that will be nullified by the Light System Program
  * `address` specifies the account's derived address
  * `output_state_tree_index` points to the state tree that will store the updated compressed account hash

3. **Pass current account data**

* Pass the complete current account data. The program reconstructs the existing account hash from this data to verify it matches the hash in the state tree.
* In this example, we pass `current_message` from the fetched account and `new_message` for the update.
{% endtab %}

{% tab title="Close" %}
```rust
let instruction_data = anchor_program_close::instruction::Close {
    proof: rpc_result.proof,
    account_meta: CompressedAccountMeta {
        tree_info: packed_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_tree_accounts.output_tree_index,
    },
    current_message: current_account.message,
};
```

1. **Validity Proof**

* Add the `ValidityProof` you fetched with `getValidityProof()` from your RPC provider to prove the account exists in the state tree.

2. **Specify input hash and output state tree**

Include the Merkle tree metadata packed in Step 6:

* `CompressedAccountMeta` points to the input hash and specifies the output state tree:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash that will be nullified by the Light System Program
  * `address` specifies the account's derived address
  * `output_state_tree_index` points to the state tree that will store the output hash with zero values

3. **Pass current account data**

* Pass the complete current account data. The program reconstructs the existing account hash from this data to verify it matches the hash in the state tree.
* In this example, we pass `current_message` from the fetched account before closing.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Instruction

Build a standard Solana `Instruction` struct with your `program_id`, `accounts`, and `data` from Step 7. Pass the `remaining_accounts` array you built in Step 6.

<pre class="language-rust"><code class="lang-rust">let accounts = program_create::accounts::Create { // for non-Anchor build Vec

    signer: payer.pubkey(),
};

let (remaining_accounts_metas,
    _system_accounts_offset,
    _tree_accounts_offset)
        = remaining_accounts.to_account_metas();

<strong>let instruction = Instruction {
</strong><strong>    program_id: program_create::ID,
</strong><strong>    accounts: [
</strong>        accounts.to_account_metas(Some(true)),
        remaining_accounts_metas,
    ]
    .concat(),
<strong>    data: instruction_data.data(),
</strong>};
</code></pre>

**What to include in `accounts`:**

1. **Create your program-specific accounts struct** with any accounts required by your program. Use `AnchorAccounts`, or manually build `Vec<AccountMeta>` - it won't interfere with compression-related accounts.
2. **Client-program coordination:** The client builds accounts in the order defined by `PackedAccounts` (program accounts, system accounts, tree accounts).

* The SDK automatically passes offset indices in instruction data to your program, which uses them to parse the `AccountInfo` array.
* You can safely ignore `_system_accounts_offset` and `_tree_accounts_offset` on the client side.

{% hint style="success" %}
**Debugging:** Log offset values to verify account ordering when troubleshooting `InvalidCpiAccountsOffset` errors. Compare the offset indices with your actual account structure to identify mismatches.
{% endhint %}

<details>

<summary>How account offsets are used by programs</summary>

`to_account_metas()` returns offset indices that mark where account groups start in the flattened array:

* `system_accounts_offset`: Index where Light System accounts start
* `tree_accounts_offset`: Index where Merkle tree and queue accounts start

Your program extracts `system_accounts_offset` from instruction data and uses it to slice the `AccountInfo` array before passing to `CpiAccounts::new()`.

* `CpiAccounts::new()` requires the slice to start at the Light System Program account.
* If you pass the full array without offsetting, `CpiAccounts` expects the Light System Program at position 0, but it's actually at position 1, which leads to the `InvalidCpiAccountsOffset` error.

</details>

2. **Get Light System accounts** by calling `remaining_accounts.to_account_metas()` to return the merged accounts array with Light System and tree account indices.
3. **Merge all account indices into one vector**:

* `accounts.to_account_metas(Some(true))` converts your Anchor struct to `Vec<AccountMeta>` (Anchor auto-generates this method)
* `remaining_accounts_metas` returns the indices for the Light System and tree accounts.

This is the final account array:

```
[0]    Your program accounts 
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues
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

## Full Code Examples

Full Rust test examples using `light-program-test`.

1. Install the Light CLI first to download the program binaries:

```bash
npm i -g @lightprotocol/zk-compression-cli
```

2. Then build and run tests:

```bash
cargo test-sbf
```

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% tabs %}
{% tab title="Create" %}
```rust
#![cfg(feature = "test-sbf")]

use anchor_lang::AnchorDeserialize;
use light_program_test::{
    program_test::LightProgramTest, AddressWithTree, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::{
    address::v1::derive_address,
    instruction::{PackedAccounts, SystemAccountMetaConfig},
};
use program_create::MyCompressedAccount;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_create() {
    let config = ProgramTestConfig::new(true, Some(vec![("program_create", program_create::ID)]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();

    let (address, _) = derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &program_create::ID,
    );

    create_message_account(&mut rpc, &payer, &address, "Hello, compressed world!".to_string())
        .await
        .unwrap();

    let account = get_message_account(&mut rpc, address).await;
    assert_eq!(account.owner, payer.pubkey());
    assert_eq!(account.message, "Hello, compressed world!");
}

async fn create_message_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    address: &[u8; 32],
    message: String,
) -> Result<Signature, RpcError> {
    let config = SystemAccountMetaConfig::new(program_create::ID);
    let mut remaining_accounts = PackedAccounts::default();
    remaining_accounts.add_system_accounts(config);

    let address_tree_info = rpc.get_address_tree_v1();

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
    let packed_accounts = rpc_result.pack_tree_infos(&mut remaining_accounts);

    let output_state_tree_index = rpc
        .get_random_state_tree_info()
        .unwrap()
        .pack_output_tree_index(&mut remaining_accounts)
        .unwrap();

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: program_create::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            program_create::instruction::Create {
                proof: rpc_result.proof,
                address_tree_info: packed_accounts.address_trees[0],
                output_state_tree_index: output_state_tree_index,
                message,
            }
            .data()
        },
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn get_message_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> MyCompressedAccount {
    let account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value;
    let data = &account.data.as_ref().unwrap().data;
    MyCompressedAccount::deserialize(&mut &data[..]).unwrap()
}
```
{% endtab %}

{% tab title="Update" %}
```rust
#![cfg(feature = "test-sbf")]

use anchor_lang::AnchorDeserialize;
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use anchor_program_update::MyCompressedAccount;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_update() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("program_create", program_create::ID),
        ("anchor_program_update", anchor_program_update::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    // Create account first
    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &anchor_program_update::ID,
    );

    program_create::tests::create_message_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    update_message_account(&mut rpc, &payer, account, "Updated message!".to_string())
        .await
        .unwrap();

    let updated = get_message_account(&mut rpc, address).await;
    assert_eq!(updated.message, "Updated message!");
}

async fn update_message_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
    new_message: String,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(anchor_program_update::ID);
    remaining_accounts.add_system_accounts(config);
    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_tree_accounts = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let current_account = MyCompressedAccount::deserialize(
        &mut compressed_account.data.as_ref().unwrap().data.as_slice(),
    )
    .unwrap();

    let instruction = Instruction {
        program_id: anchor_program_update::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            anchor_program_update::instruction::Update {
                proof: rpc_result.proof,
                account_meta: CompressedAccountMeta {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                    output_state_tree_index: packed_tree_accounts.output_tree_index,
                },
                current_message: current_account.message,
                new_message,
            }
            .data()
        },
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn get_compressed_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> CompressedAccount {
    rpc.get_compressed_account(address, None)
        .await
        .unwrap()
        .value
}

async fn get_message_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> MyCompressedAccount {
    let account = get_compressed_account(rpc, address).await;
    let data = &account.data.as_ref().unwrap().data;
    MyCompressedAccount::deserialize(&mut &data[..]).unwrap()
}
```
{% endtab %}

{% tab title="Close" %}
```rust
#![cfg(feature = "test-sbf")]

use anchor_lang::AnchorDeserialize;
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use anchor_program_close::MyCompressedAccount;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_close() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("program_create", program_create::ID),
        ("anchor_program_close", anchor_program_close::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    // Create account first
    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &anchor_program_close::ID,
    );

    program_create::tests::create_message_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    close_message_account(&mut rpc, &payer, account)
        .await
        .unwrap();

    let result = rpc.get_compressed_account(address, None).await;
    assert!(result.is_err() || result.unwrap().value.data.is_none());
}

async fn close_message_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(anchor_program_close::ID);
    remaining_accounts.add_system_accounts(config);
    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_tree_accounts = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let current_account = MyCompressedAccount::deserialize(
        &mut compressed_account.data.as_ref().unwrap().data.as_slice(),
    )
    .unwrap();

    let instruction = Instruction {
        program_id: anchor_program_close::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            anchor_program_close::instruction::Close {
                proof: rpc_result.proof,
                account_meta: CompressedAccountMeta {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                    output_state_tree_index: packed_tree_accounts.output_tree_index,
                },
                current_message: current_account.message,
            }
            .data()
        },
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn get_compressed_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> CompressedAccount {
    rpc.get_compressed_account(address, None)
        .await
        .unwrap()
        .value
}
```
{% endtab %}

{% tab title="Reinit" %}
```rust
#![cfg(feature = "test-sbf")]

use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_reinit() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("program_create", program_create::ID),
        ("anchor_program_close", anchor_program_close::ID),
        ("anchor_program_reinit", anchor_program_reinit::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    // Create and close account
    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &anchor_program_reinit::ID,
    );

    program_create::tests::create_message_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    anchor_program_close::tests::close_message_account(&mut rpc, &payer, account)
        .await
        .unwrap();

    let closed_account = get_compressed_account(&mut rpc, address).await;

    // Reinitialize the account
    reinit_message_account(&mut rpc, &payer, closed_account)
        .await
        .unwrap();

    let reinit_account = rpc.get_compressed_account(address, None).await.unwrap().value.unwrap();
    assert_eq!(reinit_account.data, Some(Default::default()));
}

async fn reinit_message_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(anchor_program_reinit::ID);
    remaining_accounts.add_system_accounts(config);
    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_tree_accounts = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: anchor_program_reinit::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            anchor_program_reinit::instruction::Reinit {
                proof: rpc_result.proof,
                account_meta: CompressedAccountMeta {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                    output_state_tree_index: packed_tree_accounts.output_tree_index,
                },
            }
            .data()
        },
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn get_compressed_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> CompressedAccount {
    rpc.get_compressed_account(address, None)
        .await
        .unwrap()
        .value
}
```
{% endtab %}

{% tab title="Burn" %}
```rust
#![cfg(feature = "test-sbf")]

use anchor_lang::AnchorDeserialize;
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMetaBurn, PackedAccounts, SystemAccountMetaConfig,
};
use anchor_program_burn::MyCompressedAccount;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_burn() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("program_create", program_create::ID),
        ("anchor_program_burn", anchor_program_burn::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    // Create account first
    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &anchor_program_burn::ID,
    );

    program_create::tests::create_message_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    burn_message_account(&mut rpc, &payer, account)
        .await
        .unwrap();

    let result = rpc.get_compressed_account(address, None).await.unwrap().value;
    assert!(result.is_none());
}

async fn burn_message_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(anchor_program_burn::ID);
    remaining_accounts.add_system_accounts(config);
    let hash = compressed_account.hash;

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    let packed_tree_accounts = rpc_result
        .pack_tree_infos(&mut remaining_accounts)
        .state_trees
        .unwrap();

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let current_account = MyCompressedAccount::deserialize(
        &mut compressed_account.data.as_ref().unwrap().data.as_slice(),
    )
    .unwrap();

    let instruction = Instruction {
        program_id: anchor_program_burn::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            anchor_program_burn::instruction::Burn {
                proof: rpc_result.proof,
                account_meta: CompressedAccountMetaBurn {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                },
                current_message: current_account.message,
            }
            .data()
        },
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn get_compressed_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> CompressedAccount {
    rpc.get_compressed_account(address, None)
        .await
        .unwrap()
        .value
}
```
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="Native" %}
{% tabs %}
{% tab title="Create" %}
```rust
#![cfg(feature = "test-sbf")]

use borsh::{BorshDeserialize, BorshSerialize};
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, AddressWithTree, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::address::v1::derive_address;
use light_sdk::instruction::{PackedAccounts, SystemAccountMetaConfig};
use native_program_create::{CreateInstructionData, MyCompressedAccount};
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};

#[tokio::test]
async fn test_create() {
    let config = ProgramTestConfig::new(true, Some(vec![("native_program_create", native_program_create::ID)]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let address_tree_pubkey = address_tree_info.tree;

    let (address, _) = derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_pubkey,
        &native_program_create::ID,
    );
    let merkle_tree_pubkey = rpc.get_random_state_tree_info().unwrap().tree;

    create_compressed_account(
        &payer,
        &mut rpc,
        &merkle_tree_pubkey,
        address_tree_pubkey,
        address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(compressed_account.address.unwrap(), address);

    let my_account =
        MyCompressedAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();
    assert_eq!(my_account.owner, payer.pubkey());
    assert_eq!(my_account.message, "Hello, compressed world!");
}

pub async fn create_compressed_account(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    merkle_tree_pubkey: &Pubkey,
    address_tree_pubkey: Pubkey,
    address: [u8; 32],
    message: String,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(native_program_create::ID);
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

    let output_state_tree_index = accounts.insert_or_get(*merkle_tree_pubkey);
    let packed_address_tree_info = rpc_result.pack_tree_infos(&mut accounts).address_trees[0];
    let (account_metas, _, _) = accounts.to_account_metas();

    let instruction_data = CreateInstructionData {
        proof: rpc_result.proof,
        address_tree_info: packed_address_tree_info,
        output_state_tree_index: output_state_tree_index,
        message,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: native_program_create::ID,
        accounts: account_metas,
        data: [
            &[native_program_create::InstructionType::Create as u8][..],
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

{% tab title="Close" %}
```rust
#![cfg(feature = "test-sbf")]

use borsh::{BorshDeserialize, BorshSerialize};
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use native_program_close::{CloseInstructionData, MyCompressedAccount};
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};

pub async fn close_compressed_account(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(native_program_close::ID);
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

    let current_account =
        MyCompressedAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let meta = CompressedAccountMeta {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_accounts.output_tree_index,
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = CloseInstructionData {
        proof: rpc_result.proof,
        account_meta: meta,
        current_message: current_account.message,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: native_program_close::ID,
        accounts: account_metas,
        data: [
            &[native_program_close::InstructionType::Close as u8][..],
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

{% tab title="Reinit" %}
```rust
#![cfg(feature = "test-sbf")]

use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use native_program_reinit::ReinitInstructionData;
use solana_sdk::{
    instruction::Instruction,
    signature::{Keypair, Signer},
};

pub async fn reinit_compressed_account(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(native_program_reinit::ID);
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

    let meta = CompressedAccountMeta {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_accounts.output_tree_index,
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = ReinitInstructionData {
        proof: rpc_result.proof,
        account_meta: meta,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: native_program_reinit::ID,
        accounts: account_metas,
        data: [
            &[native_program_reinit::InstructionType::Reinit as u8][..],
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

{% tab title="Burn" %}
```rust
#![cfg(feature = "test-sbf")]

use borsh::BorshDeserialize;
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMetaBurn, PackedAccounts, SystemAccountMetaConfig,
};
use native_program_burn::{BurnInstructionData, MyCompressedAccount};
use solana_sdk::{
    instruction::Instruction,
    signature::{Keypair, Signer},
};

pub async fn burn_compressed_account(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(native_program_burn::ID);
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

    let current_account =
        MyCompressedAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    let meta = CompressedAccountMetaBurn {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = BurnInstructionData {
        proof: rpc_result.proof,
        account_meta: meta,
        current_message: current_account.message,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: native_program_burn::ID,
        accounts: account_metas,
        data: [
            &[native_program_burn::InstructionType::Burn as u8][..],
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
{% endtab %}
{% endtabs %}

## Next Steps

Start building programs to create, or interact with compressed accounts.

{% content-ref url="../guides/" %}
[guides](../guides/)
{% endcontent-ref %}
