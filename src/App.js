import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';
import Map from './components/Map'
// import Map2 from './components/Map2'
import Map3 from './components/Map3'
import Map5 from './components/Map5'
import Map6 from './components/Map6'
import Map7 from './components/Map7'

import Header from './components/Header'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <nav className="navbar navbar-expand-sm justify-content-center">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/current/">Current</Link> {/* Map */}
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/over-time/">Over Time</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/neighborhoods/">Neighborhoods</Link> {/* Map 5 */}
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/real-data-over-time/">Real Data Over Time</Link> {/* Map 5 */}
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/new-over-time/">New Over Time</Link> {/* Map 7 */}
            </li>
          </ul>
        </nav>
        <Route exact path="/" component={Home} />
        <Route path="/current" component={Current} />
        <Route path="/over-time" component={OverTime} />
        <Route path="/neighborhoods" component={Neighborhoods} />
        <Route path="/real-data-over-time" component={RealDataOverTime} />
        <Route path="/new-over-time" component={NewOverTime} />
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function Current() {
  return <Map />;
}

function OverTime() {
  return <Map3 />;
}

function Neighborhoods() {
  return <Map5 />;
}

function RealDataOverTime() {
  return <Map6 />;
}

function NewOverTime() {
  return <Map7 />;
}

export default App;
