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
  const message = currency.createNewTransaction(
    req.body.sender,
    req.body.recipient,
    req.body.amount
  );
  return res.json({
    message: `The transaction will be added to block ${message}`
  });
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

  //Reward Miner
  currency.createNewTransaction(12.5, "00", "Add Miner Public Address Here");
  return res.json({ message: "New Blocked Mined", block: newBlock });
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

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
