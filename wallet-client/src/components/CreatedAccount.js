import React, { Component } from "react";
import rp from "request-promise";
import { Redirect } from "react-router-dom";

class CreatedAccount extends Component {
  state = {
    account: {},
    goback: false
  };
  componentDidMount() {
    this.setState({ account: this.props.location.state.account });
  }
  done=()=>{
      this.setState({goback:true})
  }
  render() {
    if (this.state.goback) {
      return (
        <Redirect
          to={{
            pathname: "/"
          }}
        />
      );
    } else
      return (
        <div>
          <h6>You're Account Has been Created!</h6>
          <h6 style={{ color: "red" }}>
            THE PRIVATE ADDRESS IS PROVIDED IS YOUR OWN RESPONSBILITY, IF YOU
            LOSE IT YOU LOSE YOU ACCOUNT.
          </h6>
          <h6 style={{ color: "red", fontWeight: "700" }}>
            PLEASE STORE YOUT ADDRESS SOMEWHERE SAFE
          </h6>

          <p style={{ fontSize: "10px" }}>
            Your Private Address is {this.state.account.privateAddress}
          </p>

          <h6 style={{ color: "red" }}>
            THE PUBLIC ADDRESS PROVIDED BELOW IS HOW YOU ARE GOING TO BE
            REPRESENTED TO THE NETWORK
          </h6>

          <p style={{ fontSize: "10px" }}>
            Your public Address is {this.state.account.publicAddress}
          </p>
          <br></br>
          <h6>
            After Saving Your Addresses,{" "}
            <a onClick={this.done}>click here</a> to login
          </h6>
        </div>
      );
  }
}

export default CreatedAccount;
