import React, { Component } from "react";
import rp from "request-promise";
import M from "materialize-css";
import { Redirect } from "react-router-dom";
import Loader from "./Loader";
import logo from "../media/logo_transparent.png";

class Welcome extends Component {
  state = {
    privateAddress: "",
    passwordLogin: "",
    passwordReg1: "",
    passwordReg2: "",
    account: {},
    jwt: "",
    redirect: false,
    registerComplete: false,
    height: 0,
    width: 0,
    loadingLogin: false,
    loadingRegister: false,
    lang: "AR",
    langState:true 
  };

  componentDidMount() {
    const { width, height } = this.getWindowDimension();
    this.setState({ height: height, width: width });
    console.log(width, height);
  }
  handleChange = (event) => {
    console.log(event.target.value);
    const { name, value } = event.target;
    this.setState({
      [name]: value,
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
  hasLowerCase = (str) => {
    return str.toUpperCase() !== str;
  };
  hasUpperCase = (str) => {
    return str.toLowerCase() !== str;
  };
  hasSpecialcase = (str) => {
    return str.match(/^[^a-zA-Z0-9]+$/) ? true : false;
  };
  login = (event) => {
    this.setState({ loadingLogin: true });
    //while(true);
    const requestOptions = {
      uri: "https://boxcoin-wallet.herokuapp.com/login",
      method: "POST",
      json: true,
      body: {
        privateAddress: this.state.privateAddress,
        password: this.state.passwordLogin,
      },
    };
    rp(requestOptions)
      .then((data) => {
        if (data.error === undefined) {
          console.log(data);
          this.setState({
            jwt: data.token,
            account: data.account[0],
            redirect: true,
          });
        } else {
          this.setState({ loadingLogin: false });
          var toastHTML = "<span>wrong address or password</span>";
          M.toast({ html: toastHTML });
        }
      })
      .catch((err) => {
        this.setState({ loadingLogin: false });
        var toastHTML = "<span>Something went wrong</span>";
        M.toast({ html: toastHTML });
      });
  };
  register = (event) => {
    this.setState({ loadingRegister: true });
    const id = "reg-pass-message";
    const pass1 = this.state.passwordReg1;
    const pass2 = this.state.passwordReg2;
    const error = [
      "Passwords do not match",
      "Password is less than 8 characters",
      "Password must have a lowercase, uppercase and special character",
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
      this.setState({ loadingRegister: false });
      return;
    } else if (pass1 !== pass2) {
      document.getElementById(id).style.color = "red";
      document.getElementById(id).innerText = error[0];
      this.setState({ loadingRegister: false });
      return;
    } else {
      document.getElementById(id).style.color = "green";
      document.getElementById(id).innerText = succ;
      let privateAddress = "";
      let publicAddress = "";
      const requestOptions = {
        uri: "https://boxcoin-wallet.herokuapp.com/register",
        method: "POST",
        json: true,
        body: {
          password: this.state.passwordReg1,
          passwordConfirmation: this.state.passwordReg2,
        },
      };
      rp(requestOptions)
        .then((data) => {
          console.log(data);
          privateAddress = data.data.account.privateAddress;
          publicAddress = data.data.account.publicAddress;
          this.setState({
            registerComplete: true,
            account: data.data.account,
            loadingRegister: false,
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({ loadingRegister: false });
        });
    }
  };
  toggleLanguage = () => {
    this.setState({langState:!this.state.langState})
    console.log(this.state.langState)
    if (this.state.lang === "AR") {
      this.setState({ lang: "EN" });
      console.log(this.state.lang);
    } else {
      this.setState({ lang: "AR" });
      console.log(this.state.lang);
    }

  };
  render() {
    if (this.state.redirect)
      return (
        <Redirect
          to={{
            pathname: "/dashboard",
            state: { jwt: this.state.jwt, account: this.state.account, lang:this.state.langState },
          }}
        />
      );
    if (this.state.registerComplete)
      return (
        <Redirect
          to={{
            pathname: "/welcome",
            state: { account: this.state.account },
          }}
        />
      );
   else if(this.state.langState){
     if (this.state.width < 450)
    return (
      <div>
        <div class="container">
          <img src={logo} width="200px" height="200px"></img>
          <h2>مرحبا بك في تطبيق المحفظة الكترونية</h2>
          <div class="switch">
          <label>
            ARABIC
            <input type="checkbox" onChange={this.toggleLanguage}  value={this.state.langState}/>
            <span class="lever"></span>
            ENGLISH
          </label>
        </div>
          <div class="row">
            <form class="col s12">
              <h6>تسجيل الدخول إلى حسابك</h6>
              <div></div>

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
                    <label for="icon_vu">رقم الحساب الخاص</label>
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
                    <label for="icon_pwd1">كلمه السر</label>
                  </div>
                </div>
                <div class="container">
                  {this.state.loadingLogin ? <Loader /> : <p></p>}
                </div>
                <div class="row">
                  <div class="input-field">
                    <a
                      class="btn waves-effect waves-light"
                      onClick={this.login}
                    >
                      تسجيل الدخول
                      <i class="material-icons right">send</i>
                    </a>
                  </div>
                </div>
              </div>

              <div class="row">
                <h4>أو</h4>
              </div>
              <div class="row">
                {" "}
                <p>
                  قم بإنشاء حساب جديد عن طريق إدخال كلمة مرور, سوف تتلقى
                  عنوانك الخاص لاحقًا
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
                  <label for="icon_pwd2">كلمه السر</label>
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
                  <label for="icon_pwd3">اعادة ادخال كلمة السر</label>
                </div>
              </div>
              <div class="row">
                {" "}
                <div class="input-field">
                  <a
                    class="btn waves-effect waves-light"
                    onClick={this.register}
                  >
                    تسجيل الدخول
                    <i class="material-icons right">send</i>
                  </a>
                  <h6 id="reg-pass-message" style={{ paddingTop: "10px" }}>
                    الرجاء إدخال كلمة المرور
                  </h6>
                  <div class="container">
                    {this.state.loadingRegister ? <Loader /> : <p></p>}
                  </div>
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
        <img src={logo} width="200px" height="200px"></img>
        <h2>مرحبا بك في تطبيق المحفظة الكترونية</h2>
        <div class="switch">
          <label>
            ARABIC
            <input type="checkbox" onChange={this.toggleLanguage}  value={this.state.langState}/>
            <span class="lever"></span>
            ENGLISH
          </label>
        </div>
        <div class="row">
          <form class="col s12">
            <div class="row">
              <h6>تسجيل الدخول إلى حسابك</h6>
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
                <label for="icon_vu">رقم الحساب الخاص</label>
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
                <label for="icon_pwd1">كلمه السر</label>
              </div>
              <div class="input-field col s4">
                <a class="btn waves-effect waves-light" onClick={this.login}>
                  تسجيل الدخول
                  <i class="material-icons right">send</i>
                </a>
              </div>
            </div>
            <div class="row">
              <div class="container">
                {this.state.loadingLogin ? <Loader /> : <p></p>}
              </div>
              <h4>OR</h4>
            </div>
            <div class="row">
              <h6>
                قم بإنشاء حساب جديد عن طريق إدخال كلمة مرور, سوف تتلقى عنوانك
                الخاص لاحقًا
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
                <label for="icon_pwd2">كلمه السر</label>
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
                <label for="icon_pwd3">اعادة ادخال كلمة السر</label>
              </div>
              <div class="input-field col s4">
                <a
                  class="btn waves-effect waves-light"
                  onClick={this.register}
                >
                  انشاء حساب جديد
                  <i class="material-icons right">send</i>
                </a>
                <h6 id="reg-pass-message" style={{ paddingTop: "10px" }}>
                الرجاء إدخال كلمة مرور جديدة
                </h6>
              </div>
            </div>
            <div class="container">
              {this.state.loadingRegister ? <Loader /> : <p></p>}
            </div>
          </form>
        </div>
      </div>
    );
   }
   else {         //English
     if (this.state.width < 450)
    return (
      <div>
        <div class="container">
          <img src={logo} width="200px" height="200px"></img>
          <h6>Welcome to Egycryptocurrency wallet</h6>
          <div class="switch">
          <label>
            ARABIC
            <input type="checkbox" onChange={this.toggleLanguage}  value={this.state.langState}/>
            <span class="lever"></span>
            ENGLISH
          </label>
        </div>
          <div class="row">
            <form class="col s12">
              <h6>Login into you wallet acccount</h6>
              <div></div>

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
                <div class="container">
                  {this.state.loadingLogin ? <Loader /> : <p></p>}
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
                  <div class="container">
                    {this.state.loadingRegister ? <Loader /> : <p></p>}
                  </div>
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
        <img src={logo} width="200px" height="200px"></img>
        <h2>Welcome to Egycryptocurrency wallet</h2>
        <div class="switch">
          <label>
            ARABIC
            <input type="checkbox" onChange={this.toggleLanguage}  value={this.state.langState}/>
            <span class="lever"></span>
            ENGLISH
          </label>
        </div>
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
              <div class="container">
                {this.state.loadingLogin ? <Loader /> : <p></p>}
              </div>
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
            <div class="container">
              {this.state.loadingRegister ? <Loader /> : <p></p>}
            </div>
          </form>
        </div>
      </div>
    );}

  }
}

export default Welcome;
