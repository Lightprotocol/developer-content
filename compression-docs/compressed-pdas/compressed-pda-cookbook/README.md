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
𝐂𝐋𝐈𝐄𝐍𝐓
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
```
𝐂𝐋𝐈𝐄𝐍𝐓
   ├─ Fetch current account data
   ├─ Fetch validity proof (proves that account exists)
   ├─ Build instruction with proof and current data
   └─ Send transaction
      │
      𝐂𝐔𝐒𝐓𝐎𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌
      ├─ Reconstruct existing compressed account hash (input hash)
      │
      └─ 𝐋𝐈𝐆𝐇𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐎𝐆𝐑𝐀𝐌 𝐂𝐏𝐈
         ├─ Verify input hash
         ├─ Nullify input hash (permanent)
         ├─ No output state created
         └─ Complete atomic state transition
```
{% endtab %}
{% endtabs %}
