import React, {Component} from 'react';
import * as d3 from 'd3';
import axios from 'axios';
// import FontAwesomeIcon from 'FontAwesomeIcon'; figure out this later
import seattleJson from '../data/seattleJson'
import './Current.css'
import neighborhoods from '../data/seattle-neighborhoods'


class Map extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null,
      mapType: 'dots',
      address: "",
      tfhour: 0,
      time: 434383,
      day: 22,
      showDetails: false,
    };
  }

  width = 400;
  height = 700;
  startTime = 434383; // Mon 7/22 midnight
  endTime = 434551; // Mon 7/29 midnight

  componentDidMount() {
    this.getPoints();
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.state.dots !== previousState.dots || this.state.mapType !== previousState.mapType) {  
      this.drawMap();
    }

    // if (this.state.showDetails !== previousState.showDetails) {
    //   this.drawMap();
    // }
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

  getPoints = () => {
    axios.get('https://sea.jumpbikes.com/opendata/free_bike_status.json')
      .then(response => {
        this.setState({
          dots: this.geoJsonify(response.data),
          date: this.datify(response.data.last_updated)
        })

        d3.select('.loading-screen').remove();
      })
      .catch(response => {
        console.log(response.errors)
        alert("Whoops!")
      })
  }

  geoJsonify(response_data) {
    const time = response_data.last_updated

    const jsonFeatures = response_data.data.bikes.map(bike => {
      return {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [bike.lon, bike.lat]
        },
        'properties': {
          'time': time,
          'bike_id': bike.bike_id,
          'name': bike.name,
          'jump_ebike_battery_level': bike.jump_ebike_battery_level,
        }
      };
    });

    const collection = {
      'type': 'FeatureCollection',
      'features': jsonFeatures
    }

    return collection
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
        .transition().duration([200])
          .attr('r', '8px')
          .attr('stroke', 'black');
    }

    const handleMouseOut = function handleMouseOut(d, i) {
      d3.select(this)
        .transition().duration([200])
          .attr('r', '2px')
          .attr('stroke', 'transparent');
    }

    const that = this;

    const handleMouseClick = function handleMouseClick(d, i) {
      d3.select('.bike-info')
        .html('')

      d3.select('.bike-info')
        .append('text')
        .html(() => `
          <li>name: <b>${this.getAttribute('name')}</b></li>
          <li>id: <b>${this.getAttribute('id')}</b></li>
          <li className=".bike-info__battery">battery: <b>${this.getAttribute('battery')}%</b></li>
        `);
      
      that.setState({  showDetails: true });
    }

    let radius = '2.5px';
    let stroke = 'transparent';

    svg.selectAll('circle')
      .data(coordinates)
      .enter()
      .append('circle')
      .attr('cx', d => projection(d)[0])
      .attr('cy', d => projection(d)[1])
      .attr('r', radius)
      .attr('stroke', stroke)
      .attr('stroke-width', '.5')
      .attr('fill', (d, i) => { 
        const percentage = parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))
        return circleColorScale(percentage) 
      })
      .attr('battery', (d, i) => { 
        const percentage = parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))
        return percentage
      })
      .attr('id', (d, i) => dots.features[i].properties.bike_id)
      .attr('name', (d, i) => dots.features[i].properties.name)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleMouseClick)


  }
 
  datify = (secondsSinceEpoch) => {
    const date = new Date(secondsSinceEpoch * 1000);
    const time = date.toLocaleTimeString('en-US')
    const offset = (time.length === 10) ? 1 : 0;
    const hour = time.substr(0, 5 - offset)
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
        alert("Uh oh! Something went wrong - we couldn't get the data.")
      })
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
              <h1> {this.state.date ? this.state.date.split(' ')[0] : ''} </h1>
              <h1> {this.state.date ? this.state.date.split(' ')[1] : ''} </h1>
              <h1> {this.state.date ? this.state.date.split(' ')[2] : ''} </h1>
              <div className="btn-group buttons" role="group">
                <button className="btn btn-secondary" onClick={this.clickDotsButton}>Dots</button>
                <button className="btn btn-secondary" onClick={this.clickDensityButton}>Density</button>
              </div>
              <div className={`current-bike current-bike__current ${this.state.showDetails ? 'visible' : 'invisible'}`}>
                <ul className="bike-info bike-info__current">
                  <li>name: </li>
                  <li>id: </li>
                  <li>battery: </li>
                </ul>
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
    );
  }
}

export default Map;