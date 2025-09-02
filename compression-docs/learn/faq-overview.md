

# FAQ Overview

***

## General FAQ&#x20;

<details>

<summary>Do I need to maintain Merkle Trees or understand ZK to start building?</summary>

**No**, the protocol provides the full infrastructure. Developers just build.&#x20;

* The protocol maintains Merkle trees

- Validity proofs are fetched with RPC calls from indexers that support the [ZK Compression RPC API](../resources/json-rpc-methods/).

> _Learn more in our_ [_Core Concepts Section_](core-concepts/).

</details>

<details>

<summary>How does ZK Compression store data securely?</summary>

1. **State roots** are committed **on-chain** to ensure the same security guarantees as when data is stored in regular accounts.

2) The **raw account data** is stored on the [**Solana ledger**](#user-content-fn-1)[^1] as call data – the compressed account state is fetched with each transaction from supporting RPC providers.

3. **Validity proofs** prevent invalid state transitions.

> _Learn more in our_ [_Core Concepts Section_](core-concepts/).

</details>

<details>

<summary>Is ZK Compression a Layer 2?</summary>

**No –** ZK Compression offers

* direct and atomic transaction **execution** **on Solana's L1**  with instant finality,
* full **composability** between compressed and regular state,
* Solana's **security** guarantees, and
* no batching of transactions, bridging or liquidity fragmentation.

</details>

<details>

<summary>What are limitations and trade-offs?</summary>

**Most applications benefit** from compression **despite** these trade-offs:

* **Transactions are larger in size** due to&#x20;
  * &#x20;a 128-byte proof to verify compressed account validity and
  * account data inclusion.
* **Transactions require more compute units** for on-chain hashing and proof verification - we recommend to increase priority fee during congestion

- Interactions with compressed accounts add **marginal per-transaction fees** to Solana's base fees (<10,000 lamports).

* If a compressed account will be **updated more than 1,000 times** in its lifetime,\
  cumulative transaction costs **exceed one-time rent cost**.

> _Learn more in our_ [_Limitations section_](core-concepts/limitations.md)_._

</details>

## Compressed Tokens FAQ

<details>

<summary>Who are compressed tokens for?</summary>

Compressed tokens can optimize applications needing to mint or distribute many tokens for:

* **Reward programs** with **periodic** **claims**,&#x20;
* **Airdrops** with one transaction per recipient,&#x20;
* User wallets or accounts with **infrequent updates or transfers**, ...

Regular SPL Tokens remain more efficient for high frequency trading and liquidity pools due to larger transaction size and compute unit consumption for state updates.

</details>

<details>

<summary>How do SPL and Compressed Tokens compare?</summary>

<table><thead><tr><th width="169"></th><th width="225">SPL Tokens</th><th>Compressed Tokens</th></tr></thead><tbody><tr><td><strong>Rent Cost</strong></td><td>Yes</td><td>No</td></tr><tr><td><strong>Creation Cost</strong> <br><strong>per token account</strong></td><td>0.002 SOL</td><td>0.0000004 SOL</td></tr><tr><td><strong>Functionality</strong></td><td>All SPL operations</td><td><ul><li>All SPL operations</li><li>Convert between formats atomically in one transaction</li></ul></td></tr><tr><td><strong>Wallet Support</strong></td><td>Yes</td><td>Yes, with Phantom and Backpack</td></tr></tbody></table>

</details>

## Compressed PDA FAQ

<details>

<summary>Who are compressed PDAs for?</summary>

Compressed PDAs can optimize applications with

* user specific state
* accounts with infrequent updates

Regular PDAs remain more efficient for shared state and PDAs with high frequency updates, due to larger transaction size and compute unit consumption.

</details>

<details>

<summary>How do regular and Compressed PDAs compare?</summary>

|                                           | Regular PDA            | Compressed PDA                                             |
| ----------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| **Rent Cost**                             | Yes                    | No                                                         |
| **Creation Cost 100 byte account at PDA** | 0.0016 SOL             | \~ 0.00001 SOL                                             |
| **Functionality**                         | Full PDA operations    | <p>Full PDA operations via Light system program<br>CPI</p> |
| **Implementation**                        | Standard Anchor        | Light SDK                                                  |
| **Read Access**                           | Direct in program      | Via RPC Calls                                              |
| **Write Access**                          | Direct in program      | Via Light System CPI                                       |
| **Seed Derivation**                       | `findProgramAddress()` | <p><code>derive_address()</code> with seed<br>inputs</p>   |

</details>

***

## Next Steps

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-cover data-type="image">Cover image</th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover-dark data-type="image">Cover image (dark)</th></tr></thead><tbody><tr><td><h4>Start Learning</h4></td><td>Learn ZK Compression's core concepts.</td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-38.png">Light Protocol v2 - Batched Merkle trees-38.png</a></td><td><a href="core-concepts/">core-concepts</a></td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-70.png">Light Protocol v2 - Batched Merkle trees-70.png</a></td></tr><tr><td><h4>Whitepaper</h4></td><td>Dive deeper in the Lightpaper.</td><td></td><td></td><td></td></tr><tr><td><h4>Get Support</h4></td><td>Join our Discord for support and discussions.</td><td></td><td></td><td></td></tr></tbody></table>



[^1]: **The ledger is an immutable historical record of all Solana transactions signed by clients since the genesis block.**



    _**Learn more on the Solana Ledger in this**_ [_**blog post from Helius**_](https://www.helius.dev/blog/all-you-need-to-know-about-compression-on-solana#state-vs-ledger)_**.**_
