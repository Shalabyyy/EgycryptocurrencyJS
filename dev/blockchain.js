const SHA256 = require('sha256');
const currentNodeUrl = process.argv[3]
function Blockchain() {
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes =[];
  this.chain = [];
  this.pendingTransactions =[]; //Transaction Pool
  this.createNewBlock(100,0,0)
  
}
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash
  };
  this.pendingTransactions = []; //Clear Transactions
  this.chain.push(newBlock);

  return newBlock;
};
Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length-1]
}
Blockchain.prototype.createNewTransaction = function(sender,recipient, amount){
    const hash = SHA256(sender+amount.toString()+recipient)
    const newTransaction = {
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionHash:hash
    }
    return newTransaction
}
Blockchain.prototype.addTransactionToPendingTransactions = function(transaction){
    this.pendingTransactions.push(transaction)
    return this.chain.length
}
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData,nonce){
    const data = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = SHA256(data);
    return hash;
}
Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData){
    //for now assume only we want 4 leading Zeros
    var nonce = 0;
    var hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}
	return nonce;
}   
module.exports = Blockchain;
