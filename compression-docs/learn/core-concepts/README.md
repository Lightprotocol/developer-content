# Core Concepts

ZK Compression is a new primitive on Solana that drastically reduces on-chain state costs while maintaining security, composability, and performance. ZK Compression allows developers to scale their applications to millions of users efficiently, with the help of zero-knowledge proofs

In the following sections, we'll dive into the core concepts that make ZK Compression possible:

* **Compressed Account Model**: Understand how compressed accounts differ from regular Solana accounts (not much!) and how they enhance efficiency
* **State Trees**: Learn about the Merkle tree structure used to store compressed accounts and how it minimizes on-chain storage
* **Validity Proofs**: Explore how zero-knowledge proofs are used to validate state transitions without exposing the underlying data
* **Lifecycle of a Transaction**: Follow the journey of a ZK-compressed transaction from creation to execution
* **Limitations and Considerations**: Discover the trade-offs and scenarios where ZK Compression may or may not be the best solution
