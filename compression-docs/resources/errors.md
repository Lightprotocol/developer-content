---
description: Overview to errors of Light System Program and Light SDK.
---

# Errors

{% hint style="info" %}
Use STRG F to find your Error Code
{% endhint %}

***

## 6000 / SystemProgramError Variants

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

<table><thead><tr><th width="120.5833740234375">Code</th><th>Error</th><th>Message</th></tr></thead><tbody><tr><td>6000</td><td><code>SumCheckFailed</code></td><td>"Sum check failed"</td></tr><tr><td>6001</td><td><code>SignerCheckFailed</code></td><td>"Signer check failed"</td></tr><tr><td>6002</td><td><code>CpiSignerCheckFailed</code></td><td>"Cpi signer check failed"</td></tr><tr><td>6003</td><td><code>ComputeInputSumFailed</code></td><td>"Computing input sum failed."</td></tr><tr><td>6004</td><td><code>ComputeOutputSumFailed</code></td><td>"Computing output sum failed."</td></tr><tr><td>6005</td><td><code>ComputeRpcSumFailed</code></td><td>"Computing rpc sum failed."</td></tr><tr><td>6006</td><td><code>InvalidAddress</code></td><td>"InvalidAddress"</td></tr><tr><td>6007</td><td><code>DeriveAddressError</code></td><td>"DeriveAddressError"</td></tr><tr><td>6008</td><td><code>CompressedSolPdaUndefinedForCompressSol</code></td><td>"CompressedSolPdaUndefinedForCompressSol"</td></tr><tr><td>6009</td><td><code>DecompressLamportsUndefinedForCompressSol</code></td><td>"DecompressLamportsUndefinedForCompressSol"</td></tr><tr><td>6010</td><td><code>CompressedSolPdaUndefinedForDecompressSol</code></td><td>"CompressedSolPdaUndefinedForDecompressSol"</td></tr><tr><td>6011</td><td><code>DeCompressLamportsUndefinedForDecompressSol</code></td><td>"DeCompressLamportsUndefinedForDecompressSol"</td></tr><tr><td>6012</td><td><code>DecompressRecipientUndefinedForDecompressSol</code></td><td>"DecompressRecipientUndefinedForDecompressSol"</td></tr><tr><td>6013</td><td><code>WriteAccessCheckFailed</code></td><td>"WriteAccessCheckFailed"</td></tr><tr><td>6014</td><td><code>InvokingProgramNotProvided</code></td><td>"InvokingProgramNotProvided"</td></tr><tr><td>6015</td><td><code>InvalidCapacity</code></td><td>"InvalidCapacity"</td></tr><tr><td>6016</td><td><code>InvalidMerkleTreeOwner</code></td><td>"InvalidMerkleTreeOwner"</td></tr><tr><td>6017</td><td><code>ProofIsNone</code></td><td>"ProofIsNone"</td></tr><tr><td>6018</td><td><code>ProofIsSome</code></td><td>"Proof is some but no input compressed accounts or new addresses provided."</td></tr><tr><td>6019</td><td><code>EmptyInputs</code></td><td>"EmptyInputs"</td></tr><tr><td>6020</td><td><code>CpiContextAccountUndefined</code></td><td>"CpiContextAccountUndefined"</td></tr><tr><td>6021</td><td><code>CpiContextEmpty</code></td><td>"CpiContextEmpty"</td></tr><tr><td>6022</td><td><code>CpiContextMissing</code></td><td>"CpiContextMissing"</td></tr><tr><td>6023</td><td><code>DecompressionRecipientDefined</code></td><td>"DecompressionRecipientDefined"</td></tr><tr><td>6024</td><td><code>SolPoolPdaDefined</code></td><td>"SolPoolPdaDefined"</td></tr><tr><td>6025</td><td><code>AppendStateFailed</code></td><td>"AppendStateFailed"</td></tr><tr><td>6026</td><td><code>InstructionNotCallable</code></td><td>"The instruction is not callable"</td></tr><tr><td>6027</td><td><code>CpiContextFeePayerMismatch</code></td><td>"CpiContextFeePayerMismatch"</td></tr><tr><td>6028</td><td><code>CpiContextAssociatedMerkleTreeMismatch</code></td><td>"CpiContextAssociatedMerkleTreeMismatch"</td></tr><tr><td>6029</td><td><code>NoInputs</code></td><td>"NoInputs"</td></tr><tr><td>6030</td><td><code>InputMerkleTreeIndicesNotInOrder</code></td><td>"Input merkle tree indices are not in ascending order."</td></tr><tr><td>6031</td><td><code>OutputMerkleTreeIndicesNotInOrder</code></td><td>"Output merkle tree indices are not in ascending order."</td></tr><tr><td>6032</td><td><code>OutputMerkleTreeNotUnique</code></td><td>"OutputMerkleTreeNotUnique"</td></tr><tr><td>6033</td><td><code>DataFieldUndefined</code></td><td>"DataFieldUndefined"</td></tr><tr><td>6034</td><td><code>ReadOnlyAddressAlreadyExists</code></td><td>"ReadOnlyAddressAlreadyExists"</td></tr><tr><td>6035</td><td><code>ReadOnlyAccountDoesNotExist</code></td><td>"ReadOnlyAccountDoesNotExist"</td></tr><tr><td>6036</td><td><code>HashChainInputsLenghtInconsistent</code></td><td>"HashChainInputsLenghtInconsistent"</td></tr><tr><td>6037</td><td><code>InvalidAddressTreeHeight</code></td><td>"InvalidAddressTreeHeight"</td></tr><tr><td>6038</td><td><code>InvalidStateTreeHeight</code></td><td>"InvalidStateTreeHeight"</td></tr><tr><td>6039</td><td><code>InvalidArgument</code></td><td>"InvalidArgument"</td></tr><tr><td>6040</td><td><code>InvalidAccount</code></td><td>"InvalidAccount"</td></tr><tr><td>6041</td><td><code>AddressMerkleTreeAccountDiscriminatorMismatch</code></td><td>"AddressMerkleTreeAccountDiscriminatorMismatch"</td></tr><tr><td>6042</td><td><code>StateMerkleTreeAccountDiscriminatorMismatch</code></td><td>"StateMerkleTreeAccountDiscriminatorMismatch"</td></tr><tr><td>6043</td><td><code>ProofVerificationFailed</code></td><td>"Proof verification failed."</td></tr><tr><td>6044</td><td><code>InvalidAccountMode</code></td><td>"Invalid account mode."</td></tr><tr><td>6045</td><td><code>InvalidInstructionDataDiscriminator</code></td><td>"InvalidInstructionDataDiscriminator"</td></tr><tr><td>6046</td><td><code>NewAddressAssignedIndexOutOfBounds</code></td><td>"NewAddressAssignedIndexOutOfBounds"</td></tr><tr><td>6047</td><td><code>AddressIsNone</code></td><td>"AddressIsNone"</td></tr><tr><td>6048</td><td><code>AddressDoesNotMatch</code></td><td>"AddressDoesNotMatch"</td></tr><tr><td>6049</td><td><code>CpiContextAlreadySet</code></td><td>"CpiContextAlreadySet"</td></tr><tr><td>6050</td><td><code>InvalidTreeHeight</code></td><td>"InvalidTreeHeight"</td></tr><tr><td>6051</td><td><code>TooManyOutputAccounts</code></td><td>"TooManyOutputAccounts"</td></tr><tr><td>6052</td><td><code>BorrowingDataFailed</code></td><td>"Borrowing data failed"</td></tr><tr><td>6053</td><td><code>DuplicateAccountInInputsAndReadOnly</code></td><td>"DuplicateAccountInInputsAndReadOnly"</td></tr></tbody></table>

#### Wrapped/From Errors

<table><thead><tr><th width="110.5333251953125">Code Type</th><th>Error</th><th>Message</th></tr></thead><tbody><tr><td>Variable</td><td><code>BatchedMerkleTreeError(BatchedMerkleTreeError)</code></td><td>"Batched Merkle tree error {0}"</td></tr><tr><td>Variable</td><td><code>ConcurrentMerkleTreeError(ConcurrentMerkleTreeError)</code></td><td>"Concurrent Merkle tree error {0}"</td></tr><tr><td>Variable</td><td><code>IndexedMerkleTreeError(IndexedMerkleTreeError)</code></td><td>"Indexed Merkle tree error {0}"</td></tr><tr><td>Variable</td><td><code>AccountError(AccountError)</code></td><td>"Account checks error {0}"</td></tr><tr><td>Variable</td><td><code>ZeroCopyError(ZeroCopyError)</code></td><td>"Zero copy error {0}"</td></tr><tr><td>Variable</td><td><code>ProgramError(u64)</code></td><td>"Program error code: {0}"</td></tr></tbody></table>

***

## 16000 / LightSdkError Variants

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

<table><thead><tr><th width="119.4666748046875">Code</th><th>Error</th><th>Message</th></tr></thead><tbody><tr><td>16001</td><td><code>ConstraintViolation</code></td><td>"Constraint violation"</td></tr><tr><td>16002</td><td><code>InvalidLightSystemProgram</code></td><td>"Invalid light-system-program ID"</td></tr><tr><td>16003</td><td><code>ExpectedAccounts</code></td><td>"Expected accounts in the instruction"</td></tr><tr><td>16004</td><td><code>ExpectedAddressTreeInfo</code></td><td>"Expected address Merkle context to be provided"</td></tr><tr><td>16005</td><td><code>ExpectedAddressRootIndex</code></td><td>"Expected address root index to be provided"</td></tr><tr><td>16006</td><td><code>ExpectedData</code></td><td>"Accounts with a specified input are expected to have data"</td></tr><tr><td>16007</td><td><code>ExpectedDiscriminator</code></td><td>"Accounts with specified data are expected to have a discriminator"</td></tr><tr><td>16008</td><td><code>ExpectedHash</code></td><td>"Accounts with specified data are expected to have a hash"</td></tr><tr><td>16009</td><td><code>ExpectedLightSystemAccount(String)</code></td><td>"Expected the <code>{0}</code> light account to be provided"</td></tr><tr><td>16010</td><td><code>ExpectedMerkleContext</code></td><td>"<code>mut</code> and <code>close</code> accounts are expected to have a Merkle context"</td></tr><tr><td>16011</td><td><code>ExpectedRootIndex</code></td><td>"Expected root index to be provided"</td></tr><tr><td>16012</td><td><code>TransferFromNoInput</code></td><td>"Cannot transfer lamports from an account without input"</td></tr><tr><td>16013</td><td><code>TransferFromNoLamports</code></td><td>"Cannot transfer from an account without lamports"</td></tr><tr><td>16014</td><td><code>TransferFromInsufficientLamports</code></td><td>"Account, from which a transfer was attempted, has insufficient amount of lamports"</td></tr><tr><td>16015</td><td><code>TransferIntegerOverflow</code></td><td>"Integer overflow resulting from too large resulting amount"</td></tr><tr><td>16016</td><td><code>Borsh</code></td><td>"Borsh error."</td></tr><tr><td>16017</td><td><code>FewerAccountsThanSystemAccounts</code></td><td>"Fewer accounts than number of system accounts."</td></tr><tr><td>16018</td><td><code>InvalidCpiSignerAccount</code></td><td>"InvalidCpiSignerAccount"</td></tr><tr><td>16019</td><td><code>MissingField(String)</code></td><td>"Missing meta field: {0}"</td></tr><tr><td>16020</td><td><code>OutputStateTreeIndexIsNone</code></td><td>"Output state tree index is none. Use an CompressedAccountMeta type with output tree index to initialize or update accounts."</td></tr><tr><td>16021</td><td><code>InitAddressIsNone</code></td><td>"Address is none during initialization"</td></tr><tr><td>16022</td><td><code>InitWithAddressIsNone</code></td><td>"Address is none during initialization with address"</td></tr><tr><td>16023</td><td><code>InitWithAddressOutputIsNone</code></td><td>"Output is none during initialization with address"</td></tr><tr><td>16024</td><td><code>MetaMutAddressIsNone</code></td><td>"Address is none during meta mutation"</td></tr><tr><td>16025</td><td><code>MetaMutInputIsNone</code></td><td>"Input is none during meta mutation"</td></tr><tr><td>16026</td><td><code>MetaMutOutputLamportsIsNone</code></td><td>"Output lamports is none during meta mutation"</td></tr><tr><td>16027</td><td><code>MetaMutOutputIsNone</code></td><td>"Output is none during meta mutation"</td></tr><tr><td>16028</td><td><code>MetaCloseAddressIsNone</code></td><td>"Address is none during meta close"</td></tr><tr><td>16029</td><td><code>MetaCloseInputIsNone</code></td><td>"Input is none during meta close"</td></tr><tr><td>16031</td><td><code>CpiAccountsIndexOutOfBounds(usize)</code></td><td>"CPI accounts index out of bounds: {0}"</td></tr><tr><td>16032</td><td><code>InvalidCpiContextAccount</code></td><td>"Invalid CPI context account"</td></tr><tr><td>16033</td><td><code>InvalidSolPoolPdaAccount</code></td><td>"Invalid SolPool PDA account"</td></tr><tr><td>16034</td><td><code>InvalidCpiAccountsOffset</code></td><td>"CpigAccounts accounts slice starts with an invalid account. It should start with LightSystemProgram SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7."</td></tr></tbody></table>

#### Transparent/Wrapped Errors

<table><thead><tr><th width="120.58331298828125">Code Type</th><th>Error</th><th>Message</th></tr></thead><tbody><tr><td>Variable</td><td><code>Hasher(HasherError)</code></td><td>Transparent error from HasherError</td></tr><tr><td>Variable</td><td><code>ZeroCopy(ZeroCopyError)</code></td><td>Transparent error from ZeroCopyError</td></tr><tr><td>Variable</td><td><code>ProgramError(ProgramError)</code></td><td>"Program error: {0}"</td></tr><tr><td>Variable</td><td><code>AccountError(AccountError)</code></td><td>Transparent error from AccountError</td></tr></tbody></table>
