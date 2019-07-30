import React, {Component} from 'react';
import * as d3 from 'd3';
import axios from 'axios';
// import FontAwesomeIcon from 'FontAwesomeIcon'; figure out this later
import seattleJson from '../data/seattleJson'
import ProgressBar from 'react-bootstrap/ProgressBar';
import './OverTime.css'
import neighborhoods from '../data/seattle-neighborhoods'


class Map extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null,
      mapType: 'dots',
      control: 'play',
      address: "",
      tfhour: 0,
      time: 434383,
      day: 22,
      singleBike: false,
      showDetails: true,
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
    if (this.state.dots !== previousState.dots || this.state.mapType !== previousState.mapType) {  
      this.drawMap();
    }
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
      time++;
    }, 500);
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
        .bandwidth(5)(data)
        // 4, 6, 7 is distorting, 10 (last with lines), 14, 16 1-17 big gap from 3 to 4
      );

    var color = d3.scaleSequential(d3.interpolatePuOr) // don't show density with same color as battery
     .domain([0, .06]); // Points per square pixel.
    
    contours
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('opacity', '1')
      .attr('fill', d => color(d.value));
    }

  getPoints = (time) => {
    this.setState({singleBike: false})

    axios.get(`https://jessicacaley.github.io/historical-bike-data/times/${time}.json`)
      .then(response => {
        this.setState({
          dots: response.data,
          date: this.datify(response.data.features[0].properties.time),
          time: time,
        });

        d3.select('.loading-screen').remove();
      })
      .catch(error => {
        console.log(error)
        alert("Uh oh! Something went wrong - we couldn't get the data.")
      })
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
    var projection = d3.geoMercator()//.angle(130)
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

    const timeColorScale = d3.scaleThreshold()
      .domain([5, 6, 7, 19, 20, 21]) // sunrise/sunset
      .range(['#88acc1', '#95b8cc', '#a2c4d7', '#afd0e3', '#a2c4d7', '#95b8cc', '#88acc1']);

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll('path')
      .data(seattleJson.features) // outline of seattle
      .enter()
      .append('path')
      // .attr('fill', '#e9ecef')
      .attr('fill', '#F0F5F4')
      .attr('d', path)
      .attr('stroke', 'black');
    
    d3.select('body')
      .transition()
        .style("background-color", timeColorScale(this.state.tfhour))

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

    // const that = this;

    const handleMouseOver = function handleMouseOver(d, i) {
      // that.setState({ showDetails: true })

      d3.select(this)
        .transition().duration([200])
          .attr('r', '8px')
          .attr('stroke', 'black');
        
      console.log(`this: ${this.getAttribute('name')}`)
      console.log(`d: ${d}`)
      console.log(`i: ${i}`)
      
      // d3.select('.bike-info')
      //   .append('text')
      //   .html(() => `
      //     <li>name: ${this.getAttribute('name')}</li>
      //     <li>id: ${this.getAttribute('id')}</li>
      //     <li className="bike-info__battery">battery: ${this.getAttribute('battery')}%</li>
      //   `);
    }

    const handleMouseOut = function handleMouseOut(d, i) {
      // that.setState({ showDetails: false })

      // radius = that.state.singleBike ? '8px' : '2.5px'

      d3.select(this)
        .transition().duration([200])
          .attr('r', radius)
          .attr('stroke', 'transparent');

      // d3.select('.bike-info')
      //   .html(() => '')
    }

    const that = this;

    const handleMouseClick = function handleMouseClick(d, i) {
      that.setState({ control: 'stop', bikeName: this.getAttribute('name'), bikeId: this.getAttribute('id') });

      // d3.select(this);
     
      // d3.select('#description').remove();

      // svg.append('text')
      //   .attr('id', 'description') // Create an id for text so we can select it later for removing on mouseout
      //   .attr('x', () => 700)
      //   .attr('y', () => 350)
      //   .text(() => dots.features[i].properties.name);

      that.followABike(this.getAttribute('name'));

      // put this somewhere
      // d3.select(
      //   `${'#i' + this.getAttribute('name')
      //     .split(' ')
      //     .join('')
      //     .split(':')
      //     .join('')}`)
      //   .remove();
    }

    const radius = this.state.singleBike ? '8px' : '2.5px';
    const stroke = this.state.singleBike ? 'black' : 'transparent';
 
    svg.selectAll('circle')
      .data(coordinates)
      .enter()
      .append('circle')
      .attr('cx', d => projection(d)[0])
      .attr('cy', d => projection(d)[1])
      .attr('r', radius)
      .attr('stroke', stroke)
      .attr('stroke-width', '.5')
      .attr('battery', (d, i) => { 
        const percentage = parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))
        return percentage
      })
      .attr('fill', (d, i) => { 
        const percentage = parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))
        return circleColorScale(percentage) 
      })
      .attr('name', (d, i) => dots.features[i].properties.name)
      .attr('id', (d, i) => dots.features[i].properties.bike_id)
      .on('mouseover', this.state.control === 'stop' ? '' : handleMouseOver)
      .on('mouseout', this.state.control === 'stop' ? '' : handleMouseOut)
      .on('click', this.state.control === 'stop' ? '' : handleMouseClick);
  }
 
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

  clickDotsButton = () => this.setState({ mapType: 'dots' })

  clickDensityButton = () => this.setState({ mapType: 'density' })

  stop = () => this.setState({ control: 'reset' })

  onAddressChange = (event) => {
    console.log(`Address Field updated ${event.target.value}`);
    this.setState({
      address: event.target.value,
    });
  }

  onFormSubmit = (event) => {
    event.preventDefault();
    this.placeAddress(this.state.svg, this.state.projection);
  }

  wheresThat = () => {

  }

  placeAddress = (svg, projection) => {
    const address = this.state.address;

    const params = {
      key: "294f5da8a3f72c",
      q: address + " Seattle",
      format: "json"
    };

    axios.get('https://us1.locationiq.com/v1/search.php', { params: params })
      .then(response => {
        const coordinates = [[response.data[0].lon, response.data[0].lat]];

        var address = svg.append('g');
        
        address
          .selectAll('circle')
          .data(coordinates).enter()
          .append('circle')
          .attr('cx', (d) => { 
            return projection(d)[0] 
          })
          .attr('cy', (d) => projection(d)[1])
          .attr('r', '7px')
          .attr('fill', 'transparent')
          .attr('stroke', 'black')
          .attr('stroke-width', 2)
      })
      .catch(error => {
        console.log(error)
        alert("Uh oh! Something went wrong - we couldn't get the data.")
      })
  }

  //08510 is a good example // 10329 for north // 10292
  singleBikeAnimation = (response) => {
    console.log(response)

    d3.select('.progress-bar').style('width', '0%')

    this.setState({ singleBike: true, control: 'stop' })
    let time = this.startTime;

    var intervalId2 = setInterval(() => {
      if (time === this.endTime || this.state.control !== 'stop') {
        clearInterval(intervalId2);
        this.setState({ control: 'reset' });
      } 

      const features = response.data[`${time}`] ? [ response.data[`${time}`] ] : [];

      const dots = {
        "type": "FeatureCollection",
        "features": features
      }

      const battery = features[0] ? features[0].properties.jump_ebike_battery_level : 'n/a'

      d3.select('.bike-info')
        .html('')

      d3.select('.bike-info')
        .append('text')
        .html(() => `
          <li>name: <b>${this.state.bikeName}</b></li>
          <li>id: <b>${this.state.bikeId}</b></li>
          <li className=".bike-info__battery">battery: <b>${this.state.battery}</b></li>
        `);

      this.setState({
        dots: dots,
        date: this.datify(time * 3600),
        time: time,
        battery: battery
      });

      time++;
    }, 150);
  }

  followABike = (bikeName) => {
    axios.get(`https://jessicacaley.github.io/historical-bike-data/bikes/${bikeName}.json`)
      .then(response => this.singleBikeAnimation(response))
      .catch(error => console.log(error))
  }

  revealDetails = () => {
    this.setState({ showDetails: true })
  }

  hideDetails = () => {
    this.setState({ showDetails: false })
  }

  render() {
    return (
      <div>
        <div className="parent">
          <div className='map'>
            <section className="middle">
              <section className='seattle'></section>
            </section>
            <section className='right-side'>
              <div className="controls">
                <div className="controls-progress">
                  <ProgressBar min={this.startTime} max={this.endTime} now={this.state.time} className="custom-progress-bar" variant="secondary" />
                </div>
                <div className="controls-button">
                  <button className={`btn play-stop ${this.state.control === 'play' ? "visible" : "invisible"}`} onClick={this.iterateOverTime}>&#9658;</button>
                  <button className={`btn play-stop ${this.state.control === 'stop' ? "visible" : "invisible"}`} onClick={this.stop}>&#9724;</button>
                  <button className={`btn play-stop ${this.state.control === 'reset' ? "visible" : "invisible"}`} onClick={this.drawStaticMap}>&#10226;</button>
                </div>
              </div>
              <h1> {this.state.date ? this.state.date.split(' ')[0] : ''} </h1>
              <h1> {this.state.date ? this.state.date.split(' ')[1] : ''} </h1>
              <h1> {this.state.date ? this.state.date.split(' ')[2] : ''} </h1>
              <div className="btn-group buttons" role="group">
                <button className="btn btn-secondary" onClick={this.clickDotsButton}>Dots</button>
                <button className="btn btn-secondary" onClick={this.clickDensityButton}>Density</button>
              </div>
              <div className={`btn-group buttons show-or-hide ${this.state.singleBike ? 'visible' : 'invisible'}`}>
                <button className={`btn btn-sm ${!this.state.showDetails ? 'visible' : 'invisible'}`} onClick={this.revealDetails}>Show Bike Details</button>
                <button className={`btn btn-sm ${this.state.showDetails ? 'visible' : 'invisible'}`} onClick={this.hideDetails}>Hide Bike Details</button>
              </div>
              <div className={`current-bike ${this.state.showDetails && this.state.singleBike ? 'visible' : 'invisible'}`}>
                <ul className="bike-info"></ul>
              </div>
              {/* <div className={`placeholder current-bike `}>
                <p>click to display bike details</p>
              </div> */}
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