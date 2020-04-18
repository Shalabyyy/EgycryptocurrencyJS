const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const rp = require("request-promise");
const port = process.env.PORT || 4001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function KeepAlive() {
  /*const urls = [
    "https://egycryptocurrency-node-1.herokuapp.com",
    "https://egycryptocurrency-node-2.herokuapp.com",
    "https://egycryptocurrency-node-3.herokuapp.com",
    "https://egycryptocurrency-node-4.herokuapp.com"
  ];*/
  const urls = [
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004"
  ];
  const requestPromises = [];
  try {
    for( var i=1; i<urls.length;i++){
        console.log(`${urls[i-1]} register ${urls[i]}`)
        const requestOptions = {
            uri: urls[0]+"/register-and-broadcast-node",
            method:"POST",
            json:true, 
            body:{newNodeUrl:urls[i]}
        }
        requestPromises.push(rp(requestOptions))
        console.log("Pushed")
    }
    Promise.all(requestPromises)
    .then(data=>console.log(data))
    .catch(err=>console.log("Internal Error: "+err))
  } catch (error) {
      console.log(`extrernal error: ${error}`)
  }
  
} 
function validate() {
  /*const urls = [
    "https://egycryptocurrency-node-1.herokuapp.com",
    "https://egycryptocurrency-node-2.herokuapp.com",
    "https://egycryptocurrency-node-3.herokuapp.com",
    "https://egycryptocurrency-node-4.herokuapp.com"
  ];*/
  const urls = [
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004"
  ];
  const requestPromises = [];
  try {
    for( var i=0; i<urls.length;i++){
        console.log(`${urls[i-1]} register ${urls[i]}`)
        const requestOptions = {
            uri: urls[i]+"/validate/transaction",
            method:"POST",
            json:true,
        }
        requestPromises.push(rp(requestOptions))
        console.log("Pushed")
    }
    Promise.all(requestPromises)
    .then(data=>console.log(data))
    .catch(err=>console.log("Internal Error: "+err))
  } catch (error) {
      console.log(`extrernal error: ${error}`)
  }
  
} 

setInterval(KeepAlive,5*60*1000)
setInterval(validate,2*60*1000)

app.get('/',(req,res)=>{
    const requestOptions = {
        uri:"https://egycryptocurrency-node-1.herokuapp.com/blockchain",
        method:"GET",
        json:true
    }
    rp(requestOptions)
    .then(data=>{
        res.json({data:data})
    })
})
//setInterval(KeepAlive,30000)
app.listen(port, () => {
  console.log(`Handler running on port ${port}`); 
});
