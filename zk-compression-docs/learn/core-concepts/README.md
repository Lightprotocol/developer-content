---
description: >-
  Overview to ZK Compression's Core Concepts. Get a high-level system overview
  and learn about the compressed account model, lifecycle of a transaction, and
  considerations.
---

# Core Concepts

{% hint style="info" %}
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol) to query the Light Protocol repo in natural language.
{% endhint %}

ZK Compression is an account primitive on Solana that drastically reduces on-chain state costs while maintaining Solana's security, composability, and performance.

## High Level System Overview

This is how it works at a high level:

{% stepper %}
{% step %}
### **Storage of Compressed State**

Compressed accounts store state as call data in [Solana's ledger](#user-content-fn-1)[^1], removing rent per account.
{% endstep %}

{% step %}
### **Accessing Compressed State**

Transactions specify state they access (read/write) and include it in the transaction payload.
{% endstep %}

{% step %}
### **State Validation**

Solana Programs invoke[^2] the [Light System Program](#user-content-fn-3)[^3] to update compressed state

1. **The protocol validates the state** (validity of existing state, sum checks, ownership checks)
2. **The protocol enforces a schema:** Classic Accounts → Compressed Accounts.\
   Compressed accounts have a layout similar to classic accounts.
{% endstep %}

{% step %}
### **State Updates**

At the end of an instruction, the new state is recorded as a log on the Solana ledger.
{% endstep %}

{% step %}
### **Photon RPC Nodes**

[Photon RPC nodes](#user-content-fn-4)[^4] index the state changes, making the compressed account state available to clients via the ZK Compression RPC API.
{% endstep %}

{% step %}
### Forester Nodes

Keeper nodes that interact with the [Account Compression Program](#user-content-fn-5)[^5] to empty queues and rollover state trees.

{% hint style="success" %}
Clients and custom programs do not interact with Forester nodes or the Account Compression Program. This is all done under the hood.
{% endhint %}
{% endstep %}
{% endstepper %}

## Next Steps

In the following sections, we'll dive into the core concepts that make ZK Compression possible:

* **Compressed Account Model**: Understand how compressed accounts differ from regular Solana accounts (not much!) and how they enhance efficiency.
* **State Trees**: Learn about the Merkle tree structure used to store compressed accounts and how it minimizes on-chain storage.
* **Validity Proofs**: Explore how the protocol uses zero-knowledge proofs to verify data validity while keeping proof sizes small.
* **Lifecycle of a Transaction**: Follow the journey of a ZK-compressed transaction from creation to execution.
* **Considerations**: Discover the trade-offs and scenarios where ZK Compression may or may not be the best solution.

{% content-ref url="compressed-account-model/" %}
[compressed-account-model](compressed-account-model/)
{% endcontent-ref %}

[^1]: The ledger is an immutable historical record of all Solana transactions signed by clients since the genesis block.

    Learn more here in this [blog post](https://www.helius.dev/blog/all-you-need-to-know-about-compression-on-solana#state-vs-ledger).

[^2]: A Cross Program Invocation (CPI) refers to when one program invokes the instructions of another program. This allows for the composability of Solana programs.\
    \
    Learn more about CPIs [here](https://solana.com/docs/core/cpi).

[^3]: The system program enforces the compressed account layout with ownership and sum checks and verifies the validity of your input state.\
    \
    It is also invoked to create/write to compressed accounts and PDAs.\
    \
    See the program address here.

[^4]: RPC nodes index the Light Protocol programs, enabling clients to read and build transactions interacting with compressed state.\\

    The canonical ZK Compression indexer is named Photon.\
    \
    See the Github [repo](https://github.com/helius-labs/photon) for more info.

[^5]: Implements state and address trees. It is used by the Light System program.\
    \
    See the program addresses here.
