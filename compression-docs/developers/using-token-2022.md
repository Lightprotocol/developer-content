# Using Token-2022

You can compress token-2022 accounts of mints with the following mint-extensions:

* MetadataPointer
* TokenMetadata
* InterestBearingConfig
* GroupPointer
* GroupMemberPointer
* TokenGroup
* TokenGroupMember

All other extensions are not yet supported.

{% hint style="info" %}
If you require support for other mint-extensions, [let us know](https://t.me/swen_light)!
{% endhint %}

## Minting, compressing, and transferring tokens with Token-2022 Metadata

{% hint style="info" %}
You need the following SDK versions:

* `@lightprotocol/stateless.js`  ≥ 0.21.0&#x20;
* `@lightprotocol/compressed-token`  ≥ 0.21.0&#x20;
* `@solana/web3.js` ≥ 1.95.3
{% endhint %}

```typescript
import { confirmTx, createRpc } from "@lightprotocol/stateless.js";
import {
  compress,
  createTokenPool,
  transfer,
} from "@lightprotocol/compressed-token";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo as mintToSpl,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import dotenv from "dotenv";
import bs58 from "bs58";
dotenv.config();

// set these values in your .env file
const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR!));
const RPC_ENDPOINT = process.env.RPC_ENDPOINT!;
const connection = createRpc(RPC_ENDPOINT);

(async () => {
  const mint = Keypair.generate();
  const decimals = 9;

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name: "name",
    symbol: "symbol",
    uri: "uri",
    additionalMetadata: [["key", "value"]],
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  // airdrop to pay gas
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 1e7)
  );

  console.log("mint", mint.publicKey.toBase58());

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    })
  );
  const txId = await sendAndConfirmTransaction(connection, mintTransaction, [
    payer,
    mint,
  ]);

  console.log(`txId: ${txId}`);

  // registering the mint with the Compressed-Token program
  const txId2 = await createTokenPool(
    connection,
    payer,
    mint.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log(`register-mint success! txId: ${txId2}`);

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint.publicKey,
    payer.publicKey,
    undefined,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  console.log(`ATA: ${ata.address}`);
  // Mint SPL
  const mintTxId = await mintToSpl(
    connection,
    payer,
    mint.publicKey,
    ata.address,
    payer.publicKey,
    1e5,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log(`mint-spl success! txId: ${mintTxId}`);

  const compressedTokenTxId = await compress(
    connection,
    payer,
    mint.publicKey,
    1e5,
    payer,
    ata.address,
    payer.publicKey
  );
  console.log(`compressed-token success! txId: ${compressedTokenTxId}`);

  const transferCompressedTxId = await transfer(
    connection,
    payer,
    mint.publicKey,
    1e5,
    payer,
    payer.publicKey // self-transfer
  );
  console.log(`transfer-compressed success! txId: ${transferCompressedTxId}`);
})();

```
