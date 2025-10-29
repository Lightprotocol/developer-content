---
description: >-
  Build a Typescript client to create or interact with compressed accounts.
  Includes a step-by-step implementation guide and full code examples.
---

# Typescript

The TypeScript Client SDK provides two test environments:

* **For local testing, use `TestRpc`.**
  * `TestRpc` is an in-memory indexer that parses events and builds Merkle trees on-demand to generate proofs instantly without persisting state.
  * Requires a running test validator with Light System Programs and Merkle tree accounts.
  * Provides an auto-funded keypair for testing.
* **For test-validator, devnet and mainnet use `Rpc`**
  * `Rpc` is a thin wrapper extending Solana's web3.js `Connection` class with compression-related endpoints. Find a [full list of JSON RPC methods here](https://www.zkcompression.com/resources/json-rpc-methods).
  * Connects to Photon indexer to query compressed accounts and prover service to generate validity proofs.
* `Rpc` and `TestRpc` implement the same `CompressionApiInterface`. Seamlessly switch between `TestRpc`, local test validator, and public Solana networks.

{% hint style="success" %}
Find [full code examples at the end](typescript.md#full-code-example) for Anchor.
{% endhint %}

## Implementation Guide

{% hint style="info" %}
Ask anything via [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol/3.1-javascripttypescript-sdks).
{% endhint %}

This guide covers the components of a Typescript client. Here is the complete flow:

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

{% stepper %}
{% step %}
**Dependencies**

{% tabs %}
{% tab title="npm" %}
{% code overflow="wrap" %}
```bash
npm install --save \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endcode %}
{% endtab %}

{% tab title="yarn" %}
{% code overflow="wrap" %}
```bash
yarn add \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endcode %}
{% endtab %}

{% tab title="pnpm" %}
{% code overflow="wrap" %}
```bash
pnpm add \
    @lightprotocol/stateless.js@0.22.1-alpha.1 \
    @lightprotocol/compressed-token@0.22.1-alpha.1 \
    @solana/web3.js
```
{% endcode %}
{% endtab %}
{% endtabs %}

{% hint style="info" %}
`@lightprotocol/stateless.js` provides the core SDK to create and interact with compressed accounts, including `Rpc` and `TestRpc` classes.
{% endhint %}
{% endstep %}

{% step %}
**Environment**

{% tabs %}
{% tab title="Rpc" %}
Connect to local, devnet or mainnet with `Rpc`.

{% tabs %}
{% tab title="Mainnet" %}
{% code overflow="wrap" %}
```typescript
import { createRpc } from '@lightprotocol/stateless.js';

const rpc = createRpc(
  'https://api.mainnet-beta.solana.com',
  'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);
```
{% endcode %}
{% endtab %}

{% tab title="Devnet" %}
{% code overflow="wrap" %}
```typescript
import { createRpc } from '@lightprotocol/stateless.js';

const rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);
```
{% endcode %}

* For Helius devnet: The endpoint serves RPC, Photon indexer, and prover API.
{% endtab %}

{% tab title="Localnet" %}
{% code overflow="wrap" %}
```typescript
import { createRpc } from '@lightprotocol/stateless.js';

const rpc = createRpc();
```
{% endcode %}

* Defaults to `http://127.0.0.1:8899` (RPC), `http://127.0.0.1:8784` (indexer), `http://127.0.0.1:3001` (prover)
* Requires running `light test-validator` locally
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="TestRpc" %}
Set up test environment with `TestRpc`.

{% code overflow="wrap" %}
```typescript
import { getTestRpc } from '@lightprotocol/stateless.js';
import { LightWasm, WasmFactory } from '@lightprotocol/hasher.rs';

const lightWasm: LightWasm = await WasmFactory.getInstance();
const testRpc = await getTestRpc(lightWasm);
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
**Tree Configuration**

Before creating a compressed account, your client must fetch metadata of two Merkle trees:

* an address tree to derive and store the account address and
* a state tree to store the compressed account hash.

{% hint style="success" %}
The protocol maintains Merkle trees. You don't need to initialize custom trees.\
Find the [addresses for Merkle trees here](https://www.zkcompression.com/resources/addresses-and-urls).
{% endhint %}

{% code overflow="wrap" %}
```typescript
const addressTree = await rpc.getAddressTreeInfo();
const stateTreeInfos = await rpc.getStateTreeInfos();
const outputStateTree = selectStateTreeInfo(stateTreeInfos);
```
{% endcode %}

Fetch metadata of trees with:

* `getAddressTreeInfo()` to return `TreeInfo` with the public key and other metadata for the address tree.
  * Used to derive addresses with `deriveAddress()` and
  * for `getValidityProofV0()` to prove the address does not exist yet.

{% hint style="info" %}
`getAddressTreeInfo()` is only needed to create new addresses. Other interactions with compressed accounts fetch it via the existing address (`getCompressedAccount(address)`).
{% endhint %}

* `getStateTreeInfos()` returns `TreeInfo[]` with pubkeys and metadata for all active state trees.
* `selectStateTreeInfo()` selects a random state tree to store the compressed account hash.
  * Selecting a random state tree prevents write-lock contention on state trees and increases throughput.
  * Account hashes can move to different state trees after each state transition.
  * Best practice is to minimize different trees per transaction. Still, since trees fill up over time, programs must handle accounts from different state trees within the same transaction.

{% hint style="info" %}
`TreeInfo` contains metadata for a Merkle tree:

* `tree`: Merkle tree account pubkey
* `queue`: Queue account pubkey
  * Buffers updates of compressed accounts before they are added to the Merkle tree.
  * Clients and programs do not interact with the queue. The Light System Program inserts values into the queue.
* `treeType`: Identifies tree version (StateV1, AddressV2) and account for hash insertion
* `cpiContext` (currently on devnet): Optional CPI context account for batched operations across multiple programs (may be null)
  * Allows a single zero-knowledge proof to verify compressed accounts from different programs in one instruction
  * First program caches its signer checks, second program reads them and combines instruction data
  * Reduces instruction data size and compute unit costs when multiple programs interact with compressed accounts
* `nextTreeInfo`: The tree to use for the next operation when the current tree is full (may be null)
  * When set, use this tree as output tree.
  * The protocol creates new trees, once existing trees fill up.
{% endhint %}
{% endstep %}

{% step %}
**Derive Address**

Derive a persistent address as a unique identifier for your compressed account.

{% tabs %}
{% tab title="V1 Address Trees" %}
{% code overflow="wrap" %}
```typescript
const seed = deriveAddressSeed(
  [Buffer.from('my-seed')],
  programId
);
const address = deriveAddress(seed, addressTree.tree);
```
{% endcode %}
{% endtab %}

{% tab title="V2 Address Trees" %}
{% code overflow="wrap" %}
```typescript
const seed = deriveAddressSeed(
  [Buffer.from('my-seed')],
  programId
);
const address = deriveAddress(seed, addressTree.tree);
```
{% endcode %}
{% endtab %}
{% endtabs %}

**First, derive the seed**:

* Pass arbitrary byte slices in the array to uniquely identify the account
* Specify `programId` to combine with your seeds

**Then, derive the address**:

* Pass the derived 32-byte `seed` from the first step.
* Specify `addressTree.tree` pubkey. This parameter ensures an address is unique to an address tree. Different trees produce different addresses from identical seeds.

{% hint style="info" %}
Use the same `addressTree` for both `deriveAddress()` and all subsequent operations on that account in your client and program.

* To create a compressed account, pass the address to `getValidityProofV0()` to prove the address does not exist yet.
* To update/close, use the address to fetch the current account with `getCompressedAccount(address)`.
{% endhint %}
{% endstep %}

{% step %}
**Validity Proof**

Fetch a validity proof from your RPC provider that supports ZK Compression (Helius, Triton, ...). The proof type depends on the operation:

* To create a compressed account, you must prove the **address doesn't already exist** in the address tree.
* To update or close a compressed account, you must **prove its account hash exists** in a state tree.
* You can **combine multiple addresses and hashes in one proof** to optimize compute cost and instruction data.

{% hint style="info" %}
[Here's a full guide](https://www.zkcompression.com/resources/json-rpc-methods/getvalidityproof) to the `getValidityProofV0()` method.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```typescript
const proof = await rpc.getValidityProofV0(
  [],
  [{ address: bn(address.toBytes()), tree: addressTree.tree, queue: addressTree.queue }]
);
```
{% endcode %}

**Pass these parameters**:

* Leave (`[]`) empty to create compressed accounts, since no compressed account exists yet.
* Specify the new address with its tree and queue pubkeys in `[{ address: bn(address.toBytes()), tree, queue }]` and convert it to the required format.

The RPC returns proof result with

* `compressedProof`: The proof that the address does not exist in the address tree, passed to the program in your instruction data.
* `rootIndices`: An array with root index from the validity proof for the address tree.
* Empty `leafIndices` array, since no compressed account exists yet.
{% endtab %}

{% tab title="Update, Close, Reinit, Burn" %}
{% hint style="info" %}
**Update and Close** use identical proof mechanisms. The difference is in your program's instruction handler.
{% endhint %}

{% code overflow="wrap" %}
```typescript
const hash = compressedAccount.hash;
const tree = compressedAccount.treeInfo.tree;
const queue = compressedAccount.treeInfo.queue;

const proof = await rpc.getValidityProofV0(
  [{ hash, tree, queue }],
  []
);
```
{% endcode %}

**Pass these parameters**:

* Specify the account hash with its tree and queue pubkeys in `[{ hash, tree, queue }]`.
* Get `tree` and `queue` from `compressedAccount.treeInfo.tree` and `compressedAccount.treeInfo.queue`.
* (`[]`) remains empty, since the proof verifies the account hash exists in a state tree, not that the address doesn't exist in an address tree.

The RPC returns proof result with

* `compressedProof`: The proof that the account hash exists in the state tree, passed to the program in your instruction data.
* `rootIndices` and `leafIndices` arrays with proof metadata to pack accounts in the next step.
{% endtab %}

{% tab title="Combined Proof" %}
{% hint style="info" %}
**Advantages of combined proofs**:

* You only add one validity proof with 128 bytes in size instead of two to your instruction data.
* Reduction of compute unit consumption by at least 100k CU, since combined proofs are verified in a single CPI by the Light System Program.
{% endhint %}

{% code overflow="wrap" %}
```typescript
const hash = compressedAccount.hash;
const tree = compressedAccount.treeInfo.tree;
const queue = compressedAccount.treeInfo.queue;

const proof = await rpc.getValidityProofV0(
  [{ hash, tree, queue }],
  [{ address: bn(address.toBytes()), tree: addressTree.tree, queue: addressTree.queue }]
);
```
{% endcode %}

**Pass these parameters**:

* Specify one or more existing account hashes with their tree and queue pubkeys in `[{ hash, tree, queue }]`.
* Specify one or more new addresses with their tree and queue pubkeys in `[{ address: bn(address.toBytes()), tree, queue }]`.

The RPC returns proof result with

* `compressedProof`: A single combined proof that verifies both the account hash exists in the state tree and the address does not exist in the address tree, passed to the program in your instruction data.
* `rootIndices` and `leafIndices` arrays with proof metadata to build `PackedAddressTreeInfo` and `PackedStateTreeInfo` in the next step.
{% endtab %}
{% endtabs %}

**Supported Combinations and Maximums**

The specific combinations and maximums depend on the circuit version (v1 or v2) and the proof type.
* Combine multiple hashes **or** multiple addresses in a single proof, or
* multiple hashes **and** addresses in a single combined proof.

{% tabs %}
{% tab title="V1 Circuits" %}

| **Hashes-only** | | | | | |
|---------|:---:|:---:|:---:|:---:|:---:|
| | 1 | 2 | 3 | 4 | 8 |

| **Addresses-only** | | | | | |
|---------|:---:|:---:|:---:|:---:|:---:|
| | 1 | 2 | 3 | 4 | 8 |

| **Single Combined Proofs** | Any combination of |
|---------|:---:|
| Hashes | 1, 2, 3, 4, 8 |
| Addresses | 1, 2, 4, 8 |

{% endtab %}

{% tab title="V2 Circuits" %}

| **Hashes-only** | |
|---------|:---:|
| | 1 to 20 |

| **Addresses-only** | |
|---------|:---:|
| | 1 to 32 |

| **Single Combined Proofs** | Any combination of |
|---------|:---:|
| Hashes | 1 to 4 |
| Addresses | 1 to 4 |

{% endtab %}
{% endtabs %}

{% endstep %}

{% step %}
**Pack Accounts**

To optimize instruction data we pack accounts into an array:
* Every packed account is assigned to an u8 index.
* Indices are included in instruction data, instead of 32 byte pubkeys.
* The indices point to the `remainingAccounts` in Anchor.

**1. PackedAccounts Overview**

Use the `PackedAccounts` helper from the SDK to construct the `remainingAccounts` array with correct indices.

`PackedAccounts`

1. derives CPI signer PDA and builds all 8 Light System accounts with `read-only` permission flags.

* These accounts log/verify state changes but don't modify their own state.

2. deduplicates pubkeys to make sure each unique pubkey appears only once in `remainingAccounts`.

* For example, if the input state tree is the same as the output state tree, both reference the same pubkey and return the same index.

3. converts pubkeys to sequential u8 indices in the sequential order below.

{% code overflow="wrap" %}
```
[0]    Your program accounts 
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues
```
{% endcode %}

**2. Import and Initialize PackedAccounts**

{% code overflow="wrap" %}
```typescript
import { PackedAccounts, SystemAccountMetaConfig } from '@lightprotocol/stateless.js';

const systemAccountConfig = new SystemAccountMetaConfig(programId);
const packedAccounts = new PackedAccounts();
packedAccounts.addSystemAccounts(systemAccountConfig);
```
{% endcode %}

Initialize the helper and populate the 8 Light System accounts:

1. **Import `PackedAccounts` and `SystemAccountMetaConfig`** from `@lightprotocol/stateless.js`. Use 0.22.1-alpha.1
2. **Create system account config** with `new SystemAccountMetaConfig(programId)`.
3. **Create helper instance** with `new PackedAccounts()`.
4. **Add system accounts** with `addSystemAccounts(systemAccountConfig)` to populate indices 0-7.

In the next steps, you will add tree and queue accounts from the validity proof, then convert to `AccountMeta[]`.

{% hint style="info" %}
Program-specific accounts (signers, fee payer) are passed to `.accounts()`, not added to `remainingAccounts`.
{% endhint %}

<details>

<summary><em>System Accounts List</em></summary>

| # | Account                            | Purpose                                                                                                                                                                                        |
| - | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Light System Program\[^1]          | Verifies validity proofs, compressed account ownership checks, cpis the account compression program to update tree accounts                                                                    |
| 2 | CPI Signer\[^2]                    | <p>- Signs CPI calls from your program to Light System Program<br>- PDA verified by Light System Program during CPI<br>- Derived from your program ID</p>                                      |
| 3 | Registered Program PDA             | Access control to the Account Compression Program                                                                                                                                              |
| 4 | Noop Program\[^3]                  | <p>- Logs compressed account state to Solana ledger. Only used in v1.<br>- Indexers parse transaction logs to reconstruct compressed account state</p>                                                           |
| 5 | Account Compression Authority\[^4] | Signs CPI calls from Light System Program to Account Compression Program                                                                                                                       |
| 6 | Account Compression Program\[^5]   | <p>- Writes to state and address tree accounts<br>- Client and program do not directly interact with this program</p>                                                                          |
| 7 | Invoking Program                   | <p>Your program's ID, used by Light System Program to:<br>- Derive the CPI Signer PDA<br>- Verify the CPI Signer matches your program ID<br>- Set the owner of created compressed accounts</p> |
| 8 | System Program\[^6]                | Solana System Program to transfer lamports                                                                                                                                  |

</details>

**3. Pack Tree Accounts from Validity Proof**

`getValidityProofV0()` returns pubkeys and other metadata of Merkle trees. You will convert the pubkeys to u8 indices that reference accounts in the `remainingAccounts` array to optimize your instruction data.

{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```typescript
const addressTreeIndex = packedAccounts.insertOrGet(addressTree.tree);
const addressQueueIndex = packedAccounts.insertOrGet(addressTree.queue);

const packedAddressTreeInfo = {
  addressMerkleTreePubkeyIndex: addressTreeIndex,
  addressQueuePubkeyIndex: addressQueueIndex,
  rootIndex: proof.rootIndices[0]
};
```
{% endcode %}

* Call `insertOrGet()` with each tree and queue pubkey from the validity proof
* Create `PackedAddressTreeInfo` with three fields:

1. `addressMerkleTreePubkeyIndex`: Points to the address tree account in `remainingAccounts`
   * The address tree is used to derive addresses and verify the address does not already exist
2. `addressQueuePubkeyIndex`: Points to the address queue account in `remainingAccounts`
   * The queue buffers new addresses before they are inserted into the address tree
3. `rootIndex`: The Merkle root index from `proof.rootIndices[0]` (Validity Proof step)
   * Specifies the root to verify the address does not exist in the tree
{% endtab %}

{% tab title="Update, Close, Reinit, Burn" %}
{% code overflow="wrap" %}
```typescript
const merkleTreeIndex = packedAccounts.insertOrGet(compressedAccount.treeInfo.tree);
const queueIndex = packedAccounts.insertOrGet(compressedAccount.treeInfo.queue);

const packedStateTreeInfo = {
  merkleTreePubkeyIndex: merkleTreeIndex,
  queuePubkeyIndex: queueIndex,
  leafIndex: compressedAccount.leafIndex,
  rootIndex: proof.rootIndices[0],
  proveByIndex: false
};
```
{% endcode %}

* Call `insertOrGet()` with the state tree and queue pubkeys from `compressedAccount.treeInfo`
* Create `PackedStateTreeInfo` with five fields:

1. `merkleTreePubkeyIndex`: Points to the state tree account in `remainingAccounts`
   * The state tree stores the existing account hash that Light System Program verifies
2. `queuePubkeyIndex`: Points to the nullifier queue account in `remainingAccounts`
   * The queue tracks nullified (spent) account hashes to prevent double-spending
3. `leafIndex`: The leaf position in the Merkle tree from `compressedAccount.leafIndex`
   * Specifies which leaf contains your account hash to verify it exists in the tree
4. `rootIndex`: The Merkle root index from `proof.rootIndices[0]`
   * Specifies the root to verify the account hash against
5. `proveByIndex`: The proof verification mode.
   * `false` for v1 state trees
   * `true` for v2 state trees
{% endtab %}
{% endtabs %}

**4. Add Output State Tree**

Specify the state tree to store the new account hash.

{% code overflow="wrap" %}
```typescript
const outputTreeIndex = packedAccounts.insertOrGet(outputStateTree.tree);
```
{% endcode %}

* Use `outputStateTree` variable from Step 3 with the `TreeInfo` with pubkey and metadata for the randomly selected state tree
* Call `insertOrGet(outputStateTree.tree)` to add the tree and get its index for instruction data

{% hint style="info" %}
The output tree is separate from the trees in your validity proof. The validity proof references trees that verify existing state (or prove an address doesn't exist), while the output tree specifies where to write the new account hash.
{% endhint %}

**5. Finalize Accounts**

{% code overflow="wrap" %}
```typescript
const { remainingAccounts } = packedAccounts.toAccountMetas();
```
{% endcode %}

Call `toAccountMetas()` to build the complete accounts structure for `.remainingAccounts()`. 
* Packed struct indices reference accounts by their position in this array. 
* The method returns an object with a `remainingAccounts` property containing the `AccountMeta[]` array.

**The method returns accounts in two sections:**

{% code overflow="wrap" %}
```
 [systemAccounts] [packedAccounts]
       ↑               ↑
  Light System     Merkle tree &
    accounts      queue accounts

```
{% endcode %}

1. **System accounts as `read-only`** (indices 0-7):
   * System accounts like the noop program log state changes but don't modify their own state.
   * Light System Program expects these accounts at these exact positions.
2. **Tree and queue accounts as `writable`** (indices 8+):
   * All tree and queue accounts with writable flags in sequential order.
   * Light System Program writes new hashes and addresses to these accounts.

**6. Summary**

You built the `remainingAccounts` array to merge accounts into an array:

* Light System accounts to create and interact with compressed accounts via the Light System Program
* Tree accounts from the validity proof to prove address non-existence (create) or existence of the account hash (update/close)
* The output state tree to store the new account hash

The accounts receive a sequential u8 index. Instruction data references accounts via these indices in this order.

{% hint style="success" %}
`PackedAddressTreeInfo` and `PackedStateTreeInfo` structs contain indices instead of 32-byte pubkeys, to reduce instruction data size to 1 byte per index.
{% endhint %}
{% endstep %}

{% step %}
**Instruction Data**

Build your instruction data with the validity proof, tree account indices, and complete account data.

{% hint style="info" %}
Compressed account data must be passed in instruction data because only the Merkle root hash is stored on-chain. Regular accounts store full data on-chain for programs to read data directly.

The program hashes this data and the Light System Program verifies the hash against the root in a Merkle tree account to ensure its correctness.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```typescript
const proof = {
  0: proofRpcResult.compressedProof,
};

const instructionData = {
  proof,
  addressTreeInfo: packedAddressTreeInfo,
  outputStateTreeIndex: outputTreeIndex,
};
```
{% endcode %}

1. **Validity Proof**

* Add and wrap the `compressedProof` you fetched to prove that the address does not exist yet in the specified address tree.

2. **Specify Merkle trees to store address and account hash**

Include the Merkle tree metadata from the Pack Accounts section:

* `PackedAddressTreeInfo` specifies the index to the address tree account used to derive the address. The index points to the address tree account in the accounts array.
* `outputStateTreeIndex` points to the state tree account in the accounts array that will store the compressed account hash.

3. **Pass initial account data**

* This example creates an account with default values.
* Add custom fields to your instruction struct for any initial data your program requires.
{% endtab %}

{% tab title="Update" %}
{% code overflow="wrap" %}
```typescript
const proof = {
  0: proofRpcResult.compressedProof,
};

const instructionData = {
  proof,
  accountMeta: {
    treeInfo: packedStateTreeInfo,
    address: compressedAccount.address,
    outputStateTreeIndex: outputTreeIndex
  },
  currentMessage: currentAccount.message,
  newMessage,
};
```
{% endcode %}

1. **Validity Proof**

* Add and wrap the `compressedProof` you fetched to prove the account hash exists in the state tree.


2. **Specify input hash and output state tree**

Include the Merkle tree metadata from the Pack Accounts section:

* `accountMeta` points to the input hash and specifies the output state tree with these fields:
  * `treeInfo: PackedStateTreeInfo` points to the existing account hash that will be nullified by the Light System Program
  * `address` specifies the account's derived address
  * `outputStateTreeIndex` points to the state tree that will store the updated compressed account hash

3. **Pass current account data**

* Pass the complete current account data. The program reconstructs the existing account hash from this data to verify it matches the hash in the state tree.
* In this example, we pass `currentMessage` from the fetched account and `newMessage` for the update.
{% endtab %}

{% tab title="Close" %}
{% code overflow="wrap" %}
```typescript
const proof = {
  0: proofRpcResult.compressedProof,
};

const instructionData = {
  proof,
  accountMeta: {
    treeInfo: packedStateTreeInfo,
    address: compressedAccount.address,
    outputStateTreeIndex: outputTreeIndex
  },
  currentMessage: currentAccount.message,
};
```
{% endcode %}

1. **Validity Proof**

* Add and wrap the `compressedProof` you fetched to prove the account hash exists in the state tree.

2. **Specify input hash and output state tree**

Include the Merkle tree metadata from the Pack Accounts section:

* `accountMeta` points to the input hash and specifies the output state tree:
  * `treeInfo: PackedStateTreeInfo` points to the existing account hash that will be nullified by the Light System Program
  * `address` specifies the account's derived address
  * `outputStateTreeIndex` points to the state tree that will store the output hash with zero values

3. **Pass current account data**

* Pass the complete current account data. The program reconstructs the existing account hash from this data to verify it matches the hash in the state tree.
* In this example, we pass `currentMessage` from the fetched account before closing.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
**Instruction**

Build the instruction with your `program_id`, `accounts`, and `data` from Step 7. Pass the accounts array you built in Step 6.

{% code overflow="wrap" %}
```typescript
const instruction = await program.methods
  .create(
    instructionData.proof,
    instructionData.addressTreeInfo,
    instructionData.outputStateTreeIndex)
  .accounts({
    signer: payer.publicKey
  })
  .remainingAccounts(packedAccounts.toAccountMetas().remainingAccounts)
  .instruction();
```
{% endcode %}

**What to include in `accounts`:**

1. **Anchor's named accounts** in `.accounts()` are defined by your program's IDL and include both program-specific accounts and Light System accounts in a fixed order.

* Indices in packed instruction data structures (`merkleTreePubkeyIndex`, `queuePubkeyIndex`, etc.) reference positions in the merged accounts array.
* Your program uses these indices to locate accounts in the complete `AccountInfo` array.

2. **Add Merkle tree and queue accounts** with `.remainingAccounts(accountMetas)` to append them after Anchor's named accounts.
3. **Build the complete instruction with `.instruction()`**:

* Anchor converts `.accounts({ signer })` to `AccountMeta[]` using the program's IDL account definitions.
* `.remainingAccounts()` appends the Merkle tree and queue accounts after named accounts.
* Returns `TransactionInstruction` with `programId`, merged `keys` (all accounts concatenated), and serialized instruction `data`.

**Final account array:** The client builds the final accounts array:

{% code overflow="wrap" %}
```
Named accounts from .accounts():
[0-N]  
  Program-specific accounts
  Light System accounts

Remaining accounts from .remainingAccounts():
[N+1+] 
  Merkle trees, 
  queues
```
{% endcode %}
{% endstep %}

{% step %}
**Send Transaction**

Submit the instruction to the network.

{% code overflow="wrap" %}
```typescript
const blockhash = await rpc.getLatestBlockhash();
const signedTx = buildAndSignTx(
  [instruction],
  payer,
  blockhash.blockhash,
  [] // additional signers if needed
);
const signature = await sendAndConfirmTx(rpc, signedTx);
```
{% endcode %}
{% endstep %}
{% endstepper %}

## Full Code Examples

Full TypeScript test examples using local test validator with `createRpc()`.

1. Install the Light CLI first to download program binaries:

{% code overflow="wrap" %}
```bash
npm -g i @lightprotocol/zk-compression-cli@0.27.1-alpha.2
```
{% endcode %}

2. Start local test validator:

{% code overflow="wrap" %}
```bash
light test-validator
```
{% endcode %}

3. Then run tests in a separate terminal:

{% code overflow="wrap" %}
```bash
anchor test --skip-local-validator
```
{% endcode %}

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% code overflow="wrap" %}
```typescript
// Create Compressed Account Example
import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Create } from "../target/types/create";
import idl from "../target/idl/create.json";
import {
  bn,
  CompressedAccountWithMerkleContext,
  confirmTx,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  deriveAddressSeed,
  LightSystemProgram,
  PackedAccounts,
  Rpc,
  sleep,
  SystemAccountMetaConfig,
} from "@lightprotocol/stateless.js";
import * as assert from "assert";

const path = require("path");
const os = require("os");
require("dotenv").config();

const anchorWalletPath = path.join(os.homedir(), ".config/solana/id.json");
process.env.ANCHOR_WALLET = anchorWalletPath;

describe("test-anchor", () => {
  const program = anchor.workspace.Create as Program<Create>;
  const coder = new anchor.BorshCoder(idl as anchor.Idl);

  it("create compressed account", async () => {
    let signer = new web3.Keypair();
    let rpc = createRpc(
      "http://127.0.0.1:8899",
      "http://127.0.0.1:8784",
      "http://127.0.0.1:3001",
      {
        commitment: "confirmed",
      },
    );
    let lamports = web3.LAMPORTS_PER_SOL;
    await rpc.requestAirdrop(signer.publicKey, lamports);
    await sleep(2000);

    const outputStateTree = defaultTestStateTreeAccounts().merkleTree;
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;

    const messageSeed = new TextEncoder().encode("message");
    const seed = deriveAddressSeed(
      [messageSeed, signer.publicKey.toBytes()],
      new web3.PublicKey(program.idl.address),
    );
    const address = deriveAddress(seed, addressTree);

    // Create compressed account with message
    const txId = await createCompressedAccount(
      rpc,
      addressTree,
      addressQueue,
      address,
      program,
      outputStateTree,
      signer,
      "Hello, compressed world!",
    );
    console.log("Transaction ID:", txId);

    // Wait for indexer to process the transaction
    const slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    let compressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    let myAccount = coder.types.decode(
      "MyCompressedAccount",
      compressedAccount.data.data,
    );

    console.log("Decoded data owner:", myAccount.owner.toBase58());
    console.log("Decoded data message:", myAccount.message);

    // Verify account data
    assert.ok(
      myAccount.owner.equals(signer.publicKey),
      "Owner should match signer public key"
    );
    assert.strictEqual(
      myAccount.message,
      "Hello, compressed world!",
      "Message should match the created message"
    );
  });
});

async function createCompressedAccount(
  rpc: Rpc,
  addressTree: anchor.web3.PublicKey,
  addressQueue: anchor.web3.PublicKey,
  address: anchor.web3.PublicKey,
  program: anchor.Program<Create>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  message: string,
) {
  const proofRpcResult = await rpc.getValidityProofV0(
    [],
    [
      {
        tree: addressTree,
        queue: addressQueue,
        address: bn(address.toBytes()),
      },
    ],
  );
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const addressMerkleTreePubkeyIndex =
    remainingAccounts.insertOrGet(addressTree);
  const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(addressQueue);
  const packedAddressTreeInfo = {
    rootIndex: proofRpcResult.rootIndices[0],
    addressMerkleTreePubkeyIndex,
    addressQueuePubkeyIndex,
  };
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);
  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .createAccount(proof, packedAddressTreeInfo, outputStateTreeIndex, message)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
// Update Compressed Account Example
import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Update } from "../target/types/update";
import updateIdl from "../target/idl/update.json";
import {
  bn,
  CompressedAccountWithMerkleContext,
  confirmTx,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  deriveAddressSeed,
  LightSystemProgram,
  PackedAccounts,
  Rpc,
  sleep,
  SystemAccountMetaConfig,
} from "@lightprotocol/stateless.js";
import * as assert from "assert";

const path = require("path");
const os = require("os");
require("dotenv").config();

const anchorWalletPath = path.join(os.homedir(), ".config/solana/id.json");
process.env.ANCHOR_WALLET = anchorWalletPath;

describe("test-anchor-update", () => {
  const updateProgram = anchor.workspace.Update as Program<Update>;
  const updateCoder = new anchor.BorshCoder(updateIdl as anchor.Idl);

  it("update compressed account message", async () => {
    let signer = new web3.Keypair();
    let rpc = createRpc(
      "http://127.0.0.1:8899",
      "http://127.0.0.1:8784",
      "http://127.0.0.1:3001",
      {
        commitment: "confirmed",
      },
    );
    let lamports = web3.LAMPORTS_PER_SOL;
    await rpc.requestAirdrop(signer.publicKey, lamports);
    await sleep(2000);

    const outputStateTree = defaultTestStateTreeAccounts().merkleTree;
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;

    const messageSeed = new TextEncoder().encode("message");
    const seed = deriveAddressSeed(
      [messageSeed, signer.publicKey.toBytes()],
      new web3.PublicKey(updateProgram.idl.address),
    );
    const address = deriveAddress(seed, addressTree);

    // Step 1: Create compressed account with initial message using update program's create_account
    const createTxId = await createCompressedAccount(
      rpc,
      addressTree,
      addressQueue,
      address,
      updateProgram,
      outputStateTree,
      signer,
      "Hello, compressed world!",
    );
    console.log("Create Transaction ID:", createTxId);

    // Wait for indexer to process the create transaction
    let slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    // Step 2: Get the created account
    let compressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    let myAccount = updateCoder.types.decode(
      "MyCompressedAccount",
      compressedAccount.data.data,
    );
    assert.strictEqual(myAccount.message, "Hello, compressed world!");
    assert.ok(myAccount.owner.equals(signer.publicKey), "Owner should match signer public key");
    console.log("Created message:", myAccount.message);

    // Step 3: Update the account with new message
    const updateTxId = await updateCompressedAccount(
      rpc,
      compressedAccount,
      updateProgram,
      outputStateTree,
      signer,
      "Hello again, compressed World!",
    );
    console.log("Update Transaction ID:", updateTxId);

    // Wait for indexer to process the update transaction
    slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    // Step 4: Verify the update
    compressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    myAccount = updateCoder.types.decode(
      "MyCompressedAccount",
      compressedAccount.data.data,
    );
    console.log("Updated message:", myAccount.message);

    assert.ok(myAccount.owner.equals(signer.publicKey), "Owner should match signer public key");
    assert.strictEqual(myAccount.message, "Hello again, compressed World!", "Message should be updated");
  });
});

async function createCompressedAccount(
  rpc: Rpc,
  addressTree: anchor.web3.PublicKey,
  addressQueue: anchor.web3.PublicKey,
  address: anchor.web3.PublicKey,
  program: anchor.Program<Update>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  message: string,
) {
  const proofRpcResult = await rpc.getValidityProofV0(
    [],
    [
      {
        tree: addressTree,
        queue: addressQueue,
        address: bn(address.toBytes()),
      },
    ],
  );
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const addressMerkleTreePubkeyIndex =
    remainingAccounts.insertOrGet(addressTree);
  const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(addressQueue);
  const packedAddressTreeInfo = {
    rootIndex: proofRpcResult.rootIndices[0],
    addressMerkleTreePubkeyIndex,
    addressQueuePubkeyIndex,
  };
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .createAccount(proof, packedAddressTreeInfo, outputStateTreeIndex, message)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}

async function updateCompressedAccount(
  rpc: Rpc,
  compressedAccount: CompressedAccountWithMerkleContext,
  program: anchor.Program<Update>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  newMessage: string,
) {
  const proofRpcResult = await rpc.getValidityProofV0(
    [
      {
        hash: compressedAccount.hash,
        tree: compressedAccount.treeInfo.tree,
        queue: compressedAccount.treeInfo.queue,
      },
    ],
    [],
  );

  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const merkleTreePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.tree,
  );
  const queuePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.queue,
  );
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  // Deserialize current account using update program's coder
  const coder = new anchor.BorshCoder(updateIdl as anchor.Idl);
  const currentAccount = coder.types.decode(
    "MyCompressedAccount",
    compressedAccount.data.data,
  );

  const compressedAccountMeta = {
    treeInfo: {
      merkleTreePubkeyIndex,
      queuePubkeyIndex,
      leafIndex: compressedAccount.leafIndex,
      proveByIndex: false,
      rootIndex: proofRpcResult.rootIndices[0],
    },
    outputStateTreeIndex,
    address: compressedAccount.address,
  };

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .updateAccount(proof, currentAccount, compressedAccountMeta, newMessage)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
// Close Compressed Account Example
import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Close } from "../target/types/close";
import closeIdl from "../target/idl/close.json";
import {
  bn,
  CompressedAccountWithMerkleContext,
  confirmTx,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  deriveAddressSeed,
  LightSystemProgram,
  PackedAccounts,
  Rpc,
  sleep,
  SystemAccountMetaConfig,
} from "@lightprotocol/stateless.js";
import * as assert from "assert";

const path = require("path");
const os = require("os");
require("dotenv").config();

const anchorWalletPath = path.join(os.homedir(), ".config/solana/id.json");
process.env.ANCHOR_WALLET = anchorWalletPath;

describe("test-anchor-close", () => {
  const closeProgram = anchor.workspace.Close as Program<Close>;
  const closeCoder = new anchor.BorshCoder(closeIdl as anchor.Idl);

  it("close compressed account", async () => {
    let signer = new web3.Keypair();
    let rpc = createRpc(
      "http://127.0.0.1:8899",
      "http://127.0.0.1:8784",
      "http://127.0.0.1:3001",
      {
        commitment: "confirmed",
      },
    );
    let lamports = web3.LAMPORTS_PER_SOL;
    await rpc.requestAirdrop(signer.publicKey, lamports);
    await sleep(2000);

    const outputStateTree = defaultTestStateTreeAccounts().merkleTree;
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;

    const messageSeed = new TextEncoder().encode("message");
    const seed = deriveAddressSeed(
      [messageSeed, signer.publicKey.toBytes()],
      new web3.PublicKey(closeProgram.idl.address),
    );
    const address = deriveAddress(seed, addressTree);

    const createTxId = await createCompressedAccount(
      rpc,
      addressTree,
      addressQueue,
      address,
      closeProgram,
      outputStateTree,
      signer,
      "Hello, compressed world!",
    );
    console.log("Create Transaction ID:", createTxId);

    // Wait for indexer to process the create transaction
    let slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    let compressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    let myAccount = closeCoder.types.decode(
      "MyCompressedAccount",
      compressedAccount.data.data,
    );
    assert.strictEqual(myAccount.message, "Hello, compressed world!");
    assert.ok(myAccount.owner.equals(signer.publicKey), "Owner should match signer public key");
    console.log("Created message:", myAccount.message);

    const closeTxId = await closeCompressedAccount(
      rpc,
      compressedAccount,
      closeProgram,
      outputStateTree,
      signer,
      "Hello, compressed world!",
    );
    console.log("Close Transaction ID:", closeTxId);

    // Wait for indexer to process the close transaction
    slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    // After closing, the account exists with zero data.
    // Verify the account was closed by checking that data.data is empty.
    const closedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    assert.ok(
      closedAccount.data.data === null ||
      (Buffer.isBuffer(closedAccount.data.data) && closedAccount.data.data.length === 0),
      "Closed account should have null or empty data.data"
    );
    console.log("Verified account was closed (data.data is empty as expected)");
  });
});

async function createCompressedAccount(
  rpc: Rpc,
  addressTree: anchor.web3.PublicKey,
  addressQueue: anchor.web3.PublicKey,
  address: anchor.web3.PublicKey,
  program: anchor.Program<Close>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  message: string,
) {
  const proofRpcResult = await rpc.getValidityProofV0(
    [],
    [
      {
        tree: addressTree,
        queue: addressQueue,
        address: bn(address.toBytes()),
      },
    ],
  );
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const addressMerkleTreePubkeyIndex =
    remainingAccounts.insertOrGet(addressTree);
  const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(addressQueue);
  const packedAddressTreeInfo = {
    rootIndex: proofRpcResult.rootIndices[0],
    addressMerkleTreePubkeyIndex,
    addressQueuePubkeyIndex,
  };
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .createAccount(proof, packedAddressTreeInfo, outputStateTreeIndex, message)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}

async function closeCompressedAccount(
  rpc: Rpc,
  compressedAccount: CompressedAccountWithMerkleContext,
  program: anchor.Program<Close>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  message: string,
) {
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const proofRpcResult = await rpc.getValidityProofV0(
    [
      {
        hash: compressedAccount.hash,
        tree: compressedAccount.treeInfo.tree,
        queue: compressedAccount.treeInfo.queue,
      },
    ],
    [],
  );

  const merkleTreePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.tree,
  );
  const queuePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.queue,
  );
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  const coder = new anchor.BorshCoder(closeIdl as anchor.Idl);
  const currentAccount = coder.types.decode(
    "MyCompressedAccount",
    compressedAccount.data.data,
  );

  const compressedAccountMeta = {
    treeInfo: {
      merkleTreePubkeyIndex,
      queuePubkeyIndex,
      leafIndex: compressedAccount.leafIndex,
      proveByIndex: false,
      rootIndex: proofRpcResult.rootIndices[0],
    },
    address: compressedAccount.address,
    outputStateTreeIndex,
  };

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .closeAccount(proof, compressedAccountMeta, message)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
// Reinitialize Compressed Account Example
import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Reinit } from "../target/types/reinit";
import reinitIdl from "../target/idl/reinit.json";
import {
  bn,
  CompressedAccountWithMerkleContext,
  confirmTx,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  deriveAddressSeed,
  LightSystemProgram,
  PackedAccounts,
  Rpc,
  sleep,
  SystemAccountMetaConfig,
} from "@lightprotocol/stateless.js";
import * as assert from "assert";

const path = require("path");
const os = require("os");
require("dotenv").config();

const anchorWalletPath = path.join(os.homedir(), ".config/solana/id.json");
process.env.ANCHOR_WALLET = anchorWalletPath;

describe("test-anchor-reinit", () => {
  const reinitProgram = anchor.workspace.Reinit as Program<Reinit>;
  const reinitCoder = new anchor.BorshCoder(reinitIdl as anchor.Idl);

  it("reinitialize compressed account", async () => {
    let signer = new web3.Keypair();
    let rpc = createRpc(
      "http://127.0.0.1:8899",
      "http://127.0.0.1:8784",
      "http://127.0.0.1:3001",
      {
        commitment: "confirmed",
      },
    );
    let lamports = web3.LAMPORTS_PER_SOL;
    await rpc.requestAirdrop(signer.publicKey, lamports);
    await sleep(2000);

    const outputStateTree = defaultTestStateTreeAccounts().merkleTree;
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;

    const messageSeed = new TextEncoder().encode("message");
    const seed = deriveAddressSeed(
      [messageSeed, signer.publicKey.toBytes()],
      new web3.PublicKey(reinitProgram.idl.address),
    );
    const address = deriveAddress(seed, addressTree);

    const createTxId = await createCompressedAccount(
      rpc,
      addressTree,
      addressQueue,
      address,
      reinitProgram,
      outputStateTree,
      signer,
      "Hello, compressed world!",
    );
    console.log("Create Transaction ID:", createTxId);

    // Wait for indexer to process the transaction
    let slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    let compressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    let myAccount = reinitCoder.types.decode(
      "MyCompressedAccount",
      compressedAccount.data.data,
    );
    assert.strictEqual(myAccount.message, "Hello, compressed world!");
    assert.ok(myAccount.owner.equals(signer.publicKey), "Owner should match signer public key");
    console.log("Created message:", myAccount.message);

    const closeTxId = await closeCompressedAccount(
      rpc,
      compressedAccount,
      reinitProgram,
      outputStateTree,
      signer,
      "Hello, compressed world!",
    );
    console.log("Close Transaction ID:", closeTxId);

    // Wait for indexer to process the close transaction
    slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    let closedCompressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));

    // The getValidityProofV0 call will fetch the current closed account state.
    const reinitTxId = await reinitCompressedAccount(
      rpc,
      closedCompressedAccount,
      reinitProgram,
      outputStateTree,
      signer,
    );
    console.log("Reinit Transaction ID:", reinitTxId);

    // Wait for indexer to process the reinit transaction
    slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    // Verify the account was reinitialized with default values
    let reinitializedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    let reinitMyAccount = reinitCoder.types.decode(
      "MyCompressedAccount",
      reinitializedAccount.data.data,
    );
    assert.strictEqual(reinitMyAccount.message, "", "Message should be empty (default)");
    assert.ok(
      reinitMyAccount.owner.equals(web3.PublicKey.default),
      "Owner should be default PublicKey"
    );
    console.log("Compressed account was reinitialized with default values");
  });
});

async function createCompressedAccount(
  rpc: Rpc,
  addressTree: anchor.web3.PublicKey,
  addressQueue: anchor.web3.PublicKey,
  address: anchor.web3.PublicKey,
  program: anchor.Program<Reinit>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  message: string,
) {
  const proofRpcResult = await rpc.getValidityProofV0(
    [],
    [
      {
        tree: addressTree,
        queue: addressQueue,
        address: bn(address.toBytes()),
      },
    ],
  );
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const addressMerkleTreePubkeyIndex =
    remainingAccounts.insertOrGet(addressTree);
  const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(addressQueue);
  const packedAddressTreeInfo = {
    rootIndex: proofRpcResult.rootIndices[0],
    addressMerkleTreePubkeyIndex,
    addressQueuePubkeyIndex,
  };
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .createAccount(proof, packedAddressTreeInfo, outputStateTreeIndex, message)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}

async function closeCompressedAccount(
  rpc: Rpc,
  compressedAccount: CompressedAccountWithMerkleContext,
  program: anchor.Program<Reinit>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  message: string,
) {
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const proofRpcResult = await rpc.getValidityProofV0(
    [
      {
        hash: compressedAccount.hash,
        tree: compressedAccount.treeInfo.tree,
        queue: compressedAccount.treeInfo.queue,
      },
    ],
    [],
  );

  const merkleTreePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.tree,
  );
  const queuePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.queue,
  );
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  const coder = new anchor.BorshCoder(reinitIdl as anchor.Idl);
  const currentAccount = coder.types.decode(
    "MyCompressedAccount",
    compressedAccount.data.data,
  );

  const compressedAccountMeta = {
    treeInfo: {
      merkleTreePubkeyIndex,
      queuePubkeyIndex,
      leafIndex: compressedAccount.leafIndex,
      proveByIndex: false,
      rootIndex: proofRpcResult.rootIndices[0],
    },
    address: compressedAccount.address,
    outputStateTreeIndex,
  };

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .closeAccount(proof, compressedAccountMeta, message)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}

async function reinitCompressedAccount(
  rpc: Rpc,
  compressedAccount: CompressedAccountWithMerkleContext,
  program: anchor.Program<Reinit>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
) {
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const proofRpcResult = await rpc.getValidityProofV0(
    [
      {
        hash: compressedAccount.hash,
        tree: compressedAccount.treeInfo.tree,
        queue: compressedAccount.treeInfo.queue,
      },
    ],
    [],
  );

  const merkleTreePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.tree,
  );
  const queuePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.queue,
  );
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  const compressedAccountMeta = {
    treeInfo: {
      merkleTreePubkeyIndex,
      queuePubkeyIndex,
      leafIndex: compressedAccount.leafIndex,
      proveByIndex: false,
      rootIndex: proofRpcResult.rootIndices[0],
    },
    address: compressedAccount.address,
    outputStateTreeIndex,
  };

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .reinitAccount(proof, compressedAccountMeta)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
// Burn Compressed Account Example
import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Burn } from "../target/types/burn";
import burnIdl from "../target/idl/burn.json";
import {
  bn,
  CompressedAccountWithMerkleContext,
  confirmTx,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  deriveAddressSeed,
  LightSystemProgram,
  PackedAccounts,
  Rpc,
  sleep,
  SystemAccountMetaConfig,
} from "@lightprotocol/stateless.js";
import * as assert from "assert";

const path = require("path");
const os = require("os");
require("dotenv").config();

const anchorWalletPath = path.join(os.homedir(), ".config/solana/id.json");
process.env.ANCHOR_WALLET = anchorWalletPath;

describe("test-anchor-burn", () => {
  const burnProgram = anchor.workspace.Burn as Program<Burn>;
  const burnCoder = new anchor.BorshCoder(burnIdl as anchor.Idl);

  it("burn compressed account", async () => {
    let signer = new web3.Keypair();
    let rpc = createRpc(
      "http://127.0.0.1:8899",
      "http://127.0.0.1:8784",
      "http://127.0.0.1:3001",
      {
        commitment: "confirmed",
      },
    );
    let lamports = web3.LAMPORTS_PER_SOL;
    await rpc.requestAirdrop(signer.publicKey, lamports);
    await sleep(2000);

    const outputStateTree = defaultTestStateTreeAccounts().merkleTree;
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;

    const messageSeed = new TextEncoder().encode("message");
    const seed = deriveAddressSeed(
      [messageSeed, signer.publicKey.toBytes()],
      new web3.PublicKey(burnProgram.idl.address),
    );
    const address = deriveAddress(seed, addressTree);

    // Step 1: Create compressed account with initial message
    const createTxId = await createCompressedAccount(
      rpc,
      addressTree,
      addressQueue,
      address,
      burnProgram,
      outputStateTree,
      signer,
      "Hello, compressed world!",
    );
    console.log("Create Transaction ID:", createTxId);

    // Wait for indexer to process the create transaction
    let slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    // Step 2: Get the created account and verify
    let compressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()));
    let myAccount = burnCoder.types.decode(
      "MyCompressedAccount",
      compressedAccount.data.data,
    );
    assert.strictEqual(myAccount.message, "Hello, compressed world!");
    assert.ok(myAccount.owner.equals(signer.publicKey), "Owner should match signer public key");
    console.log("Created message:", myAccount.message);

    // Step 3: Burn the account permanently
    const burnTxId = await burnCompressedAccount(
      rpc,
      compressedAccount,
      burnProgram,
      signer,
      "Hello, compressed world!",
    );
    console.log("Burn Transaction ID:", burnTxId);

    // Wait for indexer to process the burn transaction
    slot = await rpc.getSlot();
    await rpc.confirmTransactionIndexed(slot);

    // Step 4: Verify the account is burned (does not exist)
    try {
      await rpc.getCompressedAccount(bn(address.toBytes()));
      assert.fail("Expected account to not exist after burning");
    } catch (error: any) {
      // Account should not exist after burn
      console.log("Verified account was burned");
    }
  });
});

async function createCompressedAccount(
  rpc: Rpc,
  addressTree: anchor.web3.PublicKey,
  addressQueue: anchor.web3.PublicKey,
  address: anchor.web3.PublicKey,
  program: anchor.Program<Burn>,
  outputStateTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair,
  message: string,
) {
  const proofRpcResult = await rpc.getValidityProofV0(
    [],
    [
      {
        tree: addressTree,
        queue: addressQueue,
        address: bn(address.toBytes()),
      },
    ],
  );
  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const addressMerkleTreePubkeyIndex =
    remainingAccounts.insertOrGet(addressTree);
  const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(addressQueue);
  const packedAddressTreeInfo = {
    rootIndex: proofRpcResult.rootIndices[0],
    addressMerkleTreePubkeyIndex,
    addressQueuePubkeyIndex,
  };
  const outputStateTreeIndex =
    remainingAccounts.insertOrGet(outputStateTree);

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .createAccount(proof, packedAddressTreeInfo, outputStateTreeIndex, message)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}

async function burnCompressedAccount(
  rpc: Rpc,
  compressedAccount: CompressedAccountWithMerkleContext,
  program: anchor.Program<Burn>,
  signer: anchor.web3.Keypair,
  currentMessage: string,
) {
  const proofRpcResult = await rpc.getValidityProofV0(
    [
      {
        hash: compressedAccount.hash,
        tree: compressedAccount.treeInfo.tree,
        queue: compressedAccount.treeInfo.queue,
      },
    ],
    [],
  );

  const systemAccountConfig = new SystemAccountMetaConfig(program.programId);
  let remainingAccounts = new PackedAccounts();
  remainingAccounts.addSystemAccounts(systemAccountConfig);

  const merkleTreePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.tree,
  );
  const queuePubkeyIndex = remainingAccounts.insertOrGet(
    compressedAccount.treeInfo.queue,
  );

  // CompressedAccountMetaBurn does not have output_state_tree_index
  const compressedAccountMeta = {
    treeInfo: {
      merkleTreePubkeyIndex,
      queuePubkeyIndex,
      leafIndex: compressedAccount.leafIndex,
      proveByIndex: false,
      rootIndex: proofRpcResult.rootIndices[0],
    },
    address: compressedAccount.address,
  };

  let proof = {
    0: proofRpcResult.compressedProof,
  };
  const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  let tx = await program.methods
    .burnAccount(proof, compressedAccountMeta, currentMessage)
    .accounts({
      signer: signer.publicKey,
    })
    .preInstructions([computeBudgetIx])
    .remainingAccounts(remainingAccounts.toAccountMetas().remainingAccounts)
    .signers([signer])
    .transaction();
  tx.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
  tx.sign(signer);

  const sig = await rpc.sendTransaction(tx, [signer]);
  await confirmTx(rpc, sig);
  return sig;
}
```
{% endcode %}

## Next Steps

Start building programs to create, or interact with compressed accounts.

{% content-ref url="../guides/" %}
[guides](../guides/)
{% endcontent-ref %}
