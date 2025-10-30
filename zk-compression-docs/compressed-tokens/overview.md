---
description: >-
  Complete overview to compressed tokens core features, setup guide and
  cookbook.
---

Compressed tokens provide full SPL token functionality without per-account rent cost.

<table><thead><tr><th valign="middle">Creation</th><th width="200" align="center">Regular SPL Token</th><th width="200" align="center">Compressed Token</th><th align="center">Cost Reduction</th></tr></thead><tbody><tr><td valign="middle">100 Token Accounts</td><td align="center">~ 0.2 SOL</td><td align="center"><strong>~ 0.00004 SOL</strong></td><td align="center"><em><strong>5000x</strong></em></td></tr></tbody></table>

Compressed token accounts store information about an individual's ownership of a specific token (mint). Different from regular token accounts, they don't require an Associated Token Account (ATA) per token holder.

For example, this simplifies [token distribution](advanced-guides/create-an-airdrop.md), since you don't need to allocate a token account per recipient.

#### Compressed Tokens at a Glance

<table data-view="cards"><thead><tr><th></th><th></th></tr></thead><tbody><tr><td><strong>Rent-free tokens</strong></td><td>Create token accounts without upfront rent exempt balance.</td></tr><tr><td><strong>SPL Compatibility</strong></td><td>Compatible with SPL tokens and Solana programs.</td></tr><tr><td><strong>Wallet Support</strong></td><td>Supported by leading wallets including Phantom and Backpack.</td></tr></tbody></table>

## Start building

Developing with compressed tokens works similar SPL tokens and involves minimal setup:

1. Install dependencies

{% tabs %}
{% tab title="npm" %}
```bash
npm install --save-dev typescript tsx @types/node && \
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add --dev typescript tsx @types/node && \
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add --save-dev typescript tsx @types/node && \
pnpm add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```
{% endtab %}
{% endtabs %}

2. Set up your developer environment

<details>

<summary><em>Setup Developer Environment</em></summary>

By default, all guides use Localnet.

```bash
# Install the development CLI
npm install @lightprotocol/zk-compression-cli
```

```bash
# Start a local test validator
light test-validator

## ensure you have the Solana CLI accessible in your system PATH 
```

```typescript
// createRpc() defaults to local test validator endpoints
import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

const connection: Rpc = createRpc();

async function main() {
  let slot = await connection.getSlot();
  console.log(slot);

  let health = await connection.getIndexerHealth(slot);
  console.log(health);
  // "Ok"
}

main();
```

**Alternative: Using Devnet**

Replace `<your-api-key>` with your actual API key. [Get your API key here](https://www.helius.dev/zk-compression), if you don't have one yet.

```typescript
import { createRpc } from "@lightprotocol/stateless.js";

// Helius exposes Solana and Photon RPC endpoints through a single URL
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<your_api_key>";
const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

console.log("Connection created!");
console.log("RPC Endpoint:", RPC_ENDPOINT);
```

</details>

3. Get started with our cookbook or advanced guides for implementations

### Guides

<table><thead><tr><th width="359.98333740234375">Guide</th><th>Description</th></tr></thead><tbody><tr><td><a href="guides/how-to-create-and-register-a-mint-account-for-compression.md">How to Create and Register a Mint Account for Compression</a></td><td>Create new SPL mint with token pool for compression</td></tr><tr><td><a href="guides/how-to-create-compressed-token-accounts.md">How to Create Compressed Token Accounts</a></td><td>Create compressed and learn difference to regular token accounts</td></tr><tr><td><a href="guides/how-to-mint-compressed-tokens.md">How to Mint Compressed Tokens</a></td><td>Create new compressed tokens to existing mint</td></tr><tr><td><a href="guides/how-to-transfer-compressed-token.md">How to Transfer Compressed Tokens</a></td><td>Move compressed tokens between compressed accounts</td></tr><tr><td><a href="guides/how-to-compress-and-decompress-spl-tokens.md">How to Decompress and Compress Tokens</a></td><td>Convert SPL tokens between regular and compressed format</td></tr><tr><td><a href="guides/how-to-compress-complete-spl-token-accounts.md">How to Compress complete SPL Token Accounts</a></td><td>Compress complete SPL token accounts and reclaim rent afterwards</td></tr><tr><td><a href="guides/how-to-merge-compressed-token-accounts.md">How to Merge Compressed Accounts</a></td><td>Consolidate multiple compressed accounts of the same mint into a single compressed account</td></tr><tr><td><a href="guides/how-to-create-compressed-token-pools-for-mint-accounts.md">How to Create Token Pools for Mint Accounts</a></td><td>Create token pool for compression for existing SPL mints</td></tr><tr><td><a href="guides/how-to-approve-and-revoke-delegate-authority.md">How to Approve and Revoke Delegate Authority</a></td><td>Approve or revoke delegates for compressed token accounts</td></tr></tbody></table>

### Implementation Guides

<table><thead><tr><th width="360.35003662109375">Guide</th><th>Description</th></tr></thead><tbody><tr><td><a href="advanced-guides/create-an-airdrop.md">Create an Airdrop</a></td><td>Create an airdrop, with or without code</td></tr><tr><td><a href="advanced-guides/use-token-2022-with-compression.md">Use Token-2022 with compressed tokens</a></td><td>Create and transfer compressed tokens with Token-2022 extensions</td></tr><tr><td><a href="advanced-guides/add-wallet-support-for-compressed-tokens.md">Add Wallet Support for Compressed Tokens</a></td><td>Implement compressed token support in your wallet application</td></tr></tbody></table>

## Examples

<table><thead><tr><th width="230">Example</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://github.com/Lightprotocol/example-web-client">Web Client</a></td><td>Demonstrates how to use @lightprotocol/stateless.js in a browser environment to interact with the ZK Compression API</td></tr><tr><td><a href="https://github.com/Lightprotocol/example-nodejs-client">Node.js Client</a></td><td>Script to execute basic compression/decompression/transfers</td></tr><tr><td><a href="https://github.com/Lightprotocol/example-compressed-claim">Claim Implementation Airdrops</a></td><td>Demo for time-locked airdrop with compressed tokens</td></tr><tr><td><a href="https://github.com/Lightprotocol/example-token-distribution">Token Distribution</a></td><td>Token distribution example implementation for airdrops, payments, and rewards</td></tr></tbody></table>

***

# Next Steps

Get started with the first cookbook guide.

{% content-ref url="guides/how-to-create-and-register-a-mint-account-for-compression.md" %}
[how-to-create-and-register-a-mint-account-for-compression.md](guides/how-to-create-and-register-a-mint-account-for-compression.md)
{% endcontent-ref %}
