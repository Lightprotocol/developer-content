# Table of contents

* [Introduction](README.md)
* [CLAUDE.md](claude.md.md)
* [Quickstart](quickstart.md)
* [Support](support.md)
* [Event: 1000x Hackathon Sidetracks](event-1000x-hackathon-sidetracks.md)

## Compressed Tokens

* [Overview](compressed-tokens/overview.md)
* [Guides](compressed-tokens/guides/README.md)
  * [How to Create Compressed Token Accounts](compressed-tokens/guides/how-to-create-compressed-token-accounts.md)
  * [How to Mint Compressed Tokens](compressed-tokens/guides/how-to-mint-compressed-tokens.md)
  * [How to Transfer Compressed Token](compressed-tokens/guides/how-to-transfer-compressed-token.md)
  * [How to compress and decompress SPL Tokens](compressed-tokens/guides/how-to-compress-and-decompress-spl-tokens.md)
  * [How to Compress complete SPL Token Accounts](compressed-tokens/guides/how-to-compress-complete-spl-token-accounts.md)
  * [How to Create and Register a Mint Account for Compression](compressed-tokens/guides/how-to-create-and-register-a-mint-account-for-compression.md)
  * [How to Create Compressed Token Pools for Mint Accounts](compressed-tokens/guides/how-to-create-compressed-token-pools-for-mint-accounts.md)
  * [How to Merge Compressed Token Accounts](compressed-tokens/guides/how-to-merge-compressed-token-accounts.md)
  * [How to approve and revoke delegate authority](compressed-tokens/guides/how-to-approve-and-revoke-delegate-authority.md)
* [Implementation Guides](compressed-tokens/implementation-guides/README.md)
  * [Add Wallet Support for Compressed Tokens](compressed-tokens/implementation-guides/add-wallet-support-for-compressed-tokens.md)
  * [Create an Airdrop](compressed-tokens/implementation-guides/create-an-airdrop.md)
  * [Use Token 2022 with Compression](compressed-tokens/implementation-guides/use-token-2022-with-compression.md)
* [Examples](compressed-tokens/example-clients/README.md)
  * [Example Web Client](https://github.com/Lightprotocol/example-web-client)
  * [Example Node.js Client](https://github.com/Lightprotocol/example-nodejs-client)
  * [Claim Implementation Airdrops](https://github.com/Lightprotocol/example-compressed-claim)
  * [Example Token Distribution](https://github.com/Lightprotocol/example-token-distribution)

## Compressed PDAs

* [Create a Program with Compressed PDAs](compressed-pdas/create-a-program-with-compressed-pdas.md)
* [Guides](compressed-pdas/guides/README.md)
  * [How to Create Compressed Accounts](compressed-pdas/guides/how-to-create-compressed-accounts.md)
  * [How to Update Compressed Accounts](compressed-pdas/guides/how-to-update-compressed-accounts.md)
  * [How to Close Compressed Accounts](compressed-pdas/guides/how-to-close-compressed-accounts.md)
  * [How to Reinitialize Compressed Accounts](compressed-pdas/guides/how-to-reinitialize-compressed-accounts.md)
  * [How to Burn Compressed Accounts](compressed-pdas/guides/how-to-burn-compressed-accounts.md)
* [Client Library](compressed-pdas/client-library/README.md)
  * [Rust](compressed-pdas/client-library/rust.md)
  * [Typescript](compressed-pdas/client-library/typescript.md)
* [Program Examples](compressed-pdas/program-examples.md)

## Resources

* [CLI Installation](resources/cli-installation.md)
* [Addresses & URLs](resources/addresses-and-urls.md)
* [JSON RPC methods](resources/json-rpc-methods/README.md)
  * [getcompressedaccount](resources/json-rpc-methods/getcompressedaccount.md)
  * [getcompressedaccountsbyowner](resources/json-rpc-methods/getcompressedaccountsbyowner.md)
  * [getcompressedbalancebyowner](resources/json-rpc-methods/getcompressedbalancebyowner.md)
  * [getcompressedbalance](resources/json-rpc-methods/getcompressedbalance.md)
  * [getcompressedminttokenholders](resources/json-rpc-methods/getcompressedminttokenholders.md)
  * [getcompressedtokenaccountbalance](resources/json-rpc-methods/getcompressedtokenaccountbalance.md)
  * [getcompressedtokenaccountbydelegate](resources/json-rpc-methods/getcompressedtokenaccountbydelegate.md)
  * [getcompressedtokenaccountsbyowner](resources/json-rpc-methods/getcompressedtokenaccountsbyowner.md)
  * [getcompressedtokenbalancesbyowner](resources/json-rpc-methods/getcompressedtokenbalancesbyowner.md)
  * [getcompressionsignaturesforaccount](resources/json-rpc-methods/getcompressionsignaturesforaccount.md)
  * [getcompressionsignaturesforaddress](resources/json-rpc-methods/getcompressionsignaturesforaddress.md)
  * [getcompressionsignaturesforowner](resources/json-rpc-methods/getcompressionsignaturesforowner.md)
  * [getcompressionsignaturesfortokenowner](resources/json-rpc-methods/getcompressionsignaturesfortokenowner.md)
  * [getindexerhealth](resources/json-rpc-methods/getindexerhealth.md)
  * [getindexerslot](resources/json-rpc-methods/getindexerslot.md)
  * [getlatestcompressionsignatures](resources/json-rpc-methods/getlatestcompressionsignatures.md)
  * [getlatestnonvotingsignatures](resources/json-rpc-methods/getlatestnonvotingsignatures.md)
  * [getmultiplecompressedaccounts](resources/json-rpc-methods/getmultiplecompressedaccounts.md)
  * [getmultiplenewaddressproofs](resources/json-rpc-methods/getmultiplenewaddressproofs.md)
  * [gettransactionwithcompressioninfo](resources/json-rpc-methods/gettransactionwithcompressioninfo.md)
  * [getvalidityproof](resources/json-rpc-methods/getvalidityproof.md)
* [SDKs](resources/sdks/README.md)
  * [Client Development](resources/sdks/client-development.md)
  * [Program Development](resources/sdks/program-development.md)
* [Error Cheatsheet](resources/error-cheatsheet/README.md)
  * [Debug 0x179b / 6043 / ProofVerificationFailed](resources/error-cheatsheet/debug-0x179b-6043-proofverificationfailed.md)
  * [Debug 0x179b / 6043 / ProofVerificationFailed (new)](resources/error-cheatsheet/debug-0x179b-6043-proofverificationfailed-new.md)
  * [Debug 0x36D2 / 14034 / InvalidCpiAccountsOffset](resources/error-cheatsheet/debug-0x36d2-14034-invalidcpiaccountsoffset.md)

## Learn

* [Core Concepts](learn/core-concepts/README.md)
  * [Compressed Account Model](learn/core-concepts/compressed-account-model/README.md)
    * [State Merkle Trees](learn/core-concepts/compressed-account-model/README.md#state-merkle-trees)
    * [Validity Proofs](learn/core-concepts/compressed-account-model/README.md#validity-proofs)
  * [Lifecycle of a Transaction](learn/core-concepts/lifecycle-of-a-transaction.md)
  * [Considerations](learn/core-concepts/considerations.md)
* [Node Operators](learn/node-operators.md)
* [Solana vs Compressed Accounts](learn/core-concepts/solana-vs-compressed-accounts.md)


## References

* [AI Tools Guide](references/ai-tools-guide.md)
* [Whitepaper](references/whitepaper.md)
* [Terminology](references/terminology.md)
* [Security](references/security.md)

## Links

* [GitHub](https://github.com/Lightprotocol)
* [DeepWiki](https://deepwiki.com/Lightprotocol/light-protocol)
* [Discord](https://discord.com/invite/CYvjBgzRFP)
