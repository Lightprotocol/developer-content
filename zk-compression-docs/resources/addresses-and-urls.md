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

### State Trees & Queues & CPI Accounts

{% tabs %}
{% tab title="V1" %}

<table>
  <thead>
    <tr>
      <th width="100"></th>
      <th width="80">Devnet</th>
      <th width="80">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>State Tree</td>
      <td>✓</td>
      <td>✓</td>
      <td><strong>smt2rJAFdyJJupwMKAqTNAJwvjhmiZ4JYGZmbVRw1Ho</strong></td>
    </tr>
    <tr>
      <td>Nullifier Queue</td>
      <td>✓</td>
      <td>✓</td>
      <td><strong>nfq2hgS7NYemXsFaFUCe3EMXSDSfnZnAe27jC6aPP1X</strong></td>
    </tr>
    <tr>
      <td>CPI Context</td>
      <td>✓</td>
      <td>✓</td>
      <td><strong>cpi2cdhkH5roePvcudTgUL8ppEBfTay1desGh8G8QxK</strong></td>
    </tr>
  </tbody>
</table>
{% endtab %}

{% tab title="V2" %}

<table>
  <thead>
    <tr>
      <th width="100"></th>
      <th width="80">Devnet</th>
      <th width="80">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>State Tree #1</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>bmt1LryLZUMmF7ZtqESaw7wifBXLfXHQYoE4GAmrahU</strong></td>
    </tr>
    <tr>
      <td>Output Queue #1</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>oq1na8gojfdUhsfCpyjNt6h4JaDWtHf1yQj4koBWfto</strong></td>
    </tr>
    <tr>
      <td>CPI Context #1</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>cpi15BoVPKgEPw5o8wc2T816GE7b378nMXnhH3Xbq4y</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="100"></th>
      <th width="80">Devnet</th>
      <th width="80">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>State Tree #2</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>bmt2UxoBxB9xWev4BkLvkGdapsz6sZGkzViPNph7VFi</strong></td>
    </tr>
    <tr>
      <td>Output Queue #2</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>oq2UkeMsJLfXt2QHzim242SUi3nvjJs8Pn7Eac9H9vg</strong></td>
    </tr>
    <tr>
      <td>CPI Context #2</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>cpi2yGapXUR3As5SjnHBAVvmApNiLsbeZpF3euWnW6B</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="100"></th>
      <th width="80">Devnet</th>
      <th width="80">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>State Tree #3</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>bmt3ccLd4bqSVZVeCJnH1F6C8jNygAhaDfxDwePyyGb</strong></td>
    </tr>
    <tr>
      <td>Output Queue #3</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>oq3AxjekBWgo64gpauB6QtuZNesuv19xrhaC1ZM1THQ</strong></td>
    </tr>
    <tr>
      <td>CPI Context #3</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>cpi3mbwMpSX8FAGMZVP85AwxqCaQMfEk9Em1v8QK9Rf</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="100"></th>
      <th width="80">Devnet</th>
      <th width="80">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>State Tree #4</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>bmt4d3p1a4YQgk9PeZv5s4DBUmbF5NxqYpk9HGjQsd8</strong></td>
    </tr>
    <tr>
      <td>Output Queue #4</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>oq4ypwvVGzCUMoiKKHWh4S1SgZJ9vCvKpcz6RT6A8dq</strong></td>
    </tr>
    <tr>
      <td>CPI Context #4</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>cpi4yyPDc4bCgHAnsenunGA8Y77j3XEDyjgfyCKgcoc</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="100"></th>
      <th width="80">Devnet</th>
      <th width="80">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>State Tree #5</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>bmt5yU97jC88YXTuSukYHa8Z5Bi2ZDUtmzfkDTA2mG2</strong></td>
    </tr>
    <tr>
      <td>Output Queue #5</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>oq5oh5ZR3yGomuQgFduNDzjtGvVWfDRGLuDVjv9a96P</strong></td>
    </tr>
    <tr>
      <td>CPI Context #5</td>
      <td>✓</td>
      <td>-</td>
      <td><strong>cpi5ZTjdgYpZ1Xr7B1cMLLUE81oTtJbNNAyKary2nV6</strong></td>
    </tr>
  </tbody>
</table>
{% endtab %}
{% endtabs %}

### Address Trees & Queues

{% tabs %}
{% tab title="V1" %}
<table><thead><tr><th width="150">Address Tree #1</th><th></th></tr></thead><tbody><tr><td>Address Tree #1</td><td><strong>amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2</strong></td></tr><tr><td>Address Queue #1</td><td><strong>aq1S9z4reTSQAdgWHGD2zDaS39sjGrAxbR31vxJ2F4F</strong></td></tr></tbody></table>
{% endtab %}

{% tab title="V2" %}
<table><thead><tr><th width="150">Address Tree #1</th><th></th></tr></thead><tbody><tr><td>Address Tree #1</td><td><strong>amt2kaJA14v3urZbZvnc5v2np8jqvc4Z8zDep5wbtzx</strong></td></tr></tbody></table>
{% endtab %}
{% endtabs %}

### Token Escrow PDA

<table><thead><tr><th width="150"></th><th></th></tr></thead><tbody><tr><td>Token Escrow Owner PDA</td><td><strong>GXtd2izAiMJPwMEjfgTRH3d7k9mjn4Jq3JrWFv9gySYy</strong></td></tr></tbody></table>

### Lookup Tables

{% hint style="info" %}
[Lookup tables](https://solana.com/docs/advanced/lookup-tables) reduce your transaction size. We provide pre-initialized lookup tables that cover the Light's program IDs and accounts:
{% endhint %}

<table><thead><tr><th width="150"></th><th></th></tr></thead><tbody><tr><td>Lookup Table #1 (Mainnet)</td><td><strong>9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ</strong></td></tr><tr><td>Lookup Table #1 (Devnet)</td><td><strong>qAJZMgnQJ8G6vA3WRcjD9Jan1wtKkaCFWLWskxJrR5V</strong></td></tr></tbody></table>

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
