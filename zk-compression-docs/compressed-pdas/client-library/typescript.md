---
description: >-
  Build a TypeScript client with Rpc or TestRpc to create, update, and close
  compressed accounts. Includes a step-by-step implementation guide and full
  code examples.
---

# Typescript

The TypeScript Client SDK provides two abstractions to create or interact with compressed accounts:

* **For local testing**, use [`TestRpc`](https://www.zkcompression.com/resources/sdks/typescript-client#testrpc).
  * `TestRpc` is an RPC implementation with in-memory indexer and without external dependencies.
  * It parses events and builds Merkle trees on-demand without persisting state.
* **For test-validator, devnet and mainnet** use [`Rpc`](https://www.zkcompression.com/resources/sdks/typescript-client#rpc)
  * `Rpc` is a thin wrapper extending Solana's web3.js `Connection` class with compression-related endpoints. Find a [full list of JSON RPC methods here](https://www.zkcompression.com/resources/json-rpc-methods).
  * It connects to the Photon indexer that tracks compressed state to query compressed accounts and the prover service for validity proofs.
* `Rpc` and `TestRpc` implement the same `CompressionApiInterface`. Seamlessly switch between `TestRpc`, local test validator with `Rpc`, and public Solana networks.

{% hint style="success" %}
Find [full code examples for a counter program](typescript.md#full-code-example) at the end for Anchor.&#x20;
{% endhint %}

{% tabs %}
{% tab title="Create" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Derive unique compressed account address
</strong><strong>   ├─ Fetch validity proof (proves that address doesn't exist)
</strong><strong>   ├─ Pack accounts and build instruction
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Derive and check address
      ├─ Initialize compressed account
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify validity proof (non-inclusion)
         ├─ Create address (address tree)
         ├─ Create compressed account (state tree)
         └─ Complete atomic account creation
</code></pre>
{% endtab %}

{% tab title="Update" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch current account data
</strong><strong>   ├─ Fetch validity proof (proves that account exists)
</strong><strong>   ├─ Build instruction with proof, current data, new data and metadata
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing compressed account hash (input hash)
      ├─ Modify compressed account data (output)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify and nullify input hash
         ├─ Create new compressed account hash with updated data (output hash)
         └─ Complete atomic account update
</code></pre>
{% endtab %}

{% tab title="Close" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch current account data
</strong><strong>   ├─ Fetch validity proof (proves that account exists)
</strong><strong>   ├─ Build instruction with proof, current data and metadata
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing compressed account hash (input hash)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify input hash
         ├─ Nullify input hash
         └─ Create DEFAULT_DATA_HASH with zero discriminator (output)
</code></pre>
{% endtab %}

{% tab title="Reinitialize" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch closed account metadata
</strong><strong>   ├─ Fetch validity proof (proves closed account hash exists)
</strong><strong>   ├─ Build instruction with proof and new data
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing closed account hash (input hash)
      ├─ Initialize account with new data (output)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify input hash exists
         ├─ Nullify input hash
         ├─ Create new account with new hash and default values at same address
         └─ Complete atomic account reinitialization
</code></pre>
{% endtab %}

{% tab title="Burn" %}
<pre><code><strong>𝐂𝐋𝐈𝐄𝐍𝐓
</strong><strong>   ├─ Fetch current account data
</strong><strong>   ├─ Fetch validity proof (proves that account exists)
</strong><strong>   ├─ Build instruction with proof and current data
</strong><strong>   └─ Send transaction
</strong>      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing compressed account hash (input hash)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify input hash
         ├─ Nullify input hash (permanent)
         └─ No output state created
</code></pre>
{% endtab %}
{% endtabs %}

## Implementation Guide

{% stepper %}
{% step %}
### Dependencies

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

{% tab title="pnpm" %}
```bash
pnpm add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @lightprotocol/zk-compression-cli
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
`@lightprotocol/stateless.js` provides the core SDK to create and interact with compressed accounts, including `Rpc` and `TestRpc` classes.
{% endhint %}
{% endstep %}

{% step %}
### Environment

{% tabs %}
{% tab title="Rpc" %}
Connect to local, devnet or mainnet with `Rpc`.

{% tabs %}
{% tab title="Mainnet" %}
```typescript
import { Rpc } from '@lightprotocol/stateless.js';

const rpc = new Rpc(
  'https://api.mainnet-beta.solana.com',
  'https://mainnet.helius.xyz',
  'https://prover.mainnet.example.com',
  undefined,
  { apiKey: 'YOUR_API_KEY' }
);
```
{% endtab %}

{% tab title="Devnet" %}
```typescript
import { Rpc } from '@lightprotocol/stateless.js';

const rpc = new Rpc(
  'https://api.devnet.solana.com',
  'https://devnet.helius.xyz',
  'https://prover.devnet.example.com',
  undefined,
  { apiKey: 'YOUR_API_KEY' }
);
```
{% endtab %}

{% tab title="Localnet" %}
```typescript
import { Rpc } from '@lightprotocol/stateless.js';

const rpc = new Rpc(
  'http://127.0.0.1:8899',
  'http://127.0.0.1:8784',
  'http://127.0.0.1:3001'
);
```

* Requires running `light test-validator` locally
{% endtab %}
{% endtabs %}
{% endtab %}

{% tab title="TestRpc" %}
Set up test environment with `TestRpc`.

```typescript
import { getTestRpc } from '@lightprotocol/stateless.js';
import { LightWasm, WasmFactory } from '@lightprotocol/hasher.rs';

const lightWasm: LightWasm = await WasmFactory.getInstance();
const testRpc = await getTestRpc(lightWasm);
```
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Tree Configuration

Before creating a compressed account, your client must fetch metadata for two Merkle trees:

* an address tree to derive and store the account address and
* a state tree to store the account hash.

{% hint style="success" %}
The protocol maintains Merkle trees at fixed addresses. You don't need to initialize custom trees. See the [addresses for Merkle trees here](https://www.zkcompression.com/resources/addresses-and-urls).
{% endhint %}

```typescript
const addressTree = await rpc.getAddressTreeV1();
const stateTree = await rpc.getRandomStateTreeInfo();
```

Fetch metadata of trees with:

* `getAddressTreeV1()` to return the `TreeInfo` interface with the public key and other metadata for the address tree.
  * Used to derive addresses with `deriveAddress()` and
  * for `get_validity_proof()` to prove the address does not exist yet to avoid duplicate addresses.
* `getRandomStateTreeInfo()` to return the `TreeInfo` interface with the public key and other metadata for a random state tree to store the compressed account hash.
  * Selecting a random state tree prevents write-lock contention on state trees and increases throughput.
  * Account hashes can move to different state trees after each state transition.
  * Best practice is to minimize different trees per transaction. Still, since trees may fill up over time, programs must handle accounts from different state trees within the same transaction.

{% hint style="info" %}
The `TreeInfo` interface contains metadata for a Merkle tree:

* `tree`: Merkle tree account pubkey
* `queue`: Queue account pubkey. Under the hood, hashes and addresses are inserted into a queue before being asynchronously inserted into a Merkle tree. The client and custom program do not interact with the queue.
* `tree_type`: Identifies tree version (StateV1, AddressV1) and account for hash insertion.
* `cpi_context` includes an optional CPI context account for shared proof verification of multiple programs.
{% endhint %}
{% endstep %}

{% step %}
### Derive Address

Derive a persistent address as a unique identifier for your compressed account with `deriveAddress()`.

```typescript
const seed = Buffer.from('my-seed');
const address = deriveAddress(
  [seed],
  addressTree,
  programId
);
```

**Pass these parameters**:

* `[seed]`: Arbitrary byte slices that uniquely identify the account
* `addressTree` to specify the tree pubkey. This parameter ensures an address is unique to an address tree. Different trees produce different addresses from identical seeds.
* `programId` to specify the program owner pubkey.

{% hint style="info" %}
Use the same `addressTree` for both `deriveAddress()` and all subsequent operations on that account in your client and program.
{% endhint %}
{% endstep %}

{% step %}
### Validity Proof

Fetch a zero-knowledge proof (Validity proof) from your RPC provider that supports ZK Compression (Helius, Triton, ...). What is proved depends on the operation:

* To create a compressed account, you must prove the **address doesn't already exist** in the address tree (_non-inclusion proof_).
* To update or close a compressed account, you must **prove the account hash exists** in a state tree (_inclusion proof_).

{% hint style="info" %}
[Here's a full guide](https://www.zkcompression.com/resources/json-rpc-methods/getvalidityproof) to the `getValidityProof()` method.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```typescript
const proof = await rpc.getValidityProof(
  [],
  [{ address, tree: addressTree }]
);
```

**Pass these parameters**:

* Leave (`[]`) empty to create compressed accounts, since no compressed account exists yet to reference.
* Specify in (`[{ address, tree: addressTree }]`) the new address to create with its address tree.

The RPC returns validity proof context with

* the non-inclusion `compressedProof`, passed to the program in the instruction data,
* `newAddressParams` with the tree metadata for your address (tree, root, leaf index), and
* an empty `merkleTrees` field when you create a compressed account, since you did not reference an existing account.
{% endtab %}

{% tab title="Update & Close" %}
{% hint style="info" %}
**Update and Close** use identical proof mechanisms. The difference is in your program's instruction handler.
{% endhint %}

```typescript
const hash = compressedAccount.hash;

const proof = await rpc.getValidityProof(
  [hash],
  []
);
```

**Pass these parameters**:

* Specify in (`[hash]`) the hash of the existing compressed account to prove its existence in the state tree.
* Leave (`[]`) empty, since the proof verifies the account hash exists in a state tree, not the address in an address tree.

The RPC returns validity proof context with

* the inclusion `compressedProof`, passed to the program in the instruction data,
* `merkleTrees` with the tree metadata for the account hash (tree, root, leaf index), and
* an empty `newAddressParams` field, since you don't create a new address.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Pack Accounts

Compressed account instructions require packing accounts into the `remainingAccounts` array.

{% hint style="info" %}
**"Packing" accounts optimizes instruction size:**

* **Packed structs** (e.g., `PackedAddressTreeInfo`, `PackedMerkleTreeInfo`) contain account **indices** (u8) instead of 32 byte pubkeys. The indices point to the `remainingAccounts` array.
* **Non-Packed structs** contain full pubkeys. RPC methods return full pubkeys.
{% endhint %}

#### 1. Initialize Account Arrays

```typescript
let remainingAccounts: AccountMeta[] = [];
let accountsOffset = 0;
```

Initialize `remainingAccounts` to collect `AccountMeta` objects (containing `pubkey`, `isWritable`, `isSigner` properties). `accountsOffset` tracks the current index position and increments as accounts are added.

The array organizes accounts into three logical sections:

1. `pre_accounts` includes the signers, fee payer, and any program-specific accounts.
2. `system_accounts` includes eight accounts the Light System program requires to create or interact with compressed accounts.
3. `packed_accounts` includes Merkle tree and queue accounts returned from the `getValidityProof()` response in the previous step.

You will populate the array in the next steps.

```
[preAccounts] [systemAccounts] [treeAccounts]
       ↑                ↑                  ↑
    Signers,       Light system      state trees,
   fee payer   program accounts    address trees

```

#### 2. Add Light System Accounts

Add the Light System accounts your program needs to create and interact with compressed via CPI to the Light System Program.

```typescript
const systemAccounts = getSystemAccounts(programId);
remainingAccounts.push(...systemAccounts);
accountsOffset += systemAccounts.length;
```

* Pass your program ID in `getSystemAccounts(programId)` to derive the CPI signer PDA
* `getSystemAccounts()` returns 8 Light System accounts in the sequence below - add them to `remainingAccounts` and increment `accountsOffset` to track the next available index.

<details>

<summary><em>System Accounts List</em></summary>

| # | Account                            | Purpose                                                                                                                                                                                        |
| - | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Light System Program\[^1]          | Verifies validity proofs and executes CPI calls to create or interact with compressed accounts                                                                                                 |
| 2 | CPI Signer\[^2]                    | <p>- Signs CPI calls from your program to Light System Program<br>- PDA verified by Light System Program during CPI<br>- Derived from your program ID</p>                                      |
| 3 | Registered Program PDA             | <p>- Proves your program can interact with Account Compression Program<br>- Prevents unauthorized programs from modifying compressed account state</p>                                         |
| 4 | Noop Program\[^3]                  | <p>- Logs compressed account state to Solana ledger<br>- Indexers parse transaction logs to reconstruct compressed account state</p>                                                           |
| 5 | Account Compression Authority\[^4] | Signs CPI calls from Light System Program to Account Compression Program                                                                                                                       |
| 6 | Account Compression Program\[^5]   | <p>- Writes to state and address tree accounts<br>- Client and program do not directly interact with this program</p>                                                                          |
| 7 | Invoking Program                   | <p>Your program's ID, used by Light System Program to:<br>- Derive the CPI Signer PDA<br>- Verify the CPI Signer matches your program ID<br>- Set the owner of created compressed accounts</p> |
| 8 | System Program\[^6]                | Solana System Program to create accounts or transfer lamports                                                                                                                                  |

</details>

#### 3. Pack Tree Accounts from Validity Proof

`getValidityProof()` returns pubkeys and other metadata of Merkle trees. With `packTreeInfos()`, you convert the pubkeys to u8 indices that reference positions in `remainingAccounts` to optimize your instruction data.

{% tabs %}
{% tab title="Create" %}
```typescript
const packedTreeInfos = packTreeInfos(
  remainingAccounts,
  [],
  proof.newAddressParams
);

const packedAddressTrees = packedTreeInfos.addressTrees;
```

* `packTreeInfos()` extracts Merkle tree pubkeys from validity proof and adds them to `remainingAccounts`
* `.addressTrees` returns `PackedAddressTreeInfo[]` that specifies where to create the address:
  * `addressMerkleTreePubkeyIndex` points to the address tree account in `remainingAccounts`
  * `addressQueuePubkeyIndex` points to the address queue account in `remainingAccounts`
  * `rootIndex` specifies the Merkle root to verify the address does not exist in the address tree
{% endtab %}

{% tab title="Update & Close" %}
```typescript
const packedTreeInfos = packTreeInfos(
  remainingAccounts,
  proof.merkleTrees,
  []
);

const packedMerkleTrees = packedTreeInfos.stateTrees.packedTreeInfos;
```

* `packTreeInfos()` extracts Merkle tree pubkeys from validity proof and adds them to `remainingAccounts`
* `.stateTrees` returns `PackedStateTreeInfos` that points to the existing account hash:
  * `merkleTreePubkeyIndex` points to the state tree account in `remainingAccounts`
  * `leafIndex` specifies which leaf position contains the account hash
  * `rootIndex` specifies the Merkle root to verify the account hash exists in the state tree
{% endtab %}
{% endtabs %}

#### 4. Add Output State Tree

```typescript
const outputStateTree = await rpc.getRandomStateTreeInfo();
const outputTreeIndex = accountsOffset;

remainingAccounts.push({
  pubkey: outputStateTree.pubkey,
  isSigner: false,
  isWritable: true
});
```

* `getRandomStateTreeInfo()` returns the `TreeInfo` interface with the pubkey and other metadata of a state tree to store the new account hash
* Capture `accountsOffset` as `outputTreeIndex` before pushing - this will be the index position after the push
* Push an `AccountMeta` object to `remainingAccounts` with:
  * `pubkey`: The state tree's pubkey
  * `isSigner: false`: The state tree account does not sign the transaction
  * `isWritable: true`: The state tree will be modified to store the new account hash

#### 5. Summary

You initialized the `remainingAccounts` array to merge the following accounts for the instruction:

* Light System accounts to create and interact with compressed accounts via the Light System Program.
* Tree accounts from the validity proof to prove address non-existence (create), or existence of the account hash (update/close).
* The output state tree to store the new account hash.

The accounts receive a sequential index. Instruction data references accounts via these indices in this order.
{% endstep %}

{% step %}
### Instruction Data

Build your instruction data with the validity proof, tree account indices, and complete account data.

{% hint style="info" %}
Compressed account data must be passed in instruction data, since only a hash is stored on-chain. This is unlike Solana accounts, where programs can read data directly from accounts.

The program hashes this data and the Light System Program verifies the hash against the root in a Merkle tree account to ensure its correctness.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```typescript
const instructionData = {
  proof: proof.compressedProof,
  addressTreeInfo: packedAddressTrees[0],
  outputStateTreeIndex: outputTreeIndex,
};
```

1. **Non-inclusion Proof**

* Add the `compressedProof` you fetched with `getValidityProof()` from your RPC provider to prove that the address does not exist yet in the specified address tree (non-inclusion).

2. **Specify Merkle trees to store address and account hash**

Include the Merkle tree metadata fetched in Step 3:

* `PackedAddressTreeInfo` specifies the index to the address tree account used to derive the address. The index points to the address tree account in `remainingAccounts`.
* `outputStateTreeIndex` points to the state tree account in `remainingAccounts` that will store the compressed account hash.

3. **Pass initial account data**

* The counter program initializes the account to 0, wherefore no new value needs to be passed.
* If your program requires initial data, add custom fields to your instruction struct.
{% endtab %}

{% tab title="Update" %}
```typescript
const instructionData = {
  proof: proof.compressedProof,
  counterValue: currentCounterValue,
  accountMeta: {
    treeInfo: packedMerkleTrees[0],
    address: compressedAccount.address,
    outputStateTreeIndex: outputTreeIndex
  },
};
```

1. **Inclusion Proof**

* Add the `compressedProof` you fetched with `getValidityProof()` from your RPC provider to prove the account exists in the state tree (inclusion).

2. **Specify input hash and output state tree**

Include the Merkle tree metadata fetched in Step 3:

* `accountMeta` points to the input hash and specifies the output state tree with these fields:
  * `treeInfo: PackedMerkleTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index) so the Light System Program can mark it as nullified
  * `address` specifies the account's derived address
  * `outputStateTreeIndex` points to the state tree that will store the updated compressed account hash

3. **Pass current account data**

* Pass the complete current account data. The program reconstructs the existing account hash from this data to verify it matches the hash in the state tree.
* In this example, we pass the current `counterValue`, before incrementing.
{% endtab %}

{% tab title="Close" %}
```typescript
const instructionData = {
  proof: proof.compressedProof,
  counterValue: currentCounterValue,
  accountMeta: {
    treeInfo: packedMerkleTrees[0],
    address: compressedAccount.address,
    outputStateTreeIndex: outputTreeIndex
  },
};
```

1. **Inclusion Proof**

* Add the `compressedProof` you fetched with `getValidityProof()` from your RPC provider to prove the account exists in the state tree (inclusion).

2. **Specify input hash and output state tree**

Include the Merkle tree metadata fetched in Step 3:

* `accountMeta` points to the input hash and specifies the output state tree:
  * `treeInfo: PackedMerkleTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index).
  * `address` specifies the account's derived address.
  * `outputStateTreeIndex` points to the state tree that will store the output hash with zero values.

3. **Pass current account data**

* Pass the complete current account data. The program reconstructs the existing account hash from this data to verify it matches the hash in the state tree.
* In this example, we pass the current `counterValue`, before closing.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Instruction

Build a `TransactionInstruction` with your `program_id`, `accounts`, and `data` from Step 7. Pass the `remainingAccounts` array you built in Step 6.

```typescript
const instruction = await program.methods
  .createCounter(instructionData.proof, instructionData.addressTreeInfo, instructionData.outputStateTreeIndex)
  .accounts({
    signer: payer.publicKey
  })
  .remainingAccounts(remainingAccounts)
  .instruction();
```

**What to include in `accounts`:**

1. **Define program-specific accounts** in `.accounts()` with any accounts your program requires - these won't interfere with compression-related accounts.
2. **Add the Light System and Merkle tree accounts** with `.remainingAccounts(remainingAccounts)` to the instruction's account list.
3. **Build the complete instruction with `.instruction()`**:

* Anchor converts `.accounts({ signer })` to `AccountMeta[]` with the program's IDL account metadata. These accounts have fixed indices defined by the IDL.
* `.remainingAccounts()` appends the Light System and Merkle tree accounts after named accounts.
* Returns `TransactionInstruction` with `programId`, merged `keys` (all accounts concatenated), and serialized instruction `data`.

```
[0]    Your program accounts (signer, etc.)
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues (from validity proof)
```
{% endstep %}

{% step %}
### Send Transaction

Submit the instruction to the network.

```typescript
const transaction = new Transaction().add(instruction);
const signature = await sendAndConfirmTransaction(
  rpc,
  transaction,
  [payer]
);
```
{% endstep %}
{% endstepper %}

## Full Code Example

The full code example below shows you how to create a counter with Anchor.

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Anchor" %}


{% hint style="success" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/anchor/tests/test.ts#L54).
{% endhint %}

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import idl from "../target/idl/counter.json";
import {
  bn,
  CompressedAccountWithMerkleContext,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  deriveAddressSeed,
  LightSystemProgram,
  Rpc,
  sleep,
} from "@lightprotocol/stateless.js";
import { assert } from "chai";

const path = require("path");
const os = require("os");
require("dotenv").config();

const anchorWalletPath = path.join(os.homedir(), ".config/solana/id.json");
process.env.ANCHOR_WALLET = anchorWalletPath;

describe("test-anchor", () => {
  const program = anchor.workspace.Counter as Program<Counter>;
  const coder = new anchor.BorshCoder(idl as anchor.Idl);

  it("", async () => {
    let signer = new web3.Keypair();
    let rpc = createRpc(
      "http://127.0.0.1:8899",
      "http://127.0.0.1:8784",
      "http://127.0.0.1:3001",
      {
        commitment: "confirmed",
      }
    );
    let lamports = web3.LAMPORTS_PER_SOL;
    await rpc.requestAirdrop(signer.publicKey, lamports);
    await sleep(2000);

    const outputMerkleTree = defaultTestStateTreeAccounts().merkleTree;
    const addressTree = defaultTestStateTreeAccounts().addressTree;
    const addressQueue = defaultTestStateTreeAccounts().addressQueue;

    const counterSeed = new TextEncoder().encode("counter");
    const seed = deriveAddressSeed(
      [counterSeed, signer.publicKey.toBytes()],
      new web3.PublicKey(program.idl.address)
    );
    const address = deriveAddress(seed, addressTree);

    await CreateCounterCompressedAccount(
      rpc,
      addressTree,
      addressQueue,
      address,
      program,
      outputMerkleTree,
      signer
    );
  });
});

async function CreateCounterCompressedAccount(
  rpc: Rpc,
  addressTree: anchor.web3.PublicKey,
  addressQueue: anchor.web3.PublicKey,
  address: anchor.web3.PublicKey,
  program: anchor.Program<Counter>,
  outputMerkleTree: anchor.web3.PublicKey,
  signer: anchor.web3.Keypair
) {
  {
    const proofRpcResult = await rpc.getValidityProofV0(
      [],
      [
        {
          tree: addressTree,
          queue: addressQueue,
          address: bn(address.toBytes()),
        },
      ]
    );
    const systemAccountConfig = SystemAccountMetaConfig.new(program.programId);
    let remainingAccounts =
      PackedAccounts.newWithSystemAccounts(systemAccountConfig);

    const addressMerkleTreePubkeyIndex =
      remainingAccounts.insertOrGet(addressTree);
    const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(addressQueue);
    const packedAddreesMerkleContext = {
      rootIndex: proofRpcResult.rootIndices[0],
      addressMerkleTreePubkeyIndex,
      addressQueuePubkeyIndex,
    };
    const outputMerkleTreeIndex =
      remainingAccounts.insertOrGet(outputMerkleTree);

    let proof = {
      0: proofRpcResult.compressedProof,
    };
    const computeBudgetIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });
    let tx = await program.methods
      .createCounter(proof, packedAddreesMerkleContext, outputMerkleTreeIndex)
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
    await rpc.confirmTransaction(sig);
    console.log("Created counter compressed account ", sig);
  }
}
```

{% hint style="info" %}
Helper classes (`PackedAccounts`, `SystemAccountMetaConfig`, `getLightSystemAccountMetas`, `SystemAccountPubkeys`) are available in the [complete source code](https://github.com/Lightprotocol/program-examples/blob/3a9ff76d0b8b9778be0e14aaee35e041cabfb8b2/counter/anchor/tests/test.ts#L54).
{% endhint %}
{% endtab %}
{% endtabs %}

## Next Steps

Start building programs to create, update, or close compressed accounts.

{% content-ref url="../guides/" %}
[guides](../guides/)
{% endcontent-ref %}
