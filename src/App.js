import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';
import Current from './components/Current'
import Neighborhoods from './components/Neighborhoods'
import OverTime from './components/OverTime'
import Home from './components/Home'
import Header from './components/Header'

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <section className="page">
          <div className="navigation">
            <nav className="navbar navbar-expand-sm justify-content-center">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/current/">Current</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/over-time/">Historical</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/neighborhoods/">Neighborhoods</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="content">
            <Route exact path="/" component={Home} />
            <Route path="/current" component={Current} />
            <Route path="/over-time" component={OverTime} />
            <Route path="/neighborhoods" component={Neighborhoods} />
          </div>
        </section>
      </Router>
    </div>
  );
}

export default App;
