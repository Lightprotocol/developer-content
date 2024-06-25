# Computing over Light State with custom ZKPs

{% hint style="info" %}
This is an advanced section; if you don't need custom off-chain compute for your application, you can safely disregard this section.
{% endhint %}

If you want to use custom off-chain compute with compressed accounts, you need to verify a custom ZKP in your on-chain program.&#x20;

Fortunately, all state compressed via Light Protocol is stored in Poseidon hash Merkle trees, so you can compute over all the existing compressed state efficiently.
