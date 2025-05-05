# JS - v0.21.0

This is a JS release for `@lightprotocol/stateless.js` and `@lightprotocol/compressed-token.`

v0.21.0 has several important breaking changes that improve protocol scalability.

{% hint style="info" %}
If you need help migrating, we're happy to assist you. Please reach out to the team [here](https://t.me/swen_light).
{% endhint %}

## How to Migrate from v0.20.x

You can find working code snippets [here](https://www.zkcompression.com/developers/add-compressed-token-support-to-your-wallet#decompress-spl-tokens).

## Compress

<pre class="language-typescript"><code class="lang-typescript">// old
const activeStateTrees = await connection.getCachedActiveStateTreeInfo();
<strong>const { tree } = pickRandomTreeAndQueue(activeStateTrees);
</strong>
const compressIx = await CompressedTokenProgram.compress({
    outputStateTree: tree,
});


// New
const treeInfos = await rpc.getStateTreeInfos();
const treeInfo = selectStateTreeInfo(treeInfos);

const infos = await getTokenPoolInfos(rpc, mint);
const tokenPoolInfo = selectTokenPoolInfo(infos);

const compressIx = await CompressedTokenProgram.compress({
    outputStateTreeInfo: treeInfo,
    tokenPoolInfo,
});
</code></pre>

## Decompress

**Old (v0.20.x)**

```typescript
// ...

const stateTreeInfos = await rpc.getCachedActiveStateTreeInfo();
const { tree } = pickRandomTreeAndQueue(stateTreeInfos)

const ix = await CompressedTokenProgram.decompress({
    ...rest,
    outputStateTree: tree,
});
```

**New (v0.21.x)**

```typescript
// ...

const poolInfos = await getTokenPoolInfos(rpc, mint);
const selectedTokenPoolInfos = selectTokenPoolInfosForDecompression(
    poolInfos,
    amount,
);

const ix = await CompressedTokenProgram.decompress({
    ...rest
    tokenPoolInfos: selectedTokenPoolInfos,
});
```



**You can find a detailed list of all changes here:**

{% embed url="https://github.com/Lightprotocol/light-protocol/blob/b860d449b25d1943b4bc007717316913c9713be8/js/compressed-token/CHANGELOG.md" %}
