# Stepper Block Template

⚠️ **CRITICAL**: **NO INDENTATION** inside `{% step %}` blocks - GitBook creates unwanted code blocks from indented content.

## Basic Syntax

```markdown
{% stepper %}
{% step %}
### First Step Title

Content for the first step goes here.
{% endstep %}

{% step %}
### Second Step Title

Content for the second step goes here.
{% endstep %}

{% step %}
### Third Step Title

Content for the third step goes here.
{% endstep %}
{% endstepper %}
```

## Complete Example with Code

```markdown
{% stepper %}
{% step %}
### Install Dependencies

Install the required packages for ZK Compression:

```bash
npm install @lightprotocol/stateless.js @solana/web3.js
```
{% endstep %}

{% step %}
### Set Up Connection

Create a connection to the Solana devnet:

```typescript
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
```
{% endstep %}

{% step %}
### Create Your First Compressed Token

Mint a compressed token:

```typescript
import { createMint, mintTo } from '@lightprotocol/stateless.js';

const mint = await createMint(connection, payer, authority, decimals);
await mintTo(connection, payer, mint, destination, amount);
```
{% endstep %}
{% endstepper %}
```

## With Multiple Content Types

```markdown
{% stepper %}
{% step %}
### Derive Account Address

First, derive a unique compressed account address:

```typescript
const seed = crypto.randomBytes(32);
const address = await deriveAddress(seed, programId);
```

{% hint style="info" %}
The seed must be unique for your program.
{% endhint %}
{% endstep %}

{% step %}
### Fetch Validity Proof

Get proof that the address doesn't exist yet:

```typescript
const proof = await rpc.getValidityProof([address]);
```

**Why this matters:** The proof ensures no state conflicts.
{% endstep %}

{% step %}
### Submit Transaction

Pack accounts and send the transaction:

```typescript
const tx = await program.methods
  .createAccount(data)
  .accounts({ address, proof })
  .rpc();
```

{% hint style="success" %}
Account created successfully!
{% endhint %}
{% endstep %}
{% endstepper %}
```

## Best Practices

- ⚠️ **CRITICAL: NO INDENTATION inside steps** - causes rendering errors
- Each step should have an H3 heading (`###`)
- Steps are numbered automatically
- Steps can contain any markdown: code, hints, lists, images
- Ideal for tutorials, guides, and multi-step processes
- Keep steps focused on a single action
- Use 3-7 steps typically (not too few, not too many)
- Include code examples in relevant steps
- Add hints or notes for important information
- Test that the steps work in sequence

## Common Use Cases

- Setup/installation guides
- Multi-step tutorials
- Onboarding flows
- Configuration processes
- Deployment procedures
- Testing workflows
