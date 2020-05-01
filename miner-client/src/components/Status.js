import React, { Component } from "react";
import rp from "request-promise";
import M from "materialize-css";
import { Redirect } from "react-router-dom";

class Status extends Component {
  state = {
    jwt: "",
    url1: "",
    status1: "Offline",
    url2: ""
  };

  addNode = () => {
    console.log("hello Node");
    this.setState({ status1: "Loading.." });
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
              newNodeUrl: this.state.url1,
            },
            json: true
          };
          rp(request2Options)
          .then(data=>{
            this.setState({status1:"Online"})
          })
          .catch(err=>{
            console.log(err)
            this.setState({status1:"Network Error"})
          })
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
        <h5>
          To ensure that the network remains active, we encourage miners to use
          cloud based computaional power
        </h5>
        <h6>Each User is allowed up to 2 Cloud Based Nodes</h6>
        <div>
          <div class="input-field">
            <i class="material-icons prefix">cloud</i>
            <input
              id="icon_prefix55"
              type="text"
              class="validate"
              name="url1"
              onChange={this.handleChange}
            />
            <label for="icon_prefix55">First URl as (http://website.com)</label>
          </div>
          <div class="row">
            <div class="col s6">
              <a class="btn waves-effect waves-light" onClick={this.addNode}>
                Activate
                <i class="material-icons right">cloud_upload</i>
              </a>
            </div>
            <div class="col s2">
              <p>Status:{this.state.status1}</p>
            </div>
          </div>{" "}
        </div>
      </div>
    );
  }
}

export default Status;
