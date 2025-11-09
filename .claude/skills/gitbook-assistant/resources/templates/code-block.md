# Code Block Template

## Basic Syntax

````markdown
```language
code here
```
````

## With Language Specification

````markdown
```typescript
const connection = new Connection('https://devnet.helius-rpc.com');
const balance = await connection.getBalance(publicKey);
console.log(`Balance: ${balance} lamports`);
```
````

## Common Languages

### TypeScript/JavaScript
````markdown
```typescript
import { Rpc } from '@lightprotocol/stateless.js';

const rpc = new Rpc(
  'https://zk-compression.devnet.rpcpool.com',
  'https://devnet.helius-rpc.com'
);
```
````

### Rust
````markdown
```rust
use light_sdk::compressed_account::CompressedAccount;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Implementation
    Ok(())
}
```
````

### Bash/Shell
````markdown
```bash
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --url devnet
solana airdrop 2
```
````

### JSON
````markdown
```json
{
  "name": "my-compression-app",
  "version": "1.0.0",
  "dependencies": {
    "@lightprotocol/stateless.js": "^0.1.0"
  }
}
```
````

### TOML (Cargo.toml)
````markdown
```toml
[dependencies]
light-sdk = "0.3.0"
solana-program = "1.18"
anchor-lang = "0.29.0"
```
````

## GitBook Code Block with Features

````markdown
{% code title="create-mint.ts" lineNumbers="true" %}
```typescript
import { createMint } from '@lightprotocol/stateless.js';

async function main() {
  const mint = await createMint(
    connection,
    payer,
    mintAuthority,
    decimals
  );
  console.log('Mint created:', mint.toBase58());
}
```
{% endcode %}
````

## Best Practices

- Always specify the language for syntax highlighting
- Use descriptive titles when using {% code %} blocks
- Keep code examples concise and focused
- Include comments for complex operations
- Show complete, runnable examples when possible
- Use line numbers for longer code snippets
- For inline code, use single backticks: `functionName()`

## Supported Languages (Prism)

Common languages supported:
- `typescript`, `javascript`, `jsx`, `tsx`
- `rust`, `toml`
- `python`, `java`, `go`, `c`, `cpp`
- `bash`, `shell`, `sh`
- `json`, `yaml`, `xml`
- `solidity`, `sql`, `graphql`
- `markdown`, `html`, `css`
