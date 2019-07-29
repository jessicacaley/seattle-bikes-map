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
      pause: true,
      address: "",
      tfhour: 0,
      time: 434383,
      day: 22,
    };
  }

  width = 500;
  height = 750;
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

  drawStaticMap = () => this.getPoints(this.startTime);

  iterateOverTime = () => {
    this.setState({pause: false})

    let time = this.startTime;
    var intervalId = setInterval(() => {
      if(time === this.endTime || this.state.pause || this.state.singleBike) {
        clearInterval(intervalId);
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

    var color = d3.scaleSequential(d3.interpolatePurples) // don't show density with same color as battery
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
      })
      .catch(error => {
        console.log(error)
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

    const timeColorScale = d3.scaleThreshold()
      .domain([5, 6, 7, 19, 20, 21]) // sunrise/sunset
      .range(['#88acc1', '#95b8cc', '#a2c4d7', '#afd0e3', '#a2c4d7', '#95b8cc', '#88acc1']);

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll('path')
      .data(seattleJson.features) // outline of seattle
      .enter()
      .append('path')
      // .attr('fill', '#F7FCE8')
      .attr('fill', '#e9ecef')
      .attr('d', path)
      .attr('stroke', 'black');
    
    d3.select('body')
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

    const handleMouseOver = function handleMouseOver(d, i) {
      d3.select(this)
        .attr('r', '6px');
    }

    const handleMouseOut = function handleMouseOut(d, i) {
      d3.select(this)
        .attr('r', '2px')
    }

    const that = this;

    const handleMouseClick = function handleMouseClick(d, i) {
      that.setState({ pause: false });

      d3.select(this);
     
      d3.select('#description').remove();

      svg.append('text')
        .attr('id', 'description') // Create an id for text so we can select it later for removing on mouseout
        .attr('x', () => 700)
        .attr('y', () => 350)
        .text(() => dots.features[i].properties.name);

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

    let radius = '2.5px'

    if (this.state.singleBike) {
      radius = "8px"
    }

    svg.selectAll('circle')
      .data(coordinates).enter()
      .append('circle')
      .attr('cx', d => projection(d)[0])
      .attr('cy', d => projection(d)[1])
      .attr('r', radius)
      .attr('fill', (d, i) => { 
        const percentage = parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))
        return circleColorScale(percentage) 
      })
      .attr('name', (d, i) => dots.features[i].properties.name)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleMouseClick);
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

  pause = () => this.setState({ pause: true })

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
      })
  }

  //08510 is a good example // 10329 for north // 10292
  singleBikeAnimation = (response) => {
    this.setState({ singleBike: true, pause: false })
    let time = this.startTime;

    var intervalId2 = setInterval(() => {
      console.log(this.state.day)

      if (time === this.endTime || this.state.pause) {
        clearInterval(intervalId2);
        if (!this.state.pause) this.setState({ pause: true });
      } 

      const features = response.data[`${time}`] ? [ response.data[`${time}`] ] : [];

      const dots = {
        "type": "FeatureCollection",
        "features": features
      }

      this.setState({
        dots: dots,
        date: this.datify(time * 3600),
        time: time
      });

      time++;
    }, 100);
  }

  followABike = (bikeName) => {
    axios.get(`https://jessicacaley.github.io/historical-bike-data/bikes/${bikeName}.json`)
      .then(response => this.singleBikeAnimation(response))
      .catch(error => console.log(error))
  }

  render() {
    return (
      <div className='map'>
        <section className='left-side'>
          <form>
            <input 
              // className="form-control"
              onChange={this.onAddressChange}
              value={this.state.address}
              name="address"
              id="address"
              type="text"
              placeholder="Address" />
            <input type="submit"
              className="btn btn-secondary btn-sm" 
              onClick={this.onFormSubmit} />
          </form>
          <div className="btn-toolbar justify-content-center" role="toolbar">
            <div className="btn-group mr-2" role="group">
              <button className="btn btn-secondary" onClick={this.clickDotsButton}>Dots</button>
              <button className="btn btn-secondary" onClick={this.clickDensityButton}>Density</button>
              <button className="btn btn-secondary" onClick={this.drawStaticMap}>Reset Map</button>
            </div>
            
          </div>
        </section>
        <section className="middle">
          
          <section className='seattle'></section>
        </section>
        <section className='right-side'>
          <div className="controls">
            <div className="controls-progress">
              <ProgressBar min={this.startTime} max={this.endTime} now={this.state.time} className="custom-progress-bar" variant="secondary" />
            </div>
            <div className="controls-button">
              <button className={`btn play-stop ${this.state.pause ? "visible" : "invisible"}`} onClick={this.iterateOverTime}>&#9658;</button>
              {/* <FontAwesomeIcon icon="play" /> figure this out later */}
              {/* scrub bar? https://codepen.io/iamfiscus/pen/xbOyrE */}
              <button className={`btn play-stop ${this.state.pause ? "invisible" : "visible"}`} onClick={this.pause}>&#9724;</button>
            </div>
          </div>
          <h1> {this.state.date ? this.state.date.split(' ')[0] : ''} </h1>
          <h1> {this.state.date ? this.state.date.split(' ')[1] : ''} </h1>
          <h1> {this.state.date ? this.state.date.split(' ')[2] : ''} </h1>
        </section>
      </div>
    );
  }
}

export default Map;