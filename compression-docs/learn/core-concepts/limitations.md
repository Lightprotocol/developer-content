# Limitations

Before using ZK Compression to scale your application state, you should consider the limitations of compressed accounts:

* [Larger Transaction Size](limitations.md#larger-transaction-size)
* [High Compute Unit Usage](limitations.md#high-compute-unit-usage)
* [Per-Transaction State Cost](limitations.md#per-transaction-state-cost)

## General Recommendation

{% hint style="info" %}
Consider which accounts in your application benefit from ZK Compression, and which don't. You can use both types for different parts of your application!
{% endhint %}

You may prefer the account _not_ to be permanently compressed if:

* The account gets updated very frequently within a single block (e.g., shared liquidity pools in a DeFi protocol)
* You expect the lifetime number of writes to the same account to be very large (>>1000x)
* The account stores large amounts of data, and you need to access a large part of it (>1kb) inside one on-chain transaction.

## **Larger transaction size**

Solana's Transaction size limit is 1232 Bytes. Transactions exceeding this limit will fail.

**ZK Compression increases your transaction size in two ways:**

* 128 Bytes for the validity proof\
  _constant size per transaction if you read from at least 1 compressed account._
* You must send the account data you want to read/write on-chain.

## **High Compute Unit Usage**

{% hint style="info" %}
System CU usage:

* \~100,000 CU for validity proof verification\
  _this is a constant per transaction if you read data from at least 1 compressed account._
* \~100,000 CU system use (state tree [Poseidon](https://eprint.iacr.org/2019/458.pdf) hashing et al).
* \~6,000 CU per compressed account read/write_._

**Example**: a typical compressed token transfer uses around 292,000 CU.
{% endhint %}

Higher CU usage can:

* **Lead to usage limits**\
  _The total CU limit per transaction is 1,400,000 CU, and the per-block write lock limit per State tree is 12,000,000 CU._&#x20;
* **Require your users to increase their** [**priority fee**](https://solana.com/developers/guides/advanced/how-to-use-priority-fees) **during L1 congestion**\
  _Whenever Solana's global per-block CU limit (50,000,000 CU) is reached, validator clients may prioritize transactions with higher per-CU priority fees._

## Per-transaction state cost&#x20;

Each write operation incurs a small additional network cost. If you expect a single compressed account to amass a large amount of state updates, the lifetime cost of the compressed account may be higher than its uncompressed equivalent which currently has a fixed per-byte rent cost at creation.

{% hint style="info" %}
Whenever a [transaction](lifecycle-of-a-transaction.md) writes to a compressed account, it nullifies the previous compressed account state and appends the new compressed account as a leaf to the state tree. Both of these actions incur costs that add to Solana's base fee.
{% endhint %}

<table><thead><tr><th width="150">Type</th><th width="178">Lamports</th><th>Notes</th></tr></thead><tbody><tr><td>Solana base fee</td><td>5000 per signature</td><td>~</td></tr><tr><td>Write new compressed account state </td><td>~300 per leaf (default)</td><td>Depends on tree depth: <br><span class="math">\left( 2^{\text{tree\_depth}} \times \text{tree\_account\_rent\_cost} \times \text{rollover\_threshold} \right) </span><br>~300 for the default depth of <code>26</code>.</td></tr><tr><td>Nullify old compressed account state</td><td>5000</td><td>Currently, this flat fee applies when nullifying at least one account to reimburse the cost of running a forester transaction. The current default Forester node implementation can be found <a href="../../node-operators/run-a-node.md#light-forester-node">here</a>.</td></tr><tr><td>Create an address</td><td>5000</td><td>Same as Nullify.</td></tr></tbody></table>

## Next Steps

This covers most of the key concepts about ZK Compression! Next, [build a program](../../introduction/intro-to-development.md#on-chain-program-development) or application with ZK Compression or learn how to set up and [run](../../node-operators/run-a-node.md) your own node.
