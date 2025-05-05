# JS - v0.21.0

This is a JS release for `@lightprotocol/stateless.js` and `@lightprotocol/compressed-token.`

v0.21.0 has several important breaking changes that improve protocol scalability.

{% hint style="info" %}
If you need help migrating, we're happy to assist you. Please reach out to the team [here](https://t.me/swen_light).
{% endhint %}

## How to Migrate from v0.20.x

### Compress

**Old Code**

```typescript
// old
const activeStateTrees = await connection.getCachedActiveStateTreeInfo();
const { tree } = pickRandomTreeAndQueue(activeStateTrees);

const compressIx = await CompressedTokenProgram.compress({
    // ...
    outputStateTree: tree,
});
```

**New Code**

```typescript
// 1. Fetch and select stateTreeInfo
const treeInfos = await rpc.getStateTreeInfos();
const treeInfo = selectStateTreeInfo(treeInfos);

// 2. Fetch and select tokenPoolInfo
const infos = await getTokenPoolInfos(rpc, mint);
const tokenPoolInfo = selectTokenPoolInfo(infos);

const compressIx = await CompressedTokenProgram.compress({
    // ...
    outputStateTreeInfo: treeInfo,
    tokenPoolInfo,
});
```

### Decompress

```typescript
// 1. Fetch and select stateTreeInfo
const treeInfos = await rpc.getStateTreeInfos();
const treeInfo = selectStateTreeInfo(treeInfos);

// 2. Fetch tokenPoolInfo
const infos = await getTokenPoolInfos(rpc, mint);
// Select explicitly for decompression
const selectedInfos = selectTokenPoolInfosForDecompression(
    infos,
    amount,
);

const ix = await CompressedTokenProgram.decompress({
    // ...
    outputStateTreeInfo: treeInfo,
    tokenPoolInfos: selectedInfos,
});
```





You can find a detailed list of all changes here:

{% embed url="https://github.com/Lightprotocol/light-protocol/blob/b860d449b25d1943b4bc007717316913c9713be8/js/compressed-token/CHANGELOG.md" %}

