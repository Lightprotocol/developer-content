# ZK & Validity Proofs

## Validity Proofs

Validity proofs are succinct zero-knowledge proofs (ZKPs) that prove the existence of $$𝑛$$ compressed accounts as leaves within $$𝑚$$ state trees.&#x20;

<figure><img src="../../.gitbook/assets/Screenshot 2024-05-13 at 14.40.53.png" alt=""><figcaption><p>A Merkle proof path consists of all sibling node hashes required to calculate the final root node. (purple)</p></figcaption></figure>

We leverage their succinctness to maintain a constant 128-byte proof size for covering both multiple state inclusion and address exclusion proofs.

The protocol leverages ZKP generation and verification under the hood, so you don't have to learn about ZK directly.

