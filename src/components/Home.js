import React, {Component} from 'react';
import * as d3 from 'd3';
import seattleJson from '../data/seattleJson'
import './Home.css'

class Map extends Component { 
  constructor(props) {
    super(props);

    d3.select('body')
      .style("background-color", 'rgb(136, 172, 193)')

    this.state = {
      tfhour: 0,
    }
  }

  width = 400;
  height = 700;
  
  componentDidMount() {
    this.drawMap();
    d3.select('.loading-screen').remove();
  }

  drawMap = () => {
    d3.selectAll('svg').remove();

    var svg = d3.select('.seattle')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    var g = svg.append('g');

    var projection = d3.geoMercator()//.angle(130)
      .scale(1)
      .translate([0, 0]);

    var path = d3.geoPath()
      .projection(projection);

    var b = path.bounds(seattleJson),
    s = .95 / Math.max((b[1][0] - b[0][0]) / this.width, (b[1][1] - b[0][1]) / this.height),
    t = [(this.width - s * (b[1][0] + b[0][0])) / 2, (this.height - s * (b[1][1] + b[0][1])) / 2];

    projection
      .scale(s)
      .translate(t);

    const timeColorScale = d3.scaleThreshold()
      .domain([5, 6, 7, 19, 20, 21]) // sunrise/sunset
      .range(['#88acc1', '#95b8cc', '#a2c4d7', '#afd0e3', '#a2c4d7', '#95b8cc', '#88acc1']);

    g.selectAll('path')
      .data(seattleJson.features) // outline of seattle
      .enter()
      .append('path')
      .attr('fill', '#F0F5F4')
      .attr('d', path)
      .attr('stroke', 'black');
    
    d3.select('body')
      .transition()
        .style("background-color", timeColorScale(this.state.tfhour))
  }

  render() {
    return (
      <div className="homepage">
        <div className="parent ">
          <div className='map'>
            <section className="middle">
              <section className='seattle'></section>
            </section>
            <section className='right-side'>
              <h1>JUMP Bikes in Seattle</h1>
            </section>
          </div>
        </div>
          <div className="loading-screen d-flex justify-content-center">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
}

export default Map;