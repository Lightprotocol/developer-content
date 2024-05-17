# Limitations

Before using Light to scale your application state, you should consider the limitations of compressed accounts:

* Larger Transaction Size
* High Compute Unit Usage
* Per-Transaction State Cost

## General Recommendation <a href="#general-recommendation" id="general-recommendation"></a>

{% hint style="info" %}
Consider which accounts in your application benefit from ZK Compression, and which don't. You can use both types for different parts of your application!
{% endhint %}

You may prefer the account _not_ to be permanently compressed if:

* The account gets updated very frequently within a single block (e.g., shared liquidity pools in a DeFi protocol)
* You expect the lifetime number of writes to the same account to be very large (>>1000x)
* The account stores large amounts of data, and you need to access a large part of it (>1kb) inside one on-chain transaction.

## **Larger transaction size** <a href="#larger-transaction-size" id="larger-transaction-size"></a>

Solana's Transaction size limit is 1232 Bytes. Transactions exceeding this limit will fail.

**ZK Compression increases your transaction size in two ways:**

* 128 Bytes for the validity proof _constant size per transaction if you read from at least 1 compressed account._
* You must send the compressed account data you want to read/write on-chain.

## **High Compute Unit Usage** <a href="#high-compute-unit-usage" id="high-compute-unit-usage"></a>

{% hint style="info" %}
System CU usage:

* \~100,000 CU for validity proof verification _this is a constant per transaction if you read data from at least 1 compressed account._
* \~100,000 CU system use (state tree [Poseidon](https://eprint.iacr.org/2019/458.pdf) hashing et al).
* \~6,000 CU per compressed account read/write_._

**Example**: a typical compressed token transfer uses around 292,000 CU.
{% endhint %}

Higher CU usage can:

* **Lead to usage limits** _The total CU limit per transaction is 1,400,000 CU, and the per-block write lock limit per State tree is 12,000,000 CU._
* **This can require your users to increase their** [**priority fee**](https://solana.com/developers/guides/advanced/how-to-use-priority-fees) **during L1 congestion** _Whenever Solana's global per-block CU limit (50,000,000 CU) is reached, validator clients may prioritize transactions with higher per-CU priority fees._

## Per-transaction state cost <a href="#per-transaction-state-cost" id="per-transaction-state-cost"></a>

Each write operation incurs a small additional network cost. If you expect a single compressed account to amass a large amount of state updates, the lifetime cost of the compressed account may be higher than its uncompressed equivalent which currently has a fixed per-byte rent cost at creation.

{% hint style="info" %}
Whenever a [transaction](lifecycle-of-a-transaction.md) writes to a compressed account, it nullifies the previous compressed account state and appends the new compressed account as a leaf to the state tree. Both of these actions incur costs that add to Solana's base fee.
{% endhint %}

* **Appending compressed account state to a state tree**: Typically \~100-200 lamports per new leaf (2^tree\_depth ×tree\_account\_rent\_cost×rollover\_threshold)
* **Nullifying a leaf in a state tree**: The current default [forester node](../../node-operators/node-operator-guide/run-a-node.md#photon-rpc-node) implementation can nullify one leaf within one Solana transaction (5000 lamports base fee per nullified leaf).

## Next Steps <a href="#next-steps" id="next-steps"></a>

This covers most of the key concepts about ZK Compression! Next, [build a program](../../overview/intro-to-development.md#on-chain-program-development) or application with ZK Compression or learn how to set up and [run](../../node-operators/node-operator-guide/run-a-node.md) your own node.
