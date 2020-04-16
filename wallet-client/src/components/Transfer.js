import React, { Component } from "react";
import rp from "request-promise";
import { Redirect } from "react-router-dom";
class Transfer extends Component {
  state = {
    account: {},
    jwt: "",
    balance: 0.0,
    recipient: "",
    amount: "",
    height: 0,
    width: 0
  };
  componentDidMount() {
    const { width, height } = this.getWindowDimension();
    this.setState({
      account: this.props.location.state.account,
      jwt: this.props.location.state.jwt,
      height: height,
      width: width
    });
    console.log(this.props.location.state);
    const requestOptions = {
      uri: "http://localhost:4000/get-balance",
      method: "GET",
      json: true,
      headers: {
        "x-access-token": this.props.location.state.jwt
      }
    };
    rp(requestOptions)
      .then(data => {
        console.log(data.message.result.balance);
        this.setState({ balance: data.message.result.balance });
      })
      .catch(error => console.log(error));
  }
  getWindowDimension = () => {
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    return { width, height };
  };
  hasLowerCase = str => {
    return str.toUpperCase() !== str;
  };
  hasUpperCase = str => {
    return str.toLowerCase() !== str;
  };
  handleChange = event => {
    console.log(event.target.value);
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
    //console.log(this.state.username)
  };
  transfer = event => {
    if(this.state.amount<=0 || this.state.recipient.length !==64){
      window.alert("Please Enter Corret Data")
      return 
    }
    
    const requestOptions = {
      uri: "http://localhost:4000/send-funds",
      method: "POST",
      json: true,
      headers: {
        "x-access-token": this.props.location.state.jwt
      },
      body: { amount: this.state.amount, recipient: this.state.recipient }
    };
    if (this.state.amount > this.state.balance) {
      window.alert("Insuffcient funds");
      return;
    } else {
      rp(requestOptions)
        .then(data => {
          window.alert("Your Transaction will be proccessed shortly");
        })
        .catch(err => window.alert("Transaction Failed"));
    }
  };
  render() {
    if (this.props.location.state.jwt != "")
      if (this.state.width < 450) return (<div>
        <div className="container">
          <p>Welcome {this.props.location.state.account.privateAddress}</p>
          <h6>Your Balance is: {this.state.balance} BOX</h6>
          <br></br>
          <div class="row">
            <h6>Transfer crypto to anyone in the network</h6>
            <div class="input-field">
              <i class="material-icons prefix">verified_user</i>
              <input
                id="icon_vu1"
                type="text"
                class="validate"
                name="recipient"
                value={this.state.recipient}
                onChange={this.handleChange}
              />
              <label for="icon_vu1">recipient</label>
            </div>
            <div class="input-field">
              <i class="material-icons prefix">lock</i>
              <input
                id="icon_pwd5"
                type="number"
                class="validate"
                name="amount"
                value={this.state.amount}
                onChange={this.handleChange}
              />
              <label for="icon_pwd5">Amount</label>
            </div>
            <div class="input-field">
              <a class="btn waves-effect waves-light" onClick={this.transfer}>
                Transfer
                <i class="material-icons right">send</i>
              </a>
            </div>
          </div>
        </div>
      </div>);
      else
        return (
          <div className="container">
            <h2>Welcome {this.props.location.state.account.privateAddress}</h2>
            <h3>Your Balance is: {this.state.balance} BOX</h3>
            <div class="row">
              <h6>Transfer crypto to anyone in the network</h6>
              <div class="input-field col s4">
                <i class="material-icons prefix">verified_user</i>
                <input
                  id="icon_vu1"
                  type="text"
                  class="validate"
                  name="recipient"
                  value={this.state.recipient}
                  onChange={this.handleChange}
                />
                <label for="icon_vu1">recipient</label>
              </div>
              <div class="input-field col s4">
                <i class="material-icons prefix">lock</i>
                <input
                  id="icon_pwd5"
                  type="number"
                  class="validate"
                  name="amount"
                  value={this.state.amount}
                  onChange={this.handleChange}
                />
                <label for="icon_pwd5">Amount</label>
              </div>
              <div class="input-field col s4">
                <a class="btn waves-effect waves-light" onClick={this.transfer}>
                  Transfer
                  <i class="material-icons right">send</i>
                </a>
              </div>
            </div>
          </div>
        );
    else return <Redirect to="/" />;
  }
}

export default Transfer;
