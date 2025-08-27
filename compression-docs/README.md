# Overview

## Welcome to ZK Compression

ZK Compression is a new account primitive that lets developers store tokens and PDAs on Solana at a fraction of the cost, without sacrificing L1 performance or security.

## State Cost Reduction

Creation costs comparison:

- 100-byte PDA Account: Regular account costs approximately 0.0016 SOL, while compressed account costs approximately 0.00001 SOL (160x cheaper)
- 100 Token Accounts: Regular accounts cost approximately 0.2 SOL, while compressed accounts cost approximately 0.00004 SOL (5000x cheaper)

## Core Features

**Minimal state cost**: Securely stores state on cheaper ledger space instead of the more expensive account space, allowing apps to scale to millions of users.

**L1 security and performance**: Execution and data availability on Solana, preserving the performance and security guarantees of the L1.

**Composable**: Apps can mix and match between compressed and regular on-chain state, allowing atomic interaction with multiple programs, accounts, and compressed accounts.

## ZK and Compression in a Nutshell

**Compression**: Only the state roots (small fingerprints of all compressed accounts) are stored in on-chain accounts. The underlying data is stored on the cheaper Solana ledger.

**ZK**: The protocol uses small zero-knowledge proofs (validity proofs) to ensure the integrity of the compressed state. This is all done under the hood. You can fetch validity proofs from RPC providers that support ZK Compression.

## How to Use This Documentation

This documentation introduces the ZK Compression primitive and guides you to relevant codebases and examples.

Note: ZK Compression and its RPC implementation is built by Light and Helius.
