# Forester nodes

Forester nodes ensure the liveness of the protocol. Anyone can run a forester node.&#x20;

#### The Light Forest

All compressed "Light" state exists in a forest of state trees. State trees are sparse binary Merkle tree data structures whose roots and other metadata exist in on-chain accounts on Solana. While regular Solana accounts are stored completey on-chain, a compressed account is a snapshot of an account state that is stored as a leaf in a state tree. One state tree therefore houses many such compressed accounts; a state tree of depth 31 can store \~2B compressed accounts.&#x20;

When a user transaction writes to a compressed account, the Light system program appends a new compressed account (the snapshot of the updated state) as a leaf to the state tree, effectively advancing the state root of said tree on Solana. One user transaction can write to multiple compressed accounts/ advance multiple state roots.&#x20;

#### 1. Forester nodes dispose old state to ensure liveness

When new state gets appended, old state needs to get nullified. To ensure atomicity as part of each user transaction the system program stores all nullified compressed account hashes on-chain inside the state tree's associated nullifier queue,  marking them as spent.

The nullifier queue has a maximum length though and can therefore support only house up to _n_ hashes. Once a nullfiier queue is full, the respective state tree cannot be advanced and transactions will fail.&#x20;

Forester nodes can empty nullifier queues asynchronously by updating the respective state trees (replacing nullified leaves with zero values) in batches in exchange for a reward.

#### 2. Forester nodes dispose of and plant new state trees

Every user transaction appends new leaves to all state trees it writes to, and since trees have a maximum capacity of leaves they can hold, they eventually become full. Therefore, to ensure liveness of the protocol, Forester nodes can roll-over near-full trees onto new tree accounts in exchange for a reward.

## Installation

<mark style="background-color:blue;">More coming soon.</mark>
