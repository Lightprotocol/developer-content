---
title: Addresses and URLs
description: Overview to all of ZK Compression's RPC URLs, Program IDs & Accounts and Lookup Tables.
---

### RPC URLs

{% tabs %}
{% tab title="Mainnet" %}
<table><thead><tr><th width="96">Network</th><th width="201">Service</th><th>URL</th></tr></thead><tbody><tr><td>Mainnet</td><td>Network Address (RPC)</td><td><code>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr><tr><td>Mainnet</td><td>Photon RPC API</td><td><code>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr></tbody></table>
{% endtab %}

{% tab title="Devnet" %}
<table><thead><tr><th width="82">Network</th><th width="198">Service</th><th>URL</th></tr></thead><tbody><tr><td>Devnet</td><td>Network Address (RPC)</td><td><code>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr><tr><td>Devnet</td><td>Photon RPC API</td><td><code>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr></tbody></table>
{% endtab %}
{% endtabs %}

{% hint style="info" %}
Find all JSON RPC Methods for ZK Compression [here](json-rpc-methods/).
{% endhint %}

### Program IDs

<table><thead><tr><th width="279"></th><th></th></tr></thead><tbody><tr><td>Light System Program</td><td><strong>SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7</strong></td></tr><tr><td>Compressed Token Program</td><td><strong>cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m</strong></td></tr><tr><td>Account Compression Program</td><td><strong>compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq</strong></td></tr></tbody></table>

### State Trees & Queues&#x20;

<table><thead><tr><th width="279">State Tree and Queue #1</th><th></th></tr></thead><tbody><tr><td>Public State Tree #1</td><td><strong>smt1NamzXdq4AMqS2fS2F1i5KTYPZRhoHgWx38d8WsT</strong></td></tr><tr><td>Public Nullifier Queue #1</td><td><strong>nfq1NvQDJ2GEgnS8zt9prAe8rjjpAW1zFkrvZoBR148</strong></td></tr></tbody></table>

### Address Trees & Queues&#x20;

<table><thead><tr><th width="279">Address Tree #1</th><th></th></tr></thead><tbody><tr><td>Public Address Tree #1</td><td><strong>amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2</strong></td></tr><tr><td>Public Address Queue #1</td><td><strong>aq1S9z4reTSQAdgWHGD2zDaS39sjGrAxbR31vxJ2F4F</strong></td></tr></tbody></table>

### Token Escrow PDA

<table><thead><tr><th width="279">Address Tree #1</th><th></th></tr></thead><tbody><tr><td>Token Escrow Owner PDA</td><td><strong>GXtd2izAiMJPwMEjfgTRH3d7k9mjn4Jq3JrWFv9gySYy</strong></td></tr></tbody></table>

### Lookup Tables

{% hint style="info" %}
[Lookup tables](https://solana.com/docs/advanced/lookup-tables) reduce your transaction size. We provide pre-initialized lookup tables that cover the Light's program IDs and accounts:
{% endhint %}

<table><thead><tr><th width="260"></th><th></th></tr></thead><tbody><tr><td>Lookup Table #1 (Mainnet)</td><td><strong>9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ</strong></td></tr><tr><td>Lookup Table #1 (Devnet)</td><td><strong>qAJZMgnQJ8G6vA3WRcjD9Jan1wtKkaCFWLWskxJrR5V</strong></td></tr></tbody></table>

We provide a helper function below if you need to extend a custom lookup table.

<details>

<summary>ExtendLookUpTables.ts</summary>

```typescript
import { Rpc, confirmTx, createRpc } from "@lightprotocol/stateless.js";
import { createTokenProgramLookupTable } from "@lightprotocol/compressed-token";
import { Keypair, PublicKey} from "@solana/web3.js";
import { RPC_ENDPOINT } from "./constants";
const payer = Keypair.generate();
const authority = payer;
const additionalTokenMints : PublicKey[] = [];
const additionalAccounts : PublicKey[] = [];

// Localnet
const connection: Rpc = createRpc();

const main = async () => {
  /// airdrop lamports to pay gas and rent
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 1e7)
  );

  /// Create LUT
  const { address } = await createTokenProgramLookupTable(
    connection,
    payer,
    authority,
    additionalTokenMints,
    additionalAccounts
  );

  console.log("Created lookup table:", address.toBase58());
};

main();
```

</details>

***

### Next Steps

Explore all JSON RPC endpoints on Solana, best practices, and error codes.

{% content-ref url="json-rpc-methods/" %}
[json-rpc-methods](json-rpc-methods/)
{% endcontent-ref %}
