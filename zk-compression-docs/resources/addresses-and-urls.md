---
title: Addresses and URLs
description: Overview to all of ZK Compression's RPC URLs, Program IDs & Accounts and Lookup Tables.
---

### RPC URLs

{% tabs %}
{% tab title="Mainnet" %}
<table><thead><tr><th width="100">Network</th><th width="200">Service</th><th>URL</th></tr></thead><tbody><tr><td>Mainnet</td><td>Network Address (RPC)</td><td><code>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr><tr><td>Mainnet</td><td>Photon RPC API</td><td><code>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr></tbody></table>
{% endtab %}

{% tab title="Devnet" %}
<table><thead><tr><th width="100">Network</th><th width="200">Service</th><th>URL</th></tr></thead><tbody><tr><td>Devnet</td><td>Network Address (RPC)</td><td><code>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr><tr><td>Devnet</td><td>Photon RPC API</td><td><code>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></code></td></tr></tbody></table>
{% endtab %}
{% endtabs %}

{% hint style="info" %}
Find all JSON RPC Methods for ZK Compression [here](json-rpc-methods/).
{% endhint %}

### Program IDs

<table><thead><tr><th width="279"></th><th></th></tr></thead><tbody><tr><td>Light System Program</td><td><strong>SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7</strong></td></tr><tr><td>Compressed Token Program</td><td><strong>cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m</strong></td></tr><tr><td>Account Compression Program</td><td><strong>compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq</strong></td></tr></tbody></table>

### State Trees & Queues & CPI Accounts

{% hint style="success" %}
**In your local test validator environment** use in Rust `TestAccounts::get_local_test_validator_accounts()` to get all pre-configured protocol, state tree, and address tree accounts.
{% endhint %}

{% tabs %}
{% tab title="V1" %}

<table>
  <thead>
    <tr>
      <th width="130"></th>
      <th width="80" style="text-align: center;">Devnet</th>
      <th width="80" style="text-align: center;">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>State Tree</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">✓</td>
      <td><strong>smt2rJAFdyJJupwMKAqTNAJwvjhmiZ4JYGZmbVRw1Ho</strong></td>
    </tr>
    <tr>
      <td>Nullifier Queue</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">✓</td>
      <td><strong>nfq2hgS7NYemXsFaFUCe3EMXSDSfnZnAe27jC6aPP1X</strong></td>
    </tr>
    <tr>
      <td>CPI Context</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">✓</td>
      <td><strong>cpi2cdhkH5roePvcudTgUL8ppEBfTay1desGh8G8QxK</strong></td>
    </tr>
  </tbody>
</table>
{% endtab %}

{% tab title="V2" %}

<table>
  <thead>
    <tr>
      <th width="130">#1</th>
      <th width="80" style="text-align: center;">Devnet</th>
      <th width="80" style="text-align: center;">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>#1 State Tree</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>bmt1LryLZUMmF7ZtqESaw7wifBXLfXHQYoE4GAmrahU</strong></td>
    </tr>
    <tr>
      <td>#1 Output Queue</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>oq1na8gojfdUhsfCpyjNt6h4JaDWtHf1yQj4koBWfto</strong></td>
    </tr>
    <tr>
      <td>#1 CPI Context</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>cpi15BoVPKgEPw5o8wc2T816GE7b378nMXnhH3Xbq4y</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="130">#2</th>
      <th width="80" style="text-align: center;">Devnet</th>
      <th width="80" style="text-align: center;">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>#2 State Tree</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>bmt2UxoBxB9xWev4BkLvkGdapsz6sZGkzViPNph7VFi</strong></td>
    </tr>
    <tr>
      <td>#2 Output Queue</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>oq2UkeMsJLfXt2QHzim242SUi3nvjJs8Pn7Eac9H9vg</strong></td>
    </tr>
    <tr>
      <td>#2 CPI Context</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>cpi2yGapXUR3As5SjnHBAVvmApNiLsbeZpF3euWnW6B</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="130">#3</th>
      <th width="80" style="text-align: center;">Devnet</th>
      <th width="80" style="text-align: center;">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>#3 State Tree</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>bmt3ccLd4bqSVZVeCJnH1F6C8jNygAhaDfxDwePyyGb</strong></td>
    </tr>
    <tr>
      <td>#3 Output Queue</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>oq3AxjekBWgo64gpauB6QtuZNesuv19xrhaC1ZM1THQ</strong></td>
    </tr>
    <tr>
      <td>#3 CPI Context</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>cpi3mbwMpSX8FAGMZVP85AwxqCaQMfEk9Em1v8QK9Rf</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="130">#4</th>
      <th width="80" style="text-align: center;">Devnet</th>
      <th width="80" style="text-align: center;">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>#4 State Tree</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>bmt4d3p1a4YQgk9PeZv5s4DBUmbF5NxqYpk9HGjQsd8</strong></td>
    </tr>
    <tr>
      <td>#4 Output Queue</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>oq4ypwvVGzCUMoiKKHWh4S1SgZJ9vCvKpcz6RT6A8dq</strong></td>
    </tr>
    <tr>
      <td>#4 CPI Context</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>cpi4yyPDc4bCgHAnsenunGA8Y77j3XEDyjgfyCKgcoc</strong></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="130">#5</th>
      <th width="80" style="text-align: center;">Devnet</th>
      <th width="80" style="text-align: center;">Mainnet</th>
      <th>Public Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>#5 State Tree</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>bmt5yU97jC88YXTuSukYHa8Z5Bi2ZDUtmzfkDTA2mG2</strong></td>
    </tr>
    <tr>
      <td>#5 Output Queue</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>oq5oh5ZR3yGomuQgFduNDzjtGvVWfDRGLuDVjv9a96P</strong></td>
    </tr>
    <tr>
      <td>#5 CPI Context</td>
      <td style="text-align: center;">✓</td>
      <td style="text-align: center;">-</td>
      <td><strong>cpi5ZTjdgYpZ1Xr7B1cMLLUE81oTtJbNNAyKary2nV6</strong></td>
    </tr>
  </tbody>
</table>
{% endtab %}
{% endtabs %}

### Address Trees & Queues

{% tabs %}
{% tab title="V1" %}
<table><thead><tr><th width="130">Address Tree #1</th><th></th></tr></thead><tbody><tr><td>Address Tree #1</td><td><strong>amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2</strong></td></tr><tr><td>Address Queue #1</td><td><strong>aq1S9z4reTSQAdgWHGD2zDaS39sjGrAxbR31vxJ2F4F</strong></td></tr></tbody></table>
{% endtab %}

{% tab title="V2" %}
<table><thead><tr><th width="130">Address Tree</th><th></th></tr></thead><tbody><tr><td>Address Tree </td><td><strong>amt2kaJA14v3urZbZvnc5v2np8jqvc4Z8zDep5wbtzx</strong></td></tr></tbody></table>
{% endtab %}
{% endtabs %}

### Token Escrow PDA

<table><thead><tr><th width="130"></th><th></th></tr></thead><tbody><tr><td>Token Escrow Owner PDA</td><td><strong>GXtd2izAiMJPwMEjfgTRH3d7k9mjn4Jq3JrWFv9gySYy</strong></td></tr></tbody></table>

### Lookup Tables

{% hint style="info" %}
[Lookup tables](https://solana.com/docs/advanced/lookup-tables) reduce your transaction size. We provide pre-initialized lookup tables that cover the Light's program IDs and accounts:
{% endhint %}

<table><thead><tr><th width="130"></th><th></th></tr></thead><tbody><tr><td>Lookup Table #1 (Mainnet)</td><td><strong>9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ</strong></td></tr><tr><td>Lookup Table #1 (Devnet)</td><td><strong>qAJZMgnQJ8G6vA3WRcjD9Jan1wtKkaCFWLWskxJrR5V</strong></td></tr></tbody></table>

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

## System Accounts List
<table data-header-hidden>
  <thead>
    <tr>
      <th width="40">#</th>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><a data-footnote-ref href="#user-content-fn-1">​Light System Program​</a></td>
      <td>Verifies validity proofs, compressed account ownership checks, cpis the account compression program to update tree accounts</td>
    </tr>
    <tr>
      <td>2</td>
      <td>CPI Signer</td>
      <td>
        - PDA to sign CPI calls from your program to Light System Program<br>
        - Verified by Light System Program during CPI<br>
        - Derived from your program ID
      </td>
    </tr>
    <tr>
      <td>3</td>
      <td>Registered Program PDA</td>
      <td>
        - Access control to the Account Compression Program
      </td>
    </tr>
    <tr>
      <td>4</td>
      <td><a data-footnote-ref href="#user-content-fn-2">​Noop Program​</a></td>
      <td>
        - Logs compressed account state to Solana ledger. Only used in v1.<br>
        - Indexers parse transaction logs to reconstruct compressed account state
      </td>
    </tr>
    <tr>
      <td>5</td>
      <td><a data-footnote-ref href="#user-content-fn-3">​Account Compression Authority​</a></td>
      <td>
        Signs CPI calls from Light System Program to Account Compression Program
      </td>
    </tr>
    <tr>
      <td>6</td>
      <td><a data-footnote-ref href="#user-content-fn-4">​Account Compression Program​</a></td>
      <td>
        - Writes to state and address tree accounts<br>
        - Client and the account compression program do not interact directly.
      </td>
    </tr>
    <tr>
      <td>7</td>
      <td>Invoking Program</td>
      <td>
        Your program's ID, used by Light System Program to:<br>
        - Derive the CPI Signer PDA<br>
        - Verify the CPI Signer matches your program ID<br>
        - Set the owner of created compressed accounts
      </td>
    </tr>
    <tr>
      <td>8</td>
      <td><a data-footnote-ref href="#user-content-fn-5">​System Program​</a></td>
      <td>
        Solana System Program to transfer lamports
      </td>
    </tr>
  </tbody>
</table>

# Next Steps

Explore all JSON RPC endpoints on Solana, best practices, and error codes.

{% content-ref url="json-rpc-methods/" %}
[json-rpc-methods](json-rpc-methods/)
{% endcontent-ref %}


[^1]: ​[Program ID:](https://solscan.io/account/SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7) SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7

[^2]: [Program ID:](https://solscan.io/account/noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV) noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV

[^3]: PDA derived from Light System Program ID with seed `b"cpi_authority"`.

    [Pubkey](https://solscan.io/account/HZH7qSLcpAeDqCopVU4e5XkhT9j3JFsQiq8CmruY3aru): HZH7qSLcpAeDqCopVU4e5XkhT9j3JFsQiq8CmruY3aru

[^4]: [Program ID](https://solscan.io/account/compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq): compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq

[^5]: ​[Program ID](https://solscan.io/account/11111111111111111111111111111111): 11111111111111111111111111111111
