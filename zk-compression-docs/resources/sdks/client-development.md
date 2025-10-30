---
description: Overview to Client side development. Quick access to TypeScript and Rust SDKs.
---


Build client applications that interact with ZK Compression across web, Node.js, and native environments using our TypeScript and Rust SDKs.

## Typescript Client <a href="#client-side-sdks" id="client-side-sdks"></a>

* [**@lightprotocol/stateless.js**](https://www.npmjs.com/package/@lightprotocol/stateless.js) **-** Core compression SDK to create or interact with compressed accounts via RPC interface
* [**@lightprotocol/compressed-token**](https://www.npmjs.com/package/@lightprotocol/compressed-token) **-** SDK to mint, transfer, compress/ decompress, or delegate compressed tokens

{% content-ref url="../../compressed-pdas/client-library/typescript.md" %}
[typescript.md](../../compressed-pdas/client-library/typescript.md)
{% endcontent-ref %}

## Rust Client

* For devnet and mainnet use [`light-client`](https://docs.rs/light-client)&#x20;
  * An RPC client for compressed accounts and tokens. Find a [full list of JSON RPC methods here](https://www.zkcompression.com/resources/json-rpc-methods).
  * It connects to the Photon indexer that tracks compressed state to query compressed accounts and the prover service for validity proofs.
* For local testing use [`light-program-test`](https://docs.rs/light-program-test)&#x20;
  * Initializes in-process Solana VM via [LiteSVM](https://github.com/LiteSVM/LiteSVM) with auto-funded payer, local prover server and in-memory indexer.&#x20;
* `LightClient` and `LightProgramTest` implement the same [`Rpc`](https://docs.rs/light-client/latest/light_client/rpc/trait.Rpc.html) and [`Indexer`](https://docs.rs/light-client/latest/light_client/indexer/trait.Indexer.html) traits. Seamlessly switch between `light-program-test`, local test validator, and public Solana networks.

{% content-ref url="../../compressed-pdas/client-library/rust.md" %}
[rust.md](../../compressed-pdas/client-library/rust.md)
{% endcontent-ref %}

### Installation

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

{% code title="rust-client.toml" %}
```toml
[dependencies]
light-client = "0.13.1" 
```
{% endcode %}

### Environments

{% tabs %}
{% tab title="Localnet" %}
Start a local test-validator with the below command. It will start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001.

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

### Examples

{% embed url="https://github.com/Lightprotocol/example-web-client" %}

{% embed url="https://github.com/Lightprotocol/example-nodejs-client" %}

### Next Steps

Learn about SDKs for program development.

{% content-ref url="program-development.md" %}
[program-development.md](program-development.md)
{% endcontent-ref %}
