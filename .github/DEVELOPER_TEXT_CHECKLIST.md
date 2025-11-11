# Developer-Facing Text Quality Checklist

This checklist evaluates text surrounding code snippets for actionability, accuracy, and usefulness to developers implementing ZK Compression.

## Purpose

CodeRabbit uses this checklist to distinguish between helpful developer instructions and problematic text (implementation details, hallucinations, vague descriptions) that impedes SDK adoption.

## Target Audience Context

This documentation serves developers who:
- Use the TypeScript SDK (`@lightprotocol/stateless.js`, `@lightprotocol/compressed-token`)
- Build Solana programs with Rust SDK (`light-sdk`)
- Need clear, actionable instructions to implement ZK Compression
- Do NOT need to understand protocol internals unless building infrastructure
- Want to know WHAT to do and WHY, not HOW the system implements it internally

## Good Text Characteristics

### Actionable Instructions

- [ ] Text tells developers exactly WHAT to do
  - Example: "Pass the mint authority as the fifth parameter to `mintTo()`"
  - Example: "Call `derive_address()` with your custom seeds and the address tree pubkey"
- [ ] Text explains WHY a step is necessary
  - Example: "The validity proof verifies that the address doesn't exist yet in the address tree"
  - Example: "Clients fetch the proof with `getValidityProof()` from an RPC provider"
- [ ] Text describes the OUTCOME of an operation
  - Example: "This creates a compressed token account for the recipient and increases the mint's token supply"
  - Example: "`new_init()` lets the program define the initial account data"

### Clear API Explanations

- [ ] Function parameters are explained with purpose
  - Good: "`recipient: PublicKey` - the address that will own the compressed tokens"
  - Bad: "`recipient` - the recipient parameter"
- [ ] Return values are described with usage context
  - Good: "Returns `{ mint, transactionSignature }` - use `mint` for subsequent operations"
  - Bad: "Returns an object with the mint"
- [ ] Method names are shown with correct casing and syntax
  - Good: "`createMint()`", "`LightAccount::new_init()`"
  - Bad: "create mint function", "newInit method"

### Conceptual Clarity

- [ ] Technical terms are defined on first use
  - Example: "Token pool: SPL token account that holds SPL tokens corresponding to compressed tokens in circulation"
  - Example: "CPI Signer: PDA derived from your program ID with seed `b'authority'`"
- [ ] Analogies relate to familiar Solana concepts
  - Example: "Compressed accounts share the same functionality as regular Solana accounts and are fully composable"
  - Example: "`LightAccount` wraps your data similar to Anchor's `Account`"
- [ ] Limitations and constraints are stated clearly
  - Example: "The same seeds can create different addresses in different address trees"
  - Example: "Only the mint authority can perform this operation"

## Bad Text Patterns to Flag

### Implementation Details (Not Relevant to Developers)

Flag text that describes HOW the system works internally when developers only need to USE the API:

- [ ] **Merkle tree mechanics** (unless explaining tree selection for creation)
  - Bad: "The system hashes the account data with Poseidon and inserts it into the Merkle tree"
  - Good: "The Light System Program verifies the proof and creates the compressed account"
- [ ] **Protocol-level transaction flow** (unless relevant to error handling)
  - Bad: "The account compression program receives a CPI from Light System Program which validates ownership"
  - Good: "Your program calls Light System Program via CPI to create the compressed account"
- [ ] **Indexer implementation details**
  - Bad: "Photon parses transaction logs and reconstructs state by traversing the Merkle tree"
  - Good: "Use `getCompressedAccountsByOwner()` to fetch compressed accounts from the RPC indexer"
- [ ] **Prover node internals**
  - Bad: "The prover generates zero-knowledge proofs by evaluating polynomial commitments"
  - Good: "Clients fetch validity proofs from RPC providers with `getValidityProof()`"

**Guideline:** If the text explains protocol internals that developers cannot change or interact with, it's likely unnecessary detail.

### Hallucinated or Incorrect Information

Flag text that makes claims not supported by source code or documentation:

- [ ] **Non-existent API methods**
  - Example: Claiming `compressSplAccount()` exists when only `compress()` is available
  - Verify against CLAUDE.md source references
- [ ] **Incorrect parameter descriptions**
  - Example: Saying `mintTo()` takes 4 parameters when it requires 6
  - Cross-check with source code signatures
- [ ] **Misleading statements about behavior**
  - Example: "This automatically creates a token pool" when it doesn't
  - Example: "Compressed accounts are always faster" without context
- [ ] **Outdated API usage**
  - Example: Showing deprecated `createAccount()` instead of `LightAccount::new_init()`
  - Check source files for deprecation warnings

**Guideline:** Every factual claim about APIs should be verifiable against source code (via CLAUDE.md) or official SDK documentation.

### Vague or Generic Statements

Flag text that provides no actionable information:

- [ ] **Generic placeholders**
  - Bad: "This function does something with the data"
  - Bad: "Handle the response appropriately"
  - Bad: "Configure the settings as needed"
- [ ] **Missing specifics**
  - Bad: "Pass the required parameters" (which parameters? what are they?)
  - Bad: "Use the correct tree" (which tree? how to identify it?)
  - Bad: "Set up the accounts" (which accounts? what configuration?)
- [ ] **Circular definitions that don't explain purpose or usage**
  - Bad: "The mint authority is the authority that can mint"
    → Why bad: Restates the term without explaining what it controls or why it exists
  - Bad: "Address trees store addresses"
    → Why bad: Describes data structure without explaining developer purpose
  - Good: "Address trees store derived addresses that serve as persistent identifiers for compressed accounts"
    → Why good: Explains both the data structure AND its role in the system
  - Bad: "Compressed accounts are accounts that are compressed"
    → Why bad: Tautology with zero information
  - Good: "Compressed accounts are data structures represented as 32-byte hashes stored in Merkle trees, requiring no rent"
    → Why good: Explains representation, storage mechanism, and key benefit

**Guideline:** Every definition must answer "What does the developer USE this for?" or "What PROBLEM does this solve?" If removing the sentence doesn't change understanding, it's likely vague.

### Confusing Terminology Mixing

Flag text that mixes abstraction levels or uses inconsistent terminology:

- [ ] **Mixing SDK and protocol terms**
  - Example: "Call `mintTo()` to invoke the compressed token program's mint instruction handler"
  - Better: "Call `mintTo()` to mint compressed tokens to a recipient"
- [ ] **Inconsistent naming**
  - Example: Switching between "validity proof", "non-inclusion proof", and "address proof" for the same concept
  - Use consistent term throughout documentation
- [ ] **Marketing language in technical docs**
  - Bad: "Revolutionary state compression technology"
  - Good: "ZK Compression reduces on-chain storage costs by storing account data in Merkle trees"

### Always-Flag Marketing Words

These words are never acceptable in technical documentation. Always flag and suggest concrete replacements:

- [ ] **"enables"** → Replace with concrete action verb
  - Bad: "This enables token operations"
  - Good: "This creates, transfers, and burns compressed tokens"
  - Bad: "enables compression"
  - Good: "compresses token accounts"

- [ ] **"comprehensive"** → Replace with specific list
  - Bad: "Comprehensive token support"
  - Good: "Supports SPL token compression, decompression, and transfers"

- [ ] **"powerful"** → Remove or replace with measurable benefit
  - Bad: "Powerful compression features"
  - Good: "Reduces storage cost by 1000x"

- [ ] **"flexible"** → Explain actual options
  - Bad: "Flexible account configuration"
  - Good: "Configure account size from 32 bytes to 10KB"

- [ ] **"operations" (without specifying which)** → List specific operations
  - Bad: "Supports compressed account operations"
  - Good: "Create, update, close, and burn compressed accounts"
  - Bad: "enables various operations"
  - Good: "mints, transfers, and burns compressed tokens"

**Guideline:** Use concrete verbs that describe actual operations. Replace "enables X" with "does X" or "creates X". Every capability claim must specify WHAT the developer can do.

## Context-Specific Guidelines

### Code Comments

- [ ] Inline comments explain WHAT and WHY, not HOW
  - Good: `// Mint authority must sign this transaction`
  - Bad: `// This line creates a variable`
- [ ] Comments provide context not obvious from code
  - Good: `// Token pool must exist before minting compressed tokens`
  - Bad: `// Call the mintTo function`

### Step-by-Step Instructions

- [ ] Each step is a complete action
  - Good: "Install dependencies with `npm install @lightprotocol/stateless.js`"
  - Bad: "Install dependencies"
- [ ] Steps follow logical order (dependencies → setup → usage)
- [ ] Prerequisites are stated upfront, not discovered mid-tutorial

### Error Messages and Troubleshooting

- [ ] Error messages are quoted exactly as they appear
  - Example: `"TokenPool not found. Please create a compressed token pool for mint: [ADDRESS]"`
- [ ] Explanations identify the ROOT CAUSE
  - Good: "This error occurs when the mint doesn't have a token pool for compression"
  - Bad: "This error means something went wrong"
- [ ] Solutions are specific and testable
  - Good: "Create a token pool with `createTokenPool(rpc, payer, mint)`"
  - Bad: "Make sure the pool is set up correctly"

### Conceptual Explanations

- [ ] Concepts are explained BEFORE they're used in code
  - Example: Define "validity proof" before showing `proof` parameter
- [ ] Analogies relate to existing Solana knowledge
  - Example: "Similar to Solana PDAs, compressed account addresses can be derived from seeds"
- [ ] Diagrams and examples supplement text (when present)

## Examples: Good vs Bad

### Example 1: Function Parameter Description

**Bad Text:**
```
The `amount` parameter specifies the amount.
```
**Why Bad:** Circular definition, provides no actionable information.

**Good Text:**
```
`amount: number | bigint` - Token amount including decimals. For a mint with 9 decimals, pass `1_000_000_000` to mint 1 token.
```
**Why Good:** Specifies type, explains decimal handling, provides concrete example.

---

### Example 2: API Method Explanation

**Bad Text:**
```
The createMint function creates a mint by calling the mint creation program and initializing the token pool data structure in the compressed token program's state.
```
**Why Bad:** Describes implementation details developers don't control.

**Good Text:**
```
`createMint()` creates an SPL mint with a token pool for compression. The token pool enables minting and burning compressed tokens.
```
**Why Good:** Focuses on what developers get and why they need it.

---

### Example 3: Error Troubleshooting

**Bad Text:**
```
If you get an error, make sure everything is set up correctly and the accounts are valid.
```
**Why Bad:** Vague, provides no actionable debugging steps.

**Good Text:**
```
**Error:** "TokenPool not found"

The mint doesn't have a token pool for compression. Create one with:
```typescript
const tokenPoolInfo = await createTokenPool(rpc, payer, mint);
```
```
**Why Good:** Identifies specific error, explains cause, provides exact solution.

---

### Example 4: Conceptual Explanation

**Bad Text:**
```
Addresses are stored in address trees which are Merkle trees that use Poseidon hashing to enable zero-knowledge proofs of non-inclusion verified by the account compression program.
```
**Why Bad:** Overloads with implementation details not relevant to SDK usage.

**Good Text:**
```
Addresses serve as persistent identifiers for compressed accounts. Derive addresses with `derive_address()` using custom seeds, similar to Solana PDAs. Addresses are unique within an address tree.
```
**Why Good:** Explains what addresses are for, how to create them, and key constraint to remember.

---

### Example 5: Code Comment

**Bad Code Comment:**
```typescript
// Step 3: Call mintTo() with mint, recipient, and amount
const signature = await mintTo(rpc, payer, mint, recipient, payer, amount);
```
**Why Bad:** Comment repeats what code already shows.

**Good Code Comment:**
```typescript
// Step 3: Mint compressed tokens to recipient
// This creates a compressed token account and increases the mint's supply
const signature = await mintTo(rpc, payer, mint, recipient, payer, amount);
```
**Why Good:** Explains outcome and side effects not obvious from function name.

## Report Format

When reporting text quality issues, use this format:

**Issue:** [Type: Implementation Detail / Hallucination / Vague Statement]
**Location:** [File path and section]
**Current Text:**
```
[Problematic text]
```
**Problem:** [Why this is unhelpful or misleading]
**Suggested Revision:**
```
[Improved text]
```
**Rationale:** [Why the revision is better for developers]

Example:

**Issue:** Unnecessary Implementation Detail
**Location:** `compressed-tokens/guides/how-to-mint-compressed-tokens.md`, line 15
**Current Text:**
```
The mintTo() function serializes the mint instruction, constructs a transaction with the compressed token program, and invokes the runtime to process the instruction which hashes the account data and updates the Merkle tree.
```
**Problem:** Describes internal system mechanics that developers cannot control or modify. Overcomplicates what should be a simple API usage explanation.
**Suggested Revision:**
```
The mintTo() function creates compressed token accounts for recipients and increases the mint's token supply. Only the mint authority can perform this operation.
```
**Rationale:** Focuses on what developers need to know: what the function does, who can call it, and the outcome. Implementation details are irrelevant for SDK users.

---

**Issue:** Hallucinated API Method
**Location:** `compressed-tokens/guides/how-to-compress-tokens.md`, line 42
**Current Text:**
```
Call `compressSplAccount()` to convert an entire SPL token account to compressed format.
```
**Problem:** The function `compressSplAccount()` does not exist in the SDK. Source code shows only `compressSplTokenAccount()` at `js/compressed-token/src/actions/compress-spl-token-account.ts`.
**Suggested Revision:**
```
Call `compressSplTokenAccount()` to convert an entire SPL token account to compressed format.
```
**Rationale:** Corrects function name to match actual SDK export, verified against CLAUDE.md source reference.

---

**Issue:** Vague Statement
**Location:** `compressed-pdas/guides/how-to-create-accounts.md`, line 89
**Current Text:**
```
Configure the CPI accounts appropriately for your program.
```
**Problem:** Provides no actionable information. Developers don't know what "appropriately" means or what configuration options exist.
**Suggested Revision:**
```
Pass three parameters to `CpiAccounts::new()`: the transaction signer, the remaining accounts slice, and your program's CPI signer PDA from Constants.
```
**Rationale:** Specifies exactly what to do with concrete parameter list.

## Additional Validation Rules

### Prerequisites and Setup Sections

- [ ] Prerequisites list specific versions when relevant
  - Example: "Rust 1.70+, Anchor 0.31.1"
- [ ] Setup instructions can be followed without external context
  - Test: Could a developer complete setup from these instructions alone?
- [ ] Environment configuration is explicit
  - Example: "This guide uses Localnet. For Devnet, see Alternative Setup."

### Advanced Sections

- [ ] Advanced content is clearly marked
  - Use collapsible `<details>` or separate "Advanced" sections
- [ ] Advanced explanations still focus on developer usage
  - Example: Showing how to implement custom validity proof fetching is advanced but relevant
  - Example: Explaining Poseidon hash function internals is not relevant

### Next Steps and Links

- [ ] "Next Steps" sections provide clear paths forward
  - Link to related guides or tutorials
  - Explain why next step is relevant
- [ ] Internal links have descriptive anchor text
  - Good: "Learn how to transfer compressed tokens"
  - Bad: "Click here for more information"

## Checklist Summary

Use this quick checklist for every text block:

1. [ ] Does this tell developers WHAT to do or WHY to do it?
2. [ ] Can this be verified against source code (if making factual claims)?
3. [ ] Would removing this text reduce developer understanding?
4. [ ] Is terminology consistent with rest of documentation?
5. [ ] Does this avoid unnecessary implementation details?
6. [ ] Is this actionable, specific, and clear?

If any answer is "No", revise or flag for review.
