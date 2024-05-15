# Validity Proofs

Validity proofs are succinct zero-knowledge proofs (ZKPs) that can prove the existence of $$𝑛$$ compressed accounts as leaves within $$𝑚$$ state trees while maintaining a constant 128-byte size.

<figure><img src="../../.gitbook/assets/Screenshot 2024-05-13 at 14.40.53.png" alt=""><figcaption><p>A Merkle proof path (purple nodes) consists of all sibling node hashes required to calculate the final root node.</p></figcaption></figure>

The protocol leverages ZKP generation and verification under the hood, so you don't have to learn about ZK directly to use ZK Compression.

