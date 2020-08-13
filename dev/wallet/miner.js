const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 4000;


app.use(express.static("miner-client/build"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "miner-client", "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Miner running on port ${port}`);
});
