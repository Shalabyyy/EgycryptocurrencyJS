import React, { Component } from "react";
import rp from "request-promise";
import M from "materialize-css";
import { Redirect } from "react-router-dom";

class Login extends Component {
  state = {
    privateAddress: "",
    passwordLogin: "",
    jwt: "",
    redirect: false,
    height: 0,
    width: 0
  };
  handleChange = event => {
    console.log(event.target.value);
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
    //console.log(this.state.username)
  };
  login = event => {
      console.log("Starting Log In")
    const requestOptions = {
      uri: "https://boxcoin-wallet.herokuapp.com/login",
      method: "POST",
      json: true,
      body: {
        privateAddress: this.state.privateAddress,
        password: this.state.passwordLogin
      }
    };
    rp(requestOptions)
      .then(data => {
        if (data.error === undefined) {
          console.log(data);
          this.setState({
            jwt: data.token,
            redirect: true
          });
        } else {
          var toastHTML = "<span>wrong address or password</span>";
          M.toast({ html: toastHTML });
        }
      })
      .catch(err => {
        var toastHTML = "<span>Something went wrong</span>";
        M.toast({ html: toastHTML });
      });
  };
  render() {
    if (this.state.redirect)
      return (
        <Redirect
          to={{
            pathname: "/dashboard",
            state: { jwt: this.state.jwt}
          }}
        />
      );
    return (
      <div class="container">
          <h4>Welcome to BoxCoin Miner App</h4>
        <div id="Row1">
          <div class="row">
            <div class="input-field">
              <i class="material-icons prefix">verified_user</i>
              <input
                id="icon_vu"
                type="text"
                class="validate"
                name="privateAddress"
                value={this.state.privateAddress}
                onChange={this.handleChange}
              />
              <label for="icon_vu">Private Address</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field">
              <i class="material-icons prefix">lock</i>
              <input
                id="icon_pwd1"
                type="password"
                class="validate"
                name="passwordLogin"
                value={this.state.passwordLogin}
                onChange={this.handleChange}
              />
              <label for="icon_pwd1">Password</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field">
              <a class="btn waves-effect waves-light" onClick={this.login}>
                Sign In
                <i class="material-icons right">send</i>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Login;
