import React from 'react';
import logo from './logo.svg';
import './App.css';
import M from 'materialize-css'
import login from './components/Login'
import status from './components/Status'
import { Route, BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <div className="App">
     <body>
        <Router>
          <Route exact path="/" component={login}></Route>
          <Route  path="/dashboard" component={status}></Route>
        </Router>
      </body>

    </div>
  );
}

export default App;
