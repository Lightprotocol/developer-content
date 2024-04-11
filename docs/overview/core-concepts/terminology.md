# Terminology

#### Compressed Solana Program (CSP) <a href="#compressed-solana-program-csp" id="compressed-solana-program-csp"></a>

A smart contract that interacts with ZK-compressed state via the LightLayer. This includes regular Anchor programs that execute fully on-chain and programs that run custom off-chain computation over compressed state.

#### Compressed State / Light State <a href="#compressed-state-light-state" id="compressed-state-light-state"></a>

State that is orders of magnitude cheaper than regular "uncompressed" state while preserving the security, performance, and composability of the Solana L1.

**Regular Solana state** lives in on-chain accounts. On-chain accounts are always loaded into the RAM of the Solana network and therefore incur a cost for the user. Users must lock SOL based on the account size at account creation to pay for rent exemption. This rent cost is prohibitive for applications and DePin networks where the incremental Lifetime Value of an individual user's on-chain state is lower than the cost of the state.

With **compressed state**, only a much smaller root hash of the state (a unique fingerprint) is stored on-chain, while the underlying data is stored off-chain.

Whenever a program or dApp interacts with compressed state, the Light smart contracts verify the integrity of the state against its root hash.

By default, the underlying "raw" state gets permanently stored on the Solana ledger, thereby leveraging the security of the Solana blockchain for Data Availability (DA).

To achieve this and to inherit Solana's parallelism, compressed state via the LightLayer is stored across _`n`_ **state trees** (concurrent Merkle trees). Each piece of data that is created or consumed in a transaction represents a single leaf of a state tree. All tree leaves get recursively hashed together so that only the tree's final 32-byte root hash needs to be stored on-chain.

To verify the validity of many pieces of state (CompressedAccounts) inside a single Solana transaction, Light uses Zero-knowledge cryptography, enabling the client to compress all state proofs into one small validity proof with a constant size of 128 bytes.

#### Compressed Account <a href="#compressed-account" id="compressed-account"></a>

Compressed accounts are the base primitive that developers interact with. They closely resemble the layout and utility of regular Solana accounts. Compressed accounts can be program-owned and can optionally have a permanent unique `address` (PDA).

One difference to regular Solana accounts is that the `address` field is optional. By default, compressed accounts can be identified by their hash, with the hash inputs being the underlying account data plus the account's unique location (leafIndex) in its corresponding state tree.

The optional unique `address` allows for verifiable uniqueness guarantees of compressed state, which can be useful for applications that require non-fungible state.

Every transaction specifies which state trees it reads from (input) and writes to (output).

When writing to a compressed account, the protocol consumes the current state and creates the new state.

`input state (current) -> state transition -> output state (new)`

A single transaction can read from _`n`_ (currently n≤8) compressed account inputs, and write to _`m`_ compressed account outputs, inheriting Solana's parallelism.

#### Merkle tree / State tree <a href="#merkle-tree-state-tree" id="merkle-tree-state-tree"></a>

Merkle trees are the underlying data structure that allows for efficient verification of the integrity of the state.

Light consists of a "forest" of state trees. Each state tree has a corresponding on-chain account storing a sparse Merkle tree, the tree's metadata, and _`n`_ recent root hashes (a root hash is the final 32-byte hash resulting from hashing together all current leaves of the tree). One state tree can have many leaves, for example, a tree of height 32 has a total capacity of 2\*\*32 (\~4B) leaves. Each leaf represents the hash of the state of a compressed account as emitted in a previous transaction.

#### Forester node <a href="#forester-node" id="forester-node"></a>

The protocol must invalidate the consumed state whenever a transaction consumes compressed account inputs. This is achieved by storing the consumed compressed account identifier hashes in an on-chain nullifier queue account. Each state tree has an associated nullifier queue (default length: n = 4800). When the queue is full, transactions involving input state from the respective state tree will fail. To ensure the liveness of the LightLayer, off-chain keepers (called Foresters) must periodically empty these queues.

To do so, Foresters asynchronously update the respective leaves in the state tree with zero values and remove the leaves hashes from the nullifier queue.

The nullification process is trustless and permissionless.

#### Photon node <a href="#photon-node" id="photon-node"></a>

Photon is the canonical indexer implementation for the ZK Compression API, built and maintained by Helius Labs. You can access their open-source implementation here: [https://github.com/helius-labs/photon](https://github.com/helius-labs/photon).

#### Validity proof / ZKP <a href="#validity-proof-zkp" id="validity-proof-zkp"></a>

At the system level, validity proofs mathematically prove the correctness of the input state that is read by a transaction. One of the most important properties of the proofs used within Light is their succinctness (read: short. 256 bytes / 128 bytes compressed).

#### Groth16 <a href="#groth16" id="groth16"></a>

Groth16 is a Zero-Knowledge Proof (ZKP) system used within Light for efficient proof generation and verification. Groth16 proofs belong to the family of SNARKs. (**S**uccinct **N**on-interactive **Ar**guments of **K**nowledge).
