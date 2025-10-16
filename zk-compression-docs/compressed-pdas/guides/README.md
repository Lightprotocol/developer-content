---
description: >-
  Overview and comparison of guides to create, update, close, reinitialize, and
  burn permanently compressed accounts. Guides include step-by-step
  implementation and full code examples.
hidden: true
---

# Guides

### Guides Overview <a href="#subsection-jvtgde75u" id="subsection-jvtgde75u"></a>

<table><thead><tr><th width="332.7890625">Guide</th><th>Description</th></tr></thead><tbody><tr><td><a href="how-to-create-compressed-accounts.md">How to Create Compressed Accounts</a></td><td>Create compressed accounts with addresses</td></tr><tr><td><a href="how-to-update-compressed-accounts.md">How to Update Compressed Accounts</a></td><td>Update compressed accounts</td></tr><tr><td><a href="how-to-close-compressed-accounts.md">How to Close Compressed Accounts</a></td><td>Close compressed accounts, retain the address</td></tr><tr><td><a href="how-to-reinitialize-compressed-accounts.md">How to Reinitialize Compressed Accounts</a></td><td>Reinitialize closed compressed accounts with the same address and new values</td></tr><tr><td><a href="how-to-burn-compressed-accounts.md">How to Burn Compressed Accounts</a></td><td>Burn compressed accounts and their address permanently</td></tr></tbody></table>

### Complete Flow Overview

{% tabs %}
{% tab title="Create" %}
<figure><img src="../../.gitbook/assets/image (14).png" alt=""><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Untitled" %}
```

├─ 
├─ 
├─ 
└─ 
   │
 
   ├─ 
   ├─ 
   │
   └─ 
         ├─ 
         ├─ 
         ├─ 
         └─ 
```
{% endtab %}

{% tab title="Update" %}
```
𝐂𝐥𝐢𝐞𝐧𝐭
├─ Fetch current account data 
├─ Fetch validity proof (proves that account exists)
├─ Build instruction with proof, current data, new data and metadata
└─ Send transaction
   │
 𝐂𝐮𝐬𝐭𝐨𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦
   ├─ Reconstruct existing compressed account hash (input hash)
   ├─ Modify compressed account data
   │
   └─ 𝐋𝐢𝐠𝐡𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦 𝐂𝐏𝐈
      ├─ Verify input hash 
      ├─ Nullify input hash 
      ├─ Create new account hash with updated data (output hash)
      └─ Complete atomic account update
```
{% endtab %}

{% tab title="Close" %}
```
𝐂𝐥𝐢𝐞𝐧𝐭
├─ Fetch current account data
├─ Fetch validity proof (proves that account exists)
├─ Build instruction with proof, current data and metadata
└─ Send transaction
   │
 𝐂𝐮𝐬𝐭𝐨𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦
   ├─ Reconstruct existing compressed account hash (input hash)
   │
   └─ 𝐋𝐢𝐠𝐡𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦 𝐂𝐏𝐈
       ├─ Verify input hash
       ├─ Nullify input hash
       ├─ Append new account hash to state tree 
       │  (output hash is marked as closed via zero-bytes and discriminator)
       └─ Complete atomic account closure
```
{% endtab %}

{% tab title="Reinit" %}
```
𝐂𝐥𝐢𝐞𝐧𝐭
├─ Fetch closed account metadata
├─ Fetch validity proof (proves closed account hash exists)
├─ Build instruction with proof and new data
└─ Send transaction
   │
 𝐂𝐮𝐬𝐭𝐨𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦
   ├─ Reconstruct closed account hash with zero values (input hash)
   ├─ Initialize account with new data
   │
   └─ 𝐋𝐢𝐠𝐡𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦 𝐂𝐏𝐈
      ├─ Verify input hash
      ├─ Nullify input hash
      └─ Append new account hash with new values (output hash)
```
{% endtab %}

{% tab title="Burn" %}
<pre><code>𝐂𝐥𝐢𝐞𝐧𝐭
├─ Fetch current account data
├─ Fetch validity proof (proves that account exists)
├─ Build instruction with proof and current data
└─ Send transaction
   │
<strong> 𝐂𝐮𝐬𝐭𝐨𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦
</strong><strong>   ├─ Reconstruct existing compressed account hash (input hash)
</strong><strong>   │
</strong><strong>   └─ 𝐋𝐢𝐠𝐡𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐏𝐫𝐨𝐠𝐫𝐚𝐦 𝐂𝐏𝐈
</strong>      ├─ Verify input hash
      ├─ Nullify input hash (permanent)
      ├─ No output state created
      └─ Complete atomic state transition
</code></pre>
{% endtab %}
{% endtabs %}

```
```
