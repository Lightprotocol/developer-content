---
description: >-
  Overview and comparison of guides to create, update, and close compressed
  accounts. Guides include step-by-step implementation and full code examples
  for Anchor, native Rust, and Pinocchio.
hidden: true
---

# Compressed PDA Cookbook





### Guides Overview <a href="#subsection-jvtgde75u" id="subsection-jvtgde75u"></a>

| Guide                                                                     | Description                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [How to Create Compressed Accounts](how-to-create-compressed-accounts.md) | Create compressed accounts with addresses                                       |
| [How to Update Compressed Accounts](how-to-update-compressed-accounts.md) | Update compressed accounts                                                      |
| [How to Close Compressed Accounts](how-to-close-compressed-accounts.md)   | Close compressed accounts, retain address                                       |
| How to Reinitialize Compressed Accounts                                   | Reinitialize closed compressed accounts at the same address with default values |
| How to Burn Compressed Accounts                                           | Burn compressed accounts and their address permanently.                         |

### Complete Flow Overview

{% tabs %}
{% tab title="Create" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Derive unique compressed account address
   ├─ Fetch validity proof (proves that address doesn't exist)
   ├─ Pack accounts and build instruction
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Derive and check address
</strong><strong>      ├─ Initialize compressed account
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify validity proof (non-inclusion)
         ├─ Create address (address tree)
         ├─ Create compressed account (state tree)
         └─ Complete atomic account creation
</code></pre>
{% endtab %}

{% tab title="Update" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch current account data
   ├─ Fetch validity proof (proves that account exists)
   ├─ Build instruction with proof, current data, new data and metadata
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>      ├─ Modify compressed account data (output)
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify and nullify input hash
         ├─ Create new compressed account hash with updated data (output hash)
         └─ Complete atomic account update
</code></pre>
{% endtab %}

{% tab title="Close" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch current account data
   ├─ Fetch validity proof (proves that account exists)
   ├─ Build instruction with proof, current data and metadata
   └─ Send transaction
      │
<strong>      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>      ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>      │
</strong><strong>      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>         ├─ Verify input hash
         ├─ Nullify input hash
         ├─ Append hash to state tree
         │  (marked as closed via zero-bytes and discriminator)
         └─ Complete atomic account closure
</code></pre>
{% endtab %}
{% endtabs %}

{% hint style="info" %}
Packed structs use indices to point to `remaining_accounts` to reduce transaction size. The instruction data references these accounts with `u8` indices instead of full 32 byte pubkeys.
{% endhint %}
