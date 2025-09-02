

# Client Development

Build client applications that interact with ZK Compression across web, Node.js, and native environments using our TypeScript and Rust SDKs.

### Core Client SDKs <a href="#client-side-sdks" id="client-side-sdks"></a>

<table><thead><tr><th width="200">SDK</th><th width="120">Language</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://www.npmjs.com/package/@lightprotocol/stateless.js"><strong>@lightprotocol/stateless.js</strong></a></td><td>TypeScript</td><td>Core compression SDK with RPC interface, compression/decompression operations, state tree management, and validity proof handling</td></tr><tr><td><a href="https://www.npmjs.com/package/@lightprotocol/compressed-token"><strong>@lightprotocol/compressed-token</strong></a></td><td>TypeScript</td><td>Compressed token operations including mint creation, transfers, SPL compression/decompression, and delegation handling</td></tr><tr><td><a href="https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/client"><strong>light-client</strong></a></td><td>Rust</td><td>RPC client with Photon indexer API, and local test validator support.</td></tr></tbody></table>

## Installation

{% tabs %}
{% tab title="npm" %}
```sh
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @lightprotocol/zk-compression-cli
```
{% endtab %}

{% tab title="Yarn" %}
```sh
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @lightprotocol/zk-compression-cli
```
{% endtab %}
{% endtabs %}

{% code title="rust-client-sdks.toml" %}
```toml
[dependencies]
light-client = "0.13.1" 
```
{% endcode %}

## Environments

{% tabs %}
{% tab title="Localnet" %}
Start a local test-validator with the below command. It will start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001.&#x20;

```bash
light test-validator 
```

See the CLI Installation Guide for more.

{% content-ref url="../cli-installation.md" %}
[cli-installation.md](../cli-installation.md)
{% endcontent-ref %}
{% endtab %}

{% tab title="Devnet" %}
The `Rpc` connection is used to interact with the ZK Compression JSON RPC. It's a thin wrapper extending [Solana's web3.js `Connection` class](https://solana-labs.github.io/solana-web3.js/classes/Connection.html) with compression-related endpoints.

Here's how you set up a connection:

```typescript
import { createRpc } from '@lightprotocol/stateless.js';

// Local development
const connection = createRpc(); // Uses local test validator

// DevNet
const connection = createRpc(
  "https://devnet.helius-rpc.com?api-key=YOUR_KEY",
);

// MainNet
const connection = createRpc(
  "https://mainnet.helius-rpc.com?api-key=YOUR_KEY"  
);
```

Find all ZK Compression related RPC methods below.

{% content-ref url="../json-rpc-methods/" %}
[json-rpc-methods](../json-rpc-methods/)
{% endcontent-ref %}
{% endtab %}
{% endtabs %}

## Examples

{% embed url="https://github.com/Lightprotocol/example-web-client" %}

{% embed url="https://github.com/Lightprotocol/example-nodejs-client" %}

## Next Steps

Get an overview of compressed tokens and dive right into the cookbook.

{% content-ref url="broken-reference" %}
[Broken link](broken-reference)
{% endcontent-ref %}
