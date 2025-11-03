---
title: Debug: ProofVerificationFailed - New (0x179b)
description: Common causes and debug steps for ProofVerificationFailed (0x179B / 6043).
hidden: true
---

You're passing an invalid proof. The proof provided cannot be verified against the expected state.

### Common Causes

Mismatches between the proof  in account hashes, Merkle roots, or addresses will lead to verification failure.

1. [**Root Indices**](#wrong-root-index) - All instructions verify the `root_index` points to a valid Merkle root.
   * The `root_index` from client must match a root in the `root_history` array of the state tree or address tree.
   * The proof confirms: "This state existed in the Merkle tree at this historical root"

2. [**Addresses**](#for-create-instructions) - Create instructions prove the address doesn't exist in the address tree.
   * The address derivation (`custom_seeds`, `address_merkle_tree_pubkey`, `program_id`) must match between client and on-chain.
   * The proof confirms: "This address is unique and not already used in this address tree"

3. [**Account Hashes**](#for-updateclosereinitiburn-instructions) - Update/close/reinit/burn instructions prove the account exists in the state tree.
   * The account hash must match the leaf at `leaf_index` in the state tree.
   * The proof confirms: "This account exists at this position in the state tree with this Merkle root hash"

{% hint style="success" %}
For help with debugging

* use the [MCP Configuration](../../references/ai-tools-guide.md#mcp)
* AskDevin via [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol).
{% endhint %}

## **Debug Steps**

{% hint style="info" %}
For a complete example of proper client+on chain flows, see the [Counter Program](https://github.com/Lightprotocol/program-examples/blob/main/counter/anchor/programs/counter/src/lib.rs#L26).
{% endhint %}

### Wrong Root Index

The client passes the incorrect `root_index` for the Merkle tree. It must reference a valid root hash in the Merkle tree's root history. This can occur with any instruction.

* Focus on consistency between the client-side generated `root_index` and what the on-chain program expects.
* The on-chain program expects the `root_index` to correctly point to a root in the `root_history` array of the Merkle tree account.
* The `root_index` must correspond to the root of the Merkle tree at the time the account was created **or** last updated.

**Add prints:**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
// Client - log root_index extracted from proof
console.log("Proof root indices:", proofRpcResult.value.rootIndices);
// Client - log root_index being sent to instruction
console.log("Sending root index:", compressedAccountMeta.treeInfo.rootIndex);
```
{% endtab %}

{% tab title="Rust" %}
```rust
// Client - log root_index extracted from proof
let root_indices = proof_result.value.get_root_indices();
println!("Proof root indices: {:?}", root_indices);
// Client - log root_index being sent to instruction
println!("Sending root_index: {}", account_meta.tree_info.root_index);

// On-chain - log received root_index
msg!("Received root_index: {}", account_meta.tree_info.root_index);
```
{% endtab %}
{% endtabs %}


**Add backtrace** to your test command:
```bash
RUST_BACKTRACE=1 cargo test-sbf
```

### For create instructions

Client and on chain seeds/addresses should be identical.

* Focus on consistency between client-side and on-chain address derivation inputs for `derive_address()`.
* The address is derived from `custom_seeds`, `address_merkle_tree_pubkey`, and `program_id`.

**Add prints:**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
// Client - log seeds/address used to request proof
console.log("Client seeds:", seeds, "address:", address);
```
{% endtab %}

{% tab title="Rust" %}
```rust
// Onchain - log seeds/address
msg!("Program seeds: {:?}, address: {:?}", seeds, address);
```
{% endtab %}
{% endtabs %}

**Add backtrace** to your test command:
```bash
RUST_BACKTRACE=1 cargo test-sbf
```

### For update/close/reinit/burn instructions

The compressed account hash must match the hash in the validity proof.

* Focus on consistency between the account fetched from indexer and the account data sent to the instruction.
* The hash is computed from account fields (`owner`, `lamports`, `address`, `data`) plus `merkle_context` (`leaf_index`, `merkle_tree_pubkey`, `is_batched`).

**Add prints:**

{% tabs %}
{% tab title="TypeScript" %}
```typescript
// Client - log account fetched from indexer
console.log("Fetched account hash:", compressedAccount.hash);
console.log("Fetched account data:", compressedAccount.data);
console.log("Leaf index:", compressedAccount.leafIndex);
// Client - log current account being sent to instruction
console.log("Sending current account:", currentAccount);
```
{% endtab %}

{% tab title="Rust" %}
```rust
// Client - log account fetched from indexer
let account = indexer.get_compressed_account(address).await?;
println!("Fetched account hash: {:?}", account.hash);
println!("Fetched account data: {:?}", account.data);
println!("Leaf index: {}", account.leaf_index);
// Client - log current account being sent to instruction
println!("Sending current account: {:?}", current_account);

// On-chain - log the account being processed
msg!("Processing account at leaf_index: {}", account_meta.tree_info.leaf_index);
msg!("Current account data: {:?}", current_account);
```
{% endtab %}
{% endtabs %}

**Add backtrace** to your test command:
```bash
RUST_BACKTRACE=1 cargo test-sbf
```

## Full Example

### Reading the Error Output

When ProofVerificationFailed occurs, understanding where to look in the transaction logs is critical. The verification happens in the Light System Program (via CPI from your program), not in your program's logs.

{% stepper %}
{% step %}
### Identify the error

Look for the error code in the transaction status:
- `Failed: InstructionError(0, Custom(6043))`
- 6043 in decimal = 0x179b in hex = ProofVerificationFailed
{% endstep %}

{% step %}
### Find Light System Program logs

Search for the Light System Program CPI in the transaction logs:
- `Program SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7 invoke [2]`
- The `[2]` indicates call depth: `[1]` = your program, `[2]` = CPI to Light System Program
- Call flow: Client → YourProgram [1] → CPI → Light System Program [2]
- All verification details appear AFTER this line
- Your program's logs (above this) don't show root verification details
{% endstep %}

{% step %}
### Check what values the Light System Program received

In the Light System Program logs, look for different fields depending on instruction type:

{% tabs %}
{% tab title="Account Hash (Update/Close/Reinit/Burn)" %}
For instructions that update or close existing compressed accounts:

**A) `proof_input_compressed_account_hashes`**
- The account hash from your proof
- Compare with `hash` field from `rpc.getCompressedAccount()`
- Must match exactly

**B) `input roots`**
- The root hash fetched from `root_history[root_index]` of the state tree
- NOT the expected root - it's what was fetched based on your `root_index`
- **Important**: State tree roots appear first in the array

**C) `input_compressed_accounts_with_merkle_context`**
- Find `root_index: U16(...)`
- This is the index you sent
{% endtab %}

{% tab title="Address (Create)" %}
For instructions that create new compressed accounts:

**A) `new_addresses`**
- The address(es) being created
- Compare with address derived from your seeds on client

**B) `new_address_roots`**
- The root hash fetched from `root_history[root_index]` of the address tree
- NOT the expected root - it's what was fetched based on your `root_index`

**C) `new_addresses` → `address_merkle_tree_root_index`**
- Find `address_merkle_tree_root_index: U16(...)`
- This is the index you sent
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Add Prints to Client code to compare values

{% tabs %}
{% tab title="TypeScript" %}
{% code overflow="wrap" %}
```typescript
// For update/close instructions
console.log("Proof root indices:", proofRpcResult.rootIndices);
console.log("Sending root index:", compressedAccountMeta.treeInfo.rootIndex);

// For create instructions with addresses
console.log("Proof root indices:", proofRpcResult.rootIndices);
console.log("Sending address root index:", addressTreeInfo.rootIndex);
```
{% endcode %}
{% endtab %}

{% tab title="Rust" %}
{% code overflow="wrap" %}
```rust
// For update/close instructions
let root_indices = proof_result.value.get_root_indices();
println!("Proof root indices: {:?}", root_indices);
println!("Sending root_index: {}", account_meta.tree_info.root_index);

// For create instructions with addresses
let address_root_indices = proof_result.value.get_address_root_indices();
println!("Proof address root indices: {:?}", address_root_indices);
println!("Sending address root_index: {}", address_tree_info.root_index);
```
{% endcode %}
{% endtab %}
{% endtabs %}

- The first value is what the proof expects
- The second value is what you actually sent
- These must match
{% endstep %}

{% step %}
### Compare the values

✓ If `proof_input_compressed_account_hashes` matches your fetched account hash:
- Account data is correct

✗ If "Sending root index" doesn't match "Proof root indices":
- You're using the wrong `root_index`
- FIX: Use `proofRpcResult.rootIndices[0]` instead of hardcoding
{% endstep %}

{% step %}
### The fix

Always use the `root_index` from the proof response:

{% tabs %}
{% tab title="TypeScript" %}
{% code overflow="wrap" %}
```typescript
// For update/close instructions
compressedAccountMeta.treeInfo.rootIndex = proofRpcResult.rootIndices[0];

// For create instructions with addresses
addressTreeInfo.rootIndex = proofRpcResult.rootIndices[0];

// For multiple accounts: rootIndices[0] is for first account,
// rootIndices[1] for second, etc.
// For addresses: address root indices come AFTER account root indices
```
{% endcode %}
{% endtab %}

{% tab title="Rust" %}
{% code overflow="wrap" %}
```rust
// For update/close instructions
account_meta.tree_info.root_index = rpc_result.get_root_indices()[0];

// For create instructions with addresses
address_tree_info.root_index = rpc_result.get_address_root_indices()[0];

// For multiple accounts: get_root_indices()[0] is for first account,
// get_root_indices()[1] for second, etc.
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}
{% endstepper %}

## Error Example

Here's what a ProofVerificationFailed error looks like in the transaction logs:

{% code overflow="wrap" %}
```
┌─── Transaction #2 ───────────────────────────────────────────────────┐
│ Status: Failed: InstructionError(0, Custom(6043))
│
│ Program Logs:
│
│ Your program logs (don't show root verification):
│ Program YourProgram invoke [1]
│ Instruction: UpdateAccount
│
│ ┌─────────────────────────────────────────────────────┐
│ │ Light System Program logs (critical details here)   │
│ └─────────────────────────────────────────────────────┘
│ Program SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7 invoke [2]
│
│ proof  Ref(CompressedProof { a: [...], b: [...], c: [...] })
```
{% endcode %}

{% tabs %}
{% tab title="Account Hash Verification (Update/Close/Reinit/Burn)" %}
{% code overflow="wrap" %}
```
│ ✓ CORRECT: Account hash matches the fetched account
│ proof_input_compressed_account_hashes [[14, 248, 45, 12, ...]]
│                                         ↑ Compare with hash from rpc.getCompressedAccount()
│
│ ✗ ROOT HASH FETCHED FROM root_history[root_index]
│   Light System Program fetched root_history[0] (see root_index below)
│   This root hash is what's stored at index 0
│   But the proof was generated with a DIFFERENT root
│ input roots [[18, 12, 88, 241, ...]]
│               ↑ This is from root_history[0], NOT the expected root
│
│   HOW TO FIX:
│   Use the root_index from proof response:
│     TypeScript: proofRpcResult.rootIndices[0]
│     Rust: proof_result.value.get_root_indices()[0]
│
│ ✗ THE BUG: root_index: U16(0)
│   Hardcoded to 0 instead of using proof response
│ input_compressed_accounts_with_merkle_context:
│   [... root_index: U16(0) ...]
│         ↑ Compare with proofRpcResult.rootIndices[0]
```
{% endcode %}

**Key Comparison Points:**

1. **Account Hash** (`proof_input_compressed_account_hashes`)
   - Compare with: `hash` from `rpc.getCompressedAccount()`
   - Must match exactly

2. **State Tree Root Hash** (`input roots`)
   - Fetched from `root_history[root_index]` on-chain
   - NOT the expected root - just what was fetched

3. **Root Index** (`root_index: U16(...)`)
   - Compare with: `proofRpcResult.rootIndices[0]` from client
   - Should come from proof response
{% endtab %}

{% tab title="Address Verification (Create)" %}
{% code overflow="wrap" %}
```
│ ✗ ADDRESS ROOT HASH FETCHED FROM root_history[root_index]
│   Light System Program fetched root_history[0] from address tree
│   But the proof was generated with a DIFFERENT address tree root
│ new_address_roots [[42, 156, 73, 201, ...]]
│                    ↑ This is from root_history[0] of the address tree
│
│   HOW TO FIX:
│   Use the root_index from proof response:
│     TypeScript: proofRpcResult.rootIndices[0]
│     Rust: proof_result.value.get_address_root_indices()[0]
│
│ ✗ THE BUG: root_index: U16(0)
│   Hardcoded to 0 instead of using proof response
│ new_addresses [NewAddressParams {
│   address: [0, 223, 172, 91, ...],
│   address_merkle_tree_account_index: 0,
│   address_queue_account_index: 1,
│   address_merkle_tree_root_index: U16(0)
│   ↑ Compare with proofRpcResult.rootIndices[0]
│ }]
```
{% endcode %}

**Key Comparison Points:**

1. **Address Derivation**
   - Client seeds must match on-chain seeds exactly
   - Verify in your program logs

2. **Address Tree Root Hash** (`new_address_roots`)
   - Fetched from `root_history[root_index]` of address tree
   - NOT the expected root - just what was fetched

3. **Address Root Index** (`address_merkle_tree_root_index: U16(...)`)
   - Compare with: `proofRpcResult.rootIndices[0]` from client
   - Should come from proof response

{% hint style="info" %}
**Mixed Transactions**: When you have both accounts AND addresses, the `rootIndices` array contains state tree roots first, then address tree roots:
- `rootIndices[0]` = first state tree root
- `rootIndices[1]` = second state tree root
- `rootIndices[2]` = first address tree root
{% endhint %}
{% endtab %}
{% endtabs %}

{% code overflow="wrap" %}
```
│ ✗ VERIFICATION FAILED
│ Program SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7 failed:
│   custom program error: 0x179b
└──────────────────────────────────────────────────────────────────────┘
```
{% endcode %}

## **Still having issues?** We're here to help!

* Reach out on [Discord](https://discord.com/invite/CYvjBgzRFP) for support
* Share the exact error code and a reproducer (GitHub repo / gist)
