---
hidden: true
---

# Client Library









{% stepper %}
{% step %}
### Setup

environment

trees



```rust
let config = ProgramTestConfig::new(
        true,
        Some(vec![("create_and_update", create_and_update::ID)]),
    );LightProgramTest
    let mut rpc = LightProgramTest::new(config).await.unwrap(); // for LightProgramTest
    let address_tree_info = rpc.get_address_tree_v1();
    let state_tree_info = rpc.get_random_state_tree_info()?;
```
{% endstep %}

{% step %}
### Validity Proof

Create

```rust
let rpc_result = rpc
        .get_validity_proof(
            vec![],
            vec![AddressWithTree {
                address: *address,
                tree: address_tree_info.tree,
            }],
            None,
        )
        .await?;
```

Update and Close



Summary

{% tabs %}
{% tab title="Create" %}

{% endtab %}

{% tab title="Update" %}

{% endtab %}

{% tab title="Close" %}

{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### Accounts



```rust
let mut remaining_accounts = PackedAccounts::default();
let config = SystemAccountMetaConfig::new(create_and_update::ID);
    remaining_accounts.add_system_accounts(config);
let packed_address_tree_accounts = rpc_result
    .pack_tree_infos(&mut remaining_accounts)
    .address_trees;
let output_state_tree_index = rpc
    .get_random_state_tree_info()?
    .pack_output_tree_index(&mut remaining_accounts)?;
let accounts = create_and_update::accounts::GenericAnchorAccounts {
    signer: payer.pubkey(),
};
let accounts =  [
            accounts.to_account_metas(None),
            remaining_accounts.to_account_metas().0,
        ]
        .concat();
```
{% endstep %}

{% step %}
### Instruction Data

```rust
let instruction_data = create_and_update::instruction::CreateCompressedAccount {
        proof: rpc_result.proof,
        address_tree_info: packed_address_tree_accounts[0],
        output_state_tree_index,
        message,
    };
```
{% endstep %}
{% endstepper %}

## Full Code Example

{% tabs %}
{% tab title="Create" %}

{% endtab %}

{% tab title="Update" %}

{% endtab %}

{% tab title="Close" %}

{% endtab %}
{% endtabs %}

```
// Some code
```



## Next Steps





