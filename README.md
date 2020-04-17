# EgycryptocurrencyJS
Running the wallet app
---------------------
This method will run wallet backend and frontend concurrently, Please keep in a mind that a auth token is required to run the get balance and send funds methods.
```
npm run wallet
```

Viewing the BlockChain
---------------------
This method displays the blockchain

GET, https://egycryptocurrency-node-1.herokuapp.com/blockchain


Mining a Block
---------------------
Mine a block with the current transactions

GET, https://egycryptocurrency-node-1.herokuapp.com/mine

Validate Transaction 
---------------------
Deposit Crypto for some public address
```json
{
	"recipient":"8b1875cdbd490e33c3240b233274c15f15f53c700ed8aabc76094fe257e3f1b6",
	"amount":50
}
```
Send a Transaction
---------------------
Send a transactoin for this node to another address

POST, https://egycryptocurrency-node-1.herokuapp.com/transaction/broadcast
where the sender is node1,

```json
{
	"amount":2,
	"recipient":"d4ba5f1d9d6e2fd0445684bc149c1b3ace3a4a72e041111a663e2819b69a329c"
}
```

Validate Transaction 
---------------------
Validate the oldest in the pending transaction array, The Json Body is Optional

POST, https://egycryptocurrency-node-1.herokuapp.com/validate/transaction


```json
{
	"amount":2,
	"sender":"10a455a7c1dfe8f232744555b38973f808dc5c17d59f36f89f654ba242fdf32f",
	"recipient":"47d3150bde8a9c7c814b661278e05b1e533b91a3d180d3a2353f9b7d275d5d36",
	"transactionHash":"b8cdb49a7ed56f651fb945fb25def1ee6c7bb6ffdc04d275d9debf9819a05493",
	"validationsNeeded":1
	
}
```

Disconnect a Node
---------------------
Remove the node from the network
DELETE, https://egycryptocurrency-node-1.herokuapp.com/disconnect

Consensus Method
---------------------
Get latest version of the node
GET, https://egycryptocurrency-node-1.herokuapp.com/consensus
