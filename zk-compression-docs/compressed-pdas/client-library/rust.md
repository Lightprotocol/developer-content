---
title: Rust Client
description: >-
  Build a Rust client to create or interact with compressed accounts and tokens.
  Includes a step-by-step implementation guide and full code examples.
---







{% step %}
### Validity Proof

Fetch a validity proof from your RPC provider that supports ZK Compression (Helius, Triton, ...). The proof type depends on the operation:

* To create a compressed account, you must prove the **address doesn't already exist** in the address tree.
* To update or close a compressed account, you must **prove its account hash exists** in a state tree.
* You can **combine multiple addresses and hashes in one proof** to optimize compute cost and instruction data.

{% hint style="info" %}
[Here's a full guide](https://www.zkcompression.com/resources/json-rpc-methods/getvalidityproof) to the `get_validity_proof()` method.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
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
{% endcode %}

**Pass these parameters**:

* Leave (`vec![]`) empty to create compressed accounts, since no compressed account exists yet.
* Specify in (`vec![AddressWithTree]`) the new address to create with its address tree.

The RPC returns `ValidityProofWithContext` with

* `proof` to prove that the address does not exist in the address tree, passed to the program in your instruction data.
* `addresses` with the public key and metadata of the address tree to pack accounts in the next step.
* An empty `accounts` field, since you do not reference an existing account, when you create a compressed account.
{% endtab %}

{% tab title="Update, Close, Reinit, Burn" %}
{% hint style="info" %}
These operations proof that the account hash exists in the state tree. The difference is in your program's instruction handler.
{% endhint %}

{% code overflow="wrap" %}
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
{% endcode %}

**Pass these parameters**:

* Specify in (`vec![hash]`) the hash of the existing compressed account to prove its existence in the state tree.
* (`vec![]`) remains empty, since the proof verifies the account hash exists in a state tree, not that the address doesn't exist in an address tree.

The RPC returns `ValidityProofWithContext` with

* `proof` with the proof that the account hash exists in the state tree, passed to the program in your instruction data.
* `accounts` with the public key and metadata of the state tree to pack accounts in the next step.
* An empty `addresses` field, since you passed no metadata to create an address, when you update, close, reinitialize or burn a compressed account.
{% endtab %}

{% tab title="Combined Proof" %}
{% hint style="info" %}
**Advantages of combined proofs**:

* You only add one validity proof with 128 bytes in size instead of two to your instruction data.
* Reduction of compute unit consumption by at least 100k CU, since combined proofs are verified in a single CPI by the Light System Program.
{% endhint %}

{% code overflow="wrap" %}
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
{% endcode %}

**Pass these parameters**:

* Specify in (`vec![hash]`) one or more hashes of the existing compressed account to prove existence in the state trees.
* Specify in (`vec![AddressWithTree]`) one or more addresses to prove non-existence in address trees.

The RPC returns `ValidityProofWithContext` with

* `proof`: A single combined proof, passed to the program in your instruction data.
* `addresses` with the public key and metadata of the address tree to pack accounts in the next step.
* `accounts` with the public key and metadata of the state tree to pack accounts in the next step.

**Supported Combinations and Maximums**

The specific combinations and maximums depend on the circuit version (v1 or v2) and the proof type.

* Combine multiple hashes **or** multiple addresses in a single proof, or
* multiple hashes **and** addresses in a single combined proof.

{% hint style="info" %}
These maximums are determined by the available circuit verifying keys. Different proof sizes require different circuits optimized for that specific combination. View the [source code here](https://github.com/Lightprotocol/light-protocol/tree/871215642b4b5b69d2bcd7eca22542346d0e2cfa/program-libs/verifier/src/verifying_keys).
{% endhint %}

{% tabs %}
{% tab title="V1 Circuits" %}
V1 circuits can prove in a single proof

* 1, 2, 3, 4, or 8 hashes,
* 1, 2, 3, 4, or 8 addresses, or
* multiple hashes or addresses in any combination of the below.

| **Single Combined Proofs** | Any combination of |
| -------------------------- | :----------------: |
| Hashes                     |    1, 2, 3, 4, 8   |
| Addresses                  |     1, 2, 4, 8     |
{% endtab %}

{% tab title="V2 Circuits" %}
V2 circuits can prove in a single proof

* 1 to 20 hashes,
* 1 to 32 addresses, or
* multiple hashes or addresses in any combination of the below.

| **Single Combined Proofs** | Any combination of |
| -------------------------- | :----------------: |
| Hashes                     |       1 to 4       |
| Addresses                  |       1 to 4       |
{% endtab %}
{% endtabs %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Pack Accounts

To optimize instruction data we pack accounts into an array:

* Every packed account is assigned to an u8 index.
* Indices are included in instruction data, instead of 32 byte pubkeys.
* The indices point to the instructions accounts
  * in anchor to `remainingAccounts`, and
  * in native programs to the account info slice.

**1. Initialize PackedAccounts**

{% tabs %}
{% tab title="Anchor" %}
{% code overflow="wrap" %}
```rust
let mut remaining_accounts = PackedAccounts::default();
```
{% endcode %}
{% endtab %}

{% tab title="Native" %}
{% code overflow="wrap" %}
```rust
let mut accounts = PackedAccounts::default();
```
{% endcode %}
{% endtab %}
{% endtabs %}

`PackedAccounts::default()` creates a helper struct with three empty vectors that you'll populate in the next steps:

1. `pre_accounts`: program-specific accounts (optional and not typically used with Anchor)
2. `system_accounts`: eight Light System accounts required to create or interact with compressed accounts
3. `packed_accounts`: Merkle tree and queue accounts from the validity proof

{% code overflow="wrap" %}
```
[pre_accounts] [system_accounts] [packed_accounts]
       ↑               ↑                ↑
    Signers,    Light System      state trees,
   fee payer      accounts      address trees

```
{% endcode %}

**2. Add Light System Accounts**

Add the Light System accounts your program needs to create and interact with compressed accounts.

{% tabs %}
{% tab title="Anchor" %}
{% code overflow="wrap" %}
```rust
let config = SystemAccountMetaConfig::new(program_create::ID);
remaining_accounts.add_system_accounts(config)?;
```
{% endcode %}

* Pass your program ID in `SystemAccountMetaConfig::new(program_create::ID)` to derive the CPI signer PDA
* Call `add_system_accounts(config)?` - the SDK will populate the `system_accounts` vector with 8 Light System accounts in the sequence below.
{% endtab %}

{% tab title="Native" %}
{% code overflow="wrap" %}
```rust
let config = SystemAccountMetaConfig::new(native_program::ID);
accounts.add_pre_accounts_signer(payer.pubkey());
accounts.add_system_accounts(config)?;
```
{% endcode %}

* Add the signer to `pre_accounts` with `add_pre_accounts_signer(payer.pubkey())`
* Pass your program ID in `SystemAccountMetaConfig::new()` to derive the CPI signer PDA
* Call `add_system_accounts(config)?`, the SDK will populate the `system_accounts` vector with 8 Light System accounts in the sequence below.
{% endtab %}
{% endtabs %}

<details>

<summary><em>System Accounts List</em></summary>

<table data-header-hidden><thead><tr><th width="40">#</th><th>Name</th><th>Description</th></tr></thead><tbody><tr><td>1</td><td><a data-footnote-ref href="#user-content-fn-1">​Light System Program​</a></td><td>Verifies validity proofs, compressed account ownership checks, cpis the account compression program to update tree accounts</td></tr><tr><td>2</td><td>CPI Signer</td><td>- PDA to sign CPI calls from your program to Light System Program<br>- Verified by Light System Program during CPI<br>- Derived from your program ID</td></tr><tr><td>3</td><td>Registered Program PDA</td><td>- Access control to the Account Compression Program</td></tr><tr><td>4</td><td><a data-footnote-ref href="#user-content-fn-2">​Noop Program​</a></td><td>- Logs compressed account state to Solana ledger. Only used in v1.<br>- Indexers parse transaction logs to reconstruct compressed account state</td></tr><tr><td>5</td><td><a data-footnote-ref href="#user-content-fn-3">​Account Compression Authority​</a></td><td>Signs CPI calls from Light System Program to Account Compression Program</td></tr><tr><td>6</td><td><a data-footnote-ref href="#user-content-fn-4">​Account Compression Program​</a></td><td>- Writes to state and address tree accounts<br>- Client and the account compression program do not interact directly.</td></tr><tr><td>7</td><td>Invoking Program</td><td>Your program's ID, used by Light System Program to:<br>- Derive the CPI Signer PDA<br>- Verify the CPI Signer matches your program ID<br>- Set the owner of created compressed accounts</td></tr><tr><td>8</td><td><a data-footnote-ref href="#user-content-fn-5">​System Program​</a></td><td>Solana System Program to transfer lamports</td></tr></tbody></table>

</details>

**3. Pack Tree Accounts from Validity Proof**

`getValidityProof()` returns pubkeys and other metadata of Merkle trees. With `pack_tree_infos`, you will convert the pubkeys to u8 indices that reference accounts in the accounts array to optimize your instruction data.

{% tabs %}
{% tab title="Anchor" %}
{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```rust
let packed_accounts = rpc_result.pack_tree_infos(&mut remaining_accounts);
```
{% endcode %}

Call `pack_tree_infos(&mut remaining_accounts)` to extract tree pubkeys and add them to the accounts array.

The returned `PackedTreeInfos` contain `.address_trees` as `Vec<PackedAddressTreeInfo>`:

* `address_merkle_tree_pubkey_index`: Points to the address tree account
* `address_queue_pubkey_index`: Points to the address queue account
  * The queue buffers new addresses before they are inserted into the address tree
* `root_index`: The Merkle root index from the validity proof to verify the address does not exist in the tree.
{% endtab %}

{% tab title="Update, Close, Reinit, Burn" %}
{% code overflow="wrap" %}
```rust
let packed_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .state_trees
    .unwrap();
```
{% endcode %}

Call `pack_tree_infos(&mut remaining_accounts)` to extract tree pubkeys and add them to the accounts array.

The returned `PackedTreeInfos` contains `.state_trees` as `Option<PackedStateTreeInfos>`:

* `merkle_tree_pubkey_index`: Points to the state tree account
* `queue_pubkey_index`: Points to the nullifier queue account
  * The queue tracks nullified (spent) account hashes to prevent double-spending
* `leaf_index`: The leaf position in the Merkle tree from the validity proof to verify the compressed account it exists in the tree
* `root_index`: The Merkle root index from the validity proof to verify the account hash against
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="Native" %}
{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```rust
let output_state_tree_index = accounts.insert_or_get(*merkle_tree_pubkey);
let packed_address_tree_info = rpc_result.pack_tree_infos(&mut accounts).address_trees[0];
```
{% endcode %}

* Use `insert_or_get()` to add the output state tree pubkey and get its index
* Call `pack_tree_infos(&mut accounts)` to extract address tree info

The returned `PackedAddressTreeInfo` contains:

* `address_merkle_tree_pubkey_index`: Points to the address tree account
* `address_queue_pubkey_index`: Points to the address queue account
  * The queue buffers new addresses before they are inserted into the address tree
* `root_index`: The Merkle root index from the validity proof to verify the address does not exist in the tree
{% endtab %}

{% tab title="Update, Close, Reinit, Burn" %}
{% code overflow="wrap" %}
```rust
let packed_accounts = rpc_result
    .pack_tree_infos(&mut accounts)
    .state_trees
    .unwrap();
```
{% endcode %}

Call `pack_tree_infos(&mut accounts)` to extract tree pubkeys and add them to the accounts array.

The returned `PackedStateTreeInfos` contains:

* `merkle_tree_pubkey_index`: Points to the state tree account
* `queue_pubkey_index`: Points to the nullifier queue account
  * The queue tracks nullified (spent) account hashes to prevent double-spending
* `leaf_index`: The leaf position in the Merkle tree from the validity proof to verify the compressed account it exists in the tree
* `root_index`: The Merkle root index from the validity proof to verify the account hash against
{% endtab %}
{% endtabs %}
{% endtab %}
{% endtabs %}

**4. Add Output State Tree (Create only)**

{% hint style="info" %}
When packing accounts on the client side, you must specify the output state tree to store the new account hash _except_ for burn instructions.
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
For create instructions:

{% code overflow="wrap" %}
```rust
let output_state_tree_index = output_state_tree_info
    .pack_output_tree_index(&mut remaining_accounts)?;
```
{% endcode %}

* Use `output_state_tree_info` variable from Step 3 with the `TreeInfo` metadata for the randomly selected state tree
* Call `pack_output_tree_index(&mut remaining_accounts)` to add the tree to packed accounts and return its u8 index.

For update, close, and reinitialize instructions, the `output_state_tree_index` is automatically included in `CompressedAccountMeta` from `pack_tree_infos()` in Step 3.
{% endtab %}

{% tab title="Native" %}
For create instructions, the output state tree was already added in Step 3:

{% code overflow="wrap" %}
```rust
// Already done in Step 3:
let output_state_tree_index = accounts.insert_or_get(*merkle_tree_pubkey);
```
{% endcode %}

* `insert_or_get()` adds the output state tree pubkey to the accounts array and returns its u8 index
* This happens before calling `pack_tree_infos()` to extract address tree info in Step 3

For update, close, and reinitialize instructions, the `output_state_tree_index` is automatically included in `CompressedAccountMeta` from `pack_tree_infos()` in Step 3.
{% endtab %}
{% endtabs %}

**5. Summary**

You initialized `PackedAccounts::default()` to merge accounts into an array to optimize instruction data:

* added Light System accounts to create and interact with compressed accounts via the Light System Program
* added tree accounts from the validity proof to prove an address does not exist (create) or existence of the account hash (update/close)
* added the output state tree to store the new compressed account hash

The accounts are referenced in instruction data by u8 indices in Packed structs.
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
{% code overflow="wrap" %}
```rust
let instruction_data = program_create::instruction::Create {
    proof: rpc_result.proof,
    address_tree_info: packed_accounts.address_trees[0],
    output_state_tree_index,
    message,
};
```
{% endcode %}

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
{% code overflow="wrap" %}
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
{% endcode %}

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
{% code overflow="wrap" %}
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
{% endcode %}

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

{% tab title="Reinit" %}
{% code overflow="wrap" %}
```rust
let instruction_data = anchor_program_reinit::instruction::Reinit {
    proof: rpc_result.proof,
    account_meta: CompressedAccountMeta {
        tree_info: packed_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
        output_state_tree_index: packed_tree_accounts.output_tree_index,
    },
};
```
{% endcode %}

1. **Validity Proof**

* Add the `ValidityProof` you fetched with `getValidityProof()` from your RPC provider to prove the account hash exists in the state tree.

2. **Specify input hash and output state tree**

Include the Merkle tree metadata packed in Step 6:

* `CompressedAccountMeta` points to the input hash and specifies the output state tree:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash that will be nullified by the Light System Program
  * `address` specifies the account's derived address
  * `output_state_tree_index` points to the state tree that will store the reinitialized account hash

3. **Account data initialization**

* Reinitialize creates an account with default-initialized values (e.g., `Pubkey` as all zeros, numbers as `0`, strings as empty).
* To set custom values, update the account in the same or a separate transaction.
{% endtab %}

{% tab title="Burn" %}
{% code overflow="wrap" %}
```rust
let instruction_data = anchor_program_burn::instruction::Burn {
    proof: rpc_result.proof,
    account_meta: CompressedAccountMetaBurn {
        tree_info: packed_tree_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
    },
    current_message: current_account.message,
};
```
{% endcode %}

1. **Validity Proof**

* Add the `ValidityProof` you fetched with `getValidityProof()` from your RPC provider to prove the account hash exists in the state tree.

2. **Specify input hash**

Include the Merkle tree metadata packed in Step 6:

* `CompressedAccountMetaBurn` points to the input hash:
  * `tree_info: PackedStateTreeInfo` points to the existing account hash that will be nullified by the Light System Program
  * `address` specifies the account's derived address
  * No `output_state_tree_index`, since burn does not create output state.

3. **Pass current account data**

* Pass the complete current account data. The program reconstructs the existing account hash from this data to verify it matches the hash in the state tree.
* In this example, we pass `current_message` from the fetched account before burning.
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
2. **Client-program coordination:** The client builds accounts in the order defined by `PackedAccounts` (arbitrary pre accounts, system accounts, packed (tree) accounts).

* You can safely ignore `_system_accounts_offset` and `_tree_accounts_offset`.

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

</details>

2. **Get Light System accounts** by calling `remaining_accounts.to_account_metas()` to return the merged accounts array with Light System and tree account indices.
3. **Merge all account indices into one vector**:

* `accounts.to_account_metas(Some(true))` converts your Anchor struct to `Vec<AccountMeta>` (Anchor auto-generates this method)
* `remaining_accounts_metas` returns the indices for the Light System and tree accounts.

This is the final account array:

{% tabs %}
{% tab title="Anchor Programs" %}
1. Account struct:

* Signers
* Fee payer

2. Remaining accounts:

{% code overflow="wrap" %}
```
[0]    Light System Program
[1]    CPI Signer PDA
[2-7]  Other Light System accounts
[8+]   Merkle trees, queues
```
{% endcode %}
{% endtab %}

{% tab title="Native Program" %}
All accounts are in the array when not using Anchor.

{% code overflow="wrap" %}
```
[0]    Signers, Fee Payer
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues
```
{% endcode %}

-> you need to use 1 as offset when creating CpiAccounts struct in your program.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Send Transaction

{% code overflow="wrap" %}
```rust
rpc.create_and_send_transaction(&[instruction],
  &payer.pubkey(), &[payer])
      .await?;
```
{% endcode %}
{% endstep %}
{% endstepper %}

## Full Code Examples

Full Rust test examples using `light-program-test`.

1. Install the Light CLI first to download the program binaries:

{% code overflow="wrap" %}
```bash
npm i -g @lightprotocol/zk-compression-cli@0.27.1-alpha.2
```
{% endcode %}

2. Then build and run tests:

{% code overflow="wrap" %}
```bash
cargo test-sbf
```
{% endcode %}

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}
{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
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
use create::MyCompressedAccount;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_create() {
    let config = ProgramTestConfig::new(true, Some(vec![("create", create::ID)]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();

    let (address, _) = derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &create::ID,
    );

    create_compressed_account(&mut rpc, &payer, &address, "Hello, compressed world!".to_string())
        .await
        .unwrap();

    let account = get_message_account(&mut rpc, address).await;
    assert_eq!(account.owner, payer.pubkey());
    assert_eq!(account.message, "Hello, compressed world!");
}

async fn create_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    address: &[u8; 32],
    message: String,
) -> Result<Signature, RpcError> {
    let config = SystemAccountMetaConfig::new(create::ID);
    let mut remaining_accounts = PackedAccounts::default();
    remaining_accounts.add_system_accounts(config)?;

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
        program_id: create::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            create::instruction::CreateAccount {
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
        .value
        .unwrap();
    let data = &account.data.as_ref().unwrap().data;
    MyCompressedAccount::deserialize(&mut &data[..]).unwrap()
}
```
{% endcode %}
{% endtab %}

{% tab title="Update" %}
{% code overflow="wrap" %}
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
use update::MyCompressedAccount;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_update() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("update", update::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    // Create account first
    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &update::ID,
    );

    create_compressed_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    println!("{:?}", account);
    update_compressed_account(&mut rpc, &payer, account, "Updated message!".to_string())
        .await
        .unwrap();

    let updated = get_message_account(&mut rpc, address).await;
    assert_eq!(updated.owner, payer.pubkey());
    assert_eq!(updated.message, "Updated message!");
}

async fn update_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
    new_message: String,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(update::ID);
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

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let current_account = MyCompressedAccount::deserialize(
        &mut compressed_account.data.as_ref().unwrap().data.as_slice(),
    )
    .unwrap();

    let instruction = Instruction {
        program_id: update::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            update::instruction::UpdateAccount {
                proof: rpc_result.proof,
                current_account,
                account_meta: CompressedAccountMeta {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                    output_state_tree_index: packed_tree_accounts.output_tree_index,
                },
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
        .unwrap()
}

async fn get_message_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> MyCompressedAccount {
    let account = get_compressed_account(rpc, address).await;
    let data = &account.data.as_ref().unwrap().data;
    MyCompressedAccount::deserialize(&mut &data[..]).unwrap()
}

async fn create_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    address: &[u8; 32],
    message: String,
) -> Result<Signature, RpcError> {
    let config = SystemAccountMetaConfig::new(update::ID);
    let mut remaining_accounts = PackedAccounts::default();
    remaining_accounts.add_system_accounts(config)?;

    let address_tree_info = rpc.get_address_tree_v1();

    let rpc_result = rpc
        .get_validity_proof(
            vec![],
            vec![light_program_test::AddressWithTree {
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
        program_id: update::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            update::instruction::CreateAccount {
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
```
{% endcode %}
{% endtab %}

{% tab title="Close" %}
{% code overflow="wrap" %}
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
async fn test_close() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("close", close::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &close::ID,
    );

    create_compressed_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    close_compressed_account(&mut rpc, &payer, account, "Hello, compressed world!".to_string())
        .await
        .unwrap();

    let closed = rpc.get_compressed_account(address, None).await.unwrap().value.unwrap();
    assert_eq!(closed.address.unwrap(), address);
    assert_eq!(closed.owner, close::ID);

    let data = closed.data.unwrap();
    assert_eq!(data.discriminator, [0u8; 8]);
    assert!(data.data.is_empty());
    assert_eq!(data.data_hash, [0u8; 32]);
}

async fn close_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
    message: String,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(close::ID);
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

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: close::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            close::instruction::CloseAccount {
                proof: rpc_result.proof,
                account_meta: CompressedAccountMeta {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                    output_state_tree_index: packed_tree_accounts.output_tree_index,
                },
                current_message: message,
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
        .unwrap()
}

async fn create_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    address: &[u8; 32],
    message: String,
) -> Result<Signature, RpcError> {
    let config = SystemAccountMetaConfig::new(close::ID);
    let mut remaining_accounts = PackedAccounts::default();
    remaining_accounts.add_system_accounts(config)?;

    let address_tree_info = rpc.get_address_tree_v1();

    let rpc_result = rpc
        .get_validity_proof(
            vec![],
            vec![light_program_test::AddressWithTree {
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
        program_id: close::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            close::instruction::CreateAccount {
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
```
{% endcode %}
{% endtab %}

{% tab title="Reinit" %}
{% code overflow="wrap" %}
```rust
#![cfg(feature = "test-sbf")]

use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use light_sdk::LightDiscriminator;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_reinit() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("reinit", reinit::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &reinit::ID,
    );

    create_compressed_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    close_compressed_account(&mut rpc, &payer, account, "Hello, compressed world!".to_string())
        .await
        .unwrap();

    let closed = rpc.get_compressed_account(address, None).await.unwrap().value.unwrap();
    assert_eq!(closed.address.as_ref().unwrap(), &address);
    assert_eq!(closed.owner, reinit::ID);

    let data = closed.data.as_ref().unwrap();
    assert_eq!(data.discriminator, [0u8; 8]);
    assert!(data.data.is_empty());
    assert_eq!(data.data_hash, [0u8; 32]);

    // Reinitialize the closed account
    reinit_compressed_account(&mut rpc, &payer, closed)
        .await
        .unwrap();

    // Verify reinitialized account has default values
    let reinitialized = rpc.get_compressed_account(address, None).await.unwrap().value.unwrap();
    assert_eq!(reinitialized.address.as_ref().unwrap(), &address);
    assert_eq!(reinitialized.owner, reinit::ID);

    let data = reinitialized.data.as_ref().unwrap();
    // Default MyCompressedAccount should have empty message and default pubkey
    assert_eq!(data.discriminator, reinit::MyCompressedAccount::LIGHT_DISCRIMINATOR);
    assert!(!data.data.is_empty()); // Has default-initialized data now
}

async fn close_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
    message: String,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(reinit::ID);
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

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: reinit::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            reinit::instruction::CloseAccount {
                proof: rpc_result.proof,
                account_meta: CompressedAccountMeta {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                    output_state_tree_index: packed_tree_accounts.output_tree_index,
                },
                current_message: message,
            }
            .data()
        },
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await
}

async fn reinit_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(reinit::ID);
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

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: reinit::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            reinit::instruction::ReinitAccount {
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
        .unwrap()
}

async fn create_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    address: &[u8; 32],
    message: String,
) -> Result<Signature, RpcError> {
    let config = SystemAccountMetaConfig::new(reinit::ID);
    let mut remaining_accounts = PackedAccounts::default();
    remaining_accounts.add_system_accounts(config)?;

    let address_tree_info = rpc.get_address_tree_v1();

    let rpc_result = rpc
        .get_validity_proof(
            vec![],
            vec![light_program_test::AddressWithTree {
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
        program_id: reinit::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            reinit::instruction::CreateAccount {
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
```
{% endcode %}
{% endtab %}

{% tab title="Burn" %}
{% code overflow="wrap" %}
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
use burn::MyCompressedAccount;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    signature::{Keypair, Signature, Signer},
};

#[tokio::test]
async fn test_burn() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("burn", burn::ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    // Create account first
    let address_tree_info = rpc.get_address_tree_v1();
    let (address, _) = light_sdk::address::v1::derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_info.tree,
        &burn::ID,
    );

    create_compressed_account(
        &mut rpc,
        &payer,
        &address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    let account = get_compressed_account(&mut rpc, address).await;
    let message_account = get_message_account(&mut rpc, address).await;
    assert_eq!(message_account.owner, payer.pubkey());
    assert_eq!(message_account.message, "Hello, compressed world!");

    // Burn the account
    burn_compressed_account(&mut rpc, &payer, account, "Hello, compressed world!".to_string())
        .await
        .unwrap();

    // Verify account is burned (should not exist)
    let result = rpc.get_compressed_account(address, None).await;
    assert!(result.unwrap().value.is_none(), "Account should be burned and not exist");
}

async fn burn_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    compressed_account: CompressedAccount,
    current_message: String,
) -> Result<Signature, RpcError> {
    let mut remaining_accounts = PackedAccounts::default();

    let config = SystemAccountMetaConfig::new(burn::ID);
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

    let (remaining_accounts, _, _) = remaining_accounts.to_account_metas();

    let instruction = Instruction {
        program_id: burn::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            burn::instruction::BurnAccount {
                proof: rpc_result.proof,
                account_meta: CompressedAccountMetaBurn {
                    tree_info: packed_tree_accounts.packed_tree_infos[0],
                    address: compressed_account.address.unwrap(),
                },
                current_message,
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
        .unwrap()
}

async fn get_message_account(
    rpc: &mut LightProgramTest,
    address: [u8; 32],
) -> MyCompressedAccount {
    let account = get_compressed_account(rpc, address).await;
    let data = &account.data.as_ref().unwrap().data;
    MyCompressedAccount::deserialize(&mut &data[..]).unwrap()
}

async fn create_compressed_account(
    rpc: &mut LightProgramTest,
    payer: &Keypair,
    address: &[u8; 32],
    message: String,
) -> Result<Signature, RpcError> {
    let config = SystemAccountMetaConfig::new(burn::ID);
    let mut remaining_accounts = PackedAccounts::default();
    remaining_accounts.add_system_accounts(config)?;

    let address_tree_info = rpc.get_address_tree_v1();

    let rpc_result = rpc
        .get_validity_proof(
            vec![],
            vec![light_program_test::AddressWithTree {
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
        program_id: burn::ID,
        accounts: [
            vec![AccountMeta::new(payer.pubkey(), true)],
            remaining_accounts,
        ]
        .concat(),
        data: {
            use anchor_lang::InstructionData;
            burn::instruction::CreateAccount {
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
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="Native" %}
{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```rust
use borsh::{BorshDeserialize, BorshSerialize};
use light_program_test::{
    program_test::LightProgramTest, AddressWithTree, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::address::v1::derive_address;
use light_sdk::instruction::{PackedAccounts, SystemAccountMetaConfig};
use native_program_create::{CreateInstructionData, InstructionType, MyCompressedAccount, ID};
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};

#[tokio::test]
async fn test_create() {
    let config = ProgramTestConfig::new(true, Some(vec![("native_program_create", ID)]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let address_tree_pubkey = address_tree_info.tree;

    // Create compressed account
    let (address, _) = derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_pubkey,
        &ID,
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

    // Get the created account
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(compressed_account.address.unwrap(), address);

    // Deserialize and verify the account data
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
    let system_account_meta_config = SystemAccountMetaConfig::new(ID);
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
        program_id: ID,
        accounts: account_metas,
        data: [
            &[InstructionType::Create as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}
```
{% endcode %}
{% endtab %}

{% tab title="Close" %}
{% code overflow="wrap" %}
```rust
use borsh::{BorshDeserialize, BorshSerialize};
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::address::v1::derive_address;
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use native_program_close::{CloseInstructionData, InstructionType, MyCompressedAccount, ID};
use solana_sdk::{
    instruction::Instruction,
    signature::{Keypair, Signer},
};

#[tokio::test]
async fn test_close() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("native_program_close", ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let address_tree_pubkey = address_tree_info.tree;

    // Create compressed account
    let (address, _) = derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_pubkey,
        &ID,
    );
    let merkle_tree_pubkey = rpc.get_random_state_tree_info().unwrap().tree;

    native_program_close::test_helpers::create_compressed_account(
        &payer,
        &mut rpc,
        &merkle_tree_pubkey,
        address_tree_pubkey,
        address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    // Get the created account
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(compressed_account.address.unwrap(), address);

    // Close the account
    close_compressed_account(&payer, &mut rpc, &compressed_account)
        .await
        .unwrap();

    // Verify account is closed (data should be default/empty)
    let closed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(closed_account.data, Some(Default::default()));
}

pub async fn close_compressed_account(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(ID);
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
        program_id: ID,
        accounts: account_metas,
        data: [
            &[InstructionType::Close as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}
```
{% endcode %}
{% endtab %}

{% tab title="Reinit" %}
{% code overflow="wrap" %}
```rust
use borsh::{BorshDeserialize, BorshSerialize};
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::address::v1::derive_address;
use light_sdk::instruction::{
    account_meta::CompressedAccountMeta, PackedAccounts, SystemAccountMetaConfig,
};
use native_program_reinit::{ReinitInstructionData, InstructionType, MyCompressedAccount, ID};
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};

#[tokio::test]
async fn test_reinit() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("native_program_reinit", ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let address_tree_pubkey = address_tree_info.tree;

    // Create compressed account
    let (address, _) = derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_pubkey,
        &ID,
    );
    let merkle_tree_pubkey = rpc.get_random_state_tree_info().unwrap().tree;

    native_program_reinit::test_helpers::create_compressed_account(
        &payer,
        &mut rpc,
        &merkle_tree_pubkey,
        address_tree_pubkey,
        address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    // Get the created account
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();

    // Close the account
    native_program_reinit::test_helpers::close_compressed_account(&payer, &mut rpc, &compressed_account)
        .await
        .unwrap();

    // Verify account is closed
    let closed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    assert_eq!(closed_account.data, Some(Default::default()));

    // Reinitialize the account
    reinit_compressed_account(&payer, &mut rpc, &closed_account)
        .await
        .unwrap();

    // Verify account is reinitialized with default MyCompressedAccount values
    let reinit_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();

    // Deserialize and verify it's a default-initialized MyCompressedAccount
    let deserialized_account = MyCompressedAccount::deserialize(
        &mut reinit_account.data.as_ref().unwrap().data.as_slice()
    )
    .unwrap();

    // Check that the reinitialized account has default values
    assert_eq!(deserialized_account.owner, Pubkey::default());
    assert_eq!(deserialized_account.message, String::default());
}

pub async fn reinit_compressed_account(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(ID);
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
        program_id: ID,
        accounts: account_metas,
        data: [
            &[InstructionType::Reinit as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}
```
{% endcode %}
{% endtab %}

{% tab title="Burn" %}
{% code overflow="wrap" %}
```rust
use borsh::{BorshDeserialize, BorshSerialize};
use light_client::indexer::CompressedAccount;
use light_program_test::{
    program_test::LightProgramTest, Indexer, ProgramTestConfig, Rpc, RpcError,
};
use light_sdk::address::v1::derive_address;
use light_sdk::instruction::{
    account_meta::CompressedAccountMetaBurn, PackedAccounts, SystemAccountMetaConfig,
};
use native_program_burn::{BurnInstructionData, InstructionType, MyCompressedAccount, ID};
use solana_sdk::{
    instruction::Instruction,
    signature::{Keypair, Signer},
};

#[tokio::test]
async fn test_burn() {
    let config = ProgramTestConfig::new(true, Some(vec![
        ("native_program_burn", ID),
    ]));
    let mut rpc = LightProgramTest::new(config).await.unwrap();
    let payer = rpc.get_payer().insecure_clone();

    let address_tree_info = rpc.get_address_tree_v1();
    let address_tree_pubkey = address_tree_info.tree;

    // Create compressed account
    let (address, _) = derive_address(
        &[b"message", payer.pubkey().as_ref()],
        &address_tree_pubkey,
        &ID,
    );
    let merkle_tree_pubkey = rpc.get_random_state_tree_info().unwrap().tree;

    native_program_burn::test_helpers::create_compressed_account(
        &payer,
        &mut rpc,
        &merkle_tree_pubkey,
        address_tree_pubkey,
        address,
        "Hello, compressed world!".to_string(),
    )
    .await
    .unwrap();

    // Get the created account
    let compressed_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value
        .unwrap();
    println!("compressed_account: {:?}", compressed_account);
    assert_eq!(compressed_account.address.unwrap(), address);

    // Burn the account
    burn_compressed_account(&payer, &mut rpc, &compressed_account)
        .await
        .unwrap();

    // Verify account is burned (should be None)
    let burned_account = rpc
        .get_compressed_account(address, None)
        .await
        .unwrap()
        .value;
    assert!(burned_account.is_none());
}

pub async fn burn_compressed_account(
    payer: &Keypair,
    rpc: &mut LightProgramTest,
    compressed_account: &CompressedAccount,
) -> Result<(), RpcError> {
    let system_account_meta_config = SystemAccountMetaConfig::new(ID);
    let mut accounts = PackedAccounts::default();
    accounts.add_pre_accounts_signer(payer.pubkey());
    accounts.add_system_accounts(system_account_meta_config)?;

    let hash = compressed_account.hash;

    println!("Requesting proof for hash: {:?}", hash);

    let rpc_result = rpc
        .get_validity_proof(vec![hash], vec![], None)
        .await?
        .value;

    println!("Proof returned for hashes: {:?}", rpc_result.proof);

    let packed_accounts = rpc_result
        .pack_tree_infos(&mut accounts)
        .state_trees
        .unwrap();

    let current_account =
        MyCompressedAccount::deserialize(&mut compressed_account.data.as_ref().unwrap().data.as_slice())
            .unwrap();

    println!("Account owner from chain (program): {:?}", compressed_account.owner);
    println!("Account data owner (user): {:?}", current_account.owner);
    println!("Account message: {:?}", current_account.message);
    println!("Account hash: {:?}", hash);
    println!("Account data bytes: {:?}", &compressed_account.data.as_ref().unwrap().data);

    let meta = CompressedAccountMetaBurn {
        tree_info: packed_accounts.packed_tree_infos[0],
        address: compressed_account.address.unwrap(),
    };

    let (account_metas, _, _) = accounts.to_account_metas();
    let instruction_data = BurnInstructionData {
        proof: rpc_result.proof,
        account_meta: meta,
        current_account,
    };
    let inputs = instruction_data.try_to_vec().unwrap();

    let instruction = Instruction {
        program_id: ID,
        accounts: account_metas,
        data: [
            &[InstructionType::Burn as u8][..],
            &inputs[..],
        ]
        .concat(),
    };

    rpc.create_and_send_transaction(&[instruction], &payer.pubkey(), &[payer])
        .await?;
    Ok(())
}
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endtab %}
{% endtabs %}

## Next Steps

Start building programs to create, or interact with compressed accounts.

{% content-ref url="../guides/" %}
[guides](../guides/)
{% endcontent-ref %}

[^1]: ​[Program ID:](https://solscan.io/account/SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7) SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7

[^2]: [Program ID:](https://solscan.io/account/noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV) noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV

[^3]: PDA derived from Light System Program ID with seed `b"cpi_authority"`.

    [Pubkey](https://solscan.io/account/HZH7qSLcpAeDqCopVU4e5XkhT9j3JFsQiq8CmruY3aru): HZH7qSLcpAeDqCopVU4e5XkhT9j3JFsQiq8CmruY3aru

[^4]: [Program ID](https://solscan.io/account/compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq): compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq

[^5]: ​[Program ID](https://solscan.io/account/11111111111111111111111111111111): 11111111111111111111111111111111
