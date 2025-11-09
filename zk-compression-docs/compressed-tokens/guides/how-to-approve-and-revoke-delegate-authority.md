---
title: How to Approve and Revoke Delegate Authority
description: Complete guide to manage delegate authority for compressed tokens with `approve()` and `revoke()`, troubleshooting and advanced configurations.
---

The `approve()` and `revoke()` functions grant and remove delegate spending authority for compressed tokens. Only the token owner can perform these operations.

Before we approve or revoke delegates, we need:

* compressed token accounts to delegate or revoke delegation from, and
* an SPL mint with a token pool for compression. This token pool can be created for new SPL mints via [`createMint()`](how-to-create-and-register-a-mint-account-for-compression.md) or added to existing SPL mints via [`createTokenPool()`](how-to-create-compressed-token-pools-for-mint-accounts.md).

{% tabs %}
{% tab title="approve()" %}
```typescript
// Approve delegate for spending up to the specified amount
const approveSignature = await approve(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    amount,
    owner,
    delegate.publicKey, // delegate account
);
```
{% endtab %}

{% tab title="revoke()" %}
```typescript
// Get delegated accounts for revocation
const delegatedAccounts = await rpc.getCompressedTokenAccountsByDelegate(
    delegate.publicKey,
    { mint }
);

// Revoke delegate authority
const revokeSignature = await revoke(
    rpc,
    payer,
    delegatedAccounts.items, // delegated compressed token accounts
    owner,
);
```
{% endtab %}
{% endtabs %}

# Full Code Example

{% stepper %}
{% step %}
## Prerequisites

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
## Approve / Revoke Delegates

{% tabs %}
{% tab title="Approve Delegate" %}
Approve delegate authority for compressed tokens. The delegate can spend up to the approved amount.

<pre class="language-typescript" data-title="approve-delegates.ts" data-overflow="wrap"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create mint and token pool with initial tokens
// 3. Call approve() with mint, amount, owner, delegate
// 4. Verify delegation via getCompressedTokenAccountsByDelegate

import { Keypair } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import {
    createMint,
    mintTo,
    approve
} from '@lightprotocol/compressed-token';
import BN from 'bn.js';

async function approveDelegates() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Step 2: Create SPL mint with token pool and mint initial tokens
    const { mint } = await createMint(
        rpc,
        payer,
        payer.publicKey, // mint authority
        9 // decimals
    );

    console.log("SPL mint with token pool created:", mint.toBase58());

    const tokenOwner = Keypair.generate();
    const initialAmount = 1_000_000_000; // 1 token with 9 decimals

    await mintTo(
        rpc,
        payer,
        mint, // SPL mint with token pool for compression
        tokenOwner.publicKey, // recipient
        payer, // mint authority
        initialAmount
    );

    console.log("Initial tokens minted:", initialAmount / 1_000_000_000, "tokens");
    console.log("Token owner:", tokenOwner.publicKey.toBase58());

    // Generate delegate address and define amount to approve for delegation
    const delegate = Keypair.generate();
    const delegateAmount = 500_000_000; // 0.5 tokens

<strong>    // Step 3: Call approve() with mint, amount, owner, delegate
</strong><strong>    const approveTx = await approve(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint, // SPL mint with token pool for compression
</strong><strong>        delegateAmount,
</strong><strong>        tokenOwner, // owner keypair
</strong><strong>        delegate.publicKey // delegate address
</strong><strong>    );
</strong>
    console.log("Delegate approved");
    console.log("Delegate:", delegate.publicKey.toBase58());
    console.log("Approved amount:", delegateAmount / 1_000_000_000, "tokens");
    console.log("Transaction:", approveTx);

<strong>    // Step 4: Verify delegation via getCompressedTokenAccountsByDelegate
</strong><strong>    const delegateAccounts = await rpc.getCompressedTokenAccountsByDelegate(
</strong><strong>        delegate.publicKey,
</strong><strong>        { mint }
</strong><strong>    );
</strong>
    // Check delegated balance
    if (delegateAccounts.items.length > 0) {
        const delegatedBalance = delegateAccounts.items.reduce(
            (sum, account) => sum.add(account.parsed.amount),
            new BN(0)
        );
        console.log("Verified delegation:", delegatedBalance.toNumber() / 1_000_000_000, "tokens");
    }

    return {
        mint,
        tokenOwner,
        delegate: delegate.publicKey,
        approveTransaction: approveTx,
        delegatedAmount: delegateAmount
    };
}

approveDelegates().catch(console.error);
</code></pre>
{% endtab %}

{% tab title="Approve and Revoke" %}
Approve delegation, then revoke it in a single script.

<pre class="language-typescript" data-title="approve-and-revoke-delegates.ts" data-overflow="wrap"><code class="lang-typescript">// Complete workflow: approve and revoke delegation
// 1. Setup and create mint with initial tokens
// 2. Approve delegation
// 3. Verify delegation exists
// 4. Revoke delegation
// 5. Verify delegation removed

import { Keypair } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import {
    createMint,
    mintTo,
    approve,
    revoke
} from '@lightprotocol/compressed-token';
import BN from 'bn.js';

async function approveAndRevokeDelegates() {
    // Step 1: Setup funded payer and connect to local validator
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.generate();
    const airdropSignature = await rpc.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await rpc.confirmTransaction(airdropSignature);

    // Create SPL mint with token pool and mint initial tokens
    const { mint } = await createMint(
        rpc,
        payer,
        payer.publicKey, // mint authority
        9 // decimals
    );

    console.log("SPL mint with token pool created:", mint.toBase58());

    const tokenOwner = Keypair.generate();
    const initialAmount = 1_000_000_000; // 1 token with 9 decimals

    await mintTo(
        rpc,
        payer,
        mint, // SPL mint with token pool for compression
        tokenOwner.publicKey, // recipient
        payer, // mint authority
        initialAmount
    );

    console.log("Initial tokens minted:", initialAmount / 1_000_000_000, "tokens");
    console.log("Token owner:", tokenOwner.publicKey.toBase58());

    // Generate delegate and define delegation amount
    const delegate = Keypair.generate();
    const delegateAmount = 500_000_000; // 0.5 tokens

<strong>    // Step 2: Approve delegation
</strong><strong>    console.log("\n--- Approving Delegation ---");
</strong><strong>    const approveTx = await approve(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        mint,
</strong><strong>        delegateAmount,
</strong><strong>        tokenOwner,
</strong><strong>        delegate.publicKey
</strong><strong>    );
</strong>
    console.log("Delegate approved");
    console.log("Delegate:", delegate.publicKey.toBase58());
    console.log("Approved amount:", delegateAmount / 1_000_000_000, "tokens");
    console.log("Transaction:", approveTx);

<strong>    // Step 3: Verify delegation exists
</strong><strong>    const delegateAccountsBefore = await rpc.getCompressedTokenAccountsByDelegate(
</strong><strong>        delegate.publicKey,
</strong><strong>        { mint }
</strong><strong>    );
</strong>
    const delegatedBalance = delegateAccountsBefore.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );
    console.log("Verified delegation:", delegatedBalance.toNumber() / 1_000_000_000, "tokens");

<strong>    // Step 4: Revoke delegation
</strong><strong>    console.log("\n--- Revoking Delegation ---");
</strong><strong>    const revokeTx = await revoke(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        delegateAccountsBefore.items, // delegated accounts to revoke
</strong><strong>        tokenOwner,
</strong><strong>    );
</strong>
    console.log("Delegate revoked!");
    console.log("Transaction:", revokeTx);

<strong>    // Step 5: Verify delegation removed
</strong><strong>    const delegateAccountsAfter = await rpc.getCompressedTokenAccountsByDelegate(
</strong><strong>        delegate.publicKey,
</strong><strong>        { mint }
</strong><strong>    );
</strong>
    const ownerAccounts = await rpc.getCompressedTokenAccountsByOwner(
        tokenOwner.publicKey,
        { mint }
    );
    const ownerBalance = ownerAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );

    console.log("\n--- Final State ---");
    console.log("Delegated accounts remaining:", delegateAccountsAfter.items.length);
    console.log("Owner balance after revocation:", ownerBalance.toNumber() / 1_000_000_000, "tokens");

    return {
        approveTransaction: approveTx,
        revokeTransaction: revokeTx,
        finalOwnerBalance: ownerBalance
    };
}

approveAndRevokeDelegates().catch(console.error);
</code></pre>
{% endtab %}
{% endtabs %}
{% endstep %}
{% endstepper %}

### Troubleshooting

<details>

<summary>"Account is not delegated"</summary>

Attempting to revoke non-delegated accounts.

```typescript
/// Verify accounts are delegated before revocation.
const delegateAccounts = await rpc.getCompressedTokenAccountsByDelegate(
    delegate.publicKey,
    { mint }
);

if (delegateAccounts.items.length === 0) {
    console.log("No delegated accounts to revoke");
    return;
}
```

</details>

## Advanced Configuration

<details>

<summary>Approve Multiple Delegates</summary>

```typescript
const delegates = [
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
];

const amounts = [
    200_000_000, // 0.2 tokens to first delegate
    300_000_000, // 0.3 tokens to second delegate
];

// Approve each delegate
for (let i = 0; i < delegates.length; i++) {
    const approveTx = await approve(
        rpc,
        payer,
        mint,
        amounts[i],
        tokenOwner,
        delegates[i],
    );
    
    console.log(`Delegate ${i + 1} approved:`, approveTx);
}
```

</details>

<details>

<summary>Revoke Multiple Delegates</summary>

```typescript
const delegates = [
    new PublicKey("DELEGATE_1_ADDRESS"),
    new PublicKey("DELEGATE_2_ADDRESS"),
];

// Revoke each delegate
for (const delegate of delegates) {
    // Get delegated accounts for this delegate
    const delegateAccounts = await rpc.getCompressedTokenAccountsByDelegate(
        delegate,
        { mint }
    );
    
    if (delegateAccounts.items.length > 0) {
        const revokeTx = await revoke(
            rpc,
            payer,
            delegateAccounts.items,
            tokenOwner,
        );
        
        console.log(`Delegate ${delegate.toBase58()} revoked:`, revokeTx);
    }
}
```

</details>

# Next Steps

That's it! Explore more guides in our cookbook section, or check out the advanced guides.

{% columns %}
{% column %}
{% content-ref url="./" %}
[.](./)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="../advanced-guides/README.md" %}
[README.md](../advanced-guides/README.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}
