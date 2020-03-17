const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const BlockChain = require("./blockchain");
const rp = require("request-promise");
const currency = new BlockChain();

const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ hello: "Welome to Egycryptocurrency" });
});

//Get BlockChain
app.get("/blockchain", (req, res) => {
  return res.send(currency);
});

//Do a transaction
app.post("/transaction", (req, res) => {
  const newTransaction = req.body;
  const message = currency.addTransactionToPendingTransactions(newTransaction);
  return res.json({
    message: `The transaction will be added to block ${message}`
  });
});
app.post("/transaction/broadcast", (req, res) => {
  const newTransaction = currency.createNewTransaction(
    req.body.sender,
    req.body.recipient,
    req.body.amount
  );
  //Add to my own Array

  currency.addTransactionToPendingTransactions(newTransaction);

  //Broadcast to the rest of the Nodes
  const requestPromises = [];
  currency.networkNodes.forEach(networkNodeUrl => {
    console.log("JAck ass:" + networkNodeUrl);
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then(data => {
    res.json({ message: "The Broadcast was successfull" });
  });
});

app.post("/receive-new-block", (req, res) => {
  const newBlock = req.body.newBlock;
  console.log(newBlock);
  const lastBlock = currency.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock.index + 1 == newBlock.index;
  console.log(lastBlock.hash + " -" + newBlock.previousBlockHash);
  console.log(lastBlock.index + 1);
  console.log(newBlock.index);
  if (correctHash && correctIndex) {
    //accept
    currency.chain.push(newBlock);
    currency.pendingTransactions = [];
    console.log("Block Accepted");
    return res.json({
      message: "New Block received and accepeted",
      newBlock: newBlock
    });
  } else {
    //reject
    console.log("Block Rejected");
    return res.json({ message: "New Block Rejected", newBlock: newBlock });
  }
});
//Mine block
app.get("/mine", (req, res) => {
  //Get Previous hash
  const previousBlockhash = currency.getLastBlock().hash;

  //get unforged transactions
  const currentBlockData = {
    transactions: currency.pendingTransactions,
    index: currency.getLastBlock().index + 1
  };
  //execure proof of work and commute hash
  const nonce = currency.proofOfWork(previousBlockhash, currentBlockData);
  const hash = currency.hashBlock(previousBlockhash, currentBlockData, nonce);
  const newBlock = currency.createNewBlock(nonce, previousBlockhash, hash);
  //reward Miner

  const requestPromises = [];
  currency.networkNodes.forEach(nodeUrl => {
    const requestOptions = {
      uri: nodeUrl + "/receive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises)
    .then(data => {
      //Award Miner
      const requestOptions = {
        uri: currency.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 12.5,
          sender: "00",
          recipient: currency.currentNodeUrl
        },
        json: true
      };
      return rp(requestOptions);
    })
    .then(data => {
      return res.json({
        message: "New block mined and broadcasted successfuly",
        block: newBlock
      });
    });
});

//Add a node to the network an broadcast
app.post("/register-and-broadcast-node", (req, res) => {
  try {
    const nodeUrl = req.body.newNodeUrl;
    //Check if it is not in the network
    if (currency.networkNodes.indexOf(nodeUrl) == -1)
      currency.networkNodes.push(nodeUrl);

    //Broadcast new Node to all Nodes in the Network by calling register-node
    const regNodesPromises = []; //to make sure all requests send back replies
    currency.networkNodes.forEach(networkNodeUrl => {
      const requestOptions = {
        uri: networkNodeUrl + "/register-node",
        method: "POST",
        body: { newNodeUrl: nodeUrl },
        json: true
      };
      regNodesPromises.push(rp(requestOptions));
    });
    Promise.all(regNodesPromises) //Once Finished with no errors, then ..
      .then(data => {
        //Now we have to send the new node, the rest of the nodes in the Network by calling register-nodes-bulk
        console.log("Successfuly Broadcasted");
        const bulkOptions = {
          uri: nodeUrl + "/register-nodes-bulk",
          method: "POST",
          body: {
            allNetworkNodes: [...currency.networkNodes, currency.currentNodeUrl]
          },
          json: true
        };
        return rp(bulkOptions);
      })
      .then(data => {
        res.json({ message: "Node successfuly registred in the netowrk" });
      })
      .catch();
  } catch (error) {
    console.log(error);
  }
});
//Register Node
app.post("/register-node", (req, res) => {
  try {
    const newNodeUrl = req.body.newNodeUrl;
    //Make Sure that the nodes is not me and It is not already in my array
    const notAlreadyThere = currency.networkNodes.indexOf(newNodeUrl) == -1;
    const notMe = currency.currentNodeUrl != newNodeUrl;
    if (notAlreadyThere && notMe) {
      currency.networkNodes.push(newNodeUrl);
      res.json({ message: "We have registered the new node" });
    } else {
      res.json({ message: "Error Registering the Node" });
    }
  } catch (error) {
    console.log(error);
  }
});
app.post("/register-nodes-bulk", (req, res) => {
  try {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
      if (
        currency.networkNodes.indexOf(networkNodeUrl) == -1 &&
        currency.currentNodeUrl != networkNodeUrl
      ) {
        //if Not Present, Register That Node and it's not my address
        if (networkNodeUrl != null && networkNodeUrl != undefined) {
          console.log(networkNodeUrl);
          currency.networkNodes.push(networkNodeUrl);
        }
      }
    });
    res.json({ message: "Successfuly added All Nodes" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/consensus", (req, res) => {
  //Longest Chain Method
  const requestPromises = [];
  //Fetchiing All Blockchain Data
  currency.networkNodes.forEach(nodeUrl => {
    const requestOptions = {
      uri: nodeUrl + "/blockchain",
      method: "GET",
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  //Checking if there is a longer chain in the network
  Promise.all(requestPromises).then(blockchains => {
    const curretChainLength = currency.chain.length;
    let maxChainLength = curretChainLength;
    let longestChain = null;
    let newPendingTransactions = null;
    blockchains.forEach(blockchain => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        longestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });
    if(!longestChain || (longestChain && !currency.chainIsValid(longestChain))){
      res.json({
        message:"Blockchain was not replaced",
        chain: currency.chain
      })
    }
    else if (longestChain && currency.chainIsValid(longestChain) ){
      currency.chain = longestChain
      currency.pendingTransactions = newPendingTransactions
      res.json({
        message:"Blockchain was replaced with a longer one",
        chain:currency.chain
      })
    }
  });
});

app.get('/block/:blockhash',(req,res)=>{
  const block = currency.getBlock(req.params.blockhash)
  res.json({block:block})
})
app.get('/transaction/:transactionId',(req,res)=>{

})
app.get('/address/:address',(req,res)=>{

})
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
