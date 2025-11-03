---
description: >-
  This file provides guidance to Claude Code (claude.ai/code) when working with
  developer documentation in this repository.
hidden: true
---

# Developer Documentation Index

## Table of Contents

- [AI Integration](#ai-integration)
- [Project Overview](#project-overview)
- [Complete Documentation Index](#complete-documentation-index)
- [Development Quick Reference](#development-quick-reference)
  - [Program Development (Rust)](#for-program-development-rust)
  - [Client Development](#for-client-development)
  - [Wallet Integration](#for-wallet-integration)
  - [Infrastructure Requirements](#infrastructure-requirements)
  - [Key Program IDs](#key-program-ids)

***

> ## AI Integration
>
> This documentation supports AI-powered development workflows:
>
> * **[LLM Index](https://www.zkcompression.com/llms.txt)** — Site map optimized for LLM navigation
> * **[Full LLM Content](https://www.zkcompression.com/llms-full.txt)** — Complete documentation as single file for AI processing
> * **Markdown Export** — Append `.md` to any page URL across the site for raw markdown (e.g., [`whitepaper.md`](https://www.zkcompression.com/references/whitepaper.md))
>
> ### Deep Wiki & Ask Devin
> * **[Developer Content](https://deepwiki.com/Lightprotocol/developer-content)** — AI-indexed documentation
> * **[Program Examples](https://deepwiki.com/Lightprotocol/program-examples)** — AI-indexed code examples
> * **[Light Protocol Repository](https://deepwiki.com/Lightprotocol/light-protocol)** — AI-indexed source code
***

### Complete Documentation Index

```
zk-compression-docs/
│
├─ [Introduction](README.md) — Introduction to ZK Compression
├─ [Quickstart](quickstart.md) — Create your first compressed token in minutes
├─ [Support](support.md) — Get expert help with ZK Compression, compressed tokens, compressed PDAs, local development and more
├─ [Event: 1000x Hackathon Sidetracks](event-1000x-hackathon-sidetracks.md) — Overview to Local Sidetracks to the Cypherpunk Hackathon
│
├─ Compressed Tokens/
│  ├─ [Overview](compressed-tokens/overview.md) — Complete overview to compressed tokens core features, setup guide and cookbook
│  ├─ Guides/
│  │  ├─ [Index](compressed-tokens/guides/README.md) — Overview of guides to compressed token operations with full code examples
│  │  ├─ [How to Create and Register Mint](how-to-create-and-register-a-mint-account-for-compression.md) — Complete guide to create and register an SPL token mint account for compression with createMint()
│  │  ├─ [How to Create Token Accounts](how-to-create-compressed-token-accounts.md) — Short guide to compressed token account creation with ZK Compression on Solana
│  │  ├─ [How to Mint Compressed Tokens](how-to-mint-compressed-tokens.md) — Complete guide to mint compressed tokens with mintTo()
│  │  ├─ [How to Transfer Compressed Tokens](how-to-transfer-compressed-token.md) — Complete guide to transfer compressed SPL tokens between compressed or regular accounts with transfer()
│  │  ├─ [How to Compress/Decompress SPL Tokens](how-to-compress-and-decompress-spl-tokens.md) — Complete guide to compress SPL tokens with compress() and decompress with decompress(). Best used for transfers
│  │  ├─ [How to Compress Complete Token Accounts](how-to-compress-complete-spl-token-accounts.md) — Complete guide to compress complete SPL Token Accounts with compressSplTokenAccount. Use for account migration and to reclaim rent
│  │  ├─ [How to Merge Token Accounts](how-to-merge-compressed-token-accounts.md) — Complete guide to merge multiple compressed token accounts into a single account with mergeTokenAccounts()
│  │  ├─ [How to Create Token Pools](how-to-create-compressed-token-pools-for-mint-accounts.md) — Complete guide to create and manage token pools for compressed tokens for SPL mints with createTokenPool()
│  │  └─ [How to Approve/Revoke Delegate](how-to-approve-and-revoke-delegate-authority.md) — Complete guide to manage delegate authority for compressed tokens with approve() and revoke()
│  └─ Advanced Guides/
│     ├─ [Index](compressed-tokens/advanced-guides/README.md) — Reference table mapping all advanced guides with descriptions
│     ├─ [Create an Airdrop](create-an-airdrop.md) — Complete guide to create an airdrop with or without code. ZK compression is the most efficient way to distribute SPL tokens
│     ├─ [Use Token 2022 with Compression](use-token-2022-with-compression.md) — Complete guide to mint, compress and transfer tokens with Token-2022 Metadata with ZK Compression
│     └─ [Add Wallet Support](add-wallet-support-for-compressed-tokens.md) — Complete guide to add Compressed Token Support to Your Wallet Application
│
├─ Compressed PDAs/
│  ├─ [Overview](compressed-pdas/overview.md) — Overview to compressed PDA core features
│  ├─ [Create a Program with Compressed PDAs](create-a-program-with-compressed-pdas.md) — Overview to compressed PDA core features and guide for program development
│  ├─ Guides/
│  │  ├─ [Index](compressed-pdas/guides/README.md)
│  │  ├─ [How to Create Compressed Accounts](how-to-create-compressed-accounts.md)
│  │  │  ├─ Derive unique compressed account address
│  │  │  ├─ Fetch validity proof (proves address doesn't exist)
│  │  │  ├─ Pack accounts and build instruction
│  │  │  └─ Send transaction
│  │  ├─ [How to Update Compressed Accounts](how-to-update-compressed-accounts.md)
│  │  ├─ [How to Close Compressed Accounts](how-to-close-compressed-accounts.md)
│  │  ├─ [How to Reinitialize Compressed Accounts](how-to-reinitialize-compressed-accounts.md)
│  │  └─ [How to Burn Compressed Accounts](how-to-burn-compressed-accounts.md)
│  ├─ Client Library/
│  │  ├─ [Index](compressed-pdas/client-library/README.md)
│  │  ├─ [Rust](rust.md)
│  │  └─ [TypeScript](typescript.md)
│  └─ Testing Libraries/
│     ├─ [Index](compressed-pdas/testing-libraries/README.md)
│     ├─ [Light Program Test](light-program-test.md)
│     └─ [Light Client](light-client.md)
│
├─ Resources/
│  ├─ [CLI Installation](resources/cli-installation.md) — Steps to set up your local environment for ZK Compression development
│  ├─ [Addresses & URLs](resources/addresses-and-urls.md) — Overview to all of ZK Compression's RPC URLs, Program IDs & Accounts and Lookup Tables
│  ├─ JSON RPC Methods/
│  │  ├─ [Index](resources/json-rpc-methods/README.md) — Overview of all available ZK compression JSON RPC endpoints on Solana, best practices, and error codes
│  │  ├─ [getCompressedAccount](getcompressedaccount.md) — Retrieve compressed account information by address or hash
│  │  ├─ [getCompressedAccountsByOwner](getcompressedaccountsbyowner.md) — Retrieve all compressed accounts owned by a specific address
│  │  ├─ [getCompressedBalance](getcompressedbalance.md) — Retrieve the lamport balance for a specific compressed account by address or hash
│  │  ├─ [getCompressedBalanceByOwner](getcompressedbalancebyowner.md) — Query the total compressed token balance for a specific account owner
│  │  ├─ [getCompressedMintTokenHolders](getcompressedminttokenholders.md) — Retrieve owner balances for a given mint in descending order
│  │  ├─ [getCompressedTokenAccountBalance](getcompressedtokenaccountbalance.md) — Retrieve the balance for a given token account by address or hash
│  │  ├─ [getCompressedTokenAccountByDelegate](getcompressedtokenaccountbydelegate.md) — Retrieve compressed token accounts that are partially or fully delegated to a given delegate
│  │  ├─ [getCompressedTokenAccountsByOwner](getcompressedtokenaccountsbyowner.md) — Retrieve compressed token accounts owned by a specific address
│  │  ├─ [getCompressedTokenBalancesByOwner](getcompressedtokenbalancesbyowner.md) — Retrieves all token balances for compressed accounts owned by an address
│  │  ├─ [getCompressionSignaturesForAccount](getcompressionsignaturesforaccount.md) — Retrieve the signatures of the transactions that closed or opened a compressed account with the given hash
│  │  ├─ [getCompressionSignaturesForAddress](getcompressionsignaturesforaddress.md) — Retrieve the signatures of the transactions that closed or opened a compressed account with the given address
│  │  ├─ [getCompressionSignaturesForOwner](getcompressionsignaturesforowner.md) — Retrieve the signatures of the transactions that have modified an owner's compressed accounts
│  │  ├─ [getCompressionSignaturesForTokenOwner](getcompressionsignaturesfortokenowner.md) — Retrieve the signatures of the transactions that have modified an owner's compressed token accounts
│  │  ├─ [getIndexerHealth](getindexerhealth.md) — Retrieve an error if the indexer is stale by more than a configurable number of blocks
│  │  ├─ [getIndexerSlot](getindexerslot.md) — Retrieve the slot of the last block indexed by the indexer
│  │  ├─ [getLatestCompressionSignatures](getlatestcompressionsignatures.md) — Retrieve the signatures of the latest transactions that used the compression program (paginated endpoint)
│  │  ├─ [getLatestNonVotingSignatures](getlatestnonvotingsignatures.md) — Retrieve the signatures of the latest transactions that are not voting transactions
│  │  ├─ [getMultipleCompressedAccounts](getmultiplecompressedaccounts.md) — Retrieve multiple compressed accounts with the given addresses or hashes
│  │  ├─ [getMultipleNewAddressProofs](getmultiplenewaddressproofs.md) — Retrieve proofs that the new addresses are not taken already and can be created
│  │  ├─ [getTransactionWithCompressionInfo](gettransactionwithcompressioninfo.md) — Retrieve the transaction data for the transaction with the given signature along with parsed compression info
│  │  └─ [getValidityProof](getvalidityproof.md) — Retrieve a single ZK Proof used by the compression program to verify that the given accounts are valid and the new addresses can be created
│  ├─ SDKs/
│  │  ├─ [Index](resources/sdks/README.md) — Overview to TypeScript and Rust SDKs for Client and Program Development
│  │  ├─ [Client Development](client-development.md) — Overview to Client side development. Quick access to TypeScript and Rust SDKs
│  │  └─ [Program Development](program-development.md) — Overview to on-chain program development. Quick access to SDKs for Anchor, Pinocchio, or native Rust
│  └─ Error Cheatsheet/
│     ├─ [Index](resources/error-cheatsheet/README.md) — Complete error code reference for ZK Compression. Search error codes with hex values and messages
│     └─ [Debug ProofVerificationFailed](debug-0x179b-6043-proofverificationfailed.md) — Common cause and debug steps for ProofVerificationFailed (0x179B / 6043)
│
├─ Learn/
│  ├─ Core Concepts/
│  │  ├─ [Index](learn/core-concepts/README.md) — Overview to ZK Compression's Core Concepts. Get a high-level system overview
│  │  ├─ Compressed Account Model/
│  │  │  ├─ [Overview](compressed-account-model/README.md) — Overview to the Compressed Account Model, State Merkle trees, and Validity Proofs
│  │  │  ├─ [State Merkle Trees](README.md#state-merkle-trees)
│  │  │  └─ [Validity Proofs](README.md#validity-proofs)
│  │  ├─ [Lifecycle of a Transaction](lifecycle-of-a-transaction.md) — Overview to the lifecycle of a transaction that interacts with compressed accounts
│  │  └─ [Considerations](considerations.md) — Overview to considerations of ZK Compression: larger transaction size, higher compute unit usage, and per-transaction state cost
│  └─ [Node Operators](learn/node-operators.md) — Set up ZK Compression infrastructure. Learn how to run Forester nodes, Photon indexers and Prover
│
├─ References/
│  ├─ [Whitepaper](references/whitepaper.md) — Complete whitepaper introducing ZK Compression
│  ├─ [Terminology](references/terminology.md) — Overview to terminology related to ZK Compression and Solana
│  └─ [Security](references/security.md) — Overview to Light Protocol's bug bounty program, third party security audits, and formal verification of circuits
│
└─ Links/
   ├─ [GitHub](https://github.com/Lightprotocol)
   ├─ [DeepWiki](https://deepwiki.com/Lightprotocol/light-protocol)
   └─ [Discord](https://discord.com/invite/CYvjBgzRFP)
```

### Development Quick Reference

#### For Program Development (Rust)

**SDK Options:**

* `light-sdk` (Anchor) — Recommended for new projects. Full Anchor integration with macros
* `light-sdk` (Pinocchio) — Lightweight alternative, smaller binary size
* Native Rust — Direct access to compression primitives

**Key Dependencies:**

```toml
[dependencies]
light-sdk = "0.11.0"  # For Anchor programs
light-system-program = "1.2.0"
light-compressed-token = "1.2.0"
```

**Core Operations:**

* **Create**: Derive address → Get validity proof → Invoke create instruction
* **Update**: Get account data → Modify → Invoke update with proof
* **Close**: Invoke close instruction → Account removed from state tree
* **Burn**: Permanent deletion (cannot be reinitialized at same address)

**RPC Methods You'll Need:**

* `getValidityProof` — Required for creating new compressed accounts
* `getCompressedAccount` — Fetch account data by address/hash
* `getCompressedAccountsByOwner` — Query accounts by owner

**Testing:**

* `light-program-test` — Integration testing framework (similar to solana-program-test)
* Run against local test validator with Photon indexer

#### For Client Development

**TypeScript SDK:**

```bash
npm install @lightprotocol/stateless.js @solana/web3.js
```

**Key Imports:**

```typescript
import { Rpc, createRpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
```

**Rust Client SDK:**

```toml
[dependencies]
light-client = "1.2.0"
```

**RPC Setup:**

* Mainnet: `https://zk-compression.solanarpcpool.com/` (rate-limited public endpoint)
* Devnet: `https://devnet.helius-rpc.com?api-key=<key>` (requires API key)
* Local: `http://127.0.0.1:8784` (light test-validator)

**Common Patterns:**

* **Compressed tokens**: Create mint → Create token account → Mint tokens → Transfer
* **Compressed PDAs**: Derive address → Fetch proof → Create → Update → Close
* **State queries**: Use RPC methods to fetch account data and balances

#### For Wallet Integration

**Requirements:**

* Support for compressed token accounts (similar to SPL tokens)
* Display compressed token balances via RPC
* Transaction signing for compressed token transfers

**RPC Methods:**

* `getCompressedTokenAccountsByOwner` — Get user's compressed token accounts
* `getCompressedTokenBalancesByOwner` — Get aggregated balances by mint
* `getCompressionSignaturesForTokenOwner` — Transaction history

**Reference Implementation:** See `/compressed-tokens/advanced-guides/add-wallet-support-for-compressed-tokens.md`

#### Infrastructure Requirements

**For Local Development:**

* Solana test validator with ZK Compression support
* Photon indexer (provides compression RPC methods)
* Prover service (generates validity proofs)

**Installation:**

```bash
sh <(curl -sSfL https://release.anza.xyz/stable/install)
solana-install init stable
cargo install --git https://github.com/Lightprotocol/light-protocol light-test-validator
```

**For Production:**

* RPC node with Photon indexer
* Forester nodes (state tree updates)
* Prover infrastructure

#### Key Program IDs

```
Light System Program: H5sFv8VwWmjxHYS2GB4fTDsK7uTtnRT4WiixtHrET3bN
Compressed Token Program: cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m
Account Compression Program: compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq
Noop Program: noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV
```