---
description: Common cause and debug steps for ProofVerificationFailed (0x179B / 6043)
---

# Debug 0x179b / 6043 / ProofVerificationFailed

### Description

You're passing an invalid proof. The proof provided cannot be verified against the expected state.

### **Common causes and Debug Steps**

{% hint style="info" %}
For a complete example of proper client+onchain flows, see the [Counter Program](https://github.com/Lightprotocol/program-examples/blob/main/counter/anchor/programs/counter/src/lib.rs#L26).
{% endhint %}

<details>

<summary>Inconsistent Address Seed - Client seeds don't match onchain address derivation</summary>

Compare client vs onchain seeds/addresses. Both should be identical.

```typescript
// Client - log seeds/address used to request proof
console.log("Client seeds:", seeds, "address:", address);
```

```rust
// Onchain - log seeds/address
msg!("Program seeds: {:?}, address: {:?}", seeds, address);
```

</details>

### **Still having issues?** We're here to help!

* Reach out on [Discord](https://discord.com/invite/CYvjBgzRFP) for support
* Share the exact error code and a reproducer (GitHub repo / gist)

