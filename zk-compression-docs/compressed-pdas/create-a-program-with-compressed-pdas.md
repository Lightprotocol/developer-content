---
title: Create a Program with Compressed PDAs
description: Overview to compressed PDA core features and guide for program development
---

# Create a Program with Compressed PDAs

Compressed PDAs provide full functionality of accounts at PDAs, without per-account rent cost.

<table><thead><tr><th valign="middle">Creation</th><th width="200" align="center">Regular PDA Account</th><th width="200" align="center">Compressed PDA</th><th align="center">Cost Reduction</th></tr></thead><tbody><tr><td valign="middle">100-byte PDA</td><td align="center">~ 0.0016 SOL</td><td align="center"><strong>~ 0.00001 SOL</strong></td><td align="center"><em><strong>160x</strong></em></td></tr></tbody></table>

Compressed PDAs are derived using a specific program address and seed, like regular PDAs. Custom programs invoke the [Light System program](#user-content-fn-1)[^1] to create and update accounts, instead of the System program.

#### Compressed PDAs at a Glance

<table data-view="cards"><thead><tr><th></th><th></th></tr></thead><tbody><tr><td><strong>Rent free PDAs</strong></td><td>Create accounts at program-derived addresses without upfront rent exempt balance.</td></tr><tr><td><strong>Full PDA Functionality</strong></td><td>Persistent unique identification and program ownership.</td></tr><tr><td><strong>Composable</strong></td><td>CPI support between compressed and regular PDAs.</td></tr></tbody></table>

## Start Building

Developing with compressed PDAs works similar to regular PDAs and involves minimal setup:

{% stepper %}
{% step %}
## Prerequisites

{% hint style="info" %}
Required versions:

* **Rust**: 1.86.0 or later
* **Solana CLI**: 2.2.15
* **Anchor CLI**: 0.31.1
* **Zk compression CLI**: 0.27.0 or later
* **Node.js**: 23.5.0 or later
{% endhint %}

**Install Solana CLI:**

```bash
sh -c "$(curl -sSfL https://release.solana.com/v2.2.15/install)"
```

**Install Anchor CLI:**

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest
avm use latest
```

**Install the Light CLI:**

```bash
npm -g i @lightprotocol/zk-compression-cli
```

```bash
### verify installation
light --version
```
{% endstep %}

{% step %}
## Initialize your Program

Instantiate a template Solana program with compressed accounts with all required dependencies.

```bash
light init testprogram
```

{% hint style="info" %}
The `light init` command creates only Anchor-based projects . For Pinocchio programs, manually configure dependencies using `light-sdk-pinocchio`.
{% endhint %}

<details>

<summary>Dependencies</summary>

**Rust Crates**

* `light-sdk` - Core SDK for compressed accounts in native and anchor programs
* `light-sdk-pinocchio` Core SDK for compressed accounts in pinocchio programs
* `light-client` - RPC client and indexer for interacting with compressed accounts
* `light-program-test` - Testing utilities for compressed programs.

**TypeScript/JavaScript Packages**

* `@lightprotocol/stateless.js` - Client library for interacting with compressed accounts
* `@lightprotocol/zk-compression-cli` - Command-line tools for ZK compression development

</details>
{% endstep %}

{% step %}
## Build and Test

Now `cd testprogram` and run:

```bash
anchor build
# Success: Finished `release` profile [optimized] target(s), after compiling.
# Note: Stack offset warnings are expected and don't prevent compilation
```

```bash
cargo test-sbf

# Success: test result: ok. 1 passed; 0 failed; 0 ignored
```
{% endstep %}
{% endstepper %}

### Common Errors

<details>

<summary><code>'assert.h' file not found</code> - during compilation.</summary>

```shellscript
Fix: 
In your terminal, run:
1. export CC=$(xcrun -find clang)
2. export SDKROOT=$(xcrun --show-sdk-path)
3. cargo clean
4. anchor build


Example log:
The following warnings were emitted during compilation:

warning: blake3@1.5.1: In file included from c/blake3_neon.c:1:
warning: blake3@1.5.1: c/blake3_impl.h:4:10: fatal error: 'assert.h' file not found
warning: blake3@1.5.1:     4 | #include <assert.h>
warning: blake3@1.5.1:       |          ^~~~~~~~~~
warning: blake3@1.5.1: 1 error generated.

error: failed to run custom build command for `blake3 v1.5.1`

Caused by:
  process didn't exit successfully: `/Users/you/testprogram/target/release/build/blake3-ac41d29c2eabe052/build-script-build` (exit status: 1)
  --- stdout
  cargo:rerun-if-env-changed=CARGO_FEATURE_PURE
  cargo:rerun-if-env-changed=CARGO_FEATURE_NO_NEON
  cargo:rerun-if-env-changed=CARGO_FEATURE_NEON
  cargo:rerun-if-env-changed=CARGO_FEATURE_NEON
  cargo:rerun-if-env-changed=CARGO_FEATURE_NO_NEON
  cargo:rerun-if-env-changed=CARGO_FEATURE_PURE
  cargo:rustc-cfg=blake3_neon
  OUT_DIR = Some(/Users/you/testprogram/target/release/build/blake3-735a4c71d985df30/out)
  TARGET = Some(aarch64-apple-darwin)
  OPT_LEVEL = Some(3)
  HOST = Some(aarch64-apple-darwin)
  cargo:rerun-if-env-changed=CC_aarch64-apple-darwin
  CC_aarch64-apple-darwin = None
  cargo:rerun-if-env-changed=CC_aarch64_apple_darwin
  CC_aarch64_apple_darwin = None
  cargo:rerun-if-env-changed=HOST_CC
  HOST_CC = None
  cargo:rerun-if-env-changed=CC
  CC = Some(/Users/you/.local/share/solana/install/releases/1.18.22/solana-release/bin/sdk/sbf/dependencies/platform-tools/llvm/bin/clang)
  RUSTC_WRAPPER = None
  cargo:rerun-if-env-changed=CC_ENABLE_DEBUG_OUTPUT
  cargo:rerun-if-env-changed=CRATE_CC_NO_DEFAULTS
  CRATE_CC_NO_DEFAULTS = None
  DEBUG = Some(false)
  cargo:rerun-if-env-changed=MACOSX_DEPLOYMENT_TARGET
  MACOSX_DEPLOYMENT_TARGET = None
  cargo:rerun-if-env-changed=CFLAGS_aarch64-apple-darwin
  CFLAGS_aarch64-apple-darwin = None
  cargo:rerun-if-env-changed=CFLAGS_aarch64_apple_darwin
  CFLAGS_aarch64_apple_darwin = None
  cargo:rerun-if-env-changed=HOST_CFLAGS
  HOST_CFLAGS = None
  cargo:rerun-if-env-changed=CFLAGS
  CFLAGS = None
  cargo:warning=In file included from c/blake3_neon.c:1:
  cargo:warning=c/blake3_impl.h:4:10: fatal error: 'assert.h' file not found
  cargo:warning=    4 | #include <assert.h>
  cargo:warning=      |          ^~~~~~~~~~
  cargo:warning=1 error generated.

  --- stderr


  error occurred: Command env -u IPHONEOS_DEPLOYMENT_TARGET "/Users/you/.local/share/solana/install/releases/1.18.22/solana-release/bin/sdk/sbf/dependencies/platform-tools/llvm/bin/clang" "-O3" "-ffunction-sections" "-fdata-sections" "-fPIC" "--target=arm64-apple-darwin" "-mmacosx-version-min=14.4" "-Wall" "-Wextra" "-std=c11" "-o" "/Users/you/testprogram/target/release/build/blake3-735a4c71d985df30/out/db3b6bfb95261072-blake3_neon.o" "-c" "c/blake3_neon.c" with args clang did not execute successfully (status code exit status: 1).
```

</details>

## Program Examples

<table><thead><tr><th width="250">Example</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/basic-operations/anchor">basic-operations/anchor</a></td><td>Anchor programs to create, update, close, reinitialize and burn compressed accounts with Rust and TypeScript tests</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/basic-operations/native-rust">basic-operations/native-rust</a></td><td>Native Solana program implementation to create, update, close, reinitialize and burn compressed accounts with Rust tests</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/counter/anchor">Counter (Anchor)</a></td><td>Full compressed account lifecycle (create, increment, decrement, reset, close) using Anchor framework</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/counter/native">Counter (Native)</a></td><td>Native Solana program implementation with Rust tests</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/counter/pinocchio">Counter (Pinocchio)</a></td><td>Pinocchio implementation using light-sdk-pinocchio with Rust tests</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/create-and-update">Create-and-Update</a></td><td>Create new compressed accounts and update existing ones within a single instruction and one validity proof</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/read-only">Read-Only</a></td><td>Create compressed accounts and read them on-chain</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/account-comparison">Account Comparison</a></td><td>Compare compressed accounts with standard Solana accounts</td></tr><tr><td><a href="https://github.com/Lightprotocol/program-examples/tree/main/zk-id">ZK-ID</a></td><td>Program that uses zero-knowledge proofs for identity verification with compressed accounts</td></tr></tbody></table>

## Next Steps

Start building with compressed accounts using our guides or program examples.

{% columns %}
{% column %}
{% content-ref url="guides/" %}
[guides](guides/)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="program-examples.md" %}
[program-examples.md](program-examples.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}

[^1]: The program enforces compressed account layout with ownership and sum checks. It is invoked to create and interact with compressed accounts and tokens.
