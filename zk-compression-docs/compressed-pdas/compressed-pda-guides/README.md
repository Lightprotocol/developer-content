---
description: >-
  Overview and comparison of guides to create, update, and close compressed
  accounts. Guides include step-by-step implementation and full code examples
  for Anchor, native Rust, and Pinocchio.
hidden: true
---

# Compressed PDA Guides





### Guides Overview <a href="#subsection-jvtgde75u" id="subsection-jvtgde75u"></a>

<table><thead><tr><th width="332.7890625">Guide</th><th>Description</th></tr></thead><tbody><tr><td><a href="how-to-create-compressed-accounts.md">How to Create Compressed Accounts</a></td><td>Create compressed accounts with addresses</td></tr><tr><td><a href="how-to-update-compressed-accounts.md">How to Update Compressed Accounts</a></td><td>Update compressed accounts</td></tr><tr><td><a href="how-to-close-compressed-accounts.md">How to Close Compressed Accounts</a></td><td>Close compressed accounts, retain address</td></tr><tr><td><a href="how-to-reinitialize-compressed-accounts.md">How to Reinitialize Compressed Accounts</a></td><td>Reinitialize closed compressed accounts at the same address with new values</td></tr><tr><td><a href="how-to-burn-compressed-accounts.md">How to Burn Compressed Accounts</a></td><td>Burn compressed accounts and their address permanently.</td></tr></tbody></table>

### Complete Flow Overview

{% tabs %}
{% tab title="Create" %}
```
𝐂𝐋𝐈𝐄𝐍𝐓
├─ Derive unique compressed account address
├─ Fetch validity proof (proves that address doesn't exist)
├─ Pack accounts and build instruction
└─ Send transaction
   │
 𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
   ├─ Derive and check address
   ├─ Initialize compressed account
   │
   └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
      ├─ Verify validity proof (non-inclusion)
      ├─ Create address (address tree)
      ├─ Create compressed account (state tree)
      └─ Complete atomic account creation
```
{% endtab %}

{% tab title="Update" %}
```
Client
├─ Fetch current account data 
├─ Fetch validity proof (proves that account exists)
├─ Build instruction with proof, current data, new data and metadata
└─ Send transaction
   │
 𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
   ├─ Reconstruct existing compressed account hash (input hash)
   ├─ Modify compressed account data
   │
   └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
      ├─ Verify input hash 
      ├─ Nullify input hash 
      ├─ Create new account hash with updated data (output hash)
      └─ Complete atomic account update
```
{% endtab %}

{% tab title="Close" %}
```
𝐂𝐋𝐈𝐄𝐍𝐓
├─ Fetch current account data
├─ Fetch validity proof (proves that account exists)
├─ Build instruction with proof, current data and metadata
└─ Send transaction
   │
 𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
   ├─ Reconstruct existing compressed account hash (input hash)
   │
   └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
       ├─ Verify input hash
       ├─ Nullify input hash
       ├─ Append new account hash to state tree 
       │  (output hash is marked as closed via zero-bytes and discriminator)
       └─ Complete atomic account closure
```
{% endtab %}

{% tab title="Reinit" %}
```
𝐂𝐋𝐈𝐄𝐍𝐓
├─ Fetch closed account metadata
├─ Fetch validity proof (proves closed account hash exists)
├─ Build instruction with proof and new data
└─ Send transaction
   │
 𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
   ├─ Reconstruct closed account hash with zero values (input hash)
   ├─ Initialize account with new data
   │
   └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
      ├─ Verify input hash
      ├─ Nullify input hash
      └─ Append new account hash with new values (output hash)
```
{% endtab %}

{% tab title="Burn" %}
<pre><code>𝐂𝐋𝐈𝐄𝐍𝐓
├─ Fetch current account data
├─ Fetch validity proof (proves that account exists)
├─ Build instruction with proof and current data
└─ Send transaction
   │
<strong> 𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
</strong><strong>   ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>   │
</strong><strong>   └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
</strong>      ├─ Verify input hash
        ├─ Nullify input hash (permanent)
        ├─ No output state created
        └─ Complete atomic state transition
</code></pre>
{% endtab %}
{% endtabs %}
