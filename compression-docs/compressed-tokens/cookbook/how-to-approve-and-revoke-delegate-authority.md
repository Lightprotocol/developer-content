
# How to approve and revoke delegate authority

The `approve()` and `revoke()` functions grant and remove delegate spending authority for compressed tokens. Only the token owner can perform these operations.

Before we approve or revoke delegates, we need:

* Compressed token accounts to delegate or revoke delegation from
* SPL mint registered with the compressed token program via `createMint()` or `createTokenPool()`

The functions perform opposite operations:

1. **`approve()`** consumes input account and creates delegated account with spending limit for delegate and change account for owner
2. **`revoke()`** consumes delegated accounts and creates output account under owner control without delegation

{% code title="function-manage-delegates.ts" %}
```typescript
import { approve, revoke } from '@lightprotocol/compressed-token';
import { Keypair, PublicKey } from '@solana/web3.js';

const mint = new PublicKey("YOUR_EXISTING_MINT_ADDRESS");
const delegate = Keypair.generate();
const amount = 500_000_000;
const owner = payer;

// Approve delegate
const approveSignature = await approve(
    rpc,
    payer,
    mint, // SPL mint with token pool for compression
    amount,
    owner,
    delegate.publicKey, // delegate account
);

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
{% endcode %}

### Full Code Example

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
### Approving Delegates

Run this script to approve delegate authority for compressed tokens!

<pre class="language-typescript" data-title="approve-delegates.ts"><code class="lang-typescript">// 1. Setup funded payer and connect to local validator
// 2. Create mint and token pool with initial tokens
// 3. Call approve() with mint, amount, owner, delegate
// 4. Verify delegation via getCompressedTokenAccountsByDelegate

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { 
    createMint, 
    mintTo, 
    approve 
} from '@lightprotocol/compressed-token';
import BN from 'bn.js';
import * as fs from 'fs';

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

    // Save state for revoke step
    const approveState = {
        mint: mint.toBase58(),
        tokenOwner: Array.from(tokenOwner.secretKey),
        delegate: Array.from(delegate.secretKey),
        delegatePublicKey: delegate.publicKey.toBase58(),
        payer: Array.from(payer.secretKey)
    };
    fs.writeFileSync('./approve-state.json', JSON.stringify(approveState, null, 2));

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
{% endstep %}

{% step %}
### Revoking Delegates

Remove delegate authority from previously approved accounts.

<pre class="language-typescript" data-title="revoke-delegates.ts"><code class="lang-typescript">// Continue from approve setup - revoke delegate authority
// 1. Get delegated accounts to revoke via getCompressedTokenAccountsByDelegate
// 2. Call revoke() with delegated accounts and token owner - remove delegate authority and return control to owner
// 3. Verify delegation removed via getCompressedTokenAccountsByDelegate

import { Keypair, PublicKey } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { revoke } from '@lightprotocol/compressed-token';
import BN from 'bn.js';
import * as fs from 'fs';

async function revokeDelegates() {
    if (!fs.existsSync('./approve-state.json')) {
        console.log("No delegated accounts found to revoke. Please run 'npx tsx approve.ts' first.");
        return;
    }

    // Load approve state
    const state = JSON.parse(fs.readFileSync('./approve-state.json', 'utf8'));
    const rpc = createRpc(); // defaults to localhost:8899
    const payer = Keypair.fromSecretKey(new Uint8Array(state.payer));
    const mint = new PublicKey(state.mint);
    const tokenOwner = Keypair.fromSecretKey(new Uint8Array(state.tokenOwner));
    const delegate = new PublicKey(state.delegatePublicKey);

<strong>    // Step 1: Get delegated accounts to revoke via getCompressedTokenAccountsByDelegate
</strong><strong>    const delegateAccounts = await rpc.getCompressedTokenAccountsByDelegate(
</strong><strong>        delegate,
</strong><strong>        { mint }
</strong><strong>    );
</strong>    const delegatedBalanceBefore = delegateAccounts.items.reduce(
        (sum, account) => sum.add(account.parsed.amount),
        new BN(0)
    );
    console.log("Delegated balance:", delegatedBalanceBefore.toNumber() / 1_000_000_000, "tokens");

    console.log("Revoke Delegate");
<strong>    // Step 2: Call revoke() with delegated accounts and token owner
</strong><strong>    // Remove delegate authority and return control to owner
</strong><strong>    const revokeTx = await revoke(
</strong><strong>        rpc,
</strong><strong>        payer,
</strong><strong>        delegateAccounts.items, // delegated accounts to revoke
</strong><strong>        tokenOwner, // owner of compressed tokens
</strong><strong>    );
</strong>
    console.log("Delegate revoked!");
    console.log("Transaction:", revokeTx);

<strong>    // Step 3: Verify delegation removed via getCompressedTokenAccountsByDelegate
</strong><strong>    const delegateAccountsAfter = await rpc.getCompressedTokenAccountsByDelegate(
</strong><strong>        delegate,
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

    console.log("\nFinal balances:");
    console.log("Delegated accounts:", delegateAccountsAfter.items.length);
    console.log("Owner balance after revocation:", ownerBalance.toNumber() / 1_000_000_000, "tokens");

    return {
        revokeTransaction: revokeTx,
        finalOwnerBalance: ownerBalance
    };
}

revokeDelegates().catch(console.error);
</code></pre>
{% endstep %}

{% step %}
#### Success!

You've successfully approved and revoked delegation for compressed tokens. The output shows:

* **Approval completion**: Delegate authority granted for specified token amount
* **Delegation verification**: Confirmed delegate accounts exist with correct amounts
* **Revocation completion**: Delegate authority removed and tokens returned to owner
{% endstep %}
{% endstepper %}

## Troubleshooting

<details>

<summary>"Account is not delegated"</summary>

Attempting to revoke non-delegated accounts.&#x20;

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

## Next Steps

That's it! Explore more guides in our cookbook section, or check out the advanced guides.

{% columns %}
{% column %}
{% content-ref url="./" %}
[.](./)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="../advanced-guides/" %}
[advanced-guides](../advanced-guides/)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}
