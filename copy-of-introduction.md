---
hidden: true
icon: book-open
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: false
---

# Copy of Introduction

<figure><img src=".gitbook/assets/ScaleAnything.png" alt=""><figcaption></figcaption></figure>

## Welcome to ZK Compression

ZK Compression is a Solana account primitive that lets you create tokens and PDAs at a fraction of the cost.

<table><thead><tr><th valign="middle">Creation</th><th width="200" align="center">Regular Account</th><th width="200" align="center">Compressed Account</th><th align="center">Cost Reduction</th></tr></thead><tbody><tr><td valign="middle">100-byte PDA Account</td><td align="center">0.0016 SOL</td><td align="center"><strong>~ 0.00001 SOL</strong> </td><td align="center"><em><strong>160x</strong></em> </td></tr><tr><td valign="middle">100 Token Accounts</td><td align="center">~ 0.2 SOL</td><td align="center"><strong>~ 0.00004 SOL</strong></td><td align="center"><em><strong>5000x</strong></em> </td></tr></tbody></table>

## Core Features

<table data-view="cards"><thead><tr><th></th><th></th></tr></thead><tbody><tr><td><h4>R<strong>ent-free accounts</strong></h4></td><td>Create accounts without rent-exemption.</td></tr><tr><td><h4><strong>L1 Performance</strong></h4></td><td>Execution and data availability on Solana.</td></tr><tr><td><h4><strong>Fully Composable</strong></h4></td><td>Mix between compressed and regular accounts.</td></tr></tbody></table>

## Start Building

<table data-view="cards" data-full-width="false"><thead><tr><th></th><th></th><th data-hidden data-card-cover-dark data-type="image">Cover image (dark)</th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="image"></th></tr></thead><tbody><tr><td><h3>Quick Start</h3></td><td>Get started in minutes. </td><td></td><td></td><td></td></tr><tr><td><h3><strong>Compressed Tokens</strong></h3></td><td></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-54.png">Light Protocol v2 - Batched Merkle trees-54.png</a></td><td><a href="broken-reference">Broken link</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-39 (1).png">Light Protocol v2 - Batched Merkle trees-39 (1).png</a></td></tr><tr><td><h3>Compressed PDAs</h3></td><td></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-55.png">Light Protocol v2 - Batched Merkle trees-55.png</a></td><td><a href="broken-reference">Broken link</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-40 (1).png">Light Protocol v2 - Batched Merkle trees-40 (1).png</a></td></tr></tbody></table>

## ZK and Compression in a Nutshell <a href="#zk-and-compression-in-a-nutshell" id="zk-and-compression-in-a-nutshell"></a>

ZK Compression uses state compression and [zero-knowledge proofs](#user-content-fn-1)[^1] to reduce on-chain state cost:

{% stepper %}
{% step %}
### Compression

Only small fingerprints of all compressed accounts (the state roots) are stored in on-chain accounts. The underlying data is stored on the [Solana ledger](#user-content-fn-2)[^2].
{% endstep %}

{% step %}
### ZK

The protocol uses small zero-knowledge proofs (validity proofs) to ensure the integrity of the compressed state. This is all done under the hood. You can fetch validity proofs from RPC providers that support ZK Compression.
{% endstep %}
{% endstepper %}

## Using AI to work with ZK Compression

<table><thead><tr><th width="125.25">Tool</th><th width="313">Description</th><th>Link</th></tr></thead><tbody><tr><td>MCP</td><td>MCP server that you can connect to your AI assistant to improve development.</td><td>in progress (we should link in our mcp probably to the solana mcp if solana context is needded or comparison)</td></tr><tr><td>LLMs.txt</td><td>Index of site that helps LLMs map documentation.</td><td><a href="https://zkcompression.com/llms.txt">https://zkcompression.com/llms.txt</a></td></tr><tr><td>.md</td><td>Copy the page you are working on as Markdown for LLMs for questions.</td><td>Top right corner on each page, or add suffix e.g. https://zkcompression.com.md</td></tr></tbody></table>

{% content-ref url="resources/mcp-configuration.md" %}
[mcp-configuration.md](resources/mcp-configuration.md)
{% endcontent-ref %}

## Resources

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-type="image">Cover image (dark)</th><th data-hidden data-card-cover data-type="image"></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover-dark data-type="image">Cover image (dark)</th></tr></thead><tbody><tr><td><h3>JSON RPC Methods</h3></td><td>Browse ZK Compression's API references with guides. </td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-62.png">Light Protocol v2 - Batched Merkle trees-62.png</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-73.png">Light Protocol v2 - Batched Merkle trees-73.png</a></td><td><a href="resources/json-rpc-methods/">json-rpc-methods</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-62.png">Light Protocol v2 - Batched Merkle trees-62.png</a></td></tr><tr><td><h3>SDKs</h3></td><td>Explore our TypeScript and Rust SDKs.</td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-63.png">Light Protocol v2 - Batched Merkle trees-63.png</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-46.png">Light Protocol v2 - Batched Merkle trees-46.png</a></td><td><a href="resources/sdks/">sdks</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-63.png">Light Protocol v2 - Batched Merkle trees-63.png</a></td></tr><tr><td><h3>Addresses</h3></td><td>Find program IDs, contract addresses and RPC URLs.</td><td></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-74.png">Light Protocol v2 - Batched Merkle trees-74.png</a></td><td><a href="resources/addresses-and-urls.md">addresses-and-urls.md</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-71.png">Light Protocol v2 - Batched Merkle trees-71.png</a></td></tr></tbody></table>

## Learn & Community

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-cover data-type="image"></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-type="image">Cover image (dark)</th><th data-hidden data-card-cover-dark data-type="image">Cover image (dark)</th></tr></thead><tbody><tr><td><h3>Start Learning</h3></td><td>Learn ZK Compression's core concepts.</td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-38.png">Light Protocol v2 - Batched Merkle trees-38.png</a></td><td><a href="learn/core-concepts/">core-concepts</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-70.png">Light Protocol v2 - Batched Merkle trees-70.png</a></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-70.png">Light Protocol v2 - Batched Merkle trees-70.png</a></td></tr><tr><td><h3>FAQ</h3></td><td>Explore frequently asked questions.</td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-75.png">Light Protocol v2 - Batched Merkle trees-75.png</a></td><td><a href="learn/faq-overview.md">faq-overview.md</a></td><td></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-72.png">Light Protocol v2 - Batched Merkle trees-72.png</a></td></tr><tr><td><h3><strong>Discord</strong></h3></td><td>Join our Discord for support and discussions</td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-50.png">Light Protocol v2 - Batched Merkle trees-50.png</a></td><td><a href="https://discord.com/invite/CYvjBgzRFP">https://discord.com/invite/CYvjBgzRFP</a></td><td></td><td><a href=".gitbook/assets/Light Protocol v2 - Batched Merkle trees-69.png">Light Protocol v2 - Batched Merkle trees-69.png</a></td></tr></tbody></table>

***

{% content-ref url="quickstart.md" %}
[quickstart.md](quickstart.md)
{% endcontent-ref %}

[^1]: A cryptographic proof to verify the validity of a statement without revealing the underlying data.\


    ZK Compression uses a Groth16 SNARK zk proof with a constant 128 bytes size.

[^2]: The ledger is an immutable historical record of all Solana transactions signed by clients since the genesis block.
