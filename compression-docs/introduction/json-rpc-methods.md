# JSON RPC Methods

Below are all ZK compression methods extending Solana's default JSON RPC API. Helius Labs maintains the canonical RPC API and indexer implementation [here](https://github.com/helius-labs/photon).

### getCompressedAccount

Returns the compressed account with the given address or hash.&#x20;

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccount.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccount.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccount.yaml)
{% endswagger %}

### getCompressedBalance

Returns the balance for the compressed account with the given address or hash.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedBalance.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedBalance.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedBalance.yaml)
{% endswagger %}

### getCompressedBalanceByOwner

Returns the total balance of the owner's compressed accounts.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedBalanceByOwner.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedBalanceByOwner.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedBalanceByOwner.yaml)
{% endswagger %}

### getCompressedAccountProof

Returns a proof that is used by the compression program to verify that the account is valid.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccountProof.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccountProof.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccountProof.yaml)
{% endswagger %}

### getMultipleCompressedAccounts

Returns multiple compressed accounts with the given addresses or hashes.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getMultipleCompressedAccounts.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getMultipleCompressedAccounts.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getMultipleCompressedAccounts.yaml)
{% endswagger %}

### getMultipleCompressedAccountProofs

Returns multiple proofs that are used by the compression program to verify that the accounts are valid.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getMultipleCompressedAccountProofs.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getMultipleCompressedAccountProofs.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getMultipleCompressedAccountProofs.yaml)
{% endswagger %}

### getCompressedAccountsByOwner

Returns the owner's compressed accounts. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccountsByOwner.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccountsByOwner.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedAccountsByOwner.yaml)
{% endswagger %}

### getCompressedTokenAccountsByOwner

Returns the owner's compressed token accounts. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByOwner.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByOwner.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByOwner.yaml)
{% endswagger %}

### getCompressedTokenAccountsByDelegate

Returns the compressed token accounts that are partially or fully delegated to the given delegate. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByDelegate.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByDelegate.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByDelegate.yaml)
{% endswagger %}

### getCompressedTokenAccountBalance

Returns the balance for a given token account.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountBalance.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountBalance.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountBalance.yaml)
{% endswagger %}

### getCompressedTokenBalancesByOwner

Returns the token balances for a given owner. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByOwner.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByOwner.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressedTokenAccountsByOwner.yaml)
{% endswagger %}

### getTransactionWithCompressionInfo

Returns the transaction data for the transaction with the given signature along with parsed compression info.&#x20;

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getTransactionWithCompressionInfo.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getTransactionWithCompressionInfo.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getTransactionWithCompressionInfo.yaml)
{% endswagger %}

### getCompressionSignaturesForAccount

Return the signatures of the transactions that closed or opened a compressed account with the given hash. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForAccount.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForAccount.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForAccount.yaml)
{% endswagger %}

### getCompressionSignaturesForAddress

Return the signatures of the transactions that closed or opened a compressed account with the given address. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForAddress.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForAddress.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForAddress.yaml)
{% endswagger %}

### getCompressionSignaturesForOwner

Returns the signatures of the transactions that have modified an owner's compressed accounts. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForOwner.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForOwner.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForOwner.yaml)
{% endswagger %}

### getCompressionSignaturesForTokenOwner

Returns the signatures of the transactions that have modified an owner's compressed token accounts. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForTokenOwner.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForTokenOwner.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getCompressionSignaturesForTokenOwner.yaml)
{% endswagger %}

### getLatestCompressionSignatures

Returns the signatures of the latest transactions that used the compression program. This is a paginated endpoint.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getLatestCompressionSignatures.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getLatestCompressionSignatures.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getLatestCompressionSignatures.yaml)
{% endswagger %}

### getIndexerHealth

Returns an error if the indexer is stale by more than a configurable number of blocks. Else returns ok.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getIndexerHealth.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getIndexerHealth.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getIndexerHealth.yaml)
{% endswagger %}

### getIndexerSlot

Returns the slot of the last block indexed by the indexer.

{% swagger src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getIndexerSlot.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getIndexerSlot.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getIndexerSlot.yaml)
{% endswagger %}

