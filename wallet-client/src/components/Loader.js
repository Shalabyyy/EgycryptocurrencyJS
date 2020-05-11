import React, { Component } from "react";
import "materialize-css";

class Loader extends Component {
  render() {
    return (
      <div>
         <div class="progress">
      <div class="indeterminate"></div>
  </div>
      </div>
    );
  }
}

export default Loader;
