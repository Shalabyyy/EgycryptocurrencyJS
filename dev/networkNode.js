const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const BlockChain = require("./blockchain");
const rp = require("request-promise");
const joi = require("joi");
const SHA256 = require("sha256");
const currency = new BlockChain();

const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ hello: "Welome to Egycryptocurrency" });
});

//Get BlockChain
app.get("/blockchain", (req, res) => {
  const dataToShow = {
    currentNodeUrl: currency.currentNodeUrl,
    networkNodes: currency.networkNodes,
    publicAddress: currency.publicAddress,
    networkAddresses: currency.networkAddresses,
    balance: currency.balance,
    chain: currency.chain,
    pendingTransactions: currency.pendingTransactions,
    validatedTransactions: currency.validatedTransactions
  };
  return res.send(dataToShow);
});

//Do a transaction
app.post("/transaction", (req, res) => {
  const newTransaction = req.body;
  const data = req.body;
  const schema = joi.object().keys({
    sender: joi.allow(), //change to 2 or 64 later
    recipient: joi.string().required(), //change to 64 later
    amount: joi
      .number()
      .min(0)
      .required(),
    transactionHash: joi.allow(),
    validationsNeeded: joi.allow()
  });
  const valid = joi.validate(data, schema);
  if (valid.error !== null) {
    console.log(valid.error);
    return res.json({ error: `Invalid  ${valid.error}` });
  }
  //Validated Data from here
  let message = "";
  if (req.body.sender == "00") {
    currency.addTransactionToValidTransactions(newTransaction);
  } else {
    message = currency.addTransactionToPendingTransactions(newTransaction);
  }
  return res.json({
    message: `The transaction will be added to block ${message}`
  });
});
app.post("/transaction/broadcast", (req, res) => {
  //Validate Request Body
  const data = req.body;
  const schema = joi.object().keys({
    sender: joi.allow(), //change to 2 or 64 later
    recipient: joi.string().required(), //change to 64 later
    amount: joi
      .number()
      .min(0)
      .required()
  });
  const valid = joi.validate(data, schema);
  if (valid.error !== null) {
    console.log(valid.error);
    return res.json({ error: `Invalid  ${valid.error}` });
  }

  //Starting Here The Inputs are Valid
  const newTransaction = currency.createNewTransaction(
    currency.publicAddress,
    req.body.recipient,
    req.body.amount
  );
  //Add to my own Array
  currency.addTransactionToPendingTransactions(newTransaction);
  //Broadcast to the rest of the Nodes
  const requestPromises = [];
  currency.networkNodes.forEach(networkNodeUrl => {
    console.log("Register Transaction at:" + networkNodeUrl);
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
app.post("/deposit", (req, res) => {
  //Validate Request Body
  const data = req.body;
  const schema = joi.object().keys({
    sender: joi.allow(), //change to 2 or 64 later
    recipient: joi.string().required(), //change to 64 later
    amount: joi
      .number()
      .min(0)
      .required()
  });
  const valid = joi.validate(data, schema);
  if (valid.error !== null) {
    console.log(valid.error);
    return res.json({ error: `Invalid  ${valid.error}` });
  }

  //Starting Here The Inputs are Valid
  const newTransaction = currency.createNewTransaction(
    "00",
    req.body.recipient,
    req.body.amount
  );
  //Add to my own Array, Later to have it's pwn validation
  currency.addTransactionToValidTransactions(newTransaction);
  //Broadcast to the rest of the Nodes
  const requestPromises = [];
  currency.networkNodes.forEach(networkNodeUrl => {
    console.log("Register Transaction at:" + networkNodeUrl);
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then(data => {
    res.json({
      message: "Successfult Deposited and Broadcast was successfull"
    });
  });
});
app.post("/award-miner", (req, res) => {
  //Validate Request Body
  const data = req.body;
  const schema = joi.object().keys({
    sender: joi.allow(), //change to 2 or 64 later
    recipient: joi.string().required(), //change to 64 later
    amount: joi
      .number()
      .min(0)
      .required(),
    validationsNeeded: joi.allow()
  });
  const valid = joi.validate(data, schema);
  if (valid.error !== null) {
    console.log(valid.error);
    return res.json({ error: `Invalid  ${valid.error}` });
  }

  //Starting Here The Inputs are Valid
  const newTransaction = currency.createNewTransaction(
    // currency.publicAdress,
    req.body.sender,
    req.body.recipient,
    req.body.amount
  );
  //Add to my own Array
  currency.addTransactionToPendingTransactions(newTransaction);
  //Broadcast to the rest of the Nodes
  const requestPromises = [];
  currency.networkNodes.forEach(networkNodeUrl => {
    console.log("Register Transaction at:" + networkNodeUrl);
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
  const schema = joi.object().keys({
    index: joi
      .number()
      .integer()
      .required(),
    timestamp: joi
      .number()
      .integer()
      .required(),
    transactions: joi.array().required(),
    nonce: joi
      .number()
      .integer()
      .required(),
    hash: joi
      .string()
      .length(64)
      .required(),
    previousBlockHash: joi.string().required(),
    merkleTreeRoot: joi.string().allow()
  });
  const validation = joi.validate(newBlock, schema);
  if (validation.error !== null) {
    console.log(validation.error);
    return res.json({ error: `invalid Input ${validation.error}` });
  }
  // console.log(newBlock);
  const lastBlock = currency.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock.index + 1 == newBlock.index;
  //console.log(lastBlock.hash + " -" + newBlock.previousBlockHash);
  //console.log(lastBlock.index + 1);
  //console.log(newBlock.index);
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
//Transaction Validation
app.post("/set-valid", (req, res) => {
  console.log("Hi There");
  const request = req.body.transaction;
  currency.pendingTransactions.forEach(transaction => {
    if (request.transactionHash == transaction.transactionHash) {
      const index = currency.pendingTransactions.indexOf(transaction);
      console.log(index);
      const newTransaction = currency.pendingTransactions[index];
      currency.pendingTransactions.splice(index, 1);
      currency.validatedTransactions.push(newTransaction);
      return res.json({message:"Successsfuly updated Transaction Array"})
    }
  });
});

app.post("/validate/transaction", (req, res) => {
  const {
    amount,
    sender,
    recipient,
    transactionHash,
    validatedTransactions
  } = req.body;
  // console.log(`amount added will be ${amount}`);
  // const index = currency.pendingTransactions.indexOf(req.body);
  const index = 1;
  let valid = true;
  if (index == -1) {
    valid = false;
    return res.json({ error: "The Transaction does not exist" });
  }
  //2- Checking Origin and Destination
  if (currency.publicAddress == sender) {
    valid = false;
    return res.json({ error: "You can not Validate Your Own Transaction" }); //Later to add the recipient as well
  }
  //3- Checking Balance of The Sender in Blockchain and Validated Transactions
  let balance = currency.getAddressdata(sender).balance;
  currency.validatedTransactions.forEach(transaction => {
    if (transaction.sender == sender) balance = balance - transaction.amount;
    if (transaction.recipient == sender) balance = balance + transaction.amount;
  });
  if (balance < amount) {
    valid = false;
    return res.json({
      error: `Insuffcient Funds, You have ${balance}, you want to send ${amount}`
    });
  }
  //4- Check Hash
  const hashTest = SHA256(sender + amount.toString() + recipient);
  if (hashTest != transactionHash) {
    valid = false;
    return res.json({ error: "The Transaction has been tampered with" });
  }

  //5- Return Valid Data, Updated Validated and Pending Transactions !!!! ASSUME ONLY 1 VALIDATION IS NEEDED
  if (valid) {
    console.log("Transaction Is supposed to be validated");
    currency.pendingTransactions.splice(index, 1); //Later To Broadcast the transaction
    console.log(currency.pendingTransactions);
    const requestPromises = [];
    currency.networkNodes.forEach(nodeUrl => {
      console.log(`Checking at node ${nodeUrl}`)
      const requestOptions = {
        uri: nodeUrl + "/set-valid",
        method: "POST",
        body: { transaction: req.body },
        json: true
      };
      requestPromises.push(rp(requestOptions));
    });
    console.log("VOILA")
    Promise.all(requestPromises)
      .then(data => {
        return res.json({ message: "The transaction has been validated" });
      })
      .catch(err => console.log(err));
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
        uri: currency.currentNodeUrl + "/award-miner",
        method: "POST",
        body: {
          amount: 12.5,
          sender: "00",
          recipient: currency.publicAddress
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

//Network Functions

//Add a node to the network an broadcast
app.post("/register-and-broadcast-node", (req, res) => {
  try {
    const data = req.body;
    const schema = joi.object().keys({
      newNodeUrl: joi.string().required()
    });
    const valid = joi.validate(data, schema);
    if (valid.error !== null) {
      console.log(valid.error);
      return res.json({ error: `Invalid Data ${valid.error}` });
    }

    //Validation is Fine
    const nodeUrl = req.body.newNodeUrl;
    var nodeAddress = "-1";
    //Check if it is not in the network
    if (currency.networkNodes.indexOf(nodeUrl) == -1) {
      //Add The Address and IP of the new node
      currency.networkNodes.push(nodeUrl);
      const requestOptions = {
        uri: nodeUrl + "/blockchain",
        method: "GET",
        json: true
      };
      rp(requestOptions)
        .then(response => {
          nodeAddress = response.publicAddress;
          if (nodeAddress == "-1") console.log("Bollocks");
          if (
            nodeAddress != "-1" &&
            currency.networkAddresses.indexOf(response.publicAddress) == -1 &&
            currency.publicAddress != nodeAddress
          ) {
            console.log(nodeAddress);
            currency.networkAddresses.push(response.publicAddress);
          } else {
            return res.json({ error: "Address Already Exists" });
          }
        })
        .then(cnt => {
          const regNodesPromises = []; //to make sure all requests send back replies
          currency.networkNodes.forEach(networkNodeUrl => {
            const requestOptions = {
              uri: networkNodeUrl + "/register-node",
              method: "POST",
              body: { newNodeUrl: nodeUrl, newNodeAddress: nodeAddress },
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
                  allNetworkNodes: [
                    ...currency.networkNodes,
                    currency.currentNodeUrl
                  ],
                  allNetworkAddresses: [
                    ...currency.networkAddresses,
                    currency.publicAddress
                  ]
                },
                json: true
              };
              return rp(bulkOptions);
            })
            .then(data => {
              res.json({
                message: "Node successfuly registred in the netowrk"
              });
            })
            .catch(err => console.log(err));
        });
    } else {
      return res.json({ error: "The Node Already Exists" });
    }

    //Broadcast new Node to all Nodes in the Network by calling register-node
  } catch (error) {
    console.log(error);
  }
});
//Register a Single Node
app.post("/register-node", (req, res) => {
  try {
    const data = req.body;
    const schema = joi.object().keys({
      newNodeUrl: joi.string().required(),
      newNodeAddress: joi.string().required()
    });
    const valid = joi.validate(data, schema);
    if (valid.error !== null) {
      console.log(valid.error);
      return res.json({ error: `Invalid Data ${valid.error}` });
    }
    //Valid from here
    const newNodeUrl = req.body.newNodeUrl;
    const newNodeAddress = req.body.newNodeAddress;

    if (newNodeAddress == -1) console.log("La2 ma a7a ba2a register-node");
    else console.log("Gamed Ya Box");
    //Make Sure that the nodes is not me and It is not already in my array
    const notAlreadyThere = currency.networkNodes.indexOf(newNodeUrl) == -1;
    const notMe = currency.currentNodeUrl != newNodeUrl;
    if (notAlreadyThere && notMe) {
      currency.networkNodes.push(newNodeUrl);
      currency.networkAddresses.push(newNodeAddress);
      res.json({ message: "We have registered the new node" });
    } else {
      res.json({ message: "Error Registering the Node" });
    }
  } catch (error) {
    console.log(error);
  }
});
//Register an Array of Nodes
app.post("/register-nodes-bulk", (req, res) => {
  try {
    const data = req.body;
    const schema = joi.object().keys({
      allNetworkNodes: joi.array().required(),
      allNetworkAddresses: joi.array().required()
    });
    const valid = joi.validate(data, schema);
    if (valid.error !== null) {
      console.log(valid.error);
      return res.json({ error: `Invalid Data ${valid.error}` });
    }
    //Valid from here
    const allNetworkNodes = req.body.allNetworkNodes;
    const allNetworkAddresses = req.body.allNetworkAddresses;

    if (allNetworkAddresses.indexOf("-1") != -1)
      console.log("La2 ma a7a ba2a register-BULK");
    else console.log("Gamed Ya Box");

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
    allNetworkAddresses.forEach(address => {
      if (
        currency.networkAddresses.indexOf(address) == -1 &&
        currency.publicAddress != address
      ) {
        if (address != null && address != undefined) {
          console.log(address);
          currency.networkAddresses.push(address);
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
    if (
      !longestChain ||
      (longestChain && !currency.chainIsValid(longestChain))
    ) {
      res.json({
        message: "Blockchain was not replaced",
        chain: currency.chain
      });
    } else if (longestChain && currency.chainIsValid(longestChain)) {
      currency.chain = longestChain;
      currency.pendingTransactions = newPendingTransactions;
      res.json({
        message: "Blockchain was replaced with a longer one",
        chain: currency.chain
      });
    }
  });
});

//Getters
app.get("/block/:blockhash", (req, res) => {
  const block = currency.getBlock(req.params.blockhash);
  res.json({ block: block });
});
app.get("/transaction/:transactionId", (req, res) => {
  const transaction = currency.getTransaction(req.params.transactionId);
  res.json({ transaction: transaction });
});
app.get("/address/:address", (req, res) => {
  const transactions = currency.getAddressdata(req.params.address);
  res.json({ result: transactions });
});
app.get("/block-explorer", function(req, res) {
  res.sendFile("./block-explorer/index.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
