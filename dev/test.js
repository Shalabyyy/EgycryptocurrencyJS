const Blockchain = require("./blockchain");
const currency = new Blockchain();

const bc1 = {
  currentNodeUrl: "http://localhost:3003",
  networkNodes: [],
  chain: [
    {
      index: 1,
      timestamp: 1584455064103,
      transactions: [],
      nonce: 100,
      hash: 0,
      previousBlockHash: 0
    },
    {
      index: 2,
      timestamp: 1584455215693,
      transactions: [
        {
          amount: 20,
          sender: "Yahia",
          recipient: "Box",
          transactionHash:
            "eac3aed99c3289f8e92d10e87e1eadf84460a87bf04d11b16143ca41ec0a1b4b"
        },
        {
          amount: 200,
          sender: "Yahia",
          recipient: "Box",
          transactionHash:
            "7318cc39e01cb953f57508afb4fc105d13b248faf11008f61bfaafafd2de2c52"
        }
      ],
      nonce: 10660,
      hash: "0000090909729236bdebfaebc04ac8be33bed9a20e9869defe207dbed6eb21e3",
      previousBlockHash: 0
    },
    {
      index: 3,
      timestamp: 1584455322639,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "http://localhost:3003",
          transactionHash:
            "727fc8c77bdee42c707c7b3e08969a95f88c5fc355768063594d9fd229a2a699"
        },
        {
          amount: 120,
          sender: "OP",
          recipient: "TA",
          transactionHash:
            "89a86bce13431f8d96b4a5a953b687f3aa1bf372f0e25195288951cecb5145a6"
        },
        {
          amount: 1120,
          sender: "OP",
          recipient: "TA",
          transactionHash:
            "e2fb8b75ed88f15646ce460129255d1f859308bdedec69e3832326bd63733bc3"
        }
      ],
      nonce: 2897,
      hash: "000098aa47fe6cadd1c7e0dd42195a7774fbb4a534a8d86e180698ce66012783",
      previousBlockHash:
        "0000090909729236bdebfaebc04ac8be33bed9a20e9869defe207dbed6eb21e3"
    }
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: "00",
      recipient: "http://localhost:3003",
      transactionHash:
        "727fc8c77bdee42c707c7b3e08969a95f88c5fc355768063594d9fd229a2a699"
    }
  ]
};

console.log(currency.chainIsValid(bc1.chain));
