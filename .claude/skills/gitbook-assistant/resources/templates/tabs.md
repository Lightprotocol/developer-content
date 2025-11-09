# Tabs Block Template

## Basic Syntax

```markdown
{% tabs %}
{% tab title="First Tab" %}
Content for first tab goes here.
{% endtab %}

{% tab title="Second Tab" %}
Content for second tab goes here.
{% endtab %}

{% tab title="Third Tab" %}
Content for third tab goes here.
{% endtab %}
{% endtabs %}
```

## Common Use Cases

### Code Examples in Multiple Languages

```markdown
{% tabs %}
{% tab title="TypeScript" %}
```typescript
import { createMint } from '@lightprotocol/stateless.js';

const mint = await createMint(
  connection,
  payer,
  mintAuthority,
  decimals
);
```
{% endtab %}

{% tab title="Rust" %}
```rust
use light_sdk::compressed_account::CompressedAccount;

let mint = create_mint(
    &connection,
    &payer,
    &mint_authority,
    decimals,
)?;
```
{% endtab %}
{% endtabs %}
```

### Platform-Specific Instructions

```markdown
{% tabs %}
{% tab title="macOS" %}
```bash
brew install solana
```
{% endtab %}

{% tab title="Linux" %}
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```
{% endtab %}

{% tab title="Windows" %}
Download the installer from https://solana.com/download
{% endtab %}
{% endtabs %}
```

### Framework Comparison

```markdown
{% tabs %}
{% tab title="Anchor" %}
Anchor provides a high-level framework with automatic serialization.
{% endtab %}

{% tab title="Native Rust" %}
Native Rust gives full control but requires manual serialization.
{% endtab %}
{% endtabs %}
```

## Best Practices

- Use descriptive tab titles (language names, platforms, options)
- Keep tab content focused and comparable
- Ideal for showing equivalent code in different languages
- Can contain any markdown: code, text, lists, images
- Tab order matters - put most common option first
- Minimum 2 tabs, no practical maximum
