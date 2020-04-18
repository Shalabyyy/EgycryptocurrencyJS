import React, { Component } from "react";
import rp from "request-promise";
import { Redirect } from "react-router-dom";
import M from "materialize-css";
class Transfer extends Component {
  state = {
    account: {},
    jwt: "",
    balance: 0.0,
    recipient: "",
    amount: 0,
    height: 0,
    width: 0,
    refresh:false
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
      uri: "https://boxcoin-wallet.herokuapp.com/get-balance",
      method: "GET",
      json: true,
      headers: {
        "x-access-token": this.props.location.state.jwt
      }
    };
    rp(requestOptions)
      .then(data => {
        console.log(data.message.result);
        this.setState({ balance: data.message.result.balance });
        if (data.message.result.transactions.length > 0) {
          data.message.result.transactions.forEach(transaction => {
            const amount = transaction.amount;
            var sender = transaction.sender;
            var recipient = transaction.recipient;
            var style = "";
            const myAddress = this.props.location.state.account.publicAddress;
            if (myAddress === sender) {
              sender = "ME";
              style = "#ff9999";
            }
            if (myAddress === recipient) {
              recipient = "ME";
              style = "#ccffcc";
            }

            var tableData = document.getElementById("table-body").innerHTML;
            document.getElementById("table-body").innerHTML =
               tableData +
              `<tr style="background-color:${style}">
          <td>${sender}</td>
          <td>${recipient}</td>
          <td>${amount} BOX</td>
        </tr>`;
          });
        } else {
          var tableData = document.getElementById("table-body").innerHTML;
          document.getElementById("table-body").innerHTML =
            "<tr> <td colspan='3'>No Transactions Were Made</td></tr>";
        }
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
  clearTransfer = () => {
    this.setState({ recipient: "", amount: 0 });
  };
  transfer = event => {
    if (this.state.amount <= 0 || this.state.recipient.length !== 64) {
      var toastHTML = "<span>Please Enter Corret Data</span>";
      M.toast({ html: toastHTML });
      this.clearTransfer();
      // window.alert("Please Enter Corret Data");
      return;
    }

    const requestOptions = {
      uri: "https://boxcoin-wallet.herokuapp.com/send-funds",
      method: "POST",
      json: true,
      headers: {
        "x-access-token": this.props.location.state.jwt
      },
      body: { amount: Number(this.state.amount), recipient: this.state.recipient }
    };
    if (this.state.amount > this.state.balance) {
      //window.alert("Insuffcient funds");
      var toastHTML = "<span>Insuffcient funds</span>";
      M.toast({ html: toastHTML });
      this.clearTransfer();
      return;
    } else {
      rp(requestOptions)
        .then(data => {
          //window.alert("Your Transaction will be proccessed shortly");
          var toastHTML =
            "<span>Your Transaction will be proccessed shortly</span>";
          M.toast({ html: toastHTML });
          this.clearTransfer();
          window.location.reload()
        })
        .catch(err => {
          var toastHTML = "<span>Transaction Failed</span>";
          M.toast({ html: toastHTML });
          this.clearTransfer();
        });
    }
  };
  render() {
    if (this.props.location.state.jwt != "")
      if (this.state.width < 450)
        return (
          <div>
            <div className="container">
              <p>Welcome {this.props.location.state.account.publicAddress}</p>
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
                  <a
                    class="btn waves-effect waves-light"
                    onClick={this.transfer}
                  >
                    Transfer
                    <i class="material-icons right">send</i>
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h6>Transaction History</h6>

              <table class="highlight responsive-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Recipient</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody id="table-body"></tbody>
              </table>
            </div>
          </div>
        );
      else
        return (
          <div className="container">
            <h6>Welcome</h6>
            <p style={{ fontSize: "10px" }}>
              {" "}
              {this.props.location.state.account.publicAddress}
            </p>
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
            <div>
              <h6>Transaction History</h6>

              <table class="highlight responsive-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Recipient</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody id="table-body"></tbody>
              </table>
            </div>
          </div>
        );
    else return <Redirect to="/" />;
  }
}

export default Transfer;
