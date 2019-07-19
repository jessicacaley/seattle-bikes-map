import React, {Component} from 'react';
import * as d3 from 'd3';
import seattleJson from '../data/seattleJson'
import fakeAPI from '../data/fakeAPI'


class Map extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null,
      mapType: 'dots',
      pause: false
    };
  }

  width = 800;
  height = 750;

  componentDidMount() {
    this.iterateOverTime()
  }

  componentDidUpdate(previousProps, previousState) {
    if ((this.state.dots !== previousState.dots) || (this.state.mapType !== previousState.mapType)) {  
      this.drawMap();
    }
  }

  iterateOverTime = () => {
    this.setState({pause: false})

    var i = 0;
    var intervalId = setInterval(() => {
      if(i === (fakeAPI.length - 1) || this.state.pause ){
        clearInterval(intervalId);
      }
      console.log(`Rendering map #${i+1}/${fakeAPI.length}...`)
      this.getPoints(i);
      i++;
    }, 1500);
  }

  drawContours = (svg, coordinates, projection) => {
    const data = coordinates.map(set => {
      return {
        'x': set[0],
        'y': set[1],
      }
    })

    var density = svg.append('g');
    
    var contours = density
      .selectAll('path')
      .data(d3.contourDensity()
        .x(d => projection([d.x, d.y])[0])
        .y(d => projection([d.x, d.y])[1])
        .size([this.width, this.height])
        .bandwidth(4)(data)
        // 4, 6, 7 is distorting, 10 (last with lines), 14, 16 1-17 big gap from 3 to 4
      );

    var color = d3.scaleSequential(d3.interpolateYlGn)
     .domain([0, .06]); // Points per square pixel.
    
    contours
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('opacity', '.8')
      .attr('fill', d => color(d.value));
  }

  getPoints = (i) => {
    const data = fakeAPI[i]
    this.setState({
      dots: data,
      date: this.datify(data.features[0].properties.time)
    });
  }

  drawMap = () => {
    d3.selectAll('svg').remove();

    // Create SVG
    var svg = d3.select('.seattle')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Append empty placeholder g element to the SVG
    // g will contain geometry elements
    var g = svg.append('g');

    // Create a unit projection.
    var projection = d3.geoAlbers()
      .scale(1)
      .translate([0, 0]);

    // Create a path generator.
    var path = d3.geoPath()
      .projection(projection);

    // Compute the bounds of a feature of interest, then derive scale & translate.
    var b = path.bounds(seattleJson), // outline of seattle
    s = .95 / Math.max((b[1][0] - b[0][0]) / this.width, (b[1][1] - b[0][1]) / this.height),
    t = [(this.width - s * (b[1][0] + b[0][0])) / 2, (this.height - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection to use computed scale & translate.
    projection
      .scale(s)
      .translate(t);

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll('path')
      .data(seattleJson.features) // outline of seattle
      .enter()
      .append('path')
      .attr('fill', '#F7FCE8')
      .attr('stroke', 'grey')      
      .attr('stroke-width', 2)
      .attr('d', path);

    var coordinates = this.state.dots.features.map(feature => feature.geometry.coordinates);

    this.setState({
      coordinates: coordinates,
      projection: projection,
      svg: svg
    });
    
    if(this.state.mapType === 'density') {
      this.drawContours(svg, coordinates, projection);
    } else {
      this.drawDots(svg, coordinates, projection);
    }
  }

  drawDots = (svg, coordinates, projection) => {
    const circleColorScale = d3.scaleLinear()
      .domain([0,100])
      .range(['#ff1612', '#12ff22']); // red to green
    
    const dots = this.state.dots

    const handleMouseOver = function handleMouseOver(d, i) {
      d3.select(this)
        .attr('r', '6px');
      
      const that = this;

      svg.append('text')
        .attr('id', 'i' + (this.getAttribute('name'))) // Create an id for text so we can select it later for removing on mouseout
        .attr('x', () => 100)
        .attr('y', () => 100)
        .text(() => that.getAttribute('name'));

    }

    const handleMouseOut = function handleMouseOut(d, i) {
      d3.select(this)
        .attr('r', '2px')
        
      d3.select(`${'#i' + this.getAttribute('name')}`).remove();
    }

    const handleMouseClick = function handleMouseClick(d, i) {
      d3.select(this);
     
      d3.select('#description').remove();

      svg.append('text')
        .attr('id', 'description') // Create an id for text so we can select it later for removing on mouseout
        .attr('x', () => 700)
        .attr('y', () => 350)
        .text(() => dots.features[i].properties.jump_ebike_battery_level);
    }

    svg.selectAll('circle')
      .data(coordinates).enter()
      .append('circle')
      .attr('cx', (d) => projection(d)[0])
      .attr('cy', (d) => projection(d)[1])
      .attr('r', '2px')
      .attr('fill', (d, i) => { 
        const percentage = parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))
        return circleColorScale(percentage) 
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0.1)
      .attr('name', (d, i) => dots.features[i].properties.name)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleMouseClick);
  }
 
  datify = (secondsSinceEpoch) => {
    const date = new Date(secondsSinceEpoch * 1000);
    return `${date.toLocaleDateString()} / ${date.toLocaleTimeString('en-US')}`;
  }

  clickDotsButton = () => {
    this.setState({mapType: 'dots'})
  }

  clickDensityButton = () => {
    this.setState({mapType: 'density'})
  }

  pause = () => {
    this.setState({pause: true})
  }

  render() {
    return (
      <div className='map'>
        <button onClick={this.clickDotsButton}>Dots</button>
        <button onClick={this.clickDensityButton}>Density</button>
        <button onClick={this.iterateOverTime}>Replay</button>
        <button onClick={this.pause}>Pause</button>
        <h1> {this.state.date} </h1>
        <section className='seattle'></section>
      </div>
    );
  }
}

export default Map;