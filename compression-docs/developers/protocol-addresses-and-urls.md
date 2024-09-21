# Protocol Addresses and URLs

### Mainnet URLs

<table data-header-hidden><thead><tr><th></th><th></th><th data-hidden></th></tr></thead><tbody><tr><td>Network Address (RPC)</td><td>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr><tr><td>Photon RPC API</td><td>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr></tbody></table>

### Devnet URLs

<table data-header-hidden><thead><tr><th></th><th></th><th data-hidden></th></tr></thead><tbody><tr><td>Network Address (RPC)</td><td>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr><tr><td>Photon RPC API</td><td>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr></tbody></table>

### zkTestnet URLs (deprecated)

{% hint style="info" %}
Note: zkTestnet has been deprecated in favor of our **Solana Devnet** deployment. Please use the public Solana Devnet Cluster for further development.
{% endhint %}

<table><thead><tr><th width="249"></th><th></th></tr></thead><tbody><tr><td>Network address (RPC)</td><td><a href="https://zk-testnet.helius.dev:8899">https://zk-testnet.helius.dev:8899</a> (deprecated)</td></tr><tr><td>Photon RPC API</td><td><a href="https://zk-testnet.helius.dev:8899">https://zk-testnet.helius.dev:8784</a> (deprecated)</td></tr><tr><td>Prover</td><td><a href="https://zk-testnet.helius.dev:8899">https://zk-testnet.helius.dev:3001</a> (deprecated)</td></tr></tbody></table>

### Program IDs and Accounts (from 27th Aug 2024 onward)

<table><thead><tr><th width="250"></th><th></th></tr></thead><tbody><tr><td>Light System Program</td><td><strong>SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7</strong></td></tr><tr><td>Compressed Token Program</td><td><strong>cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m</strong></td></tr><tr><td>Account Compression Program</td><td><strong>compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq</strong></td></tr><tr><td>Shared Public State Tree</td><td><strong>smt1NamzXdq4AMqS2fS2F1i5KTYPZRhoHgWx38d8WsT</strong></td></tr><tr><td>Shared Public Nullifier Queue</td><td><strong>nfq1NvQDJ2GEgnS8zt9prAe8rjjpAW1zFkrvZoBR148</strong></td></tr><tr><td>Shared Public Address Tree</td><td><strong>amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2</strong></td></tr><tr><td>Shared Public Address Queue</td><td><strong>aq1S9z4reTSQAdgWHGD2zDaS39sjGrAxbR31vxJ2F4F</strong></td></tr></tbody></table>

### Program IDs and Accounts (deprecated as of 27th Aug 2024)

<table><thead><tr><th width="248"></th><th></th></tr></thead><tbody><tr><td>Light System Program</td><td><strong>H5sFv8VwWmjxHYS2GB4fTDsK7uTtnRT4WiixtHrET3bN</strong></td></tr><tr><td>Compressed Token Program</td><td><strong>HXVfQ44ATEi9WBKLSCCwM54KokdkzqXci9xCQ7ST9SYN</strong></td></tr><tr><td>Account Compression Program</td><td><strong>CbjvJc1SNx1aav8tU49dJGHu8EUdzQJSMtkjDmV8miqK</strong></td></tr><tr><td>Shared Public State Tree</td><td><strong>5bdFnXU47QjzGpzHfXnxcEi5WXyxzEAZzd1vrE39bf1W</strong></td></tr><tr><td>Shared Public Nullifier Queue</td><td><strong>44J4oDXpjPAbzHCSc24q7NEiPekss4sAbLd8ka4gd9CZ</strong></td></tr><tr><td>Shared Public Address Tree</td><td><strong>C83cpRN6oaafjNgMQJvaYgAz592EP5wunKvbokeTKPLn</strong></td></tr><tr><td>Shared Public Address Queue</td><td><strong>HNjtNrjt6irUPYEgxhx2Vcs42koK9fxzm3aFLHVaaRWz</strong></td></tr></tbody></table>

### Lookup Tables

{% hint style="info" %}
[Lookup tables](https://solana.com/docs/advanced/lookup-tables) can be used with compressed accounts to reduce your transaction size. We provide a pre-initialized lookup table on Devnet that covers the Light's program IDs and accounts:
{% endhint %}

<table><thead><tr><th width="264"></th><th></th></tr></thead><tbody><tr><td>Default Lookup Table #1</td><td><strong>qAJZMgnQJ8G6vA3WRcjD9Jan1wtKkaCFWLWskxJrR5V</strong></td></tr></tbody></table>

You can also create your own lookup tables. We provide a helper function that initializes your table with Light's default program IDs and accounts. We also have [the following guide on creating lookup tables](https://www.zkcompression.com/developers/typescript-client#creating-lookup-tables) in the TypeScript Client section.
