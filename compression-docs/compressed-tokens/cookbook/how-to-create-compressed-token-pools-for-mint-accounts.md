

# How to Create Compressed Token Pools for Mint Accounts

The `createTokenPool()` function registers an existing SPL mint with the compressed token program and creates a token pool PDA.  `createTokenPool()` requires only `fee_payer` and has no mint authority constraint.

{% hint style="info" %}
The token pool account itself requires rent, but individual compressed token accounts are rent-free.
{% endhint %}

The function

1. registers an existing SPL mint with the compressed token program and
2. create token pool PDA with `createTokenPoolInstruction`, the omnibus account that holds SPL tokens corresponding to compressed tokens in circulation

Before we create a token pool, we need an existing SPL mint account.

{% hint style="success" %}
**Best Practice:** Each mint supports a maximum of 4 token pools total. During compression/decompression operations, token pools get write-locked. Use `addTokenPools()` to create additional pools to increase per-block write-lock capacity.
{% endhint %}

{% code title="function-create-token-pool.ts" %}
```typescript
import { createTokenPool } from '@lightprotocol/compressed-token';
import { PublicKey } from '@solana/web3.js';

const mint = new PublicKey("YOUR_EXISTING_SPL_MINT_ADDRESS");

// Registers existing SPL mint with compressed token program, creates token pool account
const transactionSignature = await createTokenPool(
    rpc,
    payer,
    mint,
);
```
{% endcode %}

## Full Code Example

{% stepper %}
{% step %}
### Prerequisites

Make sure you have dependencies and developer environment set up!

<details>

<summary>Prerequisites &#x26; Setup</summary>

### Dependencies

```bash
npm install --save-dev typescript tsx @types/node && \
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

#### Alternatives:

```bash
yarn add --dev typescript tsx @types/node && \
yarn add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

```bash
pnpm add --save-dev typescript tsx @types/node && \
pnpm add \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

### Developer Environment

By default, this guide uses Localnet.

```bash
# Install the development CLI
npm install @lightprotocol/zk-compression-cli
```

```bash
# Start a local test validator
light test-validator

## ensure you have the Solana CLI accessible in your system PATH 
```

```typescript
// createRpc() defaults to local test validator endpoints
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

**Alternative: Using Devnet**

Follow these steps to create an RPC Connection. Replace `<your_api_key>` with your API key before running.

{% hint style="info" %}
[Get your API key here](https://www.helius.dev/zk-compression), if you don't have one yet.
{% endhint %}

```typescript
import { createRpc } from "@lightprotocol/stateless.js";

// Helius exposes Solana and Photon RPC endpoints through a single URL
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<your_api_key>";
const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

console.log("Connection created!");
console.log("RPC Endpoint:", RPC_ENDPOINT);
```

</details>
{% endstep %}

{% step %}
### Creating Token Pools

Run this script to create token pools for an SPL mint!

<pre class="language-typescript" data-title="create-token-pools.ts"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL mint 
// 3. Call createTokenPool() to register mint with compressed token program
// 4. Add additional pools to increase write-lock capacity (optional)

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { createTokenPool, addTokenPools } from '@lightprotocol/compressed-token';
import { createMint } from '@solana/spl-token';

async function createTokenPools() {

    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL mint
    const mint = await createMint(
        rpc,
        payer,
        payer.publicKey, // mint authority
        payer.publicKey, // freeze authority
        9
    );

    console.log("SPL mint created");
    console.log("Mint address:", mint.toBase58());

<strong>    // Step 3: Call createTokenPool() to register SPL mint with compressed token program
</strong><strong>    // Creates token pool PDA (omnibus account) that holds SPL tokens for compressed tokens
</strong><strong>    const poolTx = await createTokenPool(
</strong>        rpc,
        payer,
        mint // existing SPL mint to register
    );

    console.log("\nToken pool created!");
    console.log("SPL mint registered with compressed token program:", mint.toBase58());
    console.log("Pool transaction:", poolTx);
    
<strong>    // Step 4: Add up to 3 additional pools - increase write-lock capacity for higher throughput
</strong><strong>    const additionalPoolsCount = 2;
</strong><strong>    const additionalPoolsTx = await addTokenPools(
</strong>        rpc,
        payer,
        mint, // SPL mint with existing token pool
        additionalPoolsCount, // number of additional pools (max 3 more)
    );

    console.log(`\nAdded ${additionalPoolsCount} additional token pools!`);
    console.log("Additional pools transaction:", additionalPoolsTx);


    return { 
        mint,
        poolTransaction: poolTx,
        additionalPoolsTransaction: additionalPoolsTx
    };
}

createTokenPools().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
#### Success!

You've created multiple token pools for an SPL mint. The output shows:

* **Token pool creation**: Omnibus account registered for compression/decompression
* **Additional pools**: Multiple pools created for increased write-lock limit per block
* **Transaction confirmations**: All pool creation operations confirmed on-chain
{% endstep %}
{% endstepper %}

## Troubleshooting

<details>

<summary>"TokenPool not found"</summary>

You're trying to access a token pool that doesn't exist.

```typescript
// Create the missing token pool
const poolTx = await createTokenPool(rpc, payer, mint);
console.log("Token pool created:", poolTx);
```

</details>

## Advanced Configuration

<details>

<summary>Batch Pool Creation</summary>

Create pools for multiple mints:

```typescript
const mints = [
    new PublicKey("MINT_1_ADDRESS"),
    new PublicKey("MINT_2_ADDRESS"),
    new PublicKey("MINT_3_ADDRESS"),
];

for (const mint of mints) {
    try {
        const poolTx = await createTokenPool(rpc, payer, mint);
        console.log(`Pool created for ${mint.toBase58()}:`, poolTx);
    } catch (error) {
        console.log(`Failed for ${mint.toBase58()}:`, error.message);
    }
}
```

</details>

<details>

<summary>Create Pool with Token-2022</summary>

Create token pools for Token-2022 mints:

```typescript
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

const poolTx = await createTokenPool(
    rpc,
    payer,
    mint, // Token-2022 mint
    undefined,
    TOKEN_2022_PROGRAM_ID,
);
```

</details>

## Next Steps

Learn how to approve and revoke delegate authority for compressed token accounts.

{% content-ref url="how-to-approve-and-revoke-delegate-authority.md" %}
[how-to-approve-and-revoke-delegate-authority.md](how-to-approve-and-revoke-delegate-authority.md)
{% endcontent-ref %}
