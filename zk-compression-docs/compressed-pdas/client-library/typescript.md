---
description: >-
  Build a Typescript client to create or interact with compressed accounts.
  Includes a step-by-step implementation guide and full code examples.
---

# Typescript

The TypeScript Client SDK provides two test environments:

* **For local testing, use `TestRpc`.**
  * `TestRpc` provides a fully initialized test environment with auto-funded keypair, a test indexer, Light System Programs, and Merkle tree accounts.
  * Parses events and builds Merkle trees on-demand to generate proofs instantly without persisting state.
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
  * for `getValidityProof()` to prove the address does not exist yet.

{% hint style="info" %}
Only needed to create new addresses. Other interactions with compressed accounts fetch it via the existing address (`getCompressedAccount(address)`).
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

{% code overflow="wrap" %}
```typescript
const seed = deriveAddressSeed(
  [Buffer.from('my-seed')],
  programId
);
const address = deriveAddress(seed, addressTree.tree);
```
{% endcode %}

**First, derive the seed**:

* Pass arbitrary byte slices in the array to uniquely identify the account
* Specify `programId` to combine with your seeds

**Then, derive the address**:

* Pass the derived 32-byte `seed` from the first step.
* Specify `addressTree.tree` pubkey. This parameter ensures an address is unique to an address tree. Different trees produce different addresses from identical seeds.

{% hint style="info" %}
Use the same `addressTree` for both `deriveAddress()` and all subsequent operations on that account in your client and program.

* To create a compressed account, pass the address to `getValidityProof()` to prove the address does not exist yet.
* To update/close, use the address to fetch the current account with `getCompressedAccount(address)`.
{% endhint %}
{% endstep %}

{% step %}
**Validity Proof**

Fetch a validity proof from your RPC provider that supports ZK Compression (Helius, Triton, ...). The proof type depends on the operation:

* To create a compressed account, you must prove the **address doesn't already exist** in the address tree.
* To update or close a compressed account, you must **prove its account hash exists** in a state tree.
* You can **combine multiple operations in one proof** to optimize compute cost and instruction data.

{% hint style="info" %}
[Here's a full guide](https://www.zkcompression.com/resources/json-rpc-methods/getvalidityproof) to the `getValidityProof()` method.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```typescript
const proof = await rpc.getValidityProof(
  [],
  [{ address, tree: addressTree.tree, queue: addressTree.queue }]
);
```
{% endcode %}

**Pass these parameters**:

* Leave (`[]`) empty to create compressed accounts, since no compressed account exists yet.
* Specify the new address with its tree and queue pubkeys in `[{ address, tree, queue }]`.

The RPC returns `ValidityProofWithContext` with

* `compressedProof`: The proof that the address does not exist in the address tree, passed to the program in your instruction data.
* `newAddressParams`: An array with address tree public key and metadata to pack accounts in the next step.
* Empty `rootIndices` and `leafIndices` arrays, since no compressed account exists yet.
{% endtab %}

{% tab title="Update & Close" %}
{% hint style="info" %}
**Update and Close** use identical proof mechanisms. The difference is in your program's instruction handler.
{% endhint %}

{% code overflow="wrap" %}
```typescript
const hash = compressedAccount.hash;
const tree = compressedAccount.merkleContext.tree;
const queue = compressedAccount.merkleContext.queue;

const proof = await rpc.getValidityProof(
  [{ hash, tree, queue }],
  []
);
```
{% endcode %}

**Pass these parameters**:

* Specify the account hash with its tree and queue pubkeys in `[{ hash, tree, queue }]`.
* (`[]`) remains empty, since the proof verifies the account hash exists in a state tree, not that the address doesn't exist in an address tree.

The RPC returns `ValidityProofWithContext` with

* `compressedProof`: The proof that the account hash exists in the state tree, passed to the program in your instruction data.
* `rootIndices`, `leafIndices`, and `proveByIndices` arrays with proof metadata to pack accounts in the next step.
* An empty `newAddressParams` array, since you pass no address to the proof, when you update or close a compressed account.
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
const tree = compressedAccount.merkleContext.tree;
const queue = compressedAccount.merkleContext.queue;

const proof = await rpc.getValidityProof(
  [{ hash, tree, queue }],
  [{ address, tree: addressTree.tree, queue: addressTree.queue }]
);
```
{% endcode %}

**Pass these parameters**:

* Specify the existing account hash with its tree and queue pubkeys in `[{ hash, tree, queue }]`.
* Specify the new address with its tree and queue pubkeys in `[{ address, tree, queue }]`.

The RPC returns `ValidityProofWithContext` with

* `compressedProof`: A single combined proof that verifies both the account hash exists in the state tree and the address does not exist in the address tree, passed to the program in your instruction data.
* `newAddressParams` array with address tree public key and metadata to build `PackedAddressTreeInfo` in the next step.
* `rootIndices`, `leafIndices`, and `proveByIndices` arrays with proof metadata to build `PackedStateTreeInfo` in the next step.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
**Pack Accounts**

To minimize instruction data compressed account instructions pack accounts into an array, and send indices that reference these accounts in the instruction data.

{% hint style="info" %}
**"Packing" accounts optimizes instruction size:**

* **Packed structs** contain account **indices** (u8) instead of 32 byte pubkeys. The indices point to the `remainingAccounts` in Anchor.
* **Non-Packed structs** contain full pubkeys. RPC methods return full pubkeys.
{% endhint %}

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
import { PackedAccounts } from '@lightprotocol/stateless.js';

const packedAccounts = new PackedAccounts();
packedAccounts.addSystemAccounts(programId);
```
{% endcode %}

Initialize the helper and populate the 8 Light System accounts:

1. **Import `PackedAccounts`** from `@lightprotocol/stateless.js`.
2. **Create helper instance** with `new PackedAccounts()`.
3. **Add system accounts** with `addSystemAccounts(programId)` to populate indices 0-7.

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
| 4 | Noop Program\[^3]                  | <p>- Logs compressed account state to Solana ledger<br>- Indexers parse transaction logs to reconstruct compressed account state</p>                                                           |
| 5 | Account Compression Authority\[^4] | Signs CPI calls from Light System Program to Account Compression Program                                                                                                                       |
| 6 | Account Compression Program\[^5]   | <p>- Writes to state and address tree accounts<br>- Client and program do not directly interact with this program</p>                                                                          |
| 7 | Invoking Program                   | <p>Your program's ID, used by Light System Program to:<br>- Derive the CPI Signer PDA<br>- Verify the CPI Signer matches your program ID<br>- Set the owner of created compressed accounts</p> |
| 8 | System Program\[^6]                | Solana System Program to create accounts or transfer lamports                                                                                                                                  |

</details>

**3. Pack Tree Accounts from Validity Proof**

`getValidityProof()` returns pubkeys and other metadata of Merkle trees. You will convert the pubkeys to u8 indices that reference accounts in the `remainingAccounts` array to optimize your instruction data.

{% tabs %}
{% tab title="Create" %}
{% code overflow="wrap" %}
```typescript
const addressTreeIndex = packedAccounts.insertOrGet(addressTree.tree);
const addressQueueIndex = packedAccounts.insertOrGet(addressTree.queue);

const packedAddressTreeInfo = {
  addressMerkleTreePubkeyIndex: addressTreeIndex,
  addressQueuePubkeyIndex: addressQueueIndex,
  rootIndex: proof.newAddressParams[0].rootIndex
};
```
{% endcode %}

* Call `insertOrGet()` with each tree and queue pubkey from the validity proof
* Create `PackedAddressTreeInfo` with three fields:

1. `addressMerkleTreePubkeyIndex`: Points to the address tree account in `remainingAccounts`
   * The address tree is used to derive addresses and verify the address does not already exist
2. `addressQueuePubkeyIndex`: Points to the address queue account in `remainingAccounts`
   * The queue buffers new addresses before they are inserted into the address tree
3. `rootIndex`: The Merkle root index from `proof.newAddressParams[0].rootIndex` (Validity Proof step)
   * Specifies the root to verify the address does not exist in the tree
{% endtab %}

{% tab title="Update & Close" %}
{% code overflow="wrap" %}
```typescript
const merkleTreeIndex = packedAccounts.insertOrGet(compressedAccount.merkleContext.tree);
const queueIndex = packedAccounts.insertOrGet(compressedAccount.merkleContext.queue);

const packedStateTreeInfo = {
  merkleTreePubkeyIndex: merkleTreeIndex,
  queuePubkeyIndex: queueIndex,
  leafIndex: proof.leafIndices[0],
  rootIndex: proof.rootIndices[0],
  proveByIndex: false
};
```
{% endcode %}

* Call `insertOrGet()` with the state tree and queue pubkeys from `compressedAccount.merkleContext`
* Create `PackedStateTreeInfo` with five fields:

1. `merkleTreePubkeyIndex`: Points to the state tree account in `remainingAccounts`
   * The state tree stores the existing account hash that Light System Program verifies
2. `queuePubkeyIndex`: Points to the nullifier queue account in `remainingAccounts`
   * The queue tracks nullified (spent) account hashes to prevent double-spending
3. `leafIndex`: The leaf position in the Merkle tree from `proof.leafIndices[0]`
   * Specifies which leaf contains your account hash to verify it exists in the tree
4. `rootIndex`: The Merkle root index from `proof.rootIndices[0]`
   * Specifies the root to verify the account hash against
5. `proveByIndex`: The proof verification mode from the validity proof
   * `false` for StateV1 trees: requires full Merkle proof path from leaf to root
   * `true` for StateV2 trees: account validity established by index position in tree
   * Value comes from `proof.proveByIndex` returned by the RPC
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
const accountMetas = packedAccounts.toAccountMetas();
```
{% endcode %}

Call `toAccountMetas()` to build the complete `AccountMeta[]` array for `.remainingAccounts()`. Packed struct indices reference accounts by their position in this array.

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
const instructionData = {
  proof: proof.compressedProof,
  addressTreeInfo: packedAddressTreeInfo,
  outputStateTreeIndex: outputTreeIndex,
};
```
{% endcode %}

1. **Validity Proof**

* Add the `compressedProof` you fetched to prove that the address does not exist yet in the specified address tree.

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
const instructionData = {
  proof: proof.compressedProof,
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

* Add the `compressedProof` you fetched to prove the account hash exists in the state tree.

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
const instructionData = {
  proof: proof.compressedProof,
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

* Add the `compressedProof` you fetched to prove the account hash exists in the state tree.

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
  .remainingAccounts(accountMetas)
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
npm i -g @lightprotocol/zk-compression-cli
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
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
```
{% endcode %}

{% code overflow="wrap" %}
```typescript
```
{% endcode %}

## Next Steps

Start building programs to create, or interact with compressed accounts.

{% content-ref url="../guides/" %}
[guides](../guides/)
{% endcontent-ref %}
