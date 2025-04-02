# getValidityProof

Returns a single ZK Proof used by the compression program to verify that the given accounts are valid and that the new addresses can be created

{% hint style="info" %}
* Proof limits per request are:
  * `hashes`: 1, 2, 3, 4, or 8&#x20;
  * `newAddressesWithTrees` : 1, 2
* The `newAddresses` param field is supported but deprecated. Please use `newAddressesWithTrees`instead.\

{% endhint %}



{% openapi src="https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getValidityProof.yaml" path="/" method="post" %}
[https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getValidityProof.yaml](https://raw.githubusercontent.com/helius-labs/photon/main/src/openapi/specs/getValidityProof.yaml)
{% endopenapi %}
