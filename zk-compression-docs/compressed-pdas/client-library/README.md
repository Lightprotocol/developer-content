---
title: Client Library
description: Overview to Rust and Typescript client guides. Guides include step-by-step implementation and full code examples.
hidden: true
---

# Overview

Use this guide to build a Typescript or Rust client. Here is the complete flow:

{% tabs %}
{% tab title="Create" %}
<figure><picture><source srcset="../../.gitbook/assets/client-create (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-create.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Update" %}
<figure><picture><source srcset="../../.gitbook/assets/client-update (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-update.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Close" %}
<figure><picture><source srcset="../../.gitbook/assets/client-close (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-close.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Reinitialize" %}
<figure><picture><source srcset="../../.gitbook/assets/client-reinit (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-reinit.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Burn" %}
<figure><picture><source srcset="../../.gitbook/assets/client-burn (1).png" media="(prefers-color-scheme: dark)"><img src="../../.gitbook/assets/client-burn.png" alt=""></picture><figcaption></figcaption></figure>
{% endtab %}
{% endtabs %}

{% hint style="info" %}
Ask anything via [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol/3.1-javascripttypescript-sdks).
{% endhint %}

{% stepper %}
{% step %}
## Installation and Setup
{% tabs %}
{% tab title="Typescript" %}

The Typescript SDK consists of 

1. [@lightprotocol/stateless.js](https://lightprotocol.github.io/light-protocol/stateless.js/index.html): The core RPC client that provides the ZK Compression RPC interface to query and build transactions that create or interact with compressed accounts on Solana. 

2. [@lightprotocol/compressed-token](https://lightprotocol.github.io/light-protocol/compressed-token/index.html) uses the stateless.js RPC interface to build transactions with compressed tokens.

{% hint style="info" %}
Use the [API documentation]( https://lightprotocol.github.io/light-protocol/) to look up specific function signatures, parameters, and return types.
{% endhint %}

### 1. Installation

{% tabs %}
{% tab title="npm" %}
```bash
npm install --save \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endtab %}
{% endtabs %}

### 2. Create an RPC Connection

{% hint style="success" %}
`Rpc` and `TestRpc` implement the same `CompressionApiInterface` for consistent usage across `TestRpc`, local test validator, and public Solana networks.
{% endhint %}

**Use `Rpc` for test-validator, devnet and mainnet**
  * `Rpc` is a thin wrapper extending Solana's web3.js `Connection` class with compression-related endpoints.
  * Connects to Photon indexer to query compressed accounts and prover service to generate validity proofs.
{% tabs %}
{% tab title="Mainnet" %}
```typescript
const rpc = createRpc('https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY');
```
{% endtab %}

{% tab title="Devnet" %}
```typescript
const rpc = createRpc('https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY');
```
{% endtab %}

{% tab title="Localnet" %}

```bash
light test-validator
```

Start a start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001.

{% endtab %}
{% endtabs %}

**For unit tests, use `TestRpc`** to start a mock RPC instance that parses events and builds Merkle trees on-demand without persisting state.
```typescript
const lightWasm: LightWasm = await WasmFactory.getInstance();
const testRpc = await getTestRpc(lightWasm);
```

{% endtab %}

{% tab title="Rust" %}

The Rust SDK consists of

1. [`light-client`](https://docs.rs/light-client): The RPC client that provides the ZK Compression RPC interface to query and build transactions for **compressed accounts and tokens** on Solana.

2. [`light-sdk`](https://docs.rs/light-sdk): Program-side abstractions (macros, wrappers, CPI interface) to create and interact with compressed accounts in Solana programs. Similar to Anchor's `Account` pattern.

**For devnet and mainnet, use `light-client`**
* Connects to Photon indexer to query compressed accounts and generate validity proofs.

```toml
[dependencies]
light-client = "0.16.0"
light-sdk = "0.16.0"
```

{% tabs %}
{% tab title="Mainnet" %}
```rust
let config = LightClientConfig::new(
    "https://api.mainnet-beta.solana.com".to_string(),
    Some("https://mainnet.helius.xyz".to_string()),
    Some("YOUR_API_KEY".to_string())
);

let mut client = LightClient::new(config).await?;

client.payer = read_keypair_file("~/.config/solana/id.json")?;
```
{% endtab %}

{% tab title="Devnet" %}
```rust
let config = LightClientConfig::devnet(
    Some("https://devnet.helius-rpc.com".to_string()),
    Some("YOUR_API_KEY".to_string())
);

let mut client = LightClient::new(config).await?;

client.payer = read_keypair_file("~/.config/solana/id.json")?;
```
{% endtab %}

{% tab title="Localnet" %}
```rust
let config = LightClientConfig::local();

let mut client = LightClient::new(config).await?;

client.payer = read_keypair_file("~/.config/solana/id.json")?;
```

Requires running `light test-validator` locally:

```bash
light test-validator
```

Starts a start a single-node Solana cluster, an RPC node, and a prover node at ports 8899, 8784, and 3001.
{% endtab %}
{% endtabs %}

**For local testing, use [`light-program-test`](https://docs.rs/light-program-test)**.
* Initializes a [LiteSVM](https://github.com/LiteSVM/LiteSVM) optimized for ZK Compression with auto-funded payer and TestIndexer. Requires Light CLI for program binaries.
* Use for unit and integration tests of your program or client code.

```toml
[dev-dependencies]
light-program-test = "0.16.0"
light-sdk = "0.16.0"
```

```rust
let config = ProgramTestConfig::new_v2(
    true,
    Some(vec![("program_create", program_create::ID)])
);
let mut rpc = LightProgramTest::new(config).await.unwrap();
let payer = rpc.get_payer().insecure_clone();
```

{% hint style="success" %}
`LightClient` and `LightProgramTest` implement the same [`Rpc`](https://docs.rs/light-client/latest/light_client/rpc/trait.Rpc.html) and [`Indexer`](https://docs.rs/light-client/latest/light_client/indexer/trait.Indexer.html) traits for consistent usage across `light-program-test`, local test validator, and public Solana networks.
{% endhint %}

{% endtab %}
{% endtabs %}

{% endstep %}
{% step %}
## Tree Configuration

Before creating a compressed account, your client must fetch metadata of two Merkle trees:

* an address tree to derive and store the account address and
* a state tree to store the compressed account hash.

{% hint style="success" %}
The protocol maintains Merkle trees. You don't need to initialize custom trees.
Find the [addresses for Merkle trees here](https://www.zkcompression.com/resources/addresses-and-urls).
{% endhint %}

{% hint style="info" %}
V2 is currently on Devnet. Use to optimize compute unit consumption by up to 70%.
{% endhint %}

{% tabs %}
{% tab title="Typescript" %}

{% tabs %}
{% tab title="V1 Trees" %}
{% code overflow="wrap" %}
```typescript
const addressTree = getDefaultAddressTreeInfo();
const stateTreeInfos = await rpc.getStateTreeInfos();
const outputStateTree = selectStateTreeInfo(stateTreeInfos);
```
{% endcode %}
{% endtab %}

{% tab title="V2 Trees" %}
{% code overflow="wrap" %}
```typescript
const addressTree = await rpc.getAddressTreeInfoV2();
const stateTreeInfos = await rpc.getStateTreeInfos();
const outputStateTree = selectStateTreeInfo(stateTreeInfos);
```
{% endcode %}
{% endtab %}
{% endtabs %}

{% endtab %}

{% tab title="Rust" %}

{% tabs %}
{% tab title="V1 Trees" %}
{% code overflow="wrap" %}
```rust
let address_tree_info = rpc.get_address_tree_v1();
let output_state_tree_info = rpc.get_random_state_tree_info().unwrap();
```
{% endcode %}
{% endtab %}

{% tab title="V2 Trees" %}
{% code overflow="wrap" %}
```rust
let address_tree_info = rpc.get_address_tree_v2();
let output_state_tree_info = rpc.get_random_state_tree_info().unwrap();
```
{% endcode %}
{% endtab %}
{% endtabs %}

{% endtab %}
{% endtabs %}


**Address Tree methods** return `TreeInfo` with the public key and other metadata for the address tree.

* `TreeInfo` is used
  * to derive addresses and
  * for `getValidityProofV0()` to prove the address does not exist yet.


**State Trees methods** return `TreeInfo[]` with pubkeys and metadata for all active state trees.
* For Typescript, `selectStateTreeInfo()` selects a random state tree to store the compressed account hash.
  * Selecting a random state tree prevents write-lock contention on state trees and increases throughput.
  * Account hashes can move to different state trees after each state transition.
  * Best practice is to minimize different trees per transaction. Still, since trees fill up over time, programs must handle accounts from different state trees within the same transaction.

{% hint style="info" %}
**`TreeInfo` contains pubkeys and other metadata of a Merkle tree.**

* `tree`: Merkle tree account pubkey
* `queue`: Queue account pubkey of queue associated with a Merkle tree
  * Buffers updates of compressed accounts before they are added to the Merkle tree.
  * Clients and programs do not interact with the queue. The Light System Program inserts values into the queue.
* `treeType`: Defaults to V1 or V2 trees, based on the feature flag.
* `cpiContext` (currently on devnet): Optional CPI context account for batched operations across multiple programs (may be null)
  * Allows a single zero-knowledge proof to verify compressed accounts from different programs in one instruction
  * First program caches its signer checks, second program reads them and combines instruction data
  * Reduces instruction data size and compute unit costs when multiple programs interact with compressed accounts
  * The SDK includes this when available.
* `nextTreeInfo`: The tree to use for the next operation when the current tree is full (may be null)
  * The SDK determines if `nextTreeInfo` should be used for the next state transition.
  * The protocol creates new trees, once existing trees fill up.
{% endhint %}

{% endstepper %}
