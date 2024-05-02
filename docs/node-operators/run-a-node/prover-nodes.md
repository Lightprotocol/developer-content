# Prover node

Prover nodes allow users to outsource validity proof generation, enabling fast synchronous state transitions.&#x20;

## Validity proofs

Transactions that read from and write to compressed accounts must submit a validity proof to the chain.

At the system level, Light currently verifies two distinct types of validity proofs:

<table><thead><tr><th>Proof type</th><th>Description</th><th data-hidden></th></tr></thead><tbody><tr><td><strong>Inclusion proof</strong></td><td>Prove that a specific compressed account is part of a state tree.  </td><td></td></tr><tr><td><strong>Exclusion proof</strong> </td><td>Prove that a specific PDA has not yet been created. Supports the full 256-bit address space. Useful for PDA-like uniqueness guarantees.</td><td></td></tr></tbody></table>

## Installation

Please refer to the implementation for now:

{% embed url="https://github.com/Lightprotocol/light-protocol/tree/main/gnark-prover#usage" %}

<mark style="background-color:blue;">More coming soon.</mark>
