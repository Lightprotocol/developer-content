# Hint Block Template

## Basic Syntax

```markdown
{% hint style="info" %}
Your informational message here.
{% endhint %}
```

## Available Styles

**info** - Blue callout for general information
```markdown
{% hint style="info" %}
This is an informational hint.
{% endhint %}
```

**warning** - Yellow/orange callout for warnings
```markdown
{% hint style="warning" %}
Proceed with caution. This may have side effects.
{% endhint %}
```

**danger** - Red callout for critical warnings
```markdown
{% hint style="danger" %}
This action cannot be undone. Ensure you have backups.
{% endhint %}
```

**success** - Green callout for positive information
```markdown
{% hint style="success" %}
Operation completed successfully!
{% endhint %}
```

## Best Practices

- Use hints to emphasize important information
- Keep hint content concise (1-3 sentences ideal)
- Choose appropriate style for the message type
- Don't nest multiple hints
- Hints can contain markdown (bold, code, links)

## With Inline Code

```markdown
{% hint style="info" %}
Use the `createMint()` function to initialize your token.
{% endhint %}
```

## With Links

```markdown
{% hint style="warning" %}
See the [Security Guidelines](../references/security.md) before deploying to mainnet.
{% endhint %}
```
