import React, {Component} from 'react';
import * as d3 from 'd3';
import seattleJson from '../data/seattleJson'
import './Home.css'

class Map extends Component { 
  constructor(props) {
    super(props);

    d3.select('body')
      .style("background-color", '#afd0e3')
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

    g.selectAll('path')
      .data(seattleJson.features) // outline of seattle
      .enter()
      .append('path')
      .attr('fill', '#fafcfa')
      .attr('d', path)
      .attr('stroke', 'grey');
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
              <h3>Mapping JUMP Bikes in Seattle</h3>
              <h4>Ada Capstone Project</h4>
              <h4>Jessica Homet</h4>
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