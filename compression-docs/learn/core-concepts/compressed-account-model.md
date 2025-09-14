---
description: >-
  Overview to the Compressed Account Model, State Merkle trees, and Validity
  Proofs.
---

# Compressed Account Model

## Compressed Account Model

***

{% hint style="info" %}
This guide assumes that you're familiar with [Solana's account model](https://solana.com/docs/core/accounts).
{% endhint %}

### Regular versus Compressed Accounts

ZK compressed state is stored in compressed accounts. Compressed accounts are similar to regular Solana accounts but with four main differences:

* Each compressed account can be identified by its hash
* Each write to a compressed account changes its hash
* An `address` can optionally be set as a permanent unique ID of the compressed account
* All compressed accounts are stored in sparse state trees. Only the tree's state root (i.e., a small fingerprint of all compressed accounts) is stored in the on-chain account space

These differences allow the protocol to store states as calldata in the less expensive Solana ledger space instead of costly on-chain account space

To understand the similarities and differences between Solana's regular account model and compressed accounts, let's first look at compressed accounts with Program-Derived Addresses (PDAs)

> If you don't know what PDAs are, read [this explainer](https://solana.com/docs/core/pda) first

#### Compressed PDA Accounts

Like regular accounts, each compressed PDA account can be identified by its unique persistent address, represented as 32 bytes in the format of a `PublicKey`. Like PDAs, compressed account addresses don't belong to a private key; rather, they're derived from the program that owns them

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/36SCAGSoEAQQ3IlQTg3x/image.png" alt="A diagram illustrating the structure of a compressed account in the Light Protocol system. The compressed account is owned by a program and is associated with a compressed PDA (Program Derived Address) account. The compressed account contains data bytes, lamports (account balance), an owner (the program that owns the account), and an address (represented as a public key). The owner of the compressed account has the authority to modify its data and transfer lamports from it. The compressed account is identified by its unique hash, which changes with each write operation. An address can be optionally set as a permanent unique identifier for the compressed account. Compressed accounts are stored in sparse Merkle trees, with only the trees&#x27; sparse state structure and roots stored in the on-chain account space, while the underlying data is stored off-chain." width="563"><figcaption><p>Compressed PDA Accounts</p></figcaption></figure>

The compressed PDA account layout is similar to Solana's regular PDA account layout — it has the **Data**, **Lamports**, **Owner**, and **Address** fields. The **Data** field stores the program state. Notice the enshrined **AccountData** structure: **Discriminator**, **Data**, **DataHash**:

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/SLS3z9CcONQ4EPCDPftb/image.png" alt="A diagram depicting the structure of a compressed PDA (Program Derived Address) account in the Light Protocol system. The compressed PDA account consists of a data field, which stores program-owned state, lamports (account balance), an owner field indicating the program that owns the account, and an address field represented as a public key. The AccountData structure within the compressed PDA account is composed of a discriminator (a unique identifier for the account type), the actual data (program state), and a DataHash (a hash of the account data). This AccountData structure is specific to the Light Protocol and differs from Solana&#x27;s regular account data field." width="563"><figcaption><p>Compressed PDA Account with AccountData</p></figcaption></figure>

The [Anchor](https://www.anchor-lang.com/) framework reserves the first 8 bytes of a regular account's data field for the discriminator. This helps programs distinguish between different program-owned accounts. The default compressed account layout is opinionated in this regard and enforces a discriminator in the Data field. You can ignore the **DataHash** field for now; we cover its importance for ZK Compression later.

#### Address & Hash

The `address` field is optional for compressed accounts because ensuring that the address of a new account is unique incurs additional computational overhead, and not all use cases need the uniqueness property of addresses.

Instead, each compressed account can be identified by its hash, regardless of whether it has an address.

{% hint style="info" %}
* Use the address field wherever the state must be unique (such as for NFTs or certain PDAs)
* You don't need the address for any fungible state (e.g., fungible tokens)
{% endhint %}

By definition, whenever the data of a compressed account changes, its hash changes. This impacts how developers interact with fungible state. Check out the [examples](https://www.zkcompression.com/get-started/intro-to-development#build-by-example) section to see what using hashes instead of addresses looks like in practice.

In the next section we will explain why using the account's hash as its ID makes sense for the compression protocol.

### State Merkle trees

Compressed accounts are stored as hashes in state Merkle trees.

A State tree is a binary Merkle tree that stores data of millions of compressed Solana accounts in leaves for efficient cryptographic verification the integrity of all leaves in a tree.

{% stepper %}
{% step %}
#### Merkle Tree

A Merkle tree compresses data by hashing adjacent leaves repeatedly into a single root hash, starting from the lowest level. The hash of a compressed Solana account is stored as a leaf in a State tree.
{% endstep %}

{% step %}
#### Merkle Root Hash

Only this root hash is stored on chain as single value on chain to secure the integrity of all compressed state in a tree. The raw state can thus be stored as calldata in the much cheaper Solana ledger space while preserving Solana's security guarantees.
{% endstep %}
{% endstepper %}

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/yYZGfWfsZriTXPIN0bIt/state%20merkle%20tree.png" alt="A diagram illustrating a binary state Merkle tree with a depth of 3 and a proof path for Leaf 1. The tree consists of 8 leaves, each representing a compressed account hash. The leaves are paired up to form nodes at each level, culminating in a single root node at the top. The proof path for Leaf 1 is highlighted, showing the hashes needed to verify the integrity of Leaf 1 up to the root node. For ZK Compression V1, &#x22;Light&#x22; state trees have a depth of 26, allowing for approximately 67 million leaves with compressed account hashes per tree."><figcaption><p>A Binary state Merkle tree, with depth 3 and proof path for Leaf 1.<br>For ZK Compression, “Light” state trees have a depth of 26, i.e. contain ~67 million leaves with compressed account hashes per tree.</p></figcaption></figure>

{% hint style="success" %}
State trees are fungible and provided by the protocol. Developers don’t need to maintain or initialize State trees themselves.
{% endhint %}

#### Leaf Hash Structure: Compressed Account Hashes

For compressed Solana accounts, the 32 byte leaf hashes effectively mirror the regular Solana account layout: `{DataHash, StateHash; Owner, Lamports`.

The `data_hash` represents the fingerprint of the actual account data.

The `state_hash` ensures that each account hash is globally unique. It includes

* the public key of the state tree's respective on-chain account (i.e., `state_tree_hash`) and
* the compressed account's position in the tree (i.e., `leafIndex`).

Lastly, `owner_hashed` determines which program owns this account and `lamports` show the account balance.

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/PpPbEKFXwnxGN6Y9FrlU/leaf%20hash%20structure%20state%20tree.png" alt="Here&#x27;s an alt text for this image:  &#x22;Diagram showing the compressed account data structure within leaves of a Merkle tree. Four leaf nodes (Leaf 0, Leaf 1, Leaf 2, Leaf 3) are displayed at the top, each containing &#x27;Compressed Account Hash&#x27;. Below this, the data structure is broken down into components: Datahash, Lamports, OwnerHash, Address, Discriminator, StateTreeHash, and Leaf_Index in the top row, with Data, Owner, and State Tree shown in the bottom row. Leaf 1 is highlighted in green. The diagram illustrates how compressed account data is organized within the Merkle tree structure.&#x22;"><figcaption><p><a href="https://github.com/Lightprotocol/light-protocol/blob/9df1ca508813ec792f756fb65b0b266a2438d080/program-libs/compressed-account/src/compressed_account.rs#L303">Compressed Account Data Structure</a> in Leaf of Merkle Tree.</p></figcaption></figure>

#### Validity Proofs

[Validity proofs](#user-content-fn-1)[^1] prove the existence of compressed accounts as leaves within state trees with a constant 128-byte size. These proofs are generated off-chain and verified on-chain. ZK Compression uses [Groth16](https://docs.rs/groth16-solana/latest/groth16_solana/), a well-known [pairing-based](https://en.wikipedia.org/wiki/Pairing-based_cryptography) [zk-SNARK](https://www.helius.dev/blog/zero-knowledge-proofs-its-applications-on-solana#-zk-snarks-and-circuits), for its proof system.

{% hint style="success" %}
Developers don’t need to generate validity proofs or learn about ZK to use ZK Compression.
{% endhint %}

<figure><img src="https://content.gitbook.com/content/GcNj6jjKQBC0HgPwNdGy/blobs/oI68euPl8TF4pMy8Sq9L/image.png" alt="Merkle tree diagram illustrating a leaf proof for Leaf 1. The tree shows a purple root node at the top, branching down through intermediate nodes (Node 4 and Node 5 in green and blue respectively) to eight leaf nodes at the bottom (Leaf 0 through Leaf 7). Leaf 1 is highlighted in green and labeled as &#x27;compressed account&#x27;. The proof path is shown with three highlighted elements in a box at the bottom right: Leaf 0, Node 1, and Node 5, representing the sibling hashes needed to verify Leaf 1&#x27;s inclusion in the tree. Caption explains that a Merkle proof consists of sibling node hashes required to calculate the final root node, with only adjacent hashes along the path to the root needed."><figcaption><p>A Merkle proof path (blue nodes) consists of all sibling node hashes required to calculate the final root node.<br>Only the adjacent hashes along the path to the root are needed.</p></figcaption></figure>

For those interested in learning more about the fundamentals of ZK and its applications on Solana, we recommend reading the following:

* [Zero-Knowledge Proofs: An Introduction to the Fundamentals](https://www.helius.dev/blog/zero-knowledge-proofs-an-introduction-to-the-fundamentals)
* [Zero-Knowledge Proofs: Its Applications on Solana](https://www.helius.dev/blog/zero-knowledge-proofs-its-applications-on-solana)

### Next Steps

Now that you understand the core concepts of ZK Compression, here's the lifecycle of a transaction.

{% content-ref url="lifecycle-of-a-transaction.md" %}
[lifecycle-of-a-transaction.md](lifecycle-of-a-transaction.md)
{% endcontent-ref %}

[^1]: are succinct zero-knowledge proofs (ZKPs)
