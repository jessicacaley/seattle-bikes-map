// json source: https://catalog.data.gov/dataset/042242c7-443e-4c2b-93ed-7dcd2bd6d8f4/resource/77db88b7-20ad-400b-aebb-3400e3042773

import React, {Component} from 'react';
import * as d3 from "d3";
import axios from "axios";
import seattleJson from "../data/seattleJson"

class Map extends Component { 

  componentDidMount() {
    this.drawMap();
  }

  drawMap() {
    console.log(seattleJson)
      
    var width = 700;
    var height = 580;

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

    // Update the projection to use computed scale & translate.
    projection
    .scale(s)
    .translate(t);

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll( "path" )
    .data( seattleJson.features )
    .enter()
    .append( "path" )
    .attr( "fill", "#ccc" )
    .attr( "stroke", "#333")
    .attr( "d", path );
  }
  

  render() {

    return (
      <div className="map">
        <h1>This is a map!</h1>
        <section className="seattle"></section>
        {/* { console.log(seattleJson.features) } */}
      </div>
    );
  }
}

export default Map;