// geojson seattle outline source: https://catalog.data.gov/dataset/042242c7-443e-4c2b-93ed-7dcd2bd6d8f4/resource/77db88b7-20ad-400b-aebb-3400e3042773

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from "d3";
import axios from "axios";
import seattleJson from "../data/seattleJson"
import jumpApiCache from "../data/jumpApiCache"
import limeApi from "../data/limeApi"
import fakeAPI from "../data/fakeAPI"


class Map extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null
    };
  }

  componentDidMount() {
    // this.getPoints(0);

    var i = 0;
    var intervalId = setInterval(() => {
      if(i === (fakeAPI.length - 1)){
        clearInterval(intervalId);
      }
      console.log(i);
      this.getPoints(i);
      i++;
    }, 1000);
    
    
    // this.drawMap();
    // let i = 0;
    //  setInterval() this.getPoints(i++), 5000 );
  }

  drawContours(svg, coordinates, projection) {
    const data = coordinates.map(set => {
      return {
        "x": set[0],
        "y": set[1],
      }
    })

    var width = 400;
    var height = 750;

    var density = svg.append("g");
    
    var contours = density
    .selectAll( 'path' )
    .data( d3.contourDensity()
      // .x( function( d ) { return d.x; } )
      // .y( function( d ) { return d.y; } )
      .x( function( d ) { return projection([d.x, d.y])[0]; } )
      .y( function( d ) { return projection([d.x, d.y])[1]; } )
      .size( [width, height] )
      .bandwidth( 4 ) // 4, 7, 10,  1-17 big gap from 3 to 4
      ( data )
    );
    
    contours
      .enter()
      .append( "path" )
      .attr( "d", d3.geoPath() )
      .attr( 'fill', 'red')
      .attr( 'opacity', '0.1');

   
  }

  getPoints(i) {
    // let data = fakeAPI[0];
    // let counter = 0;
    // let timer = setInterval(function() {
    //   let data = fakeAPI[counter];
    //   counter++;
    //   if(counter === fakeAPI.length){
    //     clearInterval(timer);
    //   }
    // }, 5000)
    const data = fakeAPI[i]
    this.setState({
      dots: data,
      date: this.datify(data.features[0].properties.time)
    });
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.state.dots !== previousState.dots) {  
      this.drawMap();
    }
  }

  // resetMap() {
    
  // }


  drawMap() {
    d3.selectAll("svg").remove();

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
    var b = path.bounds(seattleJson), // outline of seattle
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    console.log(b)

    // Update the projection to use computed scale & translate.
    projection
      .scale(s)
      .translate(t);

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll( "path" )
      .data( seattleJson.features ) // outline of seattle
      .enter()
      .append( "path" )
      // .attr( "fill", "#fff" )
      // .attr( "fill", "transparent" )
      .attr( "fill", "rgba(230, 230, 230, 1)" )
      .attr( "stroke", "#333")
      .attr( "d", path );

    console.log(this.state.dots)


    var coordinates = this.state.dots.features.map(feature => {
      return feature.geometry.coordinates;
    })


    svg.selectAll("circle")
      .data(coordinates).enter()
      .append("circle")
      .attr("cx", function (d) { return projection(d)[0]; })
      .attr("cy", function (d) { return projection(d)[1]; })
      .attr("r", "2px")
      // .attr("fill", "#444a")
      .attr("fill", "lightgrey");

    // uncomment this to call API and get updated info!
    // this.getPoints()

    this.drawContours(svg, coordinates, projection);
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