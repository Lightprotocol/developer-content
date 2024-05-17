# State Trees

The protocol stores compressed state in multiple state trees.

A state tree is a binary [Merkle tree](https://brilliant.org/wiki/merkle-tree/) that organizes data into a tree structure where each parent node is the hash of its two children nodes. This leads to a single unique root hash that allows for efficient cryptographic verification of the integrity of all the leaves in the tree.

<figure><img src="https://www.zkcompression.com/~gitbook/image?url=https%3A%2F%2F3488020389-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDBJ4vLlhHTdkUGOiHxbB%252Fuploads%252F6scYgSo19Xf3cgtlUKPC%252Fimage.png%3Falt%3Dmedia%26token%3Dde11ff14-2f7c-4844-91d2-7e29275db4e3&#x26;width=768&#x26;dpr=4&#x26;quality=100&#x26;sign=058961a34b23820e64b6c7e2b6e026fa02a7498266e9bc1fb5e03dde995aba9f" alt="" width="563"><figcaption><p>A small binary Merkle tree (depth 2)</p></figcaption></figure>

The hash of each compressed account is stored as a leaf in such a state tree:

<figure><img src="https://www.zkcompression.com/~gitbook/image?url=https%3A%2F%2F3488020389-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDBJ4vLlhHTdkUGOiHxbB%252Fuploads%252FWDP8Fagc0iHHkXh7e0EP%252FScreenshot%25202024-05-10%2520at%252006.37.41.png%3Falt%3Dmedia%26token%3D1309700a-334d-4634-9e6f-50a2e5281083&#x26;width=768&#x26;dpr=4&#x26;quality=100&#x26;sign=67c342cca081997a5f3f4201f19302e6a2188118396133fdbadbf31a8ecf9a40" alt="" width="563"><figcaption><p>Each compressed account hash is a leaf in the state tree</p></figcaption></figure>

Note that each compressed account hash includes the Public Key of the State tree's respective on-chain account (`State tree hash`) and the compressed account's position in the tree (`leafIndex`). This ensures that each account hash is globally unique.

Each state tree has a corresponding on-chain State tree account that stores only the tree's final root hash and other metadata. Storing the final tree root hash on-chain allows the protocol to efficiently verify the validity of any leaf (compressed account) in the tree without needing to access the underlying "raw" compressed account state. The raw state can thus be stored off-chain, e.g., in the much cheaper Solana ledger space, while preserving the security guarantees of the Solana L1.
