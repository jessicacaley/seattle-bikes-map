import React from 'react';
import './App.css';
import Map from './components/Map'
// import Map2 from './components/Map2'
import Map3 from './components/Map3'
import Map4 from './components/Map4'
import Map5 from './components/Map5'



function App() {
  return (
    <div className="App">
      {/* <Map /> */} {/* api call, old styling */}
      {/* <Map2 /> */}
      {/* <Map3 />  */}
      {/* new styling, uses local data and iterates */}
      {/* <Map4 />  */}
      {/* like 3 but with neighborhoods */}
      <Map5 />
      {/* experimenting with point in polygon */}
    </div>
  );
}

export default App;
