# Compressed Account Model

{% hint style="info" %}
This guide assumes that you're familiar with [Solana's account model](https://solana.com/docs/core/accounts).
{% endhint %}

ZK compressed state is stored in compressed accounts. Compressed accounts are similar to regular Solana accounts but with four main differences:

## Key Differences <a href="#key-differences" id="key-differences"></a>

* Each compressed account can be identified by its hash
* Each write to a compressed account changes its hash
* An `address` can optionally be set as a permanent unique ID of the compressed account
* All compressed accounts are stored in [sparse state trees](https://www.zkcompression.com/learn/core-concepts/state-trees). Only the tree's state root (small fingerprint of all compressed accounts) is stored in the on-chain account space.

These differences allow the protocol to store state off-chain (e.g., in the less expensive Solana ledger space) instead of in costly on-chain account space.

To understand the similarities and differences between Solana's regular account model and compressed accounts, let's first look at **compressed accounts with Program-Derived Addresses** (PDAs).

> If you don't know what PDAs are, read [this explainer](https://solana.com/docs/core/pda) first.

## Compressed PDA Accounts <a href="#compressed-pda-accounts" id="compressed-pda-accounts"></a>

Like regular accounts, each compressed PDA account can be identified by its unique persistent address, represented as 32 bytes in the format of a `PublicKey`. Like PDAs, compressed account addresses don't belong to a private key; rather, they're derived from the program owning them.



<figure><img src="https://www.zkcompression.com/~gitbook/image?url=https%3A%2F%2F3488020389-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDBJ4vLlhHTdkUGOiHxbB%252Fuploads%252FikMGOt2gYlH0YAyIDMGR%252Fimage.png%3Falt%3Dmedia%26token%3D61e5f88c-7fba-4506-9be5-a6b673831878&#x26;width=768&#x26;dpr=4&#x26;quality=100&#x26;sign=6fae0b7e54251a5364d07c144b3e3dec18b1c7c7a6050ab8b7abbdff28f991e0" alt="" width="563"><figcaption><p>Compressed PDA Accounts</p></figcaption></figure>

The compressed PDA account layout is similar to Solana's regular PDA account layout: Data, Lamports, Owner, and an address field. The data field stores the program state. Notice the enshrined AccountData structure: Discriminator, Data, DataHash:

<figure><img src="https://www.zkcompression.com/~gitbook/image?url=https%3A%2F%2F3488020389-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDBJ4vLlhHTdkUGOiHxbB%252Fuploads%252FgOUc2sZELSEWVeT5h2cI%252Fimage.png%3Falt%3Dmedia%26token%3D40d84b6a-d4b6-4224-8d20-a92c8a4355f4&#x26;width=768&#x26;dpr=4&#x26;quality=100&#x26;sign=74977b716a84d81d307582fe5f7b8da2765064ba11d3c1e1edec167c39fc60b9" alt="" width="563"><figcaption><p>Compressed PDA Account with AccountData</p></figcaption></figure>

The [Anchor](https://www.anchor-lang.com/) framework reserves the first 8 bytes of a regular account's data field for the discriminator. This helps programs distinguish between different program-owned accounts. The default compressed account layout is opinionated in this regard and enforces a discriminator in the Data field. You can ignore the dataHash field for now; we cover its importance for ZK Compression later.

### Address & Hash <a href="#address-and-hash" id="address-and-hash"></a>

The `address` field is optional for compressed accounts because ensuring that the address of a new account is unique incurs additional computational overhead, and not all use cases need the uniqueness property of addresses.

Instead, each compressed account can be identified by its hash, regardless of whether it has an address.

{% hint style="info" %}
* Use the address field wherever the state must be unique (such as for NFTs or certain PDAs).
* You don't need the address for any fungible state (e.g., fungible tokens).
{% endhint %}

By definition, whenever the data of a compressed account changes, its hash changes. This impacts how developers interact with fungible state:

* Check out the [Examples](https://www.zkcompression.com/introduction/intro-to-development#build-by-example) to see what using hashes instead of addresses looks like in practice.
* Visit the [State Trees](https://www.zkcompression.com/learn/core-concepts/state-trees) section to understand why using the account's hash as its ID makes sense for the compression protocol.
