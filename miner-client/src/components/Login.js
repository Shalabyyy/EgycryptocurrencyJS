import React, { Component } from "react";
import rp from "request-promise";
import M from "materialize-css";
import { Redirect } from "react-router-dom";
import logo from "../media/logo_transparent.png";

class Login extends Component {
  state = {
    privateAddress: "",
    passwordLogin: "",
    jwt: "",
    redirect: false,
    height: 0,
    width: 0,
    account: [],
    loading: false
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
   };
  handleChange = event => {
    console.log(event.target.value);
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
    if (this.state.loading) {
      document.getElementById("ld12").innerHTML = this.getLoadingHtml();
    } else {
      document.getElementById("ld12").innerHTML = "";
    }
  };
  login = event => {
    console.log("Starting Log In");
    this.setState({ loading: true });
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
            account: data.account[0],
            redirect: true,
            loading: false
          });
        } else {
          this.setState({ loading: false });
          var toastHTML = "<span>wrong address or password</span>";
          M.toast({ html: toastHTML });
        }
      })
      .catch(err => {
        this.setState({ loading: false });
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
            state: { jwt: this.state.jwt, account: this.state.account }
          }}
        />
      );
    return (
      <div class="container">
        <img src={logo} width="200px" height="200px"></img>

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
          <div id="ld12"></div>
        </div>
      </div>
    );
  }
}
export default Login;
