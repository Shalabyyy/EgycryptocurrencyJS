import React from 'react';
import Welcome from "./components/Welcome"  
import Transfer from "./components/Transfer"
import CreatedAccount from './components/CreatedAccount'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './App.css';

function App() {
  //add exact rto homepage
  return (
    <div className="App">
      <body>
        <Router>
          <Route  exact path="/" component={Welcome}></Route> 
          <Route  path="/dashboard" component={Transfer}></Route>
          <Route  path="/welcome" component={CreatedAccount}></Route>
        </Router>
      </body>
    </div>
  );
}

export default App;
