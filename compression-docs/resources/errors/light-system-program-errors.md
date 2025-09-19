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

| Error                  | Code | Message                   |
| ---------------------- | ---- | ------------------------- |
| `SumCheckFailed`       | 6000 | "Sum check failed"        |
| `SignerCheckFailed`    | 6001 | "Signer check failed"     |
| `CpiSignerCheckFailed` | 6002 | "Cpi signer check failed" |

### Computation Errors

| Error                    | Code | Message                        |
| ------------------------ | ---- | ------------------------------ |
| `ComputeInputSumFailed`  | 6003 | "Computing input sum failed."  |
| `ComputeOutputSumFailed` | 6004 | "Computing output sum failed." |
| `ComputeRpcSumFailed`    | 6005 | "Computing rpc sum failed."    |

### Address & Account Errors

| Error                 | Code | Message                 |
| --------------------- | ---- | ----------------------- |
| `InvalidAddress`      | 6006 | "InvalidAddress"        |
| `DeriveAddressError`  | 6007 | "DeriveAddressError"    |
| `AddressIsNone`       | 6047 | "AddressIsNone"         |
| `AddressDoesNotMatch` | 6048 | "AddressDoesNotMatch"   |
| `InvalidAccount`      | 6040 | "InvalidAccount"        |
| `InvalidAccountMode`  | 6044 | "Invalid account mode." |

### SOL Compression/Decompression Errors

| Error                                          | Code | Message                                        |
| ---------------------------------------------- | ---- | ---------------------------------------------- |
| `CompressedSolPdaUndefinedForCompressSol`      | 6008 | "CompressedSolPdaUndefinedForCompressSol"      |
| `DecompressLamportsUndefinedForCompressSol`    | 6009 | "DecompressLamportsUndefinedForCompressSol"    |
| `CompressedSolPdaUndefinedForDecompressSol`    | 6010 | "CompressedSolPdaUndefinedForDecompressSol"    |
| `DeCompressLamportsUndefinedForDecompressSol`  | 6011 | "DeCompressLamportsUndefinedForDecompressSol"  |
| `DecompressRecipientUndefinedForDecompressSol` | 6012 | "DecompressRecipientUndefinedForDecompressSol" |
| `DecompressionRecipientDefined`                | 6023 | "DecompressionRecipientDefined"                |
| `SolPoolPdaDefined`                            | 6024 | "SolPoolPdaDefined"                            |

### Access & Permission Errors

| Error                        | Code | Message                      |
| ---------------------------- | ---- | ---------------------------- |
| `WriteAccessCheckFailed`     | 6013 | "WriteAccessCheckFailed"     |
| `InvokingProgramNotProvided` | 6014 | "InvokingProgramNotProvided" |

### Capacity & Validation Errors

| Error                    | Code | Message                  |
| ------------------------ | ---- | ------------------------ |
| `InvalidCapacity`        | 6015 | "InvalidCapacity"        |
| `InvalidMerkleTreeOwner` | 6016 | "InvalidMerkleTreeOwner" |
| `InvalidArgument`        | 6039 | "InvalidArgument"        |

### Proof Errors

| Error                     | Code | Message                                                                     |
| ------------------------- | ---- | --------------------------------------------------------------------------- |
| `ProofIsNone`             | 6017 | "ProofIsNone"                                                               |
| `ProofIsSome`             | 6018 | "Proof is some but no input compressed accounts or new addresses provided." |
| `ProofVerificationFailed` | 6043 | "Proof verification failed."                                                |

### Input/Output Errors

| Error                   | Code | Message                 |
| ----------------------- | ---- | ----------------------- |
| `EmptyInputs`           | 6019 | "EmptyInputs"           |
| `NoInputs`              | 6029 | "NoInputs"              |
| `TooManyOutputAccounts` | 6051 | "TooManyOutputAccounts" |

### CPI Context Errors

| Error                                    | Code | Message                                  |
| ---------------------------------------- | ---- | ---------------------------------------- |
| `CpiContextAccountUndefined`             | 6020 | "CpiContextAccountUndefined"             |
| `CpiContextEmpty`                        | 6021 | "CpiContextEmpty"                        |
| `CpiContextMissing`                      | 6022 | "CpiContextMissing"                      |
| `CpiContextFeePayerMismatch`             | 6027 | "CpiContextFeePayerMismatch"             |
| `CpiContextAssociatedMerkleTreeMismatch` | 6028 | "CpiContextAssociatedMerkleTreeMismatch" |
| `CpiContextAlreadySet`                   | 6049 | "CpiContextAlreadySet"                   |

### Merkle Tree Index Errors

| Error                               | Code | Message                                                  |
| ----------------------------------- | ---- | -------------------------------------------------------- |
| `InputMerkleTreeIndicesNotInOrder`  | 6030 | "Input merkle tree indices are not in ascending order."  |
| `OutputMerkleTreeIndicesNotInOrder` | 6031 | "Output merkle tree indices are not in ascending order." |
| `OutputMerkleTreeNotUnique`         | 6032 | "OutputMerkleTreeNotUnique"                              |

### Data & State Errors

| Error                               | Code | Message                             |
| ----------------------------------- | ---- | ----------------------------------- |
| `DataFieldUndefined`                | 6033 | "DataFieldUndefined"                |
| `AppendStateFailed`                 | 6025 | "AppendStateFailed"                 |
| `BorrowingDataFailed`               | 6052 | "Borrowing data failed"             |
| `HashChainInputsLenghtInconsistent` | 6036 | "HashChainInputsLenghtInconsistent" |

### Read-Only Account Errors

| Error                                 | Code | Message                               |
| ------------------------------------- | ---- | ------------------------------------- |
| `ReadOnlyAddressAlreadyExists`        | 6034 | "ReadOnlyAddressAlreadyExists"        |
| `ReadOnlyAccountDoesNotExist`         | 6035 | "ReadOnlyAccountDoesNotExist"         |
| `DuplicateAccountInInputsAndReadOnly` | 6053 | "DuplicateAccountInInputsAndReadOnly" |

### Tree Configuration Errors

| Error                      | Code | Message                    |
| -------------------------- | ---- | -------------------------- |
| `InvalidAddressTreeHeight` | 6037 | "InvalidAddressTreeHeight" |
| `InvalidStateTreeHeight`   | 6038 | "InvalidStateTreeHeight"   |
| `InvalidTreeHeight`        | 6050 | "InvalidTreeHeight"        |

### Discriminator & Instruction Errors

| Error                                           | Code | Message                                         |
| ----------------------------------------------- | ---- | ----------------------------------------------- |
| `AddressMerkleTreeAccountDiscriminatorMismatch` | 6041 | "AddressMerkleTreeAccountDiscriminatorMismatch" |
| `StateMerkleTreeAccountDiscriminatorMismatch`   | 6042 | "StateMerkleTreeAccountDiscriminatorMismatch"   |
| `InvalidInstructionDataDiscriminator`           | 6045 | "InvalidInstructionDataDiscriminator"           |
| `InstructionNotCallable`                        | 6026 | "The instruction is not callable"               |

### Index Bounds Errors

| Error                                | Code | Message                              |
| ------------------------------------ | ---- | ------------------------------------ |
| `NewAddressAssignedIndexOutOfBounds` | 6046 | "NewAddressAssignedIndexOutOfBounds" |

### Wrapped/From Errors

| Error                                                  | Code Type | Message                            |
| ------------------------------------------------------ | --------- | ---------------------------------- |
| `BatchedMerkleTreeError(BatchedMerkleTreeError)`       | Variable  | "Batched Merkle tree error {0}"    |
| `ConcurrentMerkleTreeError(ConcurrentMerkleTreeError)` | Variable  | "Concurrent Merkle tree error {0}" |
| `IndexedMerkleTreeError(IndexedMerkleTreeError)`       | Variable  | "Indexed Merkle tree error {0}"    |
| `AccountError(AccountError)`                           | Variable  | "Account checks error {0}"         |
| `ZeroCopyError(ZeroCopyError)`                         | Variable  | "Zero copy error {0}"              |
| `ProgramError(u64)`                                    | Variable  | "Program error code: {0}"          |
