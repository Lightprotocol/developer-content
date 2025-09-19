---
description: >-
  Complete error code reference for the Light TypeScript/JavaScript SDK.
  Includes LightSdkError variants (16001-16034) with codes and messages.
---

# Light SDK Errors

{% hint style="info" %}
Source code: [https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/sdk/src/error.rs](https://github.com/Lightprotocol/light-protocol/blob/main/sdk-libs/sdk/src/error.rs#L126)
{% endhint %}

<details>

<summary>Dependencies</summary>

```rust
use light_account_checks::error::AccountError;
use light_hasher::HasherError;
use light_sdk_types::error::LightSdkTypesError;
use light_zero_copy::errors::ZeroCopyError;
use thiserror::Error;

use crate::ProgramError;

// Type Definition
pub type Result<T> = std::result::Result<T, LightSdkError>;
```

</details>

### Validation Errors

| Error                                | Code  | Message                                                             |
| ------------------------------------ | ----- | ------------------------------------------------------------------- |
| `ConstraintViolation`                | 16001 | "Constraint violation"                                              |
| `InvalidLightSystemProgram`          | 16002 | "Invalid light-system-program ID"                                   |
| `ExpectedAccounts`                   | 16003 | "Expected accounts in the instruction"                              |
| `ExpectedAddressTreeInfo`            | 16004 | "Expected address Merkle context to be provided"                    |
| `ExpectedAddressRootIndex`           | 16005 | "Expected address root index to be provided"                        |
| `ExpectedData`                       | 16006 | "Accounts with a specified input are expected to have data"         |
| `ExpectedDiscriminator`              | 16007 | "Accounts with specified data are expected to have a discriminator" |
| `ExpectedHash`                       | 16008 | "Accounts with specified data are expected to have a hash"          |
| `ExpectedLightSystemAccount(String)` | 16009 | "Expected the `{0}` light account to be provided"                   |
| `ExpectedMerkleContext`              | 16010 | "`mut` and `close` accounts are expected to have a Merkle context"  |
| `ExpectedRootIndex`                  | 16011 | "Expected root index to be provided"                                |

### Transfer Errors

| Error                              | Code  | Message                                                                             |
| ---------------------------------- | ----- | ----------------------------------------------------------------------------------- |
| `TransferFromNoInput`              | 16012 | "Cannot transfer lamports from an account without input"                            |
| `TransferFromNoLamports`           | 16013 | "Cannot transfer from an account without lamports"                                  |
| `TransferFromInsufficientLamports` | 16014 | "Account, from which a transfer was attempted, has insufficient amount of lamports" |
| `TransferIntegerOverflow`          | 16015 | "Integer overflow resulting from too large resulting amount"                        |

### Serialization & Data Errors

| Error                  | Code  | Message                   |
| ---------------------- | ----- | ------------------------- |
| `Borsh`                | 16016 | "Borsh error."            |
| `MissingField(String)` | 16019 | "Missing meta field: {0}" |

### Account System Errors

| Error                             | Code  | Message                                                                                                                       |
| --------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| `FewerAccountsThanSystemAccounts` | 16017 | "Fewer accounts than number of system accounts."                                                                              |
| `OutputStateTreeIndexIsNone`      | 16020 | "Output state tree index is none. Use an CompressedAccountMeta type with output tree index to initialize or update accounts." |

### Initialization Errors

| Error                         | Code  | Message                                              |
| ----------------------------- | ----- | ---------------------------------------------------- |
| `InitAddressIsNone`           | 16021 | "Address is none during initialization"              |
| `InitWithAddressIsNone`       | 16022 | "Address is none during initialization with address" |
| `InitWithAddressOutputIsNone` | 16023 | "Output is none during initialization with address"  |

### Metadata Operation Errors

| Error                         | Code  | Message                                        |
| ----------------------------- | ----- | ---------------------------------------------- |
| `MetaMutAddressIsNone`        | 16024 | "Address is none during meta mutation"         |
| `MetaMutInputIsNone`          | 16025 | "Input is none during meta mutation"           |
| `MetaMutOutputLamportsIsNone` | 16026 | "Output lamports is none during meta mutation" |
| `MetaMutOutputIsNone`         | 16027 | "Output is none during meta mutation"          |
| `MetaCloseAddressIsNone`      | 16028 | "Address is none during meta close"            |
| `MetaCloseInputIsNone`        | 16029 | "Input is none during meta close"              |

### CPI (Cross-Program Invocation) Errors

| Error                                | Code  | Message                                                                                                                                            |
| ------------------------------------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `InvalidCpiSignerAccount`            | 16018 | "InvalidCpiSignerAccount"                                                                                                                          |
| `CpiAccountsIndexOutOfBounds(usize)` | 16031 | "CPI accounts index out of bounds: {0}"                                                                                                            |
| `InvalidCpiContextAccount`           | 16032 | "Invalid CPI context account"                                                                                                                      |
| `InvalidSolPoolPdaAccount`           | 16033 | "Invalid SolPool PDA account"                                                                                                                      |
| `InvalidCpiAccountsOffset`           | 16034 | "CpigAccounts accounts slice starts with an invalid account. It should start with LightSystemProgram SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7." |

### Transparent/Wrapped Errors

| Error                        | Code Type | Message                              |
| ---------------------------- | --------- | ------------------------------------ |
| `Hasher(HasherError)`        | Variable  | Transparent error from HasherError   |
| `ZeroCopy(ZeroCopyError)`    | Variable  | Transparent error from ZeroCopyError |
| `ProgramError(ProgramError)` | Variable  | "Program error: {0}"                 |
| `AccountError(AccountError)` | Variable  | Transparent error from AccountError  |
