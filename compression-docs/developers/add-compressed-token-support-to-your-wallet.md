# Add Compressed Token Support to Your Wallet

The following page describes how to add **compressed token** support to your browser extension wallet

{% hint style="info" %}
_Key benefits of compressed tokens:_

* Up to **5000x** cheaper than uncompressed accounts
* Compatible with existing programs via atomic compression and decompression between SPL <> Compressed tokens
{% endhint %}

## Integration Steps

### 1. Install the SDK

<table><thead><tr><th width="215">Package Manager</th><th>Command</th></tr></thead><tbody><tr><td>npm</td><td><pre class="language-bash"><code class="lang-bash">npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js
</code></pre></td></tr><tr><td>Yarn</td><td><pre class="language-bash"><code class="lang-bash">yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js
</code></pre></td></tr></tbody></table>

### 2. **Create an RPC Connection**

```tsx
import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<api_key>";
const connection: Rpc = createRpc(RPC_ENDPOINT)
```

<details>

<summary><strong>Using Localnet</strong></summary>

```bash
# Install the development CLI
npm install @lightprotocol/zk-compression-cli
```

```bash
# Start a local test validator
light test-validator
```

```tsx
import {
  Rpc,
  createRpc,
} from "@lightprotocol/stateless.js";

const connection: Rpc = createRpc();

async function main() {
  let slot = await connection.getSlot();
  console.log(slot);

  let health = await connection.getIndexerHealth(slot);
  console.log(health);
  // "Ok"
}

main();
```

</details>

### 3. Display Compressed Token Balances

```typescript
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const RPC_ENDPOINT = 'https://devnet.helius-rpc.com?api-key=<api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT);
const publicKey = new PublicKey('CLEuMG7pzJX9xAuKCFzBP154uiG1GaNo4Fq7x6KAcAfG');

(async () => {
    // Returns balance for owner per mint
    // Can optionally apply filter: {mint, limit, cursor}
    const balances =
        await connection.getCompressedTokenBalancesByOwnerV2(publicKey);
    console.log(balances);
})();
```

### 4. Get Compression Signature History By Owner

```typescript
import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const RPC_ENDPOINT = 'https://devnet.helius-rpc.com?api-key=<api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT);
const publicKey = new PublicKey('CLEuMG7pzJX9xAuKCFzBP154uiG1GaNo4Fq7x6KAcAfG');

(async () => {
    // 1. Fetch signatures for the user
    //
    // Returns confirmed signatures for compression transactions involving the
    // specified account owner
    const signatures =
        await connection.getCompressionSignaturesForOwner(publicKey);
    console.log(signatures);

    // 2. Fetch transactions with compression info
    //
    // Returns pre- and post-compressed token balances grouped by owner
    const parsedTransaction = 
        await connection.getTransactionWithCompressionInfo(signatures[0].signature)
    console.log(parsedTransaction)
})();
```

**Full JSON RPC API:**

{% content-ref url="json-rpc-methods/" %}
[json-rpc-methods](json-rpc-methods/)
{% endcontent-ref %}

### 5. Sending Compressed Tokens

```typescript
//To test the code snippets below, you need the following recurring keys.
import { Keypair } from "@solana/web3.js";

const PAYER = Keypair.generate();
const PUBLIC_KEY = PAYER.publicKey;
const MINT_KEYPAIR = Keypair.generate();
const RECIPIENT_PUBLIC_KEY = Keypair.generate().publicKey.toBase58();
```

<details>

<summary>Setup Test Mint</summary>

```typescript
import { Rpc, confirmTx, createRpc } from '@lightprotocol/stateless.js';
import { createMint, mintTo } from '@lightprotocol/compressed-token';

const RPC_ENDPOINT = '<https://devnet.helius-rpc.com?api-key=><api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT);

/// Airdrop tokens to PAYER beforehand.
(async() => {
    /// Create compressed-token mint
    const { mint, transactionSignature } = await createMint(
        connection,
        PAYER,
        PAYER.publicKey,
        9,
        PAYER,
    );

    console.log(`create-mint success! txId: ${transactionSignature}`);

    /// Mint compressed tokens
    const mintToTxId = await mintTo(
        connection,
        PAYER,
        mint,
        PAYER.publicKey,
        PAYER,
        1e9,
    );

    console.log(`mint-to success! txId: ${mintToTxId}`);
})();
```

</details>

```typescript
import { Rpc, createRpc, bn } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram, selectMinCompressedTokenAccountsForTransfer } from '@lightprotocol/compressed-token';

const RPC_ENDPOINT = 'https://devnet.helius-rpc.com?api-key=<api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);
const publicKey = PUBLIC_KEY;
const recipient = RECIPIENT_PUBLIC_KEY;
const mint = MINT_KEYPAIR.publicKey;
const amount = bn(1e8);

(async () => {
    // 1. Fetch latest token account state
    const compressedTokenAccounts =
        await connection.getCompressedTokenAccountsByOwner(publicKey, {
            mint,
        });

    // 2. Select accounts to transfer from based on the transfer amount
    const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
        compressedTokenAccounts.items,
        amount,
    );

    // 3. Fetch recent validity proof
    const proof = await connection.getValidityProof(
        inputAccounts.map(account => bn(account.compressedAccount.hash)),
    );

    // 4. Create transfer instruction
    const ix = await CompressedTokenProgram.transfer({
        payer: publicKey,
        inputCompressedTokenAccounts: inputAccounts,
        toAddress: recipient,
        amount,
        recentInputStateRootIndices: proof.rootIndices,
        recentValidityProof: proof.compressedProof,
    });

    console.log(ix);
    // 5. Sign and send...
})();
```

### Advanced Integration

<details>

<summary><strong>Decompress and Compress SPL Tokens</strong></summary>

```typescript
import { Rpc, createRpc, bn } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram, selectMinCompressedTokenAccountsForTransfer } from '@lightprotocol/compressed-token';
import { createAssociatedTokenAccount } from '@solana/spl-token';

const RPC_ENDPOINT = 'https://devnet.helius-rpc.com?api-key=<api_key>';
const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);
const publicKey = PUBLIC_KEY;
const mint = MINT_KEYPAIR.publicKey;
const amount = bn(1e8);

(async () => {
    // 0. Create an associated token account for the user if it doesn't exist
    const ata = await createAssociatedTokenAccount(
        connection,
        PAYER,
        mint,
        publicKey,
    );

    // 1. Fetch the latest compressed token account state
    const compressedTokenAccounts =
        await connection.getCompressedTokenAccountsByOwner(publicKey, {
            mint,
        });

    // 2. Select accounts to transfer from based on the transfer amount
    const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
        compressedTokenAccounts,
        amount,
    );

    // 3. Fetch recent validity proof
    const proof = await connection.getValidityProof(
        inputAccounts.map(account => bn(account.compressedAccount.hash)),
    );
    
    // 4. Fetch active state tree infos
    const activeStateTrees = await connection.getCachedActiveStateTreeInfo();


    const { tree } = pickRandomTreeAndQueue(activeStateTrees);
    
    // 4. Create the decompress instruction
    const decompressIx = await CompressedTokenProgram.decompress({
        payer: publicKey,
        inputCompressedTokenAccounts: inputAccounts,
        toAddress: ata,
        amount,
        recentInputStateRootIndices: proof.rootIndices,
        recentValidityProof: proof.compressedProof,
        outputStateTree: tree
    });
    
    // 6. Build, sign, and send the decompress transaction...
    
    
    const { tree } = pickRandomTreeAndQueue(activeStateTrees);

    // 5. Create the compress instruction
    const compressIx = await CompressedTokenProgram.compress({
        payer: publicKey,
        owner: publicKey,
        source: ata,
        toAddress: publicKey,
        amount,
        mint,
        outputStateTree: tree
    });

    // 6. Build, sign and send the compress transaction...
})();
```

</details>

## Best Practices

* **Clear UI Indicators —** Provide clear visual distinctions between compressed and uncompressed SPL tokens
* **Transaction History** — Provide detailed transaction histories for compressed tokens
* **Decompression and Compression** — Provide a clear path for users to convert between compressed and uncompressed tokens when needed

## Support

For additional support or questions, please refer to our [documentation](https://www.zkcompression.com) or contact [Swen](https://t.me/swen_light) or [Mert](https://t.me/mert_helius) on Telegram or via [email](mailto:friends@lightprotocol.com).
