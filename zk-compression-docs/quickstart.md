---
title: Quick Start
description: Create your first compressed token in minutes.
icon: bolt
---

# Quickstart

With this guide you will mint compressed tokens in under 5 minutes.

{% hint style="success" %}
Compressed tokens are SPL compatible and supported by leading wallets such as Phantom or Backpack.
{% endhint %}

{% stepper %}
{% step %}
#### Install Dependencies

{% tabs %}
{% tab title="npm" %}
```bash
npm install --save-dev typescript tsx @types/node &&
npm install \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add --dev typescript tsx @types/node &&
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add --save-dev typescript tsx @types/node &&
pnpm add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
#### Create an RPC connection

Run `test-connection.ts` to verify your setup:

{% hint style="success" %}
Replace `<api_key>` with your actual API key before running! Get one [here](https://www.helius.dev/zk-compression), if you don't have one yet.
{% endhint %}

<pre class="language-typescript" data-title="test-connection.ts"><code class="lang-typescript">import { createRpc } from "@lightprotocol/stateless.js";

// Helius exposes Solana and Photon RPC endpoints through a single URL
<strong>const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=&#x3C;api_key>";
</strong>const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

console.log("Connection created");
console.log("RPC Endpoint:", RPC_ENDPOINT);
</code></pre>
{% endstep %}

{% step %}
#### Create and Mint Compressed Tokens

<details>

<summary><em>Generate your keypair, if you don't have one yet.</em></summary>

1. Install Solana

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v3.0.0/install)"
```

2. Then run the command below to create a keypair at `.config/solana/id.json`

```bash
solana-keygen new
```

3. fund wallet with devnet SOL

```bash
# Check current balance
solana balance --url devnet

# Airdrop 1 SOL to your default wallet
solana airdrop 1 --url devnet

# or use https://faucet.solana.com/
```

</details>

Run `quickstart.ts` with the following code:

<pre class="language-typescript" data-title="quickstart.ts"><code class="lang-typescript">// ZK Compression Quickstart - DevNet
// 1. Load wallet and connect to DevNet via Helius RPC
// 2. Create SPL mint with token pool for compression via createMint()
// 3. Mint compressed tokens to recipient account via mintTo() 
// 4. Verify compressed token balance via getCompressedTokenAccountsByOwner

import { createRpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo } from "@lightprotocol/compressed-token";
import { Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import { homedir } from "os";

// Step 1: Load wallet from filesystem
const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync(`${homedir()}/.config/solana/id.json`, "utf8"))));

// Helius exposes Solana and compression RPC endpoints through a single URL
<strong>const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=&#x3C;API_KEY>";
</strong>const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

const main = async () => {

  try {
    // Step 2: Create SPL mint with token pool for compression
    console.log("\nCreating SPL mint with token pool for compression");
<strong>    const { mint, transactionSignature } = await createMint(
</strong><strong>      connection,
</strong><strong>      payer,
</strong><strong>      payer.publicKey, // mintAuthority
</strong><strong>      9
</strong><strong>    );
</strong>
    console.log(`Mint address: ${mint.toBase58()}`);
    console.log(`Create mint transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);

    // Step 3: Mint compressed tokens to recipient account
    console.log("\nMinting compressed token...");
<strong>    const mintAmount = 1000000000; // mintAmount with decimals   
</strong><strong>    const mintToTxId = await mintTo(
</strong><strong>      connection,
</strong><strong>      payer,
</strong><strong>      mint, // SPL mint with token pool for compression
</strong><strong>      payer.publicKey, // recipient.publicKey
</strong><strong>      payer, // mintAuthority
</strong><strong>      mintAmount
</strong><strong>    );
</strong>
    console.log(`Compressed Token minted ${mintAmount / 1e9} token`);
    console.log(`Transaction: https://explorer.solana.com/tx/${mintToTxId}?cluster=devnet`);

    // Step 4: Verify compressed token balance via getCompressedTokenAccountsByOwner
    const tokenAccounts = await connection.getCompressedTokenAccountsByOwner(
      payer.publicKey,
      { mint } // SPL mint with token pool for compression
    );

  } catch (error: any) {
    console.error("Error:", error.message);
  }
};

main().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
#### That's it!

You've created and minted compressed tokens. The output shows:

* Mint address
* Create mint transaction link
* Minted token amount
* Mint transaction link
* Compressed token balance
{% endstep %}
{% endstepper %}

***

## Next Steps

Get an overview of compressed tokens or build a program with compressed accounts.

{% columns %}
{% column %}
{% content-ref url="compressed-tokens/overview.md" %}
[overview.md](compressed-tokens/overview.md)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="compressed-pdas/create-a-program-with-compressed-pdas.md" %}
[create-a-program-with-compressed-pdas.md](compressed-pdas/create-a-program-with-compressed-pdas.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}
