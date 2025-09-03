---
description: >-
  Overview of all available ZK compression JSON RPC endpoints on Solana, best
  practices, and error codes.
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
    visible: false
  metadata:
    visible: true
---

# JSON RPC methods

***

{% hint style="info" %}
[Helius Labs](https://github.com/helius-labs) maintains the canonical RPC API and [Photon indexer implementation](https://github.com/helius-labs/photon).
{% endhint %}

Interact with compressed accounts directly with the [ZK Compression JSON RPC](./) API. It's a thin wrapper extending [Solana's web3.js `Connection` class](https://solana-labs.github.io/solana-web3.js/classes/Connection.html) with compression-related endpoints.

The API exposed by the indexer closely mirrors existing RPC calls, with one-to-one mapping:

| Solana RPC              | Photon RPC Calls                  |
| ----------------------- | --------------------------------- |
| getAccountInfo          | getCompressedAccount              |
| getBalance              | getCompressedBalance              |
| getTokenAccountsByOwner | getCompressedTokenAccountsByOwner |
| getProgramAccounts      | getCompressedAccountsByOwner      |

## Creating an RPC Connection

Connect to a specific RPC endpoint

{% tabs %}
{% tab title="Mainnet" %}
<pre class="language-typescript"><code class="lang-typescript">import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

<strong>// Helius exposes Solana and Photon RPC endpoints through a single URL
</strong><strong>const RPC_ENDPOINT = "https://mainnet.helius-rpc.com?api-key=&#x3C;api_key>";
</strong>const PHOTON_ENDPOINT = RPC_ENDPOINT;
const PROVER_ENDPOINT = RPC_ENDPOINT;
const connection: Rpc = createRpc(RPC_ENDPOINT, PHOTON_ENDPOINT, PROVER_ENDPOINT)

console.log("connection", connection);
</code></pre>
{% endtab %}

{% tab title="Devnet" %}
<pre class="language-typescript"><code class="lang-typescript">import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

<strong>// Helius exposes Solana and Photon RPC endpoints through a single URL
</strong><strong>const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=&#x3C;api_key>";
</strong>const PHOTON_ENDPOINT = RPC_ENDPOINT;
const PROVER_ENDPOINT = RPC_ENDPOINT;
const connection: Rpc = createRpc(RPC_ENDPOINT, PHOTON_ENDPOINT, PROVER_ENDPOINT)

console.log("connection", connection);
</code></pre>
{% endtab %}
{% endtabs %}

### Best Practices

<table><thead><tr><th width="157"></th><th></th></tr></thead><tbody><tr><td><strong>Commitment Levels</strong></td><td>Use appropriate commitment levels: <code>processed</code>(fastest), <code>confirmed</code> (balanced), <code>finalized</code> (most reliable)</td></tr><tr><td><strong>Rate Limiting</strong></td><td>Implement retry logic and respect rate limits. Public endpoints: 100 req/s, Private: 1000+ req/s</td></tr><tr><td><strong>Batch Requests</strong></td><td>Use batch requests when possible to improve efficiency and reduce API calls</td></tr><tr><td><strong>Caching</strong></td><td>Cache frequently accessed data to reduce API calls and improve performance</td></tr></tbody></table>

### Error Codes

| Code   | Message              | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| -32600 | Invalid Request      | The JSON sent is not a valid Request object  |
| -32601 | Method not found     | The method does not exist / is not available |
| -32602 | Invalid params       | Invalid method parameter(s)                  |
| -32603 | Internal error       | Internal JSON-RPC error                      |
| -32000 | Account not found    | The compressed account was not found         |
| -32001 | Invalid account hash | The provided account hash is invalid         |

***

## Mainnet ZK Compression API endpoints

<table data-card-size="large" data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><h3>GetCompressedAccount</h3></td><td>Retrieves information about a specific compressed account by its address or hash.</td><td><a href="getcompressedaccount.md">getcompressedaccount.md</a></td></tr><tr><td><h3>GetCompressedAccountsByOwner</h3></td><td>Returns all compressed accounts owned by a specific address.</td><td><a href="getcompressedaccountsbyowner.md">getcompressedaccountsbyowner.md</a></td></tr><tr><td><h3>GetCompressedBalance</h3></td><td>Retrieves the balance of a compressed account.</td><td><a href="getcompressedbalance.md">getcompressedbalance.md</a></td></tr><tr><td><h3>GetCompressedBalanceByOwner</h3></td><td>Gets the total balance of all compressed accounts owned by an address.</td><td><a href="getcompressedbalancebyowner.md">getcompressedbalancebyowner.md</a></td></tr><tr><td><h3>GetCompressedMintTokenHolders</h3></td><td>Lists all holders of a specific compressed token mint.</td><td><a href="getcompressedminttokenholders.md">getcompressedminttokenholders.md</a></td></tr><tr><td><h3>GetCompressedTokenAccountBalances</h3></td><td>Retrieves the token balance of a compressed token account.</td><td><a href="getcompressedtokenaccountbalances.md">getcompressedtokenaccountbalances.md</a></td></tr><tr><td><h3>GetCompressedTokenAccountsByDelegate</h3></td><td>Returns all compressed token accounts delegated to a specific address.</td><td><a href="getcompressedtokenaccountbydelegate.md">getcompressedtokenaccountbydelegate.md</a></td></tr><tr><td><h3>GetCompressedTokenAccountsByOwner</h3></td><td>Lists all compressed token accounts owned by a specific address.</td><td><a href="getcompressedtokenaccountsbyowner.md">getcompressedtokenaccountsbyowner.md</a></td></tr><tr><td><h3>GetCompressedTokenBalancesByOwner</h3></td><td>Retrieves all token balances for compressed accounts owned by an address.</td><td><a href="getcompressedtokenbalancesbyowner.md">getcompressedtokenbalancesbyowner.md</a></td></tr><tr><td><h3>GetCompressionSignaturesForAccount</h3></td><td>Returns signatures for transactions involving a compressed account.</td><td><a href="getcompressionsignaturesforaccount.md">getcompressionsignaturesforaccount.md</a></td></tr><tr><td><h3>GetCompressionSignaturesForAddress</h3></td><td>Retrieves signatures for transactions involving a specific address.</td><td><a href="getcompressionsignaturesforaddress.md">getcompressionsignaturesforaddress.md</a></td></tr><tr><td><h3>GetCompressionSignaturesForOwner</h3></td><td>Returns signatures for transactions where an address is the owner.</td><td><a href="getcompressionsignaturesforowner.md">getcompressionsignaturesforowner.md</a></td></tr><tr><td><h3>GetCompressionSignaturesForTokenOwner</h3></td><td>Lists signatures for transactions involving tokens owned by an address.</td><td><a href="getcompressionsignaturesfortokenowner.md">getcompressionsignaturesfortokenowner.md</a></td></tr><tr><td><h3>GetIndexerHealth</h3></td><td>Returns the health status of the compression indexer.</td><td><a href="getindexerhealth.md">getindexerhealth.md</a></td></tr><tr><td><h3>GetIndexerSlot</h3></td><td>Retrieves the current slot of the compression indexer.</td><td><a href="getindexerslot.md">getindexerslot.md</a></td></tr><tr><td><h3>GetLatestCompressionSignatures</h3></td><td>Returns the most recent transaction signatures related to compression.</td><td><a href="getlatestcompressionsignatures.md">getlatestcompressionsignatures.md</a></td></tr><tr><td><h3>GetLatestNon-VotingSignatures</h3></td><td>Retrieves recent non-voting transaction signatures.</td><td><a href="getlatestnonvotingsignatures.md">getlatestnonvotingsignatures.md</a></td></tr><tr><td><h3>GetMultipleCompressedAccounts</h3></td><td>Retrieves multiple compressed accounts in a single request.</td><td><a href="getmultiplecompressedaccounts.md">getmultiplecompressedaccounts.md</a></td></tr><tr><td><h4>GetMultipleNewAddressProofs</h4></td><td>Returns proofs that the new addresses are not taken already and can be created.</td><td><a href="getmultiplenewaddressproofs.md">getmultiplenewaddressproofs.md</a></td></tr><tr><td><h3>GetTransactionWithCompressionInfo</h3></td><td>Returns transaction details with additional compression-related information.</td><td><a href="gettransactionwithcompressioninfo.md">gettransactionwithcompressioninfo.md</a></td></tr><tr><td><h3>GetValidityProof</h3></td><td>Retrieves a validity proof for compressed data.</td><td><a href="getvalidityproof.md">getvalidityproof.md</a></td></tr></tbody></table>
