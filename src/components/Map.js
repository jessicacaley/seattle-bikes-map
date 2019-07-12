// geojson seattle outline source: https://catalog.data.gov/dataset/042242c7-443e-4c2b-93ed-7dcd2bd6d8f4/resource/77db88b7-20ad-400b-aebb-3400e3042773

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from "d3";
import axios from "axios";
import seattleJson from "../data/seattleJson"
import jumpApiCache from "../data/jumpApiCache"


class Map extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null
    };
  }

  componentDidMount() {
    this.getPoints();
  }

  getPoints() {
    // // real code (API call)
    // axios.get('https://sea.jumpbikes.com/opendata/free_bike_status.json')
    //   .then(response => {
    //     console.log(this.geoJsonify(response.data))
    //     console.log(this.state.dots)
    //     this.setState({
    //       dots: this.geoJsonify(response.data),
    //       date: this.datify(response.data.last_updated)
    //     })
    //     console.log("updated state!")
    //   })
    //   .catch(response => {
    //     console.log(response.errors)
    //   })

    // test code (cached)
    this.setState({
      dots: this.geoJsonify(jumpApiCache),
      date: this.datify(jumpApiCache.last_updated)
    })

  }

  componentDidUpdate(previousProps, previousState) {
    if (this.state.dots !== previousState.dots) {
      this.drawMap();
    }
  }


  drawMap() {
    var width = 400;
    var height = 750;

    // Create SVG
    var svg = d3.select( ".seattle" )
      .append( "svg" )
      .attr( "width", width )
      .attr( "height", height );

    // Append empty placeholder g element to the SVG
    // g will contain geometry elements
    var g = svg.append( "g" );

    // Create a unit projection.
    var projection = d3.geoAlbers()
      .scale(1)
      .translate([0, 0]);

    // Create a path generator.
    var path = d3.geoPath()
      .projection(projection);

    // Compute the bounds of a feature of interest, then derive scale & translate.
    var b = path.bounds(seattleJson),
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    console.log(b)

    // Update the projection to use computed scale & translate.
    projection
      .scale(s)
      .translate(t);

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll( "path" )
      .data( seattleJson.features )
      .enter()
      .append( "path" )
      .attr( "fill", "#fff" )
      .attr( "stroke", "#333")
      .attr( "d", path );

    var coordinates = this.state.dots.features.map(feature => {
      return feature.geometry.coordinates
    })

    let projected = []

    svg.selectAll("circle")
      .data(coordinates).enter()
      .append("circle")
      .attr("cx", function (d) { projected.push(projection(d)); return projection(d)[0]; })
      .attr("cy", function (d) { return projection(d)[1]; })
      .attr("r", "2px")
      .attr("fill", "#444a")

    // uncomment this to call API and get updated info!
    // this.getPoints()

    console.log(projected)
  }

  geoJsonify(response_data) {
    // console.log(response.data)
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
          'is_reserved': bike.is_reserved,
          'is_disabled': bike.is_disabled,
          'jump_ebike_battery_level': bike.jump_ebike_battery_level,
          'jump_vehicle_type': bike.jump_vehicle_type
        }
      };
    });

    const collection = {
      'type': 'FeatureCollection',
      'features': jsonFeatures
    }

    return collection
  }
  

  datify(secondsSinceEpoch) {
    const date = new Date(secondsSinceEpoch * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('en-US');
  }


  render() {
    return (
      <div className="map">
        <h1> {this.state.date} </h1>
        <section className="seattle"></section>
      </div>
    );
  }
}

export default Map;