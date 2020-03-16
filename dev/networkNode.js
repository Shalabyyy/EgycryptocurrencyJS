const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const BlockChain = require("./blockchain");
const currency = new BlockChain();

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
  //execure proof of work
  const nonce = currency.proofOfWork(previousBlockhash, currentBlockData);
  const hash = currency.hashBlock(previousBlockhash, currentBlockData, nonce);
  const newBlock = currency.createNewBlock(nonce, previousBlockhash, hash);

  //Reward Miner
  currency.createNewTransaction(12.5, "00", "Add Miner Public Address Here");
  return res.json({ message: "New Blocked Mined", block: newBlock });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
