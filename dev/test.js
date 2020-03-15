const Blockchain = require("./blockchain");
const currency = new Blockchain();

const previousBlockHash = "DDWWEERRTT";
const currentBlockData = [
  {
    sender: "QWERTYUIOP",
    recipient: "ASDFGHJK",
    amount: 10
  },
  {
    sender: "QWERTYGYHTRWSUIOP",
    recipient: "PLMNJIU",
    amount: 20
  },
  {
    sender: "POIUYTREWQ",
    recipient: "LKJHGFDSA",
    amount: 5
  }
];
console.log(currency.proofOfWork(previousBlockHash,currentBlockData));


console.log(currency);
