# Create programs with the program-template

We've created a **program template** that you can use to bootstrap your program.&#x20;

{% hint style="info" %}
_Note the program-template as well as the light-sdk and proc macros are experimental convenience helpers, and their APIs are subject to change._
{% endhint %}

### 1. Install the CLI

<table><thead><tr><th width="215">Package Manager</th><th>Command</th></tr></thead><tbody><tr><td>npm</td><td><pre class="language-bash"><code class="lang-bash">npm install -g @lightprotocol/zk-compression-cli
</code></pre></td></tr><tr><td>Yarn</td><td><pre class="language-bash"><code class="lang-bash">yarn global add @lightprotocol/zk-compression-cli
</code></pre></td></tr></tbody></table>

### 2. **Initialize your program**

{% hint style="info" %}
Requires version **v0.15.1** or higher.
{% endhint %}

```bash
light init testprogram
```

This initializes an anchor program with a basic counter program template using compressed accounts.

Now, run:

```
anchor build
```

```
cargo test-sbf
```

### Common Errors

<details>

<summary> <code>'assert.h' file not found</code> - during compilation.<br></summary>

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

## Support

For additional support or questions, please refer to our [documentation](https://www.zkcompression.com) or contact [Swen](https://t.me/swen\_light) or [Mert](https://t.me/mert\_helius) on Telegram or via [email](mailto:friends@lightprotocol.com)
