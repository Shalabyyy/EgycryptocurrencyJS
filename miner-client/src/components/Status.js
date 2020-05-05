import React, { Component } from "react";
import rp from "request-promise";
import M from "materialize-css";
import logo from "../media/logo_transparent.png"
import { Redirect } from "react-router-dom";

class Status extends Component {
  state = {
    jwt: "",
    url1: "",
    status1: "Offline",
    url2: ""
  };
  getLoadingHtml =()=>{
   return ` <div class="preloader-wrapper big active">
   <div class="spinner-layer spinner-blue-only">
     <div class="circle-clipper left">
       <div class="circle"></div>
     </div><div class="gap-patch">
       <div class="circle"></div>
     </div><div class="circle-clipper right">
       <div class="circle"></div>
     </div>
   </div>
 </div>`
  }
  componentDidMount() {
    const requestOptions = {
      uri: "https://boxcoin-wallet.herokuapp.com/get-node-link",
      method: "GET",
      json: true,
      headers: {
        "x-access-token": this.props.location.state.jwt
      }
    };
    rp(requestOptions)
      .then(data => {
       // console.log(data.nodeUrl[0].nodeUrl);
        this.setState({ url1: data.nodeUrl[0].nodeUrl });
        console.log(this.state.url1)
        document.getElementById("mzrxx22").innerHTML = ""
        this.setState({status1:"Saved"})
      })
      .catch(err => console.log(err));
  }
  addNode = () => {
    console.log("hello Node");
    this.setState({ status1: "This Might take a while" });
    const requestOptions = {
      uri: this.state.url1,
      method: "GET",
      json: true
    };
    rp(requestOptions)
      .then(data => {
        console.log(data);
        if (data.hello === "Welome to Egycryptocurrency") {
          this.setState({ status1: "Initalizing.." });
          const nodeNumber = (
            Math.floor(Math.random() * Math.floor(4)) + 1
          ).toString();
          const request2Options = {
            uri: `https://egycryptocurrency-node-${nodeNumber}.herokuapp.com/register-and-broadcast-node`,
            method: "POST",
            body: {
              newNodeUrl: this.state.url1
            },
            json: true
          };
          rp(request2Options)
            .then(data => {
              this.setState({ status1: "Secure" });
              const request3Options = {
                uri: "https://boxcoin-wallet.herokuapp.com/fix-link",
                method: "PATCH",
                json: true,
                headers: {
                  "x-access-token": this.props.location.state.jwt
                },
                body: { newNodeUrl: this.state.url1 }
              };
              rp(request3Options)
                .then(data => {
                  this.setState({ status1: "Online" });
                  console.log(data);
                })
                .catch(err => {
                  console.log(err);
                  this.setState({ status1: "Registeration Error" });
                });
            })
            .catch(err => {
              console.log(err);
              this.setState({ status1: "Network Error" });
            });
        } else {
          this.setState({ status1: "Error" });
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ status1: "Url Error" });
      });
  };
  handleChange = event => {
    console.log(event.target.value);
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
    //console.log(this.state.username)
  };

  render() {
    return (
      <div class="container">
        <img src={logo} width="200px" height="200px"></img>
        <h6>
          To ensure that the network remains active, we encourage miners to use
          cloud based computaional power
        </h6>
        <h6>Each User is allowed One Cloud Based Nodes</h6>
        <div>
          <div class="input-field">
            <i class="material-icons prefix">cloud</i>
            <input
              id="icon_prefix55"
              type="text"
              class="validate"
              name="url1"
              value={this.state.url1}
              onChange={this.handleChange}
            />
            <label for="icon_prefix55" id="mzrxx22">URl as (http://website.com)</label>
          </div>
          <div class="row">
            <div class="col s2">
              <a class="btn waves-effect waves-light" onClick={this.addNode}>
                Activate
                <i class="material-icons right">cloud_upload</i>
              </a>
            </div>
            <div class="col s2">
              <h6>Status:{this.state.status1}</h6>
            </div>
          </div>{" "}
        </div>
      </div>
    );
  }
}

export default Status;
