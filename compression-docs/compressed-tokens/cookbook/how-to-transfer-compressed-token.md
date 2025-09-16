---
description: >-
  Complete guide to transfer compressed SPL tokens between compressed or regular
  accounts with `transfer()`, troubleshooting and advanced configurations.
---

# How to Transfer Compressed Token

The `transfer()` function moves compressed tokens between accounts. Unlike regular SPL transfers that update existing account balances, compressed transfers consume input accounts from the sender and create new output accounts for sender and recipient with updated balances.

Before we can transfer compressed tokens, we need:

* An SPL mint registered with the compressed token program via `createMint()` or `createTokenPool()`, and
* a source compressed token account with sufficient balance for the transfer amount.&#x20;

{% hint style="success" %}
Regular SPL token accounts can be compressed in the same transaction with `compress_or_decompress_amount`, if needed.
{% endhint %}

{% code title="function-transfer-compressed-tokens.ts" %}
```typescript
  import { transfer } from '@lightprotocol/compressed-token';
  import { PublicKey } from '@solana/web3.js';

  // Use existing mint with token pool for compression to transfer compressed tokens
  const mint = new PublicKey("MINT_ADDRESS");
  const recipient = new PublicKey("RECIPIENT_WALLET_ADDRESS");
  const amount = 1_000_000_000; // 1 token (9 decimals)

  // Transfer compressed tokens
  const transactionSignature = await transfer(
      rpc,
      payer,
      mint, // SPL mint with token pool for compression
      amount,
      payer,
      recipient, // destination address (toAddress parameter)
```
{% endcode %}

### Full Code Example

{% stepper %}
{% step %}
#### Prerequisites

Make sure you have dependencies and developer environment set up!

<details>

<summary>Prerequisites &#x26; Setup</summary>

#### Dependencies

```bash
npm install --save-dev typescript tsx @types/node && \
npm install --save \
    @lightprotocol/stateless.js \
    @lightprotocol/compressed-token \
    @solana/web3.js \
    @solana/spl-token
```

**Alternatives:**

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

#### Developer Environment

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
Get your API Key [here](https://www.helius.dev/zk-compression), if you don't have one yet.
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
#### Transferring Compressed Tokens

Run this script to transfer compressed tokens to a recipient!

<pre class="language-typescript" data-title="transfer-compressed-tokens.ts"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create SPL mint and token pool for compression with initial tokens
// 3. Call transfer() with mint, amount, owner, recipient
// 4. Verify transferred tokens via getCompressedTokenAccountsByOwner

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { createMint, mintTo, transfer } from '@lightprotocol/compressed-token';

async function transferCompressedTokens() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2a: Create SPL mint with token pool for compression
    const { mint, transactionSignature: mintCreateTx } = await createMint(
        rpc,
        payer,
        payer.publicKey, // mint authority
        9
    );

    console.log("SPL mint with token pool for compression created");
    console.log("Mint address:", mint.toBase58());
    console.log("Create mint transaction:", mintCreateTx);

    // Step 2b: Create token owner and mint initial tokens
    const tokenOwner = Keypair.generate();
    const initialMintAmount = 1_000_000_000; // 1 token with 9 decimals

    const mintToTx = await mintTo(
        rpc,
        payer,
        mint, // SPL mint with token pool for compression
        tokenOwner.publicKey, // recipient
        payer, // mint authority
        initialMintAmount
    );

    console.log("\nCompressed Tokens minted:", initialMintAmount / 1_000_000_000, "tokens");
    console.log("Mint tokens transaction:", mintToTx);

    // Generate recipient address and define transfer amount
    const recipient = Keypair.generate();
    const transferAmount = 500_000_000; // 0.5 tokens

<strong>    // Step 3: Call transfer() with mint, amount, owner, recipient
</strong><strong>    const transferTx = await transfer(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // SPL mint with token pool for compression
</strong><strong>        transferAmount,
</strong><strong>        tokenOwner, // owner keypair
</strong><strong>        recipient.publicKey // recipient address
</strong><strong>    );
</strong>
    console.log("\nCompressed tokens transferred!");
    console.log("From:", tokenOwner.publicKey.toBase58());
    console.log("To:", recipient.publicKey.toBase58());
    console.log("Amount transferred:", transferAmount / 1_000_000_000, "tokens");
    console.log("Transfer transaction:", transferTx);

    // Step 4: Verify transferred tokens via getCompressedTokenAccountsByOwner
    const recipientAccounts = await rpc.getCompressedTokenAccountsByOwner(
        recipient.publicKey,
        { mint }
    );

    // Check recipient received the tokens
    if (recipientAccounts.items.length > 0) {
        const receivedBalance = recipientAccounts.items[0].parsed.amount;
    }

    return { 
        transferTransaction: transferTx, 
        recipient: recipient.publicKey, 
        amount: transferAmount 
    };
}

transferCompressedTokens().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
**Success!**

You've successfully created and transferred compressed tokens. The output shows:

* **Transfer confirmation**: Tokens moved from sender to recipient
* **Amount verification**: Exact tokens transferred with decimal precision
* **Balance verification**: Both sender and recipient balances confirmed
{% endstep %}
{% endstepper %}

### Troubleshooting

<details>

<summary>"Insufficient balance for transfer"</summary>

The sender doesn't have enough compressed tokens for the requested transfer amount.

```typescript
// Check current balance first
const tokenAccounts = await rpc.getCompressedTokenAccountsByOwner(
    owner.publicKey,
    { mint }
);

if (tokenAccounts.items.length === 0) {
    throw new Error("No compressed token accounts found");
}

// Calculate total balance across all accounts
const totalBalance = tokenAccounts.items.reduce(
    (sum, account) => sum.add(account.parsed.amount),
    new BN(0)
);

console.log("Available balance:", totalBalance.toString());

// Ensure transfer amount doesn't exceed balance
if (new BN(transferAmount).gt(totalBalance)) {
    throw new Error(`Transfer amount ${transferAmount} exceeds balance ${totalBalance.toString()}`);
}
```

</details>

<details>

<summary>"Account limit exceeded"</summary>

The transfer requires more than 4 compressed accounts, which exceeds the transaction limit.

```typescript
// Error message: "Account limit exceeded: max X (4 accounts) per transaction. 
// Total balance: Y (Z accounts). Consider multiple transfers to spend full balance."

// Split into multiple smaller transfers
const maxTransferPerTx = 1_000_000_000; // Adjust based on your account sizes

if (transferAmount > maxTransferPerTx) {
    console.log("Large transfer detected, splitting into multiple transactions...");
    
    let remainingAmount = transferAmount;
    while (remainingAmount > 0) {
        const currentTransfer = Math.min(remainingAmount, maxTransferPerTx);
        
        await transfer(
            rpc,
            payer,
            mint,
            currentTransfer,
            owner,
            recipient
        );
        
        remainingAmount -= currentTransfer;
        console.log(`Transferred ${currentTransfer}, remaining: ${remainingAmount}`);
    }
}
```

</details>

### Advanced Configuration

<details>

<summary>Transfer to Multiple Recipients</summary>

Transfer to multiple recipients in separate transactions:

```typescript
const recipients = [
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
];

const amounts = [
    100_000_000, // 0.1 tokens
    200_000_000, // 0.2 tokens  
    150_000_000, // 0.15 tokens
];

for (let i = 0; i < recipients.length; i++) {
    const transactionSignature = await transfer(
        rpc,
        payer,
        mint,
        amounts[i],
        owner,
        recipients[i],
    );
    
    console.log(`Transfer ${i + 1} completed:`, transactionSignature);
}
```

</details>

<details>

<summary>Transfer with Delegate Authority</summary>

Transfer tokens using delegate authority:

```typescript
import { approve, transferDelegated } from '@lightprotocol/compressed-token';

// 1. Owner approves delegate
await approve(
    rpc,
    payer,
    mint,
    amount,
    owner, // Signer
    delegate.publicKey, // PublicKey
);

// 2. Delegate transfers tokens
await transferDelegated(
    rpc,
    payer,
    mint,
    transferAmount,
    delegate, // Signer - named "owner" in SDK
    recipient,
);
```

</details>

### Next Steps

Learn how compress and decompress SPL Tokens.

{% content-ref url="how-to-compress-and-decompress-spl-tokens.md" %}
[how-to-compress-and-decompress-spl-tokens.md](how-to-compress-and-decompress-spl-tokens.md)
{% endcontent-ref %}
