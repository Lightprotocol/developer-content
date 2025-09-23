---
description: >-
  Complete error code reference for the Light System program. Includes all error
  variants (6000-6053) with codes and messages.
---

# Light System Program Errors

<details>

<summary>Dependencies</summary>

```rust
use light_account_checks::error::AccountError;
use light_batched_merkle_tree::errors::BatchedMerkleTreeError;
use light_concurrent_merkle_tree::errors::ConcurrentMerkleTreeError;
use light_indexed_merkle_tree::errors::IndexedMerkleTreeError;
use light_zero_copy::errors::ZeroCopyError;
use pinocchio::program_error::ProgramError;
use thiserror::Error;
```

</details>

{% hint style="info" %}
Source code: [https://github.com/Lightprotocol/light-protocol/blob/main/programs/system/src/errors.rs](https://github.com/Lightprotocol/light-protocol/blob/main/programs/system/src/errors.rs#L133)
{% endhint %}

### Transaction Validation Errors

| Code | Error                  | Message                   |
| ---- | ---------------------- | ------------------------- |
| 6000 | `SumCheckFailed`       | "Sum check failed"        |
| 6001 | `SignerCheckFailed`    | "Signer check failed"     |
| 6002 | `CpiSignerCheckFailed` | "Cpi signer check failed" |

### Computation Errors

| Code | Error                    | Message                        |
| ---- | ------------------------ | ------------------------------ |
| 6003 | `ComputeInputSumFailed`  | "Computing input sum failed."  |
| 6004 | `ComputeOutputSumFailed` | "Computing output sum failed." |
| 6005 | `ComputeRpcSumFailed`    | "Computing rpc sum failed."    |

### Address & Account Errors

| Code | Error                 | Message                 |
| ---- | --------------------- | ----------------------- |
| 6006 | `InvalidAddress`      | "InvalidAddress"        |
| 6007 | `DeriveAddressError`  | "DeriveAddressError"    |
| 6047 | `AddressIsNone`       | "AddressIsNone"         |
| 6048 | `AddressDoesNotMatch` | "AddressDoesNotMatch"   |
| 6040 | `InvalidAccount`      | "InvalidAccount"        |
| 6044 | `InvalidAccountMode`  | "Invalid account mode." |

### SOL Compression/Decompression Errors

| Code | Error                                          | Message                                        |
| ---- | ---------------------------------------------- | ---------------------------------------------- |
| 6008 | `CompressedSolPdaUndefinedForCompressSol`      | "CompressedSolPdaUndefinedForCompressSol"      |
| 6009 | `DecompressLamportsUndefinedForCompressSol`    | "DecompressLamportsUndefinedForCompressSol"    |
| 6010 | `CompressedSolPdaUndefinedForDecompressSol`    | "CompressedSolPdaUndefinedForDecompressSol"    |
| 6011 | `DeCompressLamportsUndefinedForDecompressSol`  | "DeCompressLamportsUndefinedForDecompressSol"  |
| 6012 | `DecompressRecipientUndefinedForDecompressSol` | "DecompressRecipientUndefinedForDecompressSol" |
| 6023 | `DecompressionRecipientDefined`                | "DecompressionRecipientDefined"                |
| 6024 | `SolPoolPdaDefined`                            | "SolPoolPdaDefined"                            |

### Access & Permission Errors

| Code | Error                        | Message                      |
| ---- | ---------------------------- | ---------------------------- |
| 6013 | `WriteAccessCheckFailed`     | "WriteAccessCheckFailed"     |
| 6014 | `InvokingProgramNotProvided` | "InvokingProgramNotProvided" |

### Capacity & Validation Errors

| Code | Error                    | Message                  |
| ---- | ------------------------ | ------------------------ |
| 6015 | `InvalidCapacity`        | "InvalidCapacity"        |
| 6016 | `InvalidMerkleTreeOwner` | "InvalidMerkleTreeOwner" |
| 6039 | `InvalidArgument`        | "InvalidArgument"        |

### Proof Errors

| Code | Error                     | Message                                                                     |
| ---- | ------------------------- | --------------------------------------------------------------------------- |
| 6017 | `ProofIsNone`             | "ProofIsNone"                                                               |
| 6018 | `ProofIsSome`             | "Proof is some but no input compressed accounts or new addresses provided." |
| 6043 | `ProofVerificationFailed` | "Proof verification failed."                                                |

### Input/Output Errors

| Code | Error                   | Message                 |
| ---- | ----------------------- | ----------------------- |
| 6019 | `EmptyInputs`           | "EmptyInputs"           |
| 6029 | `NoInputs`              | "NoInputs"              |
| 6051 | `TooManyOutputAccounts` | "TooManyOutputAccounts" |

### CPI Context Errors

| Code | Error                                    | Message                                  |
| ---- | ---------------------------------------- | ---------------------------------------- |
| 6020 | `CpiContextAccountUndefined`             | "CpiContextAccountUndefined"             |
| 6021 | `CpiContextEmpty`                        | "CpiContextEmpty"                        |
| 6022 | `CpiContextMissing`                      | "CpiContextMissing"                      |
| 6027 | `CpiContextFeePayerMismatch`             | "CpiContextFeePayerMismatch"             |
| 6028 | `CpiContextAssociatedMerkleTreeMismatch` | "CpiContextAssociatedMerkleTreeMismatch" |
| 6049 | `CpiContextAlreadySet`                   | "CpiContextAlreadySet"                   |

### Merkle Tree Index Errors

| Code | Error                               | Message                                                  |
| ---- | ----------------------------------- | -------------------------------------------------------- |
| 6030 | `InputMerkleTreeIndicesNotInOrder`  | "Input merkle tree indices are not in ascending order."  |
| 6031 | `OutputMerkleTreeIndicesNotInOrder` | "Output merkle tree indices are not in ascending order." |
| 6032 | `OutputMerkleTreeNotUnique`         | "OutputMerkleTreeNotUnique"                              |

### Data & State Errors

| Code | Error                               | Message                             |
| ---- | ----------------------------------- | ----------------------------------- |
| 6033 | `DataFieldUndefined`                | "DataFieldUndefined"                |
| 6025 | `AppendStateFailed`                 | "AppendStateFailed"                 |
| 6036 | `HashChainInputsLenghtInconsistent` | "HashChainInputsLenghtInconsistent" |
| 6052 | `BorrowingDataFailed`               | "Borrowing data failed"             |

### Read-Only Account Errors

| Code | Error                                 | Message                               |
| ---- | ------------------------------------- | ------------------------------------- |
| 6034 | `ReadOnlyAddressAlreadyExists`        | "ReadOnlyAddressAlreadyExists"        |
| 6035 | `ReadOnlyAccountDoesNotExist`         | "ReadOnlyAccountDoesNotExist"         |
| 6053 | `DuplicateAccountInInputsAndReadOnly` | "DuplicateAccountInInputsAndReadOnly" |

### Tree Configuration Errors

| Code | Error                      | Message                    |
| ---- | -------------------------- | -------------------------- |
| 6037 | `InvalidAddressTreeHeight` | "InvalidAddressTreeHeight" |
| 6038 | `InvalidStateTreeHeight`   | "InvalidStateTreeHeight"   |
| 6050 | `InvalidTreeHeight`        | "InvalidTreeHeight"        |

### Discriminator & Instruction Errors

| Code | Error                                           | Message                                         |
| ---- | ----------------------------------------------- | ----------------------------------------------- |
| 6041 | `AddressMerkleTreeAccountDiscriminatorMismatch` | "AddressMerkleTreeAccountDiscriminatorMismatch" |
| 6042 | `StateMerkleTreeAccountDiscriminatorMismatch`   | "StateMerkleTreeAccountDiscriminatorMismatch"   |
| 6045 | `InvalidInstructionDataDiscriminator`           | "InvalidInstructionDataDiscriminator"           |
| 6026 | `InstructionNotCallable`                        | "The instruction is not callable"               |

### Index Bounds Errors

| Code | Error                                | Message                              |
| ---- | ------------------------------------ | ------------------------------------ |
| 6046 | `NewAddressAssignedIndexOutOfBounds` | "NewAddressAssignedIndexOutOfBounds" |

### Wrapped/From Errors

| Error                                                  | Code Type | Message                            |
| ------------------------------------------------------ | --------- | ---------------------------------- |
| `BatchedMerkleTreeError(BatchedMerkleTreeError)`       | Variable  | "Batched Merkle tree error {0}"    |
| `ConcurrentMerkleTreeError(ConcurrentMerkleTreeError)` | Variable  | "Concurrent Merkle tree error {0}" |
| `IndexedMerkleTreeError(IndexedMerkleTreeError)`       | Variable  | "Indexed Merkle tree error {0}"    |
| `AccountError(AccountError)`                           | Variable  | "Account checks error {0}"         |
| `ZeroCopyError(ZeroCopyError)`                         | Variable  | "Zero copy error {0}"              |
| `ProgramError(u64)`                                    | Variable  | "Program error code: {0}"          |
