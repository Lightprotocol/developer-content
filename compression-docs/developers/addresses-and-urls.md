# Addresses and URLs

### Mainnet URLs

<table data-header-hidden><thead><tr><th></th><th></th><th data-hidden></th></tr></thead><tbody><tr><td>Network Address (RPC)</td><td>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr><tr><td>Photon RPC API</td><td>https://mainnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr></tbody></table>

### Devnet URLs

<table data-header-hidden><thead><tr><th></th><th></th><th data-hidden></th></tr></thead><tbody><tr><td>Network Address (RPC)</td><td>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr><tr><td>Photon RPC API</td><td>https://devnet.helius-rpc.com?api-key=&#x3C;api_key></td><td></td></tr></tbody></table>

### Program IDs & Accounts

<table><thead><tr><th width="250"></th><th></th></tr></thead><tbody><tr><td>Light System Program</td><td><strong>SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7</strong></td></tr><tr><td>Compressed Token Program</td><td><strong>cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m</strong></td></tr><tr><td>Account Compression Program</td><td><strong>compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq</strong></td></tr><tr><td>Shared Public State Tree</td><td><strong>smt1NamzXdq4AMqS2fS2F1i5KTYPZRhoHgWx38d8WsT</strong></td></tr><tr><td>Shared Public Nullifier Queue</td><td><strong>nfq1NvQDJ2GEgnS8zt9prAe8rjjpAW1zFkrvZoBR148</strong></td></tr><tr><td>Shared Public Address Tree</td><td><strong>amt1Ayt45jfbdw5YSo7iz6WZxUmnZsQTYXy82hVwyC2</strong></td></tr><tr><td>Shared Public Address Queue</td><td><strong>aq1S9z4reTSQAdgWHGD2zDaS39sjGrAxbR31vxJ2F4F</strong></td></tr><tr><td>Token Escrow Owner PDA</td><td><strong>GXtd2izAiMJPwMEjfgTRH3d7k9mjn4Jq3JrWFv9gySYy</strong></td></tr></tbody></table>

### Lookup Tables

{% hint style="info" %}
[Lookup tables](https://solana.com/docs/advanced/lookup-tables) can be used to reduce your transaction size. We provide pre-initialized lookup tables that cover the Light's program IDs and accounts:
{% endhint %}

<table><thead><tr><th width="260"></th><th></th></tr></thead><tbody><tr><td>Lookup Table #1 (Mainnet)</td><td><strong>9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ</strong></td></tr><tr><td>Lookup Table #1 (Devnet)</td><td><strong>qAJZMgnQJ8G6vA3WRcjD9Jan1wtKkaCFWLWskxJrR5V</strong></td></tr></tbody></table>

If you need to extend a custom lookup table with accounts commonly used by Light Protocol, we provide a helper function [here](https://www.zkcompression.com/developers/typescript-client#creating-lookup-tables).
