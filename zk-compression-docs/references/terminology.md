---
title: Terminology
description: Overview to terminology related to ZK Compression and Solana
---

##Account

An entry in the Solana ledger that holds data or executable program code, stored on chain.

There are different kinds of accounts, including

* Data Accounts: Store arbitrary data used by programs.
* SPL Token Accounts: Manage token balances (similar to ERC-20 tokens on Ethereum).
* Program Accounts: Contain the executable code of a Solana program.

***

##Account Compression Program

Light Protocol's program that implements state and address trees for ZK Compression. The program provides the underlying Merkle tree infrastructure used by the Light System Program to manage compressed account state transitions.

> **Source**: https://github.com/Lightprotocol/light-protocol/tree/main/programs/account-compression

***

##Account hash

A 32-byte identifier uniquely representing a compressed account's state and position within a state tree.

***

##Account derivation

A process to create deterministic addresses for compressed PDAs by hashing program IDs and seed values.

***

##Address tree

A Merkle tree used by ZK Compression to derive compressed account addresses deterministically from seeds and a tree's public key.

Address trees are separate from state trees.

***

##[Client](https://solana.com/docs/core/transactions#client)

A computer program that accesses the Solana server network [cluster](https://solana.com/docs/core/transactions#cluster).

***

##[**Cluster**](https://solana.com/docs/references/terminology#cluster)

A set of [validators](https://solana.com/docs/references/terminology#validator) maintaining a single [ledger](https://solana.com/docs/references/terminology#ledger).

***

##Compressed PDA

Compressed accounts at Program Derived Addresses.

***

##Compressed account

A data structure that holds arbitrary data, represented as a 32-byte hash stored in a leaf of a state Merkle tree. Compressed accounts do not require a rent exempt balance upon creation.

***

##Token mint&#x20;

An SPL token mint uniquely represents a token on the Solana network and stores global metadata about the token, including `mint_authority`, `supply`, and `decimals`.

SPL tokens can be compressed if the mint has a token pool account set up. Anyone can create a token pool PDA for any given SPL mint.

***

##Token Pool Account

SPL token account that holds SPL tokens corresponding to compressed tokens in circulation. Tokens are deposited during compression and withdrawn during decompression, owned by the compressed token program's CPI authority PDA. &#x20;

***

##Concurrency

The ability to process multiple Merkle tree update requests simultaneously without invalidating each other, as long as they don't modify the same leaf.

Concurrency in ZK Compression allows parallel operations on different tree leaves without requiring locks.

***

##Compressed Token

An SPL token in compressed form. Compressed tokens do not require an associated token account per holder.

***

##Compressed Token account

An account type in the Compressed Token Program to store information about an individual's ownership of a specific token (mint). Compressed token accounts do not require a rent exempt balance upon creation.

***

##Compressed Token Program

Light Protocol's SPL-compatible token program that enables compression and decompression of token accounts. The program enforces SPL token layout standards and allows for arbitrary transitions between compressed and regular format.

***

##[**Compute units**](https://solana.com/docs/references/terminology#compute-units)

The smallest unit of measure for consumption of computational resources of the transactions on the Solana blockchain.

***

##[**Compute unit budget**](https://solana.com/docs/references/terminology#compute-budget)

The maximum number of [compute units](https://solana.com/docs/references/terminology#compute-units) consumed per transaction.

Developers set the compute unit budget via the`ComputeBudget`instruction, by default 200,000 CU, with a maximum of 1,400,000 CU.

If the transaction exceeds its compute unit limit, it fails and no changes occur.

***

##Compute unit limits per block

The total amount of compute units that all transactions in a single Solana block - the _blockspace_ - can collectively consume is currently set at 48 million CU.

The maximum compute units that can be used to modify a single account within a block - the _write lock limit -_ is currently set at 12 million CU.

***

##[Cross-program invocation (CPI)](https://solana.com/docs/core/transactions#cross-program-invocation-cpi)

A call from one [program](https://solana.com/docs/core/transactions#onchain-program) to another.

> For more information, see [calling between programs](https://solana.com/docs/core/cpi).

***

##Decompression

The process of converting a compressed to a regular Solana account. SPL tokens are withdrawn from the token pool to an Associated Token Account and compressed token accounts are invalidated.

***

##Forester node / Forester

A keeper node to incorporate state updates into state Merkle Trees for ZK Compression.

***

##Groth16

A zero-knowledge SNARK that produces constant-size proofs using bilinear pairings on elliptic curves.

ZK Compression uses Groth16 to generate 128 byte validity proofs to verify compressed account state transitions against the on-chain root.

***

##[**Hash**](https://solana.com/docs/references/terminology#hash)

A hash is a digital fingerprint of a sequence of bytes representing arbitrary data, while requiring far less storage space than the original data.

***

##Indexer

A service that tracks state changes of compressed accounts on the Solana ledger and provides RPC APIs for querying compressed accounts and generating validity proofs.

The ZK Compression indexer is named Photon and is maintained by Helius Labs.

> **Source**: https://github.com/helius-labs/photon

***

##[**Instruction**](https://solana.com/docs/references/terminology#instruction)

A call to invoke a specific [instruction handler](https://solana.com/docs/references/terminology#instruction-handler) in a [program](https://solana.com/docs/references/terminology#program).

An instruction also specifies which accounts it wants to read or modify, and additional data that serves as auxiliary input to the [instruction handler](https://solana.com/docs/references/terminology#instruction-handler). A [client](https://solana.com/docs/references/terminology#client) must include at least one instruction in a [transaction](https://solana.com/docs/references/terminology#transaction), and all instructions must complete for the transaction to be considered successful.

For example, compressed accounts are created or updated with the `InvokeCpiInstruction` to the Light System Program.

***

##Leaf index

The numerical position (u32) of a compressed account within a state tree, used for Merkle proof generation.

***

##Light System Program

ZK Compression's core program that validates compressed account state transitions by verifying validity proofs and managing compressed state changes.

The program enforces compressed account layout with ownership and sum checks, and is invoked to create and write to compressed accounts and PDAs.

> **Source**: https://github.com/Lightprotocol/light-protocol/tree/main/programs/system

***

##**Ledger**

The ledger is an immutable historical record of all Solana transactions signed by clients since the genesis block.

A helpful analogy to differentiate Solana ledger and state:

* Ledger is the entire bank statement history.
* State is the current account balance, derived from all transactions in the bank statement history.

***

##Merkle tree

A tree data structure to allow for cryptographic verification of the integrity of all leaves in a tree.

Each leaf on a Merkle tree is a hash of that leaf’s data. A Merkle tree compresses data by hashing pairs of data repeatedly into a single root hash, starting from the lowest level. Only this root hash is stored on chain. On Solana, this process is called state compression.

***

##Merkle tree account

The public key of the on-chain Merkle tree account used in ZK Compression. This identifier references the state tree that stores compressed account hashes.

***

##Merkle proof

A cryptographic proof consisting of sibling node hashes required to verify that a specific leaf exists within a Merkle tree and calculate the root hash.

ZK Compression encodes Merkle proofs into zero-knowledge proofs (validity proofs). These verify compressed account operations with a constant 128-byte size without exposing the underlying variable-size Merkle proof data.

***

##Nullification

The process of marking compressed accounts as spent to prevent double-spending.

When compressed accounts are used as inputs in transactions, their previous states are invalidated by inserting their hashes into nullifier queues. Forester nodes process these queues to permanently update the corresponding Merkle tree leaves, ensuring each compressed account state can only be used once.

***

##Nullifier queue

A queue where compressed accounts hashes used as input for transactions are temporarily stored to prevent double spending. A Forester node empties the queue by inserting queue elements into a state Merkle tree.

***

##[**Program**](https://solana.com/docs/references/terminology#onchain-program)

Programs run executable code similar to smart contracts on other blockchains with optimizations specific to Solana.

Solana programs key characteristics include:

* Solana programs are stateless and do not store state internally. Separate accounts store state for programs to execute on, such as program, user or token data. This makes Solana’s account model [different from Ethereum’s](https://solana.com/news/evm-to-svm).
* Programs are typically written in Rust.
* Programs interpret the [instructions](https://solana.com/docs/references/terminology#instruction) sent inside of each [transaction](https://solana.com/docs/references/terminology#transaction) to read and modify accounts over which it has control, hence update state.

***

##Parallelism

The ability of the SVM to execute multiple transactions simultaneously, as long as they modify different regular and/or compressed accounts.

***

##[**Program derived addresses (PDA)**](https://solana.com/docs/references/terminology#program-derived-account-pda)

PDAs are special account addresses derived deterministically using optional seeds, a bump seed, and a program ID.

They are off the Ed25519 curve, meaning they have no private key. The PDA itself, once derived, is 32 bytes, matching a regular public key.

***

##[**Prioritization fee**](https://solana.com/docs/references/terminology#prioritization-fee)

An additional fee user can specify in the compute budget [instruction](https://solana.com/docs/references/terminology#instruction) to prioritize their [transactions](https://solana.com/docs/references/terminology#transaction).

The priority fee is derived from the compute unit limit and the comput unit price. The price per compute unit set by the user in micro-lamports (1 lamport = 1,000,000 micro-lamports), rounded up to the nearest lamport.

***

##Poseidon hash

A cryptographic hash function optimized for zero-knowledge proof systems that works natively with finite field arithmetic.

The Poseidon hash is designed to minimize computational complexity in ZK circuits. ZK Compression uses Poseidon hashes to generate the account hashes stored as leaves in state trees.

***

##Proof verification

The on-chain process of validating zero-knowledge proofs to confirm the correctness of compressed account state transitions.

***

##Rent

A fee paid in SOL for the creation of [Accounts](https://solana.com/docs/references/terminology#account) to store data on the blockchain, tied to account size. When accounts do not have enough balance to pay rent, they may be Garbage Collected.

***

##[**Rent exempt**](https://solana.com/docs/references/terminology#rent-exempt)

An account that maintains a minimum lamport balance proportional to the amount of data stored on the account.

All newly created accounts are stored on chain permanently until the account is closed. It is not possible to create an account that falls below the rent exemption threshold.

The rent exemption balance remains locked while an account is active and can be fully recovered when the account is closed.

The minimum balance is paid by the creator and is calculated as follows:

```markdown
Minimum Rent Balance = 2 × 0.00000348 SOL/byte/year × Account Size (Bytes)
```

***

##Remote Procedure Calls (RPC)

A bridge between users (or applications) and the blockchain to facilitate interactions and data retrieval.

The [ZK Compression RPC API](https://www.zkcompression.com/developers/json-rpc-methods) extends [Solana's JSON RPC API](https://solana.com/docs/rpc) with additional endpoints to interact with compressed accounts, provided by Helius Labs.

> Find more information on [ZK Compression’s JSON RPC Methods here](../resources/json-rpc-methods/).

***

##[**Smart contract**](https://solana.com/docs/references/terminology#smart-contract)

Smart contracts on Solana are called programs with key characteristics and optimizations.

***

##Solana Account Model

The native framework to store and manage data on the Solana blockchain.

Solana’s Account Model separates program logic from state to optimize for parallel and faster transactions. Separate accounts store state for programs to execute on, such as program, user or token data. This makes Solana’s Account Model [different from Ethereum’s](https://solana.com/news/evm-to-svm).

ZK Compression extends Solana’s Account Model with Compressed Accounts.

***

##[**Solana Program Library (SPL)**](https://solana.com/docs/references/terminology#solana-program-library-spl)

A [library of programs](https://spl.solana.com/) on Solana such as spl-token that facilitates tasks such as creating and using tokens.

***

##State

A snapshot representing the current status of all accounts and programs on Solana.

The state is derived from the ledger by sequentially applying every transaction. State is mutable and changes with every transaction to represent the latest state.

State is kept in RAM by validators for transaction validation.

***

##State root

The root hash of a Merkle tree that serves as a cryptographic fingerprint representing all compressed accounts in the tree.

State roots are stored on-chain and used by the Light System Program to verify validity proofs during compressed account operations. Each state root represents the complete state of compressed accounts at a specific point in time.

***

##State tree

A Merkle tree that stores compressed account hashes as leaf nodes in ZK Compression.

State trees organize compressed account data into a binary tree structure where each parent node is the hash of its two children nodes. With a depth of 26, a single state tree can store approximately 67 million compressed accounts. The tree's root hash is stored on-chain as a cryptographic fingerprint representing all accounts in the tree.

***

##State compression

A process to lower the amount of data stored on chain using Merkle trees.

The process of state compression involves the following steps

1. millions of accounts are compressed into a “fingerprint” - the Merkle tree root hash
2. this “fingerprint” is stored in one Solana account
3. the account history is stored on the Solana ledger
4. the latest compressed data is fetched from an indexer
5. to verify the data, recompute the hashes and compare the final hash to the on chain root hash.

> Learn more [on generalized state compression here](https://solana.com/developers/courses/state-compression/generalized-state-compression).

***

##Token account

A token account is an account type in Solana's Token Programs that stores information about an individual's ownership of a specific token (mint). Each token account is associated with a single mint and tracks details like the token balance and owner.

***

##[**Token mint**](https://solana.com/docs/references/terminology#token-mint)

A [mint account](https://solana.com/docs/tokens/basics/create-mint) is an account type in Solana's Token Programs that can produce (or 'mint') tokens.

Different tokens are distinguished by their unique token mint addresses. Token mints uniquely represents a token on the network and stores global metadata about the token, including the `mint_authority`, supply, and decimals.

***

##[**Transaction**](https://solana.com/docs/references/terminology#transaction)

One or more [instructions](https://solana.com/docs/references/terminology#instruction) signed by a [client](https://solana.com/docs/references/terminology#client) using one or more [keypairs](https://solana.com/docs/references/terminology#keypair) and executed atomically with only two possible outcomes: success or failure.

***

##Validity proof

A zero-knowledge proof of compressed state included in a transaction to read or write compressed accounts.

Developers don't need to generate _validity proofs_.

The _validity proof_ is

* constant 128 byte in size (other than Merkle proofs with varying proof size), fitting well in Solana’s 1232 byte transaction limit
* verified against the respective on chain fingerprint to ensure the provided data was previously emitted
* provided and generated by indexers that support the [ZK Compression RPC API](https://www.zkcompression.com/developers/json-rpc-methods) which extend Solana's [JSON RPC API](https://solana.com/docs/rpc) to interact with compressed accounts. .

***

##Zero-knowledge proof (ZKP)

A cryptographic proof to verify the validity of a statement without revealing the underlying data.

ZK Compression uses a Groth16 SNARK zk proof

* for its constant _validity_ proof size, to ensures the integrity of many compressed accounts, not for private or confidential transactions, and
* to store data in zk friendly data structures. Applications on Solana can prove custom off chain computations over zk compressed state (native zk compute).

***

##ZK-SNARK

Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge, a cryptographic proof system that enables proving knowledge of information without revealing the information itself.

zk-SNARKs produce constant-size proofs that can be verified efficiently without interaction between prover and verifier. ZK Compression uses the Groth16 zk-SNARK construction to generate validity proofs for compressed account state transitions.

***

##ZK Compression

A generalized compression framework to compress and verify arbitrary data with zero-knowledge proofs, to

* enable the Compressed Account Model, the rent-free equivalent to Solana's Account Model,
* solve Solana’s state growth problem, and
* build a foundation for native zk compute.

***
