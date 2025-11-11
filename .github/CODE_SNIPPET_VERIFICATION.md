# Code Snippet Verification Checklist

This checklist validates code snippets in ZK Compression developer documentation against actual source code using CLAUDE.md cross-references.

## Purpose

CodeRabbit uses this checklist to verify that code examples accurately reflect the actual SDK implementations, preventing documentation drift and hallucinated APIs.

## Import Statement Validation

### TypeScript Imports

- [ ] Verify `@lightprotocol/stateless.js` imports match package exports
  - Common imports: `createRpc`, `Rpc`, `CompressedAccount`, `PackedAddressTreeInfo`, `ValidityProof`
  - Check against: `https://github.com/Lightprotocol/light-protocol/tree/main/js/stateless.js/src`
- [ ] Verify `@lightprotocol/compressed-token` imports match package exports
  - Common imports: `createMint`, `mintTo`, `transfer`, `compress`, `decompress`, `approve`, `revoke`
  - Check against: `https://github.com/Lightprotocol/light-protocol/tree/main/js/compressed-token/src`
- [ ] Verify `@solana/web3.js` imports use current Solana SDK APIs
  - Common imports: `Keypair`, `PublicKey`, `Connection`
- [ ] Check for deprecated import paths or renamed modules

### Rust Imports

- [ ] Verify `light-sdk` imports match crate structure
  - Common imports: `LightAccount`, `derive_address`, `CpiAccounts`, `LightSystemProgramCpi`
  - Check against: `https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/sdk/src`
- [ ] Verify macro imports: `derive_light_cpi_signer!`, `LightDiscriminator`, `pubkey!`
- [ ] Check `anchor_lang` imports for Anchor programs
  - Common imports: `prelude::*`, `AnchorDeserialize`, `AnchorSerialize`
- [ ] Verify `borsh` imports for native Rust programs
  - Common imports: `BorshSerialize`, `BorshDeserialize`

## Package Version Validation

### Alpha and Beta Versions

- [ ] **Alpha/beta versions are intentional and correct**
  - Do NOT flag pre-release versions (e.g., `0.22.1-alpha.1`) as incorrect
  - Do NOT suggest replacing with stable versions
  - Alpha/beta versions contain necessary features not yet in stable releases

## API Method Verification

### TypeScript SDK Methods

- [ ] **RPC methods** - Verify signatures against `https://github.com/Lightprotocol/light-protocol/blob/main/js/stateless.js/src/rpc.ts`
  - `getCompressedTokenAccountsByOwner(owner, options)` - check parameters and return type
  - `getCompressedAccountsByOwner(owner)` - verify method exists
  - `getValidityProof(addresses, addressTrees)` - check proof structure
  - `getIndexerHealth(slot)` - verify response format
- [ ] **Compressed Token actions** - Verify against source files in `https://github.com/Lightprotocol/light-protocol/tree/main/js/compressed-token/src/actions`
  - `createMint(rpc, payer, authority, decimals)` - check parameter order
  - `mintTo(rpc, payer, mint, recipient, authority, amount)` - verify all parameters required
  - `transfer(rpc, payer, mint, from, to, amount)` - check signature
  - `compress(rpc, payer, mint, amount)` - verify exists
  - `decompress(rpc, payer, mint, amount)` - check return type
- [ ] **Return values** - Verify documented return values match actual returns
  - `createMint()` returns `{ mint: PublicKey, transactionSignature: string }`
  - `mintTo()` returns `string` (transaction signature)
  - Check against source code, not just TypeDoc

### Rust SDK Methods

- [ ] **LightAccount methods** - Verify against `https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/sdk/src/account`
  - `LightAccount::new_init(owner, address, tree_index)` - check parameters
  - Serialization/deserialization behavior
- [ ] **Address derivation** - Verify against `https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/sdk/src/address.rs`
  - `derive_address(seeds, tree_pubkey, program_id)` - check parameter order
  - Return type: `(address: [u8; 32], address_seed: [u8; 32])`
- [ ] **CPI methods** - Verify against `https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/sdk/src/cpi`
  - `LightSystemProgramCpi::new_cpi(signer, proof)` - check builder pattern
  - `.with_light_account(account)` - verify method chaining
  - `.with_new_addresses(addresses)` - check parameter type
  - `.invoke(cpi_accounts)` - verify final call signature

## CLAUDE.md Cross-Reference Protocol

### Step 1: Identify Documentation Scope

- [ ] Determine which `.md` file is being reviewed
- [ ] Check if the file appears in `zk-compression-docs/CLAUDE.md` tree structure
- [ ] If file is not in CLAUDE.md, skip source verification (may be conceptual docs)

### Step 2: Parse CLAUDE.md Tree Structure

- [ ] Locate the documentation page in the ASCII tree (search by filename)
- [ ] Extract all `src:` prefixed GitHub URLs under that page
  - Example: For `how-to-mint-compressed-tokens.md`:
    ```
    ├── Mint Compressed Tokens (how-to-mint-compressed-tokens.md)
    │   ├── src: https://github.com/Lightprotocol/light-protocol/blob/main/js/compressed-token/src/actions/mint-to.ts
    │   └── src: https://github.com/Lightprotocol/light-protocol/blob/main/js/compressed-token/src/actions/approve-and-mint-to.ts
    ```
- [ ] Note that one doc page may map to multiple source files
- [ ] Distinguish between `src:`, `docs:`, `example:`, `rpc:`, `impl:` prefixes
  - `src:` = primary implementation to verify against
  - `docs:` = API documentation (TypeDoc, docs.rs)
  - `example:` = full example repo (may differ from SDK)
  - `rpc:` = RPC method implementation (for advanced verification)

### Step 3: Fetch Source Code

- [ ] Use web_search to fetch content from each `src:` URL
  - Example query: "fetch content from https://github.com/Lightprotocol/light-protocol/blob/main/js/compressed-token/src/actions/mint-to.ts"
- [ ] If source file is too large, focus on exported functions and type signatures
- [ ] Handle cases where source is split across multiple files (check all listed sources)

### Step 4: Compare Snippet to Source

- [ ] **Function signature matching**
  - TypeScript: Compare function name, parameter names, parameter order, types
  - Rust: Compare function signature, struct fields, macro usage
- [ ] **Import paths matching**
  - Verify imports in doc snippet match exports in source files
  - Check for renamed exports or deprecated paths
- [ ] **API usage patterns matching**
  - Verify method chaining order (e.g., Rust builder pattern)
  - Check optional vs required parameters
  - Validate default values if documented
- [ ] **Return type matching**
  - Verify documented return values match source
  - Check Promise types for TypeScript async functions

### Step 5: Handle Edge Cases

- [ ] **Simplified examples**: Doc snippets may omit error handling or types for clarity
  - This is acceptable if core API usage is correct
  - Flag if simplification introduces confusion
- [ ] **Multiple versions**: If source shows multiple overloads, verify doc uses one correctly
- [ ] **Deprecated APIs**: If doc uses deprecated API, flag even if it still works
- [ ] **Missing source mapping**: If doc page has no CLAUDE.md entry but shows code
  - Request CLAUDE.md update OR verify manually if possible
  - Do not assume code is incorrect without verification

## Placeholder and Secret Detection

### Valid Placeholders

- [ ] API keys use clear placeholder syntax:
  - Valid: `<api_key>`, `<your_api_key>`, `YOUR_API_KEY`, `<API_KEY>`
  - Valid: Inline hints like `"https://rpc.com?api-key=<api_key>"`
- [ ] Keypair/wallet placeholders are clear:
  - Valid: `Keypair.generate()`, `Keypair.fromSecretKey(...)`
  - Valid: File path references like `~/.config/solana/id.json`
- [ ] Program IDs use actual addresses or clearly marked placeholders:
  - Valid: Real program IDs like `SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7`
  - Valid: Placeholder with comment: `YOUR_PROGRAM_ID // Replace with your program ID`

### Invalid Secrets

- [ ] No real API keys (format: `helius-` prefix, alphanumeric)
  - Flag: Any string matching `helius-[a-zA-Z0-9]{8,}`
- [ ] No real secret keys (base58 encoded, 87-88 characters)
  - Flag: Any string matching `[1-9A-HJ-NP-Za-km-z]{87,88}` in keypair context
- [ ] No environment variable leaks:
  - Flag: `process.env.HELIUS_API_KEY` without placeholder explanation
- [ ] No hardcoded private keys in examples

## Basic Syntax Validation

### TypeScript

- [ ] No syntax errors that would prevent compilation
  - Missing semicolons are acceptable (depends on style guide)
  - Check for unmatched brackets, parentheses, quotes
- [ ] Async/await usage is correct
  - `await` used with Promise-returning functions
  - Functions using `await` are marked `async`
- [ ] Type annotations are present for parameters (when shown)
  - May be omitted in simplified examples
- [ ] Imports are grouped logically (SDK first, Solana after)

### Rust

- [ ] No syntax errors that would prevent compilation
  - Check for unmatched braces, parentheses
  - Verify macro syntax: `macro_name!(args)` or `#[attribute]`
- [ ] Ownership and borrowing syntax is correct
  - `&` for references, `&mut` for mutable references
  - `.clone()` used appropriately
- [ ] Generic type parameters are correctly specified
  - Example: `LightAccount::<MyCompressedAccount>::new_init(...)`
- [ ] Derive macros are correctly applied
  - Example: `#[derive(LightDiscriminator, BorshSerialize)]`

### Common Issues to Flag

- [ ] Missing `await` on async calls (TypeScript)
- [ ] Incorrect parameter order compared to source
- [ ] Using deprecated APIs (check source file comments)
- [ ] Incorrect type casting or conversions
- [ ] Missing required parameters
- [ ] Using removed or renamed functions

## Advanced Verification (Optional)

### For Comprehensive Reviews

- [ ] Check if code snippet would actually compile
  - TypeScript: Would `tsc` succeed?
  - Rust: Would `cargo check` pass?
- [ ] Verify error handling is present where critical
  - Flag if `await` call has no `.catch()` or try/catch
  - Flag if Result type is unwrapped without checking
- [ ] Check if example follows best practices from source
  - Compare to test files in SDK: `js/stateless.js/tests/e2e`
  - Compare to program-examples: `https://github.com/Lightprotocol/program-examples`

## Report Format

When reporting code snippet issues, use this format:

**Issue:** [Brief description of the discrepancy]
**Location:** [File path and line numbers]
**Documentation shows:**
```[language]
[snippet from doc]
```
**Source code shows:**
```[language]
[relevant snippet from source]
```
**CLAUDE.md reference:** [URL from CLAUDE.md]
**Recommendation:** [Suggested fix]

Example:

**Issue:** Incorrect parameter order in `mintTo()` call
**Location:** `compressed-tokens/guides/how-to-mint-compressed-tokens.md`, lines 167-174
**Documentation shows:**
```typescript
await mintTo(rpc, payer, mint, recipient, payer, amount);
```
**Source code shows:**
```typescript
// From js/compressed-token/src/actions/mint-to.ts
export async function mintTo(
  rpc: Rpc,
  payer: Keypair,
  mint: PublicKey,
  recipient: PublicKey,
  authority: Keypair,
  amount: number | bigint
)
```
**CLAUDE.md reference:** `src: https://github.com/Lightprotocol/light-protocol/blob/main/js/compressed-token/src/actions/mint-to.ts`
**Recommendation:** Parameter order is actually correct. No issue found.

---

**Issue:** Missing required import
**Location:** `compressed-pdas/guides/how-to-create-compressed-accounts.md`, line 287
**Documentation shows:**
```rust
let mut my_compressed_account = LightAccount::<MyCompressedAccount>::new_init(...);
```
**Source code shows:**
```rust
// light-sdk/src/account.rs exports LightAccount
// Requires: use light_sdk::account::LightAccount;
```
**CLAUDE.md reference:** `src: https://github.com/Lightprotocol/light-protocol/tree/main/sdk-libs/sdk/src/account`
**Recommendation:** Verify import statement is shown in full example. If missing, add to imports section.
