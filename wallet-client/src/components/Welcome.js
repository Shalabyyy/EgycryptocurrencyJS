import React, { Component } from "react";
import rp from "request-promise";
import "materialize-css";
import { Redirect } from "react-router-dom";

class Welcome extends Component {
  state = {
    privateAddress: "",
    passwordLogin: "",
    passwordReg1: "",
    passwordReg2: "",
    account: {},
    jwt: "",
    redirect: false,
    height: 0,
    width: 0
  };
  componentDidMount() {
    const { width, height } = this.getWindowDimension();
    this.setState({ height: height, width: width });
    console.log(width, height);
  }
  handleChange = event => {
    console.log(event.target.value);
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
    //console.log(this.state.username)
  };
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
  hasSpecialcase = str => {
    return str.match(/^[^a-zA-Z0-9]+$/) ? true : false;
  };
  login = event => {
    const requestOptions = {
      uri: "http://localhost:4000/login",
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
          this.setState({ jwt: data.token,account: data.account[0],redirect: true });
        } else {
          window.alert("WRONG PRIVATE ADDRESS OR PASSWORD");
        }
      })
      .catch(err => console.log(err));
  };
  register = event => {
    const id = "reg-pass-message";
    const pass1 = this.state.passwordReg1;
    const pass2 = this.state.passwordReg2;
    const error = [
      "Passwords do not match",
      "Password is less than 8 characters",
      "Password must have a lowercase, uppercase and special character"
    ];
    const succ = "Passwords Match";
    const cases =
      this.hasLowerCase(pass1) &&
      this.hasUpperCase(pass1) &&
      this.hasSpecialcase(pass1);
    console.log(pass1, cases);
    if (pass1.length <= 7) {
      document.getElementById(id).style.color = "red";
      document.getElementById(id).innerText = error[1];
      return;
    } else if (pass1 !== pass2) {
      document.getElementById(id).style.color = "red";
      document.getElementById(id).innerText = error[0];
      return;
    } else {
      document.getElementById(id).style.color = "green";
      document.getElementById(id).innerText = succ;
      let privateAddress = "";
      let publicAddress = "";
      const requestOptions = {
        uri: "http://localhost:4000/register",
        method: "POST",
        json: true,
        body: {
          password: this.state.passwordReg1,
          passwordConfirmation: this.state.passwordReg2
        }
      };
      rp(requestOptions)
        .then(data => {
          console.log(data);
          privateAddress = data.data.account.privateAddress;
          publicAddress = data.data.account.publicAddress;
          window.alert(data.data.message + "\n \n" + privateAddress);
        })
        .catch(err => console.log(err));
    }
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
    else if (this.state.width < 450)
      return (
        <div>
          <div class="container">
            <h6>Welcome to Egycryptocurrency wallet</h6>
            <div class="row">
              <form class="col s12">
                <h6>Login into you wallet acccount</h6>
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
                      <a
                        class="btn waves-effect waves-light"
                        onClick={this.login}
                      >
                        Sign In
                        <i class="material-icons right">send</i>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <h4>OR</h4>
                </div>
                <div class="row">
                  {" "}
                  <p>
                    Create a new Account by entering yout password, You will
                    recive your private address later
                  </p>
                </div>
                <div class="row">
                  <div class="input-field">
                    <i class="material-icons prefix">lock</i>
                    <input
                      id="icon_pwd2"
                      type="password"
                      class="validate"
                      name="passwordReg1"
                      value={this.state.passwordReg1}
                      onChange={this.handleChange}
                    />
                    <label for="icon_pwd2">Password</label>
                  </div>
                </div>
                <div class="row">
                  {" "}
                  <div class="input-field">
                    <i class="material-icons prefix">lock</i>
                    <input
                      id="icon_pwd3"
                      type="password"
                      class="validate"
                      name="passwordReg2"
                      value={this.state.passwordReg2}
                      onChange={this.handleChange}
                    />
                    <label for="icon_pwd3">Re-Enter Password</label>
                  </div>
                </div>
                <div class="row">
                  {" "}
                  <div class="input-field">
                    <a
                      class="btn waves-effect waves-light"
                      onClick={this.register}
                    >
                      Register
                      <i class="material-icons right">send</i>
                    </a>
                    <h6 id="reg-pass-message" style={{ paddingTop: "10px" }}>
                      Please enter you password
                    </h6>
                  </div>
                </div>
              </form>
            </div>
          </div>  
        </div>
      );
    else
      return (
        <div class="container">
          <h2>Welcome to Egycryptocurrency wallet</h2>
          <div class="row">
            <form class="col s12">
              <div class="row">
                <h6>Login into you wallet acccount</h6>
                <div class="input-field col s4">
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
                <div class="input-field col s4">
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
                <div class="input-field col s4">
                  <a class="btn waves-effect waves-light" onClick={this.login}>
                    Sign In
                    <i class="material-icons right">send</i>
                  </a>
                </div>
              </div>
              <div class="row">
                <h4>OR</h4>
              </div>
              <div class="row">
                <h6>
                  Create a new Account by entering yout password, You will
                  recive your private address later
                </h6>
                <div class="input-field col s4">
                  <i class="material-icons prefix">lock</i>
                  <input
                    id="icon_pwd2"
                    type="password"
                    class="validate"
                    name="passwordReg1"
                    value={this.state.passwordReg1}
                    onChange={this.handleChange}
                  />
                  <label for="icon_pwd2">Password</label>
                </div>
                <div class="input-field col s4">
                  <i class="material-icons prefix">lock</i>
                  <input
                    id="icon_pwd3"
                    type="password"
                    class="validate"
                    name="passwordReg2"
                    value={this.state.passwordReg2}
                    onChange={this.handleChange}
                  />
                  <label for="icon_pwd3">Re-Enter Password</label>
                </div>
                <div class="input-field col s4">
                  <a
                    class="btn waves-effect waves-light"
                    onClick={this.register}
                  >
                    Register
                    <i class="material-icons right">send</i>
                  </a>
                  <h6 id="reg-pass-message" style={{ paddingTop: "10px" }}>
                    Please enter you password
                  </h6>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
  }
}

export default Welcome;
