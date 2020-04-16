import React from 'react';
import Welcome from "./components/Welcome"  
import Transfer from "./components/Transfer"
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './App.css';

function App() {
  return (
    <div className="App">
      <body>
        <Router>
          <Route exact path="/" component={Welcome}></Route>
          <Route  path="/dashboard" component={Transfer}></Route>
        </Router>
      </body>
    </div>
  );
}

export default App;
