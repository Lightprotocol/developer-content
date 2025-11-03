---
title: How to Create Compressed Token Accounts
description: Short guide to compressed token account creation with ZK Compression on Solana and difference to regular token accounts.
---

Compressed token accounts store ownership information for compressed tokens like regular token accounts with two core differences. Compressed Tokens

* do not require an [Associated Token Accounts (ATAs)](#user-content-fn-1)[^1], and
* do not require a rent-exempt balance.

Compressed token accounts are created in the following scenarios:

1. `mintTo()` creates compressed token accounts for recipients.

{% content-ref url="how-to-mint-compressed-tokens.md" %}
[how-to-mint-compressed-tokens.md](how-to-mint-compressed-tokens.md)
{% endcontent-ref %}

2. `transfer()` consumes existing accounts of the sender as input, and creates new compressed token accounts with updated balances as output for the sender and recipient(s).

{% content-ref url="how-to-transfer-compressed-token.md" %}
[how-to-transfer-compressed-token.md](how-to-transfer-compressed-token.md)
{% endcontent-ref %}

[^1]: An associated token account is a token account with an address that's a Program Derived Address (PDA) created by the Associated Token Program. You can think of an associated token account as the default token account for a user to hold units of a specific token (mint).
