---
description: Overview limitations of compressed accounts.
---

# Limitations

## Limitations

***

### Overview

Before using ZK Compression to scale your application state, consider the following limitations of compressed accounts:

* Larger Transaction Size
* High Compute Unit Usage
* Per-Transaction State Cost

### General Recommendation

{% hint style="info" %}
Consider which accounts in your application benefit from ZK Compression and which don't. You can use both types for different parts of your application!
{% endhint %}

It may be preferred for an account _not_ to be permanently compressed if:

* The account gets updated very frequently within a single block (e.g., shared liquidity pools in a DeFi protocol).
* You expect the lifetime number of writes to the same account to be very large (>>1000x).
* The account stores large amounts of data, and you need to access a large part of it (>1kb) inside one on-chain transaction.

### **Larger Transaction Size**

Solana's transaction size limit is 1232 Bytes. Transactions exceeding this limit will fail. ZK Compression increases your transaction size in two ways:

* 128 bytes must be reserved for the validity proof, which is a constant size per transaction, assuming the transaction reads from at least one compressed account.
* You must send the account data you want to read/write on-chain.

### **High Compute Unit Usage**

{% hint style="info" %}
System CU usage:

* \~100,000 CU for validity proof verification, which is a constant size per transaction, assuming the transaction reads from at least one compressed account
* \~100,000 CU system use (state tree [Poseidon](https://eprint.iacr.org/2019/458.pdf) hashing et al.)
* \~6,000 CU per compressed account read/write

**Example**: a typical compressed token transfer uses around 292,000 CU.
{% endhint %}

Higher CU usage can:

* **Lead to usage limits:** The total CU limit per transaction is 1,400,000 CU, and the per-block write lock limit per State tree is 12,000,000 CU.
* **Require your users to increase their** [**priority fee**](https://solana.com/developers/guides/advanced/how-to-use-priority-fees) **during congestion:** Whenever Solana's global per-block CU limit (48,000,000 CU) is reached, validator clients may prioritize transactions with higher per-CU priority fees.

### State Cost per Transaction

Each write operation incurs a small additional network cost. If you expect a single compressed account to amass a large amount of state updates, the lifetime cost of the compressed account may be higher than its uncompressed equivalent, which currently has a fixed per-byte rent cost at creation.

{% hint style="info" %}
Whenever a transaction writes to a compressed account, it nullifies the previous compressed account state and appends the new compressed account as a leaf to the state tree. Both of these actions incur costs that add to Solana's base fee.
{% endhint %}

<table><thead><tr><th width="150">Type</th><th width="178">Lamports</th><th>Notes</th></tr></thead><tbody><tr><td>Solana base fee</td><td>5000 per signature</td><td>Compensates validators for processing transactions</td></tr><tr><td>Write new compressed account state</td><td>~300 per leaf (default)</td><td>Depends on tree depth:<br><span class="math">\left( 2^{\text{tree\_depth}} \times \text{tree\_account\_rent\_cost} \times \text{rollover\_threshold} \right)</span><br>~300 for the default depth of <code>26</code></td></tr><tr><td>Nullify old compressed account state</td><td>5000 per transaction</td><td>Reimburses the cost of running a Forester transaction. The current default Forester node implementation can be found here</td></tr><tr><td>Create addresses</td><td>5000 per transaction</td><td>Same as nullify</td></tr></tbody></table>

### Next Steps

Now you're familiar with the core concepts of ZK Compression, you're ready to take the next step!

{% columns %}
{% column %}
{% content-ref url="../../references/whitepaper.md" %}
[whitepaper.md](../../references/whitepaper.md)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="broken-reference" %}
[Broken link](broken-reference)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}
