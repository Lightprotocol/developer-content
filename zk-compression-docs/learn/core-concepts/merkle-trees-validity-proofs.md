---
title: Merkle trees and Validity Proofs
description: Learn the core concepts of state trees, address trees, and validity proofs for compressed accounts.
---

# Overview

The protocol uses two types of Merkle trees that serve different purposes:

* [**State trees**](#state-trees) store compressed account hashes
* [**Address trees**](#address-merkle-trees) store addresses that serve as persistent identifiers

The protocol maintains multiple Merkle trees to reduce write-lock contention. Solana's runtime locks accounts during writes, wherefore a single tree would become a bottleneck. Multiple trees allow parallel transactions.

{% hint style="success" %}

Developers don't need to maintain or initialize Merkle trees themselves.

{% endhint %}

# State trees

A state tree is a binary Merkle tree that stores data of millions of compressed Solana accounts in leaves for efficient cryptographic verification the integrity of all leaves in a tree.

{% stepper %}
{% step %}
## Merkle Tree Structure

A Merkle tree compresses data by hashing adjacent leaves repeatedly into a single root hash, starting from the lowest level. The hash of a compressed Solana account is stored as a leaf in a State tree.
{% endstep %}

{% step %}
## Merkle Root Hash

Only this root hash is stored on chain as single value on chain to secure the integrity of all compressed state in a tree. The raw state can thus be stored as calldata in the much cheaper Solana ledger space while preserving Solana's security guarantees.

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/yYZGfWfsZriTXPIN0bIt/state%20merkle%20tree.png" alt="A diagram illustrating a binary state Merkle tree with a depth of 3 and a proof path for Leaf 1. The tree consists of 8 leaves, each representing a compressed account hash. The leaves are paired up to form nodes at each level, culminating in a single root node at the top. The proof path for Leaf 1 is highlighted, showing the hashes needed to verify the integrity of Leaf 1 up to the root node. For ZK Compression V1, &#x22;Light&#x22; state trees have a depth of 26, allowing for approximately 67 million leaves with compressed account hashes per tree."><figcaption><p>A Binary state Merkle tree, with depth 3 and proof path for Leaf 1.<br>For ZK Compression, "Light" state trees have a depth of 26, i.e. contain ~67 million leaves with compressed account hashes per tree.</p></figcaption></figure>
{% endstep %}

{% step %}
## Leaf Hash Structure: Compressed Account Hashes

For compressed Solana accounts, the 32 byte leaf hashes effectively mirror the regular Solana account layout: `{DataHash, StateHash; Owner, Lamports`.

The `data_hash` represents the fingerprint of the actual account data.

The `state_hash` ensures that each account hash is globally unique. It includes

* the public key of the state tree's respective on-chain account (i.e., `state_tree_hash`) and
* the compressed account's position in the tree (i.e., `leafIndex`).

Lastly, `owner_hashed` determines which program owns this account and `lamports` show the account balance.

{% hint style="info" %}
For [details on the compressed account structure see this section](compressed-account-model.md#compressed-account-structure).
{% endhint %}

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/PpPbEKFXwnxGN6Y9FrlU/leaf%20hash%20structure%20state%20tree.png" alt="Here&#x27;s an alt text for this image:  &#x22;Diagram showing the compressed account data structure within leaves of a Merkle tree. Four leaf nodes (Leaf 0, Leaf 1, Leaf 2, Leaf 3) are displayed at the top, each containing &#x27;Compressed Account Hash&#x27;. Below this, the data structure is broken down into components: Datahash, Lamports, OwnerHash, Address, Discriminator, StateTreeHash, and Leaf_Index in the top row, with Data, Owner, and State Tree shown in the bottom row. Leaf 1 is highlighted in green. The diagram illustrates how compressed account data is organized within the Merkle tree structure.&#x22;"><figcaption><p><a href="https://github.com/Lightprotocol/light-protocol/blob/9df1ca508813ec792f756fb65b0b266a2438d080/program-libs/compressed-account/src/compressed_account.rs#L303">Compressed Account Data Structure</a> in Leaf of Merkle Tree.</p></figcaption></figure>
{% endstep %}

{% step %}
## Merkle and Validity Proofs

[Validity proofs](#user-content-fn-1)[^1] prove compressed accounts exist in state trees with a constant 128-byte proof size. This proof must be included in every transaction to verify the on-chain state.

{% hint style="success" %}
* Developers don't need to generate validity proofs or learn about ZK to use ZK Compression.
* ZK Compression uses [Groth16](https://docs.rs/groth16-solana/latest/groth16_solana/), a well-known [pairing-based](https://en.wikipedia.org/wiki/Pairing-based_cryptography) [zk-SNARK](https://www.helius.dev/blog/zero-knowledge-proofs-its-applications-on-solana#-zk-snarks-and-circuits), for its proof system.
{% endhint %}

The validity proof contains one or more merkle proofs:
* Merkle proofs consist of sibling node hashes along the path from the account's leaf to the root. 
* Starting with the leaf hash, the verifier calculates up the tree using these sibling hashes. The proof path is shown with three highlighted elements in a box at the bottom right: Leaf 0, Node 1, and Node 5, representing the sibling hashes needed to verify Leaf 1.
* If the calculated root matches the on-chain root, the account is verified.

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/oI68euPl8TF4pMy8Sq9L/image.png" alt="Merkle tree diagram illustrating a leaf proof for Leaf 1. The tree shows a purple root node at the top, branching down through intermediate nodes (Node 4 and Node 5 in green and blue respectively) to eight leaf nodes at the bottom (Leaf 0 through Leaf 7). Leaf 1 is highlighted in green and labeled as &#x27;compressed account&#x27;. The proof path is shown with three highlighted elements in a box at the bottom right: Leaf 0, Node 1, and Node 5, representing the sibling hashes needed to verify Leaf 1&#x27;s inclusion in the tree. Caption explains that a Merkle proof consists of sibling node hashes required to calculate the final root node, with only adjacent hashes along the path to the root needed."><figcaption><p>A Merkle proof path (blue nodes) consists of all sibling node hashes required to calculate the final root node.<br>Only the adjacent hashes along the path to the root are needed.</p></figcaption></figure>

For a tree with height 26, a single proof requires 26 sibling hashes (32 bytes each) plus metadata totaling 832 bytes. The proof size grows with tree height.

ZK Compression batches multiple Merkle proofs into a single zero-knowledge proof to achieve a constant 128-byte size regardless of how many accounts are verified:

| Accounts Verified | Proof Components | Size |
|-------------------|-----------------|------|
| 1 | 1 merkle proof | 832 bytes[^2] |
| 1 | 1 merkle + 1 ZK proof | 128 bytes |
| 8 | 8 merkle + 1 ZK proof | 128 bytes |

{% hint style="info" %}
Two state tree versions with different proof mechanisms are currently **supported on Devnet**:

* **V1 state trees**: Always require the full 128-byte ZK proof
* **V2 batched state trees**: Can use `prove_by_index` optimization that verifies the account exists with only one byte instead of 128-bytes.

V2 optimizes optimize compute unit consumption by up to 70% and is currently on Devnet.

When using V2 trees, RPC requests automatically choose the proof mechanism.
{% endhint %}

{% endstep %}
{% endstepper %}

# Address trees

Address trees store addresses that serve as optional, persistent identifiers for compressed accounts. 

{% hint style="info" %}
Every address is unique within its address tree, but the same seeds can create different addresses in different address trees. To enforce that a compressed account can only be created once with the same seed, check the address tree pubkey in your program.
{% endhint %}

{% stepper %}
{% step %}
## Address Tree Structure

Address trees store derived addresses in an indexed structure. Unlike state trees that store account hashes, address trees store the actual address values along with pointers to maintain sorted order.

These addresses are used only when compressed accounts require a persistent identifier that doesn't change when the account data updates.
{% endstep %}

{% step %}
## Address Tree Root Hash

Like state trees, only the root hash is stored on-chain to verify all addresses in the tree. The raw addresses are stored in the Solana ledger.
{% endstep %}

{% step %}
## Merkle and Validity Proofs

When creating a compressed account with an address, a validity proof verifies the address doesn't already exist in a specified address tree. The constant 128-byte proof must be included in the transaction only when creating accounts with addresses, not for every compressed account operation.

{% hint style="info" %}
**Address Tree Versions**

Two address tree versions are currently **supported on Devnet**:

* **V1 address trees** height 26 (~67 million addresses).
* **V2 batched address trees** with height 40 (~1 trillion addresses).

V2 is currently on Devnet. When using V2 trees, RPC requests automatically choose the proof mechanism.

Unlike state trees, address trees don't support a `prove_by_index` optimization.
{% endhint %}

{% endstep %}
{% endstepper %}

# Resources on ZK 

For those interested in learning more about the fundamentals of ZK and its applications on Solana, we recommend reading the following:

* [Zero-Knowledge Proofs: An Introduction to the Fundamentals](https://www.helius.dev/blog/zero-knowledge-proofs-an-introduction-to-the-fundamentals)
* [Zero-Knowledge Proofs: Its Applications on Solana](https://www.helius.dev/blog/zero-knowledge-proofs-its-applications-on-solana)

# Next Steps

Learn about the lifecycle of a transaction that interacts with compressed accounts.

{% content-ref url="transaction-lifecycle.md" %}
[transaction-lifecycle.md](transaction-lifecycle.md)
{% endcontent-ref %}

[^1]: are succinct zero-knowledge proofs (ZKPs)
[^2]: tree height 26 with v1 state trees of ZK Compression