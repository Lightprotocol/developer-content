

# Create a Program with Compressed PDAs

***

### Prerequisites

* Rust and Cargo installed
* Solana CLI (v1.18.15+)
* Anchor CLI (v0.30.0+)

{% stepper %}
{% step %}
### Install the Light CLI

Choose your package manager:

```bash
# npm
npm install -g @lightprotocol/zk-compression-cli

# yarn  
yarn global add @lightprotocol/zk-compression-cli
```

Verify installation:

```bash
light --version
```
{% endstep %}

{% step %}
### Initialize Your Program

{% hint style="info" %}
Requires version **v0.15.1** or higher.
{% endhint %}

```bash
light init testprogram
```

This initializes an anchor program with a basic counter program template using compressed accounts.
{% endstep %}

{% step %}
### Build and Test

Now, run:

```bash
anchor build
```

```bash
cargo test-sbf
```

**Success markers:**

* Build completes without errors
* Tests pass (4 tests: create, increment, decrement, close)
* See output: `test result: ok. 4 passed; 0 failed`
{% endstep %}

{% step %}
### Success!

You've built a program using compressed PDAs.
{% endstep %}
{% endstepper %}

### Troubleshooting

<details>

<summary><code>'assert.h' file not found</code> - during compilation</summary>

Build Errors on macOS

If you see `'assert.h' file not found`:

```bash
export CC=$(xcrun -find clang)
export SDKROOT=$(xcrun --show-sdk-path)
cargo clean
anchor build
```

#### Example Log

The following warnings were emitted during compilation:

```
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

<details>

<summary>Test Failures</summary>

Ensure you have:

* Latest Solana CLI (v1.18.15+)
* Anchor CLI (v0.30.0+)
* `solana config set --url localhost`

</details>



***
