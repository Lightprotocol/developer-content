# Validity Proofs

Validity proofs are succinct zero-knowledge proofs (ZKPs) that can prove the existence of compressed accounts as leaves within state trees while maintaining a constant 128-byte size. These proofs are generated off-chain and verified on-chain. ZK Compression uses [Groth16](https://docs.rs/groth16-solana/latest/groth16_solana/), a well-known [pairing-based](https://en.wikipedia.org/wiki/Pairing-based_cryptography) [zk-SNARK](https://www.helius.dev/blog/zero-knowledge-proofs-its-applications-on-solana#-zk-snarks-and-circuits), for its proof system.

<figure><img src="../../.gitbook/assets/Screenshot 2024-05-13 at 14.40.53.png" alt=""><figcaption><p>A Merkle proof path (purple nodes) consists of all sibling node hashes required to calculate the final root node.</p></figcaption></figure>

The protocol leverages ZKP generation and verification under the hood, so you don't have to learn about ZK directly to use ZK Compression.
