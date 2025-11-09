# Expand (Collapsible) Block Template

## Basic Syntax

### GitBook Expand Block
```markdown
{% expand title="Click to expand" %}
Hidden content goes here. This will be collapsed by default.
{% endexpand %}
```

### HTML Details Alternative
```markdown
<details>

<summary>Click to expand</summary>

Hidden content goes here. This will be collapsed by default.

</details>
```

**Note:** ⚠️ `{% tabs %}` **cannot** be nested inside `<details>` - use `{% expand %}` instead if you need tabs.

## Common Use Cases

### FAQ Section

```markdown
{% expand title="What is ZK Compression?" %}
ZK Compression is a primitive that enables developers to build scalable applications on Solana by compressing on-chain state. It uses zero-knowledge proofs to maintain security while reducing costs by up to 5000x.
{% endexpand %}

{% expand title="How does it work?" %}
Instead of storing account data in individual on-chain accounts, ZK Compression stores account state in Merkle trees. Zero-knowledge proofs validate state transitions, ensuring security equivalent to regular Solana accounts.
{% endexpand %}

{% expand title="What are the costs?" %}
Compressed accounts cost approximately 160x less than regular Solana accounts. Token compression is even more efficient at 5000x cost reduction.
{% endexpand %}
```

### Detailed Examples

```markdown
{% expand title="Full Code Example: Creating a Compressed Token" %}
Here's a complete example showing token creation, minting, and transfer:

```typescript
import { createMint, mintTo, transfer } from '@lightprotocol/stateless.js';
import { Connection, Keypair } from '@solana/web3.js';

async function main() {
  // Set up connection
  const connection = new Connection('https://api.devnet.solana.com');
  const payer = Keypair.generate();

  // Create mint
  const mint = await createMint(connection, payer, payer.publicKey, 9);

  // Mint tokens
  await mintTo(connection, payer, mint, payer.publicKey, 1_000_000);

  // Transfer tokens
  const recipient = Keypair.generate().publicKey;
  await transfer(connection, payer, mint, recipient, 100_000);
}

main();
```
{% endexpand %}
```

### Advanced Configuration

```markdown
{% expand title="Advanced: Custom RPC Configuration" %}
For production applications, configure custom RPC endpoints:

```typescript
import { Rpc } from '@lightprotocol/stateless.js';

const rpc = new Rpc(
  process.env.ZK_COMPRESSION_RPC,      // Photon RPC for compressed state
  process.env.SOLANA_RPC,              // Standard Solana RPC
  process.env.ZK_COMPRESSION_RPC       // Compression-aware RPC
);
```

**Environment variables:**
- `ZK_COMPRESSION_RPC`: Your Photon indexer endpoint
- `SOLANA_RPC`: Standard Solana RPC node
- Configure these in your `.env` file

{% hint style="warning" %}
Never commit RPC API keys to version control.
{% endhint %}
{% endexpand %}
```

### Troubleshooting Section

```markdown
{% expand title="Error: ProofVerificationFailed (0x179B)" %}
This error occurs when validity proofs are stale or invalid.

**Common causes:**
1. Using outdated proof data
2. Network state changed between proof fetch and transaction
3. Incorrect proof parameters

**Solutions:**
1. Fetch a fresh proof immediately before the transaction
2. Implement retry logic with new proofs
3. Verify account addresses match proof data

See [Debug Guide](./debug-0x179b-6043-proofverificationfailed.md) for details.
{% endexpand %}
```

### Optional Information

```markdown
{% expand title="Optional: Understanding Merkle Trees" %}
Compressed accounts are stored in Merkle trees, which are:

- Binary tree data structures
- Each leaf contains account data
- Each node contains a hash of its children
- Root hash represents the entire tree state

This structure enables efficient proof generation and verification.
{% endexpand %}
```

## Best Practices

- Use descriptive titles that tell users what they'll find
- Great for:
  - FAQ sections
  - Long code examples
  - Optional advanced information
  - Troubleshooting guides
  - Detailed explanations
- Keep collapsed by default for optional content
- Can contain any markdown: code, hints, lists, images
- Don't overuse - too many expandables reduces scannability
- Consider regular content for essential information

## Notes

- Expand blocks start collapsed
- Users click to reveal content
- Improves page scannability
- Reduces initial page length
- Mobile-friendly for long content
