import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';
import Map from './components/Map'
// import Map2 from './components/Map2'
import Map3 from './components/Map3'
import Map4 from './components/Map4'
import Map5 from './components/Map5'




function App() {
  return (
    // <div className="App">
    //   {/* <Map /> */} {/* api call, old styling */}
    //   <Map3 /> 
    //   {/* new styling, uses local data and iterates */}
    //   {/* <Map5 /> */}
    //   {/* experimenting with point in polygon */}
    // </div>
    <Router>
      <div className="App">
        {/* <Header /> */}
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/current/">Current</Link>
            </li>
            <li>
              <Link to="/over-time/">Over Time</Link>
            </li>
            <li>
              <Link to="/neighborhoods/">Neighborhoods</Link>
            </li>
          </ul>
        </nav>
        <Route exact path="/" component={Home} />
        <Route path="/current" component={Current} />
        <Route path="/over-time" component={OverTime} />
        <Route path="/neighborhoods" component={Neighborhoods} />
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

export default App;
