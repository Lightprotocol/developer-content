# State Trees

The protocol stores compressed state in multiple state trees

{% hint style="info" %}
A state tree is a binary [Merkle tree](https://brilliant.org/wiki/merkle-tree/) that organizes data into a tree structure where each parent node is the hash of its two children nodes. This leads to a single unique root hash that allows for efficient cryptographic verification of the integrity of all the nodes, also referred to as leaves, in the tree
{% endhint %}

<figure><img src="../../.gitbook/assets/image (4).png" alt="" width="563"><figcaption><p>A small binary Merkle tree (depth 2)</p></figcaption></figure>

The hash of each [compressed account](compressed-account-model.md) is stored as a leaf in such a state tree:

<figure><img src="../../.gitbook/assets/Screenshot 2024-05-10 at 06.37.41.png" alt=""><figcaption><p>Each compressed account hash is a leaf in the state tree</p></figcaption></figure>

Note that each compressed account hash includes the public key of the state tree's respective on-chain account (i.e., `state tree hash`) and the compressed account's position in the tree (i.e., `leafIndex`). This ensures that each account hash is globally unique

Each state tree has a corresponding on-chain state tree account that stores only the tree's final root hash and other metadata. Storing the final tree root hash on-chain allows the protocol to efficiently verify the validity of any leaf (compressed account) in the tree. The raw state can thus be stored as calldata in the much cheaper Solana ledger space while preserving the security guarantees of Solana

