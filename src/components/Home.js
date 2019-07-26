import React, {Component} from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import seattleJson from '../data/seattleJson'
// import fakeAPI from '../data/fakeAPI'
import './Map7.css'
import neighborhoods from '../data/seattle-neighborhoods'



class Home extends Component { 
  constructor(props) {
    super(props);

    const today =  new Date();
    this.state = {
      tfhour: today.getHours(),
    }
  }

  width = 800;
  height = 750;

  componentDidMount() {
    this.drawMap();
  }

  drawMap = () => {
    d3.selectAll('svg').remove();

    var svg = d3.select('.seattle')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    var g = svg.append('g');

    var projection = d3.geoAlbers()
      .scale(1)
      .translate([0, 0]);

    var path = d3.geoPath()
      .projection(projection);

    var b = path.bounds(seattleJson), // outline of seattle
    s = .95 / Math.max((b[1][0] - b[0][0]) / this.width, (b[1][1] - b[0][1]) / this.height),
    t = [(this.width - s * (b[1][0] + b[0][0])) / 2, (this.height - s * (b[1][1] + b[0][1])) / 2];

    projection
      .scale(s)
      .translate(t);

    g.selectAll('path')
      .data(seattleJson.features) // outline of seattle
      .enter()
      .append('path')
      .attr('fill', '#F7FCE8')
      .attr('d', path);

    const timeColorScale = d3.scaleThreshold()
      .domain([5, 6, 7, 19, 20, 21]) // sunrise/sunset
      .range(['#62889e', '#88acc1', '#afd0e3', '#d7e7f1', '#afd0e3', '#88acc1', '#62889e']); //blues
     
    d3.select('body')
      .style("background-color", timeColorScale(this.state.tfhour))
      
  }

  render() {
    return (
      <div className='map'>
        <section className='left-side'></section>
        <section className='seattle'></section>
        <section className='right-side'></section>
      </div>
    );
  }
}

export default Home;