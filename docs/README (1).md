# Terminology

### SSP / Compressed Program

**S**tateless **S**olana **P**rogram. also known as "Compressed Program". A Smart contract that interacts with ZK-compressed state via the LightLayer. This includes regular Anchor programs that fully execute on-chain as well as programs that run custom off-chain computation over compressed state.

### Compressed State / Light State

Regular Solana state lives in on-chain accounts. Since accounts are always loaded into RAM of the Solana network, developers must pay for rent exemption at account creation, which locks SOL for the time that the account exists. The amount of lamports that need to be stored in the account depends on the size of the account.

This cost is prohibitive for applications and DePin networks where the incremental Lifetime Value of an individual user's on-chain state is lower than the cost of the state.

With **compressed state**, only a much smaller hash of the state (a unique fingerprint) is stored on-chain, while the underlying data is stored off-chain.&#x20;

Whenever a program or dApp interacts with compressed state, the Light smart contracts verify the integrity of the state against its hash.

By default, the underlying "raw" state gets permanently stored on the Solana ledger, thereby leveraging the security of the Solana blockchain for DA.



To achieve this and to inherit the parallelism of Solana, all state compressed via the LightLayer is stored in _n_ state trees, known as concurrent Merkle trees. Each piece of data that gets created and consumed in a transaction represents a leaf of a state tree. all leaves are hashed together such that only the final 32-byte hash needs to be stored on-chain.

In order to verify the validity of many pieces of state (CompressedAccounts) inside a single Solana transaction, Light uses Zero-knowledge cryptography, allowing the client to compress all state proofs into one small validity proof with a constant size of 128 bytes.&#x20;





### Compressed Account



### ZK Compression



### Forrester node



### Merkle tree / State tree



### Validity proof / ZKP



### Groth16

Groth16 is a Zero-Knowledge Proof (ZKP) system used within Light for efficient proof generation and verification. Proofs are short (256 bytes / 128 bytes compressed) which is important for on-chain verificaiton on Solana. Groth16 proofs belong to the family of SNARKs. (**S**uccinct **N**on-interactive **Ar**guments of **K**nowledge).











