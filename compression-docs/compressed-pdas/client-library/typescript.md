---
description: >-
  Build a TypeScript client with Rpc or TestRpc to create, update, and close
  compressed accounts. Includes a step-by-step implementation guide and full
  code examples.
---

# Typescript

Learn how to build a TypeScript client to test compressed accounts with `TestRpc`. For devnet and mainnet use `Rpc`.

* **For local testing**, use `TestRpc`.
  * `TestRpc` is a mock RPC implementation that simulates the ZK Compression stack without external dependencies.
  * It parses events and builds Merkle trees on-demand without persisting state.
* **For devnet and mainnet** use `Rpc`.
  * `Rpc` is a thin wrapper extending Solana's web3.js `Connection` class with compression-related endpoints.  Find a [full list of JSON RPC methods here](../../resources/json-rpc-methods/).
  * It connects to Photon indexer for compressed account queries and the prover service for validity proofs.

{% hint style="success" %}
Find [full code examples for a counter program](typescript.md#full-code-example) at the end for create, update and close.&#x20;

Both `TestRpc` and `Rpc` implement the same `CompressionApiInterface`.
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

{% stepper %}
{% step %}
### Dependencies

{% tabs %}
{% tab title="Rpc" %}
```json
{
  "dependencies": {
    "@lightprotocol/stateless.js": "^0.22.0",
    "@lightprotocol/compressed-token": "^0.22.0",
    "@solana/web3.js": "^1.98.4"
  }
}
```
{% endtab %}

{% tab title="TestRpc" %}
```json
{
  "devDependencies": {
    "@lightprotocol/stateless.js": "^0.22.0",
    "@lightprotocol/compressed-token": "^0.22.0",
    "@solana/web3.js": "^1.98.4"
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
`@lightprotocol/stateless.js` provides the core SDK for ZK Compression operations, including `Rpc` and `TestRpc` classes.
{% endhint %}
{% endstep %}

{% step %}
### Environment

{% hint style="info" %}
[Get your API key here](https://www.helius.dev/zk-compression), if you don't have one yet.
{% endhint %}

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

* `Rpc` constructor accepts Solana RPC URL, Photon indexer URL, prover URL, and optional config
* Photon indexer URL and API key are required to query compressed accounts
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

* Photon indexer URL and API key are required for compressed account queries
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

* Default local endpoints for Solana RPC, Photon indexer, and prover service
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

Before creating a compressed account, the client must choose two Merkle trees:

* an address tree to derive the account address and
* a state tree to store the account hash.

**Address tree**: Stores the account addresses of compressed accounts.

* The tree pubkey becomes an input to address derivation: `hash(address_tree_pubkey || address_seed)`.
* Different address trees produce different addresses from identical seeds.
* Address trees are NOT fungible. The client must use the same tree for `deriveAddress()` and `getValidityProof()` calls.

**State tree's** store the compressed account hashes.

* State trees are fungible. Tree choice does not affect the account hash.

{% hint style="success" %}
The protocol maintains Merkle trees at fixed addresses. You don't need to initialize custom trees. See [Addresses](https://www.zkcompression.com/resources/addresses-and-urls) for available trees.
{% endhint %}

```typescript
const addressTree = await rpc.getAddressTreeV1();
const stateTree = await rpc.getRandomStateTreeInfo();
```

* `getAddressTreeV1()` returns the address tree pubkey used to derive an address for a compressed account with `deriveAddress()` and for `getValidityProof()` to prove the address does not exist yet in this tree.
* `getRandomStateTreeInfo()` returns state tree metadata (pubkey, queue, etc.) to store the compressed account hash.
{% endstep %}

{% step %}
### Derive Address (Create only)

Derive a persistent address from seeds, address tree, and program ID as unique identifier for your compressed account.

{% hint style="warning" %}
This step is only required for **create** operations. Update and close operations use the existing account's address.
{% endhint %}

```typescript
import { deriveAddress } from '@lightprotocol/stateless.js';

const seed = Buffer.from('my-seed');
const address = deriveAddress(
  [seed],
  addressTree,
  programId
);
```

**`deriveAddress()`**: Computes a deterministic 32-byte address from the inputs.

**Parameters**:

* `[seed]`: Array of Buffers that uniquely identify the account
* `addressTree`: The tree pubkey where this address will be registered. An address is unique to an address tree.
* `programId`: The program that owns this account
{% endstep %}

{% step %}
### Validity Proof

Fetch a zero-knowledge proof (Validity proof) from your RPC provider that supports ZK Compression. The proof type depends on the operation:

* To create a compressed account, you must prove the **address doesn't already exist** in the address tree (_non-inclusion proof_).
* To update or close a compressed account, you must **prove the account hash exists** in a state tree (_inclusion proof_).

{% hint style="info" %}
[Here's a full guide](https://www.zkcompression.com/resources/json-rpc-methods/getvalidityproof) to the `getValidityProof()` method.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```typescript
const proof = await rpc.getValidityProof(
  [],  // No hashes for create
  [{ address, tree: addressTree }]  // Address to create
);
```

**Parameters**:

* First arg (`[]`) is empty for compressed account creation, since no compressed account exists yet to reference.
* Second arg contains the new address to create with its address tree.

The RPC returns validity proof context with

* the non-inclusion `compressedProof`, passed to the program in the instruction data. The Light System Program verifies the proof against the current Merkle root.
* `newAddressParams` contains the tree metadata for your address (tree, root, leaf index)
* an empty `merkleTrees` field for account creation, since no account hash exists as input
{% endtab %}

{% tab title="Update & Close:" %}
{% hint style="info" %}
**Update and Close** use identical proof mechanisms. The difference is in your program's instruction handler.
{% endhint %}

```typescript
const hash = compressedAccount.hash;

const proof = await rpc.getValidityProof(
  [hash],  // Hash to prove exists
  []       // No new addresses
);
```

The `compressedAccount.hash` contains the hash that's currently in the state tree. The indexer searches for this value to generate the proof.

**Parameters**:

* First arg contains the hash of the existing compressed account to prove its existence in the state tree.
* Second arg (`[]`) is empty for update/close operations, since the address already exists from account creation.

The RPC returns validity proof context with

* the inclusion `compressedProof`, passed to the program in the instruction data. The Light System Program verifies the proof against the current Merkle root.
* `merkleTrees` contains the tree metadata for the account hash (tree, root, leaf index) for the Light System program to nullify.
* an empty `newAddressParams` field for update/close, since the address was already created. The instruction data references the address via `CompressedAccountMeta`
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Pack Accounts

Compressed account instructions require packing accounts into the `remainingAccounts` array. Packed structs contain indices instead of full 32-byte pubkeys to reduce transaction size.

{% hint style="info" %}
**Understanding "Packed" terminology:**

* **Packed structs** (e.g., `PackedAddressTreeInfo`, `PackedMerkleTreeInfo`) contain account **indices** instead of pubkeys to reduce instruction size. The indices point to the `remainingAccounts` array.
* **Non-Packed structs** contain full pubkeys for client use. RPC methods return these.
* **Packing utilities** deduplicate accounts and assign sequential indices to create Packed structs.
{% endhint %}

#### 1. Initialize Account Arrays

```typescript
import {
  packCompressedAccounts,
  buildRemainingAccounts
} from '@lightprotocol/stateless.js';

let remainingAccounts: AccountMeta[] = [];
let accountsOffset = 0;
```

* Initialize `remainingAccounts` array to collect all account metadata
* `accountsOffset` tracks the current index position

```
[pre_accounts] [system_accounts] [packed_accounts]
       ↑                ↑                  ↑
    Signers,       Light system      Merkle trees,
    fee payer      program accts     address trees
                                     (deduplicated)

```

#### 2. Add Light System Accounts

The system accounts are added to `remainingAccounts`. These accounts are required for the Light System Program to verify proofs and execute CPI's.

```typescript
import { getSystemAccounts } from '@lightprotocol/stateless.js';

const systemAccounts = getSystemAccounts(programId);
remainingAccounts.push(...systemAccounts);
accountsOffset += systemAccounts.length;
```

* `getSystemAccounts(programId)` returns 8 Light System Program accounts
* Stores your program's ID to derive the CPI signer PDA

<details>

<summary><em>System Accounts List</em></summary>

| # | Account                       | Purpose                                                 | Derivation/Address                                                             |
| - | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1 | Light System Program          | Verifies proofs and creates compressed accounts         | `SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7`                                  |
| 2 | CPI Signer                    | Your program's authority to invoke Light System Program | PDA derived from `['authority', invoking_program_id]`                          |
| 3 | Registered Program PDA        | Proves your program is authorized                       | PDA derived from `[LIGHT_SYSTEM_PROGRAM_ID]` under Account Compression Program |
| 4 | Noop Program                  | Logs compressed account data for indexers               | SPL Noop Program                                                               |
| 5 | Account Compression Authority | Authority for merkle tree writes                        | PDA derived from `[CPI_AUTHORITY_PDA_SEED]` under Light System Program         |
| 6 | Account Compression Program   | Manages state trees and address trees                   | SPL Account Compression Program                                                |
| 7 | Invoking Program              | Your program's ID                                       | `programId`                                                                    |
| 8 | System Program                | Solana System Program                                   | `11111111111111111111111111111111`                                             |

</details>

#### 3. Pack Tree Accounts from Validity Proof

The validity proof response from `getValidityProof()` contains different context metadata based on the operation. Packing utilities extract and deduplicate the relevant tree pubkeys from this context and returns indices wrapped in Packed structs.

{% tabs %}
{% tab title="Create" %}
```typescript
const {
  packedAddressTrees,
  remainingAccounts: treeAccounts
} = packCompressedAccounts(proof, remainingAccounts, accountsOffset);

remainingAccounts.push(...treeAccounts);
accountsOffset += treeAccounts.length;
```

* `packCompressedAccounts()` extracts Merkle tree pubkeys from validity proof and creates account metas
* `packedAddressTrees` returns `PackedAddressTreeInfo[]` that specifies where to create the address:
  * `addressMerkleTreePubkeyIndex` points to the address tree account in `remainingAccounts`
  * `addressQueuePubkeyIndex` points to the address queue account in `remainingAccounts`
  * `rootIndex` specifies which Merkle root to verify the non-inclusion proof against
{% endtab %}

{% tab title="Update & Close" %}
```typescript
const {
  packedMerkleTrees,
  remainingAccounts: treeAccounts
} = packCompressedAccounts(proof, remainingAccounts, accountsOffset);

remainingAccounts.push(...treeAccounts);
accountsOffset += treeAccounts.length;
```

* `packCompressedAccounts()` extracts Merkle tree pubkeys from validity proof and creates account metas
* `packedMerkleTrees` returns `PackedMerkleTreeInfo[]` that points to the existing account hash so the Light System Program can mark it as nullified:
  * `merkleTreePubkeyIndex` points to the state tree account in `remainingAccounts`
  * `leafIndex` specifies which leaf position contains the account hash
  * `rootIndex` specifies which historical Merkle root to verify the proof against
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

* `getRandomStateTreeInfo()` selects a state tree to write the account hash
* Add the output state tree to `remainingAccounts` and track its index for instruction data.

#### Summary

You initialized the `remainingAccounts` array to merge the following accounts for the instruction:

* Light System accounts are required for the Light System Program to verify proofs and execute CPI's.
* Tree accounts from validity proof prove address non-existence (create) or prove existence of the account hash (update/close).
* The output state tree stores the new account hash.

The accounts receive a sequential index. Instruction data references accounts via these indices in this order.
{% endstep %}

{% step %}
### Instruction Data

Build instruction data with the validity proof, tree account indices, complete account data and metadata.

{% hint style="info" %}
Unlike regular Solana accounts where programs read data on-chain, compressed account data must be passed in instruction data. The program hashes this data and the Light System Program verifies the hash against the root in a Merkle tree account.
{% endhint %}

{% tabs %}
{% tab title="Create" %}
```typescript
const instructionData = {
  proof: proof.compressedProof,
  addressTreeInfo: packedAddressTrees[0],
  outputStateTreeIndex: outputTreeIndex,
  message: 'Hello, compressed account!'
};
```

1. **Non-inclusion Proof**

* `compressedProof` proves that the address does not exist yet in the specified address tree (non-inclusion). Clients fetch proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify Merkle trees to store address and account hash**

* `PackedAddressTreeInfo` specifies the index to the address tree account used to derive the address. The index points to the address tree account in `remainingAccounts`.
* `outputStateTreeIndex` points to the state tree account in `remainingAccounts` that will store the compressed account hash.

3. **Custom account data**

* `message` defines data to include in the compressed account.
{% endtab %}

{% tab title="Update" %}
```typescript
const instructionData = {
  proof: proof.compressedProof,
  accountMeta: {
    treeInfo: packedMerkleTrees[0],
    address: compressedAccount.address,
    outputStateTreeIndex: outputTreeIndex
  },
  message: 'Updated message'
};
```

1. **Inclusion Proof**

* `compressedProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash and output state tree**

* `accountMeta` points to the input hash and specifies the output state tree with these fields:
  * `treeInfo: PackedMerkleTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index) so the Light System Program can mark it as nullified
  * `address` specifies the account's derived address
  * `outputStateTreeIndex` points to the state tree that will store the updated compressed account hash

3. **Custom data for update**

* `message`: New data to update in the compressed account.
{% endtab %}

{% tab title="Close" %}
```typescript
const instructionData = {
  proof: proof.compressedProof,
  accountMeta: {
    treeInfo: packedMerkleTrees[0],
    address: compressedAccount.address,
    outputStateTreeIndex: outputTreeIndex
  },
  currentValue: compressedAccount.data
};
```

1. **Inclusion Proof**

* `compressedProof` proves that the account exists in the state tree (inclusion). Clients fetch validity proofs with `getValidityProof()` from an RPC provider that supports ZK Compression (Helius, Triton, ...).

2. **Specify input hash and output state tree**

* `accountMeta` points to the input hash and specifies the output state tree:
  * `treeInfo: PackedMerkleTreeInfo` points to the existing account hash (Merkle tree pubkey index, leaf index, root index) for nullification
  * `address` specifies the account's derived address
  * `outputStateTreeIndex` points to the state tree that will store the output hash with zero values (`DEFAULT_DATA_HASH`)

{% hint style="info" %}
Account indices reduce transaction size. Instruction data references the `remainingAccounts` array with indices instead of full 32-byte pubkeys. The client packs accounts in Step 6.
{% endhint %}

3. **Current data for close**

* `currentValue` includes the current data to hash and verify the input state.
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Instruction

Build the instruction from the `remainingAccounts` (Step 6) and instruction data (Step 7).

```typescript
import {
  TransactionInstruction,
  PublicKey
} from '@solana/web3.js';

const instruction = new TransactionInstruction({
  programId: PROGRAM_ID,
  keys: [
    { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    ...remainingAccounts
  ],
  data: encodeInstructionData(instructionData)
});
```

The `TransactionInstruction` packages three components:

* `programId` contains your program's on-chain address.
* The `keys` array includes your program accounts, Light System accounts and tree accounts from the validity proof.
* `data` contains the instruction data with the validity proof, tree indices, and account data _from Step 7_.

**What to include in the `keys`:**

1. **Your program's accounts** - Include signers, PDAs, and program-specific accounts first.
2. **Light System accounts** - The system accounts required for proof verification.
3. **Remaining accounts** - Merkle trees and queues from the validity proof.

**Final account order:**

```
[0]    Your program accounts (payer, signers, etc.)
[1]    Light System Program
[2]    CPI Signer PDA
[3-8]  Other Light System accounts
[9+]   Merkle trees, queues (from validity proof)
```

Your program receives account `[0]` via standard Anchor account deserialization and accounts `[1..]` via `remaining_accounts`.
{% endstep %}

{% step %}
### Send Transaction

Submit the instruction to the network.

```typescript
import {
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';

const transaction = new Transaction().add(instruction);
const signature = await sendAndConfirmTransaction(
  rpc,
  transaction,
  [payer]
);

console.log('Transaction signature:', signature);
```
{% endstep %}
{% endstepper %}

## Full Code Example

The full code examples below walk you through the complete lifecycle of a counter program: create, increment, decrement, reset, close.

{% hint style="warning" %}
For help with debugging, see the [Error Cheatsheet](https://www.zkcompression.com/resources/error-cheatsheet).
{% endhint %}

{% tabs %}
{% tab title="Create" %}
{% hint style="success" %}
Find the [source code here](https://github.com/Lightprotocol/program-examples/tree/main/counter).
{% endhint %}

```typescript
```
{% endtab %}

{% tab title="Update" %}
{% hint style="success" %}
Find the source code here.
{% endhint %}

```typescript
```
{% endtab %}

{% tab title="Close" %}
{% hint style="success" %}
Find the Source Code here.
{% endhint %}

```typescript
```
{% endtab %}
{% endtabs %}

## Next Steps

{% content-ref url="../compressed-pda-cookbook/" %}
[compressed-pda-cookbook](../compressed-pda-cookbook/)
{% endcontent-ref %}
