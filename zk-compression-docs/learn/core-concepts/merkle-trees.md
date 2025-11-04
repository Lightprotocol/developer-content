---
title: Merkle trees
description: Learn the core concepts of state and address Merkle trees.
hidden: true
---

# Merkle trees

State and Address Merkle trees

The protocol uses multiple Merkle trees (not one global tree) to distribute transactions and reduce write-lock contention. Each compressed account must explicitly link to its specific tree.

Solana's runtime locks accounts during writes. If all compressed accounts used a single tree, that tree would become a bottleneck. Multiple trees allow parallel transactions.

V2 state trees use asynchronous updates via queues. The tree_info distinguishes between:
tree: The actual Merkle tree account
queue: Where new state is inserted (Forester updates tree from queue later)

{% hint style="success" %}
State and address Merkle trees are provided by the protocol. Developers don’t need to maintain or initialize Merkle trees themselves.
{% endhint %}

## State Merkle trees

Compressed accounts are stored as hashes in state Merkle trees.

A State tree is a binary Merkle tree that stores data of millions of compressed Solana accounts in leaves for efficient cryptographic verification the integrity of all leaves in a tree.

{% stepper %}
{% step %}
### Merkle Tree

A Merkle tree compresses data by hashing adjacent leaves repeatedly into a single root hash, starting from the lowest level. The hash of a compressed Solana account is stored as a leaf in a State tree.
{% endstep %}

{% step %}
### Merkle Root Hash

Only this root hash is stored on chain as single value on chain to secure the integrity of all compressed state in a tree. The raw state can thus be stored as calldata in the much cheaper Solana ledger space while preserving Solana's security guarantees.
{% endstep %}
{% endstepper %}

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/yYZGfWfsZriTXPIN0bIt/state%20merkle%20tree.png" alt="A diagram illustrating a binary state Merkle tree with a depth of 3 and a proof path for Leaf 1. The tree consists of 8 leaves, each representing a compressed account hash. The leaves are paired up to form nodes at each level, culminating in a single root node at the top. The proof path for Leaf 1 is highlighted, showing the hashes needed to verify the integrity of Leaf 1 up to the root node. For ZK Compression V1, &#x22;Light&#x22; state trees have a depth of 26, allowing for approximately 67 million leaves with compressed account hashes per tree."><figcaption><p>A Binary state Merkle tree, with depth 3 and proof path for Leaf 1.<br>For ZK Compression, “Light” state trees have a depth of 26, i.e. contain ~67 million leaves with compressed account hashes per tree.</p></figcaption></figure>

#### Leaf Hash Structure: Compressed Account Hashes

For compressed Solana accounts, the 32 byte leaf hashes effectively mirror the regular Solana account layout: `{DataHash, StateHash; Owner, Lamports`.

The `data_hash` represents the fingerprint of the actual account data.

The `state_hash` ensures that each account hash is globally unique. It includes

* the public key of the state tree's respective on-chain account (i.e., `state_tree_hash`) and
* the compressed account's position in the tree (i.e., `leafIndex`).

Lastly, `owner_hashed` determines which program owns this account and `lamports` show the account balance.

{% hint style="info" %}
For [details on the compressed account structure see this section](<add-link-to-compressed-account-structure>).
{% endhint %}

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/PpPbEKFXwnxGN6Y9FrlU/leaf%20hash%20structure%20state%20tree.png" alt="Here&#x27;s an alt text for this image:  &#x22;Diagram showing the compressed account data structure within leaves of a Merkle tree. Four leaf nodes (Leaf 0, Leaf 1, Leaf 2, Leaf 3) are displayed at the top, each containing &#x27;Compressed Account Hash&#x27;. Below this, the data structure is broken down into components: Datahash, Lamports, OwnerHash, Address, Discriminator, StateTreeHash, and Leaf_Index in the top row, with Data, Owner, and State Tree shown in the bottom row. Leaf 1 is highlighted in green. The diagram illustrates how compressed account data is organized within the Merkle tree structure.&#x22;"><figcaption><p><a href="https://github.com/Lightprotocol/light-protocol/blob/9df1ca508813ec792f756fb65b0b266a2438d080/program-libs/compressed-account/src/compressed_account.rs#L303">Compressed Account Data Structure</a> in Leaf of Merkle Tree.</p></figcaption></figure>

## Address Merkle trees

An Address tree is a binary Merkle tree that stores addresses that serve as optional, persistent identifier for compressed accounts.

{% hint style="info" %}
Addresses can be reused across different address trees. Uniqueness is guaranteed only within the same address tree. Your program can check the address to ensure global uniqueness.
{% endhint %}

# Validity proof

#### Non-Inclusion Proofs

A non-inclusion proof demonstrates that a specific address is not present in the tree by showing:
1. The address value is greater than `leaf_lower_range_value` and less than `leaf_higher_range_value`
2. The hash of these range values exists in the Merkle tree root

This cryptographic proof ensures each address can only be created once per address tree.
{% endstep %}
{% endstepper %}


#### Key Differences from State Trees

| Feature | State Trees | Address Trees |
|---------|-------------|---------------|
| **Purpose** | Store compressed account hashes | Store derived addresses |
| **Proof Type** | Inclusion proofs (prove account hash exists) | Non-inclusion proofs (prove address doesn't exist) |
| **Tree Depth** | 26 (~67 million leaves) | 40 (~1 trillion leaves) |
| **Tree Type** | Binary Merkle tree | Indexed binary Merkle tree |
| **When Used** | Every compressed account operation | Only when creating accounts with addresses |