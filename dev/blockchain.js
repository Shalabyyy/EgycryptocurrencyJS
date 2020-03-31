const SHA256 = require("sha256");
const crypto = require("crypto");
const buffer = require("buffer");
const merkle = require("merkle");
const currentNodeUrl = getUrl();

function getUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://egycryptocurrency-node-3.herokuapp.com";
  } else {
    return process.argv[3];
  }
}
function Blockchain() {
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.chain = [];
  this.pendingTransactions = []; //Transaction Pool
  this.validatedTransactions = [];
  this.publicKey = null;
  this.privateKey = null;
  this.publicAddress = SHA256(SHA256(this.currentNodeUrl));
  this.networkAddresses = [];
  this.balance = 0.0;
  //Execute Functions
  this.createNewBlock(100, "0", "0");
  this.generateKeys();
}
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  const merkleTreeRoot = this.getMerkleRoot(this.validatedTransactions);
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.validatedTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash,
    merkleTreeRoot: merkleTreeRoot
  };
  this.validatedTransactions = []; //Clear Transactions
  this.chain.push(newBlock);

  return newBlock;
};
Blockchain.prototype.getLastBlock = function() {
  return this.chain[this.chain.length - 1];
};
Blockchain.prototype.createNewTransaction = function(
  sender,
  recipient,
  amount
) {
  let validationsNeeded = 0;
  if (sender != "00") {
    validationsNeeded = 1;
  } else if (
    amount > this.getAddressdata(this.publicAddress).balance &&
    sender != "00"
  ) {
    console.log("insuffcient funds");
    return null;
  }
  const hash = SHA256(sender + amount.toString() + recipient);
  const newTransaction = {
    amount: amount,
    sender: sender,
    recipient: recipient,
    transactionHash: hash,
    validationsNeeded: validationsNeeded
  };
  return newTransaction;
};
Blockchain.prototype.addTransactionToPendingTransactions = function(
  transaction
) {
  this.pendingTransactions.push(transaction);
  return this.chain.length;
};
Blockchain.prototype.addTransactionToValidTransactions = function(transaction) {
  this.validatedTransactions.push(transaction);
};
Blockchain.prototype.hashBlock = function(
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const data =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = SHA256(data);
  return hash;
};
Blockchain.prototype.proofOfWork = function(
  previousBlockHash,
  currentBlockData
) {
  //for now assume only we want 4 leading Zeros
  var nonce = 0;
  var hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};
Blockchain.prototype.chainIsValid = function(blockchain) {
  let validChain = true;
  for (var i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];
    const currentBlockData = {
      transactions: currentBlock.transactions,
      index: currentBlock.index
    };
    const blockHash = this.hashBlock(
      currentBlock.previousBlockHash,
      currentBlockData,
      currentBlock.nonce
    );
    if (blockHash.substring(0, 4) !== "0000") {
      console.log(currentBlock);
      console.log(
        `Invalid Block Hash Expected: ${currentBlock.hash}, Recieived: ${blockHash}`
      );
      validChain = false;
    }
    if (currentBlock.previousBlockHash !== previousBlock.hash) {
      console.log("Invalid Previous BlockHash");
      validChain = false;
    }
    if (
      currentBlock.merkleTreeRoot !=
      this.getMerkleRoot(currentBlock.transactions)
    ) {
      console.log("Invalid Merkle Root");
      validChain = false;
    }
  }
  const genisisBlock = blockchain[0];
  if (
    genisisBlock.index !== 1 ||
    genisisBlock.nonce !== 100 ||
    genisisBlock.hash != "0" ||
    genisisBlock.previousBlockHash != "0" ||
    genisisBlock.transactions.length !== 0
  ) {
    validChain = false;
  }
  return validChain;
};
Blockchain.prototype.getBlock = function(blockHash) {
  let resultBlock = null;
  this.chain.forEach(block => {
    if (block.hash == blockHash) resultBlock = block;
  });
  return resultBlock;
};
Blockchain.prototype.getTransaction = function(transactionId) {
  let resultTransaction = null;
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.transactionHash == transactionId)
        resultTransaction = transaction;
    });
  });
  return resultTransaction;
};
Blockchain.prototype.getAddressdata = function(address) {
  let transactionsMadeByAddress = [];
  let balance = 0;
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.sender == address) {
        balance = balance - transaction.amount;
        transactionsMadeByAddress.push(transaction);
      }

      if (transaction.recipient == address) {
        balance = balance + transaction.amount;
        transactionsMadeByAddress.push(transaction);
      }
    });
  });
  this.validatedTransactions.forEach(transaction => {
    if (transaction.sender == this.publicAddress)
      balance = balance - transaction.amount;
    if (transaction.recipient == this.publicAddress)
      balance = balance + transaction.amount;
  });
  const queryData = {
    transactions: transactionsMadeByAddress,
    balance: balance
  };
  this.balance = queryData.balance;
  return queryData;
};
Blockchain.prototype.validateTransaction = function(transaction) {
  const { amount, sender, recipient, transactionHash } = transaction;
  if (
    amount != undefined &&
    sender != undefined &&
    recipient != undefined &&
    transactionHash != undefined
  ) {
    console.log("Undefined Transaction");
    return false;
  }
  if (sender === this.publicAdress) {
    console.log("You can't validate your own transaction");
    return false;
  }
  const senderNode = null;
  const recipientNode = null;
  this.networkNodes.forEach(node => {});
};
Blockchain.prototype.generateKeys = function() {
  crypto.generateKeyPair(
    "rsa",
    {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: "top secret"
      }
    },
    (err, publicKey, privateKey) => {
      this.publicKey = publicKey;
      this.privateKey = privateKey;
      //console.log(this.publicKey)
    }
  );
};
Blockchain.prototype.testEncryption = function(data) {
  const bufferedData = new Buffer(data);
  console.log(this.privateKey);
  const step1 = crypto.privateEncrypt(this.privateKey, bufferedData);
  console.log(step1);
  console.log("Encrypted with private key box");
  console.log();
  const step2 = crypto.publicDecrypt(this.publicKey, step1);
  console.log(step2);
  console.log("Decryption complete");
};
Blockchain.prototype.getMerkleRoot = function(transactions) {
  if (transactions.length == 0) {
    console.log("No Transactions");
    return;
  }
  var use_uppercase = false;
  merkle("sha256", use_uppercase).async(transactions, function(err, tree) {
    console.log(`Computer Tree Root ${tree.root()}`);
    return tree.root();
  });
};
Blockchain.prototype.flushBlockChain = function() {
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.chain = [];
  this.pendingTransactions = []; //Transaction Pool
  this.validatedTransactions = [];
  this.publicKey = null;
  this.privateKey = null;
  this.publicAddress = SHA256(SHA256(this.currentNodeUrl));
  this.networkAddresses = [];
  this.balance = 0.0;
  //Execute Functions
  this.createNewBlock(100, "0", "0");
  this.generateKeys();
};
module.exports = Blockchain;
