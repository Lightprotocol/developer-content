---
description: Common causes and debug steps for ProofVerificationFailed (0x179B / 6043)
hidden: true
---

# Debug 0x179b / 6043 / ProofVerificationFailed (new)

You're passing an invalid proof. The proof provided cannot be verified against the expected state.

### Checklist

Zero-knowledge proofs verify different things depending on the instruction type:

1. [**Verify Root Indices**](debug-0x179b-6043-proofverificationfailed-new.md#wrong-root-index) - The `root_index` references a Merkle tree root stored on-chain.
   * The `root_index` from client must correspond to the correct root hash in the state tree or address tree.
   * The `root_index` tells the verifier which Merkle root to use for verification.
2. [**Verify Addresses**](debug-0x179b-6043-proofverificationfailed-new.md#for-create-instructions) - For create instructions, prove the address doesn't exist in the address tree.
   * The address derivation (`custom_seeds`, `address_merkle_tree_pubkey`, `program_id`) must match between client and on-chain.
   * Uses `ValidityProof` with the address as input.
   * The proof confirms: "This address is unique and not already used in this address tree"
3. [**Verify Account Hashes**](debug-0x179b-6043-proofverificationfailed-new.md#for-updateclosereinitiburn-instructions) - For update/close/reinit/burn instructions, prove the account exists in the state tree.
   * `ValidityProof` with the account hash as input.
   * Verifies the account hash matches the leaf at `leaf_index` in the state tree
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
console.log("Proof root indices:", proofRpcResult.rootIndices);
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

## **Still having issues?** We're here to help!

* Reach out on [Discord](https://discord.com/invite/CYvjBgzRFP) for support
* Share the exact error code and a reproducer (GitHub repo / gist)
