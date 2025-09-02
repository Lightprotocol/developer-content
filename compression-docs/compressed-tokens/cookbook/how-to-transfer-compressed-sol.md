

# How to Transfer Compressed SOL

Compressed SOL transfers work similar to regular SOL transfers with the `transfer()` function .

The transfer nullifies input compressed accounts of the sender and creates new output accounts for the recipient.

The transaction to transfer compressed SOL includes:

1. **Select input accounts** - Find compressed accounts with sufficient lamports of the sender
2. **Generate validity proof** - Create proofs for the input accounts to verify their existence
3. **Execute transfer** - Consume input accounts and create new compressed accounts with updated balances

{% code title="function-transfer-compressed-sol.ts" %}
```typescript
// Transfer compressed SOL using Light System Program
const transactionSignature = await transfer(
    rpc,
    payer, // fee payer
    lamports, // amount in lamports
    owner, // owner of compressed lamports
    recipient.publicKey // destination address
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

#### Dependencies

```bash
npm install --save-dev typescript tsx @types/node
```

```bash
npm install \
    @lightprotocol/stateless.js \
    @solana/web3.js
```

#### Developer Environment

**RPC Connection**

```typescript
import { createRpc } from "@lightprotocol/stateless.js";

// Helius exposes Solana and Photon RPC endpoints through a single URL
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<api_key>";
const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

console.log("✅ Connection created successfully!");
console.log("RPC Endpoint:", RPC_ENDPOINT);
```

**Alternative: Using Localnet**

```bash
# Install the development CLI
npm install @lightprotocol/zk-compression-cli
```

```bash
# Start a local test validator
light test-validator
```

```typescript
// createRpc() defaults to local test validator endpoints
import { Rpc, createRpc } from "@lightprotocol/stateless.js";

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
{% endstep %}

{% step %}
### Transfer Compressed SOL

Use the `transfer()` function to nullify input accounts and create output account with specified lamports.

{% hint style="info" %}
Replace `<your-api-key>` with your actual API key before running. [Get your API key here](https://www.helius.dev/zk-compression), if you don't have one yet.
{% endhint %}

{% hint style="warning" %}
This guide loads your filesystem wallet at `~/.config/solana/id.json`. If you don't have one yet, visit the [Solana documentation](https://docs.solanalabs.com/cli/wallets/file-system) for details.&#x20;
{% endhint %}

{% code title="transfer-compressed-sol.ts" %}
```typescript
import { Keypair, PublicKey } from '@solana/web3.js';
import { 
    createRpc, 
    transfer,
    createAccountWithLamports,
    bn
} from '@lightprotocol/stateless.js';
import * as fs from 'fs';
import * as os from 'os';

// 1. Setup funded payer and RPC connection
// 2. Create compressed account with lamports 
// 3. Call transfer() to move lamports to recipient - consume input accounts and create new compressed accounts for the recipient
// 4. Verify recipient received compressed lamports with getCompressedAccountsByOwner

async function transferCompressedSol() {
    // Step 1: Setup funded payer and RPC connection
    const walletPath = os.homedir() + '/.config/solana/id.json';
    const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8'))));
    const recipient = Keypair.generate();
    const rpc = createRpc("https://devnet.helius-rpc.com?api-key=<your-api-key>");

    const balance = await rpc.getBalance(payer.publicKey);
    if (balance < 0.01 * 1e9) {
        throw new Error("Wallet needs at least 0.01 SOL for transaction fees and rent");
    }

    console.log("Sender:", payer.publicKey.toBase58());
    console.log("Recipient:", recipient.publicKey.toBase58());
    
    // Step 2: Create compressed account with lamports
    const seeds = [Buffer.from("sol-transfer"), payer.publicKey.toBuffer()];
    const programId = new PublicKey("11111111111111111111111111111111");
    
    const createTx = await createAccountWithLamports(
        rpc,
        payer,
        seeds,
        2000000, // 2M lamports to compress
        programId
    );
    
    console.log("Compressed account created:", createTx);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Call transfer() to move lamports to recipient
    // Consume input accounts and create new compressed accounts for the recipient
    const transferTx = await transfer(
        rpc,
        payer, // fee payer
        1000000, // 1M lamports to transfer
        payer, // owner of compressed lamports
        recipient.publicKey // destination
    );
    
    console.log("Transfer completed:", transferTx);

    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Verify recipient received compressed lamports
    const recipientAccounts = await rpc.getCompressedAccountsByOwner(recipient.publicKey);
    const totalReceived = recipientAccounts.items.reduce(
        (sum, account) => sum.add(account.lamports),
        bn(0)
    );
    
    console.log("Recipient compressed lamports:", totalReceived.toString());

    console.log("\n=== View on Explorer ===");
    console.log(`Account Creation: https://explorer.solana.com/tx/${createTx}?cluster=devnet`);
    console.log(`Transfer: https://explorer.solana.com/tx/${transferTx}?cluster=devnet`);

    return {
        createTransaction: createTx,
        transferTransaction: transferTx,
        recipientBalance: totalReceived.toString()
    };
}

transferCompressedSol().catch(console.error);
```
{% endcode %}
{% endstep %}

{% step %}
#### Success!

You've successfully transferred compressed SOL between addresses. The output shows:

* **Compressed lamport transfer**: Moved specified amount between wallet addresses
* **Balance preservation**: Total lamports maintained during transfer operation
* **Transaction proof**: Confirmed the transfer operation on-chain
* **Recipient verification**: The lamports now exist at the destination address

The recipient now owns compressed lamports that can be transferred again, decompressed back to regular SOL, or used in other compressed operations.
{% endstep %}
{% endstepper %}

## Troubleshooting

<details>

<summary>"Insufficient balance for transfer"</summary>

**Not enough compressed lamports available**

The function accumulates accounts until sufficient balance found:

```typescript
// Check available compressed lamports first
const accounts = await rpc.getCompressedAccountsByOwner(owner.publicKey);
const totalBalance = accounts.items.reduce(
    (sum, account) => sum.add(account.lamports),
    bn(0)
);

if (totalBalance.lt(bn(transferAmount))) {
    console.log(`Need ${transferAmount}, have ${totalBalance}`);
}
```

</details>

<details>

<summary>"Account not found after creation"</summary>

**Indexer delay after account operations**

Wait for indexer synchronization:

```typescript
// Increase wait time after account creation
await new Promise(resolve => setTimeout(resolve, 5000));

// Verify accounts exist before transfer
const accounts = await rpc.getCompressedAccountsByOwner(owner.publicKey);
if (accounts.items.length === 0) {
    throw new Error("No compressed accounts found");
}
```

</details>

## Advanced Configuration

<details>

<summary>Custom Confirmation Options</summary>

Control transaction confirmation behavior:

```typescript
import { ConfirmOptions } from '@solana/web3.js';

const confirmOptions: ConfirmOptions = {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
    maxRetries: 3
};

const transferTx = await transfer(
    rpc,
    payer,
    transferAmount,
    owner,
    recipient.publicKey,
    confirmOptions  // Optional confirmation settings
);
```

</details>

<details>

<summary>Batch Transfer Operations</summary>

Execute multiple transfers efficiently:

```typescript
async function batchTransfer(
    rpc: Rpc,
    payer: Signer,
    owner: Signer,
    recipients: Array<{ address: PublicKey; amount: number }>
) {
    const results = [];
    
    for (const { address, amount } of recipients) {
        const tx = await transfer(rpc, payer, amount, owner, address);
        results.push({ recipient: address, amount, transaction: tx });
        
        // Wait between transfers
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
}
```

</details>

<details>

<summary>Monitor Account State Changes</summary>

Track compressed account nullification and creation:

```typescript
async function monitorTransfer(rpc: Rpc, owner: PublicKey, recipient: PublicKey) {
    // Check balances before transfer
    const ownerAccountsBefore = await rpc.getCompressedAccountsByOwner(owner);
    const recipientAccountsBefore = await rpc.getCompressedAccountsByOwner(recipient);
    
    console.log("Owner accounts before:", ownerAccountsBefore.items.length);
    console.log("Recipient accounts before:", recipientAccountsBefore.items.length);
    
    // After transfer (wait for indexing)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const ownerAccountsAfter = await rpc.getCompressedAccountsByOwner(owner);
    const recipientAccountsAfter = await rpc.getCompressedAccountsByOwner(recipient);
    
    console.log("Owner accounts after:", ownerAccountsAfter.items.length);
    console.log("Recipient accounts after:", recipientAccountsAfter.items.length);
    
    return {
        ownerAccountChange: ownerAccountsAfter.items.length - ownerAccountsBefore.items.length,
        recipientAccountChange: recipientAccountsAfter.items.length - recipientAccountsBefore.items.length
    };
}
```

</details>

## Related JSON RPC Methods

| Method                                                                                           | Purpose                                  |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| [getCompressedAccountsByOwner](../../resources/json-rpc-methods/getcompressedaccountsbyowner.md) | Discover input accounts for transfer     |
| [getValidityProof](../../resources/json-rpc-methods/getvalidityproof.md)                         | Generate proofs for input account hashes |
| [getCompressedBalance](../../resources/json-rpc-methods/getcompressedbalance.md)                 | Check total compressed balance           |
