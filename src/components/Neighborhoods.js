import React, {Component} from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import seattleJson from '../data/seattleJson'
import neighborhoods from '../data/seattle-neighborhoods'
// import fakeAPI from '../data/fakeAPI'
import d3Tip from "d3-tip"
import ProgressBar from 'react-bootstrap/ProgressBar';
import './Neighborhoods.css'



// would be cool to do this one as a comparison to average amount or density in each neighborhood instead of compared to other neighborhoods
//// maybe i should have these maps all inherit from a Map class for some basic functions?

class Neighborhoods extends Component { 
  constructor(props) {
    super(props);

    d3.select('body')
      .style("background-color", 'rgb(136, 172, 193)')

    this.state = {
      dots: null,
      date: null,
      control: 'play',
      tfhour: 0,
      time: 434383,
      day: 22,
    };
  }

  width = 400;
  height = 700;
  startTime = 434383; // Mon 7/22 midnight
  endTime = 434551; // Mon 7/29 midnight

  componentDidMount() {
    this.drawStaticMap();
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.state.dots !== previousState.dots) this.drawMap();
  }

  drawStaticMap = () => {
    this.getPoints(this.startTime);
    this.setState({ control: 'play' })
  }

  iterateOverTime = () => {
    this.setState({control: 'stop'})

    let time = this.startTime;
    var intervalId = setInterval(() => {
      if(time === this.endTime || this.state.control !== "stop" || this.state.singleBike) {
        clearInterval(intervalId);
        this.setState({ control: 'reset' })
      }
      this.getPoints(time);
      // this.setState({ })
      time++;
    }, 100);
  }

  getPoints = (time) => {
    axios.get(`https://jessicacaley.github.io/historical-bike-data/times/${time}.json`)
      .then(response => {
        this.setState({
          dots: response.data,
          date: this.datify(response.data.features[0].properties.time),
          time: time,
        });

        d3.select('.loading-screen').remove();

        return response.data;
      })
      .catch(error => {
        console.log(error)
        alert("Uh oh! Something went wrong - we couldn't get the data.")
      })
  }

  // getPoints(i) {
  //   const data = fakeAPI[i]
  //   this.setState({
  //     dots: data,
  //     date: this.datify(data.features[0].properties.time),
  //     i: i
  //   });
  // }

  drawMap() {
    const tip = d3Tip();
    // tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });

    tip.attr("class", "d3-tip")
      .html(d => { return d.properties.name; })
   
    d3.selectAll('svg').remove();

    // Create SVG
    var svg = d3.select( '.seattle' )
      .append( 'svg' )
      .attr( 'width', this.width )
      .attr( 'height', this.height );
    
    svg.call(tip)    

    // Append empty placeholder g element to the SVG
    // g will contain geometry elements
    var g = svg.append( 'g' );

    // Create a unit projection.
    var projection = d3.geoMercator()
      .scale(1)
      .translate([0, 0]);

    // Create a path generator.
    var path = d3.geoPath()
      .projection(projection);

    // Compute the bounds of a feature of interest, then derive scale & translate.
    var b = path.bounds(seattleJson), // outline of seattle neighborhoods
    s = .95 / Math.max((b[1][0] - b[0][0]) / this.width, (b[1][1] - b[0][1]) / this.height),
    t = [(this.width - s * (b[1][0] + b[0][0])) / 2, (this.height - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection to use computed scale & translate.
    projection
      .scale(s)
      .translate(t);

    let neighborhoodBikeCount = {}

    neighborhoods.features.forEach((feature, i) => {
      let bikeCount = 0

      if (feature.geometry.type === 'Polygon') {
        const hood = neighborhoods.features[i].geometry.coordinates[0];

        const points = this.state.dots.features;
        
        points.forEach(point => {
          if (d3.polygonContains(hood, point.geometry.coordinates)) {
            bikeCount += 1;
          }
        })

        neighborhoodBikeCount[feature.id] = bikeCount / feature.properties.area;
      } else {
        feature.geometry.coordinates.forEach(coordinate => {
          if (coordinate.length === 1) {
            const hood = coordinate[0];

            const points = this.state.dots.features;
            
            points.forEach(point => {
              if (d3.polygonContains(hood, point.geometry.coordinates)) {
                bikeCount += 1;
              }
            })
            if (neighborhoodBikeCount[feature.id]) {
              neighborhoodBikeCount[feature.id] += bikeCount / feature.properties.area;
            } else {
              neighborhoodBikeCount[feature.id] = bikeCount / feature.properties.area;
            }
          } else {
            coordinate.forEach(section => {
              // const hood = set

              const points = this.state.dots.features;
              
              points.forEach(point => {
                if (d3.polygonContains(section, point.geometry.coordinates)) {
                  bikeCount += 1;
                }
              })

              if (neighborhoodBikeCount[feature.id]) {
                neighborhoodBikeCount[feature.id] += bikeCount / feature.properties.area;
              } else {
                neighborhoodBikeCount[feature.id] = bikeCount / feature.properties.area;
              }
            })
          }
        })
      } 
    })

    const densityValues = Object.values(neighborhoodBikeCount);

    const maxDensity = Math.max(...densityValues);
    const minDensity = Math.min(...densityValues);

    // var colorScale = d3.scaleLinear().domain([0,112703512.412]).range(['beige', 'red']);
    var colorScale = d3.scaleLinear()
      .domain([minDensity, maxDensity])
      .range(['white', 'blue']);

    const that = this;

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll( 'path' )
      .data(neighborhoods.features) // outline of seattle
      .enter()
      .append('path')
      .attr('fill', (d, i) => colorScale(neighborhoodBikeCount[d.id]))
      .attr('stroke', 'grey')      
      .attr('stroke-width', 1)
      .attr('d', path)
      .attr('name', (d) => d.id)
      .on('mouseover', function(d){
        if (that.state.control !== 'stop') {
          tip.show(d, this);
          this.style['stroke-width'] = 3;
        }
      })
      .on('mouseout', function(d){
        tip.hide(d, this);
        this.style['stroke-width'] = 1;
      })      

    var coordinates = this.state.dots.features.map(feature => {
      return feature.geometry.coordinates;
    })

    this.setState({
      coordinates: coordinates,
      projection: projection,
      svg: svg
    });
  }

  stop = () => this.setState({ control: 'reset' });

  datify = (secondsSinceEpoch) => {
    const date = new Date(secondsSinceEpoch * 1000);
    const time = date.toLocaleTimeString('en-US')
    const offset = (time.length === 10) ? 1 : 0;
    const hour = time.substr(0, 2 - offset)
    const amOrPm = time.substr(9 - offset, 2)
    let tfhour = 0;
    if (amOrPm === "PM" && hour !== "12") {
      tfhour = Number(hour) + 12;
    } else if(amOrPm === "AM" && hour === "12") {
      tfhour = 0;
    } else {
      tfhour = Number(hour);
    }

    const day = date.toLocaleDateString('en-EN', {weekday: 'long'})

    this.setState({ tfhour: tfhour, day: day })

    const shortTime = hour + amOrPm;
    
    return `${day} ${date.toLocaleDateString()} ${shortTime}`;
  }

  render() {
    return (
      <div>
        <div className="parent parent__flipped">
          <div className='map'>
            <section className="middle">
              <section className='seattle'></section>
            </section>
            <section className='right-side'>
              <div className="controls">
                <div className="controls-button">
                  <button className={`btn play-stop ${this.state.control === 'play' ? "visible" : "invisible"}`} onClick={this.iterateOverTime}>&#9658;</button>
                  <button className={`btn play-stop ${this.state.control === 'stop' ? "visible" : "invisible"}`} onClick={this.stop}>&#9724;</button>
                  <button className={`btn play-stop ${this.state.control === 'reset' ? "visible" : "invisible"}`} onClick={this.drawStaticMap}>&#10226;</button>
                </div>
                <div className="controls-progress">
                  <ProgressBar min={this.startTime} max={this.endTime} now={this.state.time} className="custom-progress-bar custom-progress-bar__neighborhood" variant="secondary" />
                </div>
              </div>
              <h1> {this.state.date ? this.state.date.split(' ')[0] : ''} </h1>
              <h1> {this.state.date ? this.state.date.split(' ')[1] : ''} </h1>
              <h1> {this.state.date ? this.state.date.split(' ')[2] : ''} </h1>
              <div className={`btn-group buttons show-or-hide ${this.state.singleBike ? 'visible' : 'invisible'}`}>
                <button className={`btn btn-sm ${!this.state.showDetails ? 'visible' : 'invisible'}`} onClick={this.revealDetails}>Show Bike Details</button>
                <button className={`btn btn-sm ${this.state.showDetails ? 'visible' : 'invisible'}`} onClick={this.hideDetails}>Hide Bike Details</button>
              </div>
              <div className={`current-bike ${this.state.showDetails && this.state.singleBike ? 'visible' : 'invisible'}`}>
                <ul className="bike-info"></ul>
              </div>
            </section>
          </div>
        </div>
        <div className="loading-screen d-flex justify-content-center">
          <div className="spinner-border text-secondary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    )
  }
}

export default Neighborhoods;