# Advanced: Computing over Light State with custom ZKPs

{% hint style="info" %}
This is an advanced section; if you don't need custom off-chain compute for your application, you can safely disregard this section.
{% endhint %}

If you want to use custom off-chain compute with compressed accounts, you need to verify a custom ZKP in your on-chain program.&#x20;

All state that is compressed via Light Protocol natively enables efficient computation via ZKPs.

If you can describe or translate your computation into a groth16 circuit, you can run that computation over all Solana L1 state that was compressed via Light. This prevents state fragmentation while enabling previously impossible types of applications and computation designs on Solana.
