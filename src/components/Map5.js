// geojson seattle outline source: https://catalog.data.gov/dataset/042242c7-443e-4c2b-93ed-7dcd2bd6d8f4/resource/77db88b7-20ad-400b-aebb-3400e3042773

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from "d3";
import axios from "axios";
import seattleJson from "../data/seattleJson"
import neighborhoods from "../data/seattle-neighborhoods"
import jumpApiCache from "../data/jumpApiCache"
import limeApi from "../data/limeApi"
import fakeAPI from "../data/fakeAPI"


class Map extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null,
    };
  }

  width = 800;
  height = 750;

  componentDidMount() {
    // Every second, render the next map.
    // var i = 0;
    // var intervalId = setInterval(() => {
    //   if(i === (fakeAPI.length - 1)){
    //     clearInterval(intervalId);
    //   }
    //   console.log(`Rendering map #${i+1}/${fakeAPI.length}...`)
    //   this.getPoints(i);
    //   i++;
    // }, 1500);

    this.getPoints(5)
  }

  drawContours(svg, coordinates, projection) {
    const data = coordinates.map(set => {
      return {
        "x": set[0],
        "y": set[1],
      }
    })

    var density = svg.append("g");
    
    var contours = density
      .selectAll( 'path' )
      .data( d3.contourDensity()
        .x( function( d ) { return projection([d.x, d.y])[0]; } )
        .y( function( d ) { return projection([d.x, d.y])[1]; } )
        .size( [this.width, this.height] )
        .bandwidth( 4 ) // 4, 6, 7 is distorting, 10 (last with lines), 14, 16 1-17 big gap from 3 to 4
        ( data )
      );

    // https://github.com/d3/d3-scale-chromatic#interpolatePiYG
    var color = d3.scaleSequential(d3.interpolateYlGn)
     .domain([0, .06]); // Points per square pixel.

    contours
      .enter()
      .append( "path" )
      .attr( "d", d3.geoPath() )
      .attr( 'fill', 'white')
      // .attr( 'stroke', 'black')
      // .attr("stroke-linejoin", "round")
      // .attr("stroke-width", 0.1)
      .attr( 'opacity', '.8')
      .attr("fill", function(d) { return color(d.value); })
      .attr("d", d3.geoPath())
  }

  getPoints(i) {
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

  drawMap() {
    d3.selectAll("svg").remove();

    // Create SVG
    var svg = d3.select( ".seattle" )
      .append( "svg" )
      .attr( "width", this.width )
      .attr( "height", this.height );

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
    s = .95 / Math.max((b[1][0] - b[0][0]) / this.width, (b[1][1] - b[0][1]) / this.height),
    t = [(this.width - s * (b[1][0] + b[0][0])) / 2, (this.height - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection to use computed scale & translate.
    projection
      .scale(s)
      .translate(t);
    
    function handleMouseOver() {
      const hood = d3.select(this)
        .attr("fill", "black");
    } 

    function handleMouseOut() {
      const hood = d3.select(this)
        .attr("fill", "#F7FCE8");
    } 



    let neighborhoodBikeCount = {}
    neighborhoods.features.forEach((feature, i) => {
      let bikeCount = 0
      const hood = neighborhoods.features[i].geometry.coordinates[0]
      // const point = fakeAPI[0].features[1000].geometry.coordinates
      const points = fakeAPI[5].features
      // console.log(hood)
      const point = fakeAPI[5].features[1565].geometry.coordinates
      // console.log(hood[0].length)
      points.forEach(point => {
        if(d3.polygonContains(hood, point.geometry.coordinates)) {
          console.log("TRUE")
          bikeCount += 1
        }
      })

      // let neighborhoodBikeCount = {}
      neighborhoodBikeCount[feature.id] = bikeCount / feature.properties.area;

      // neighborhoodsBikeCount.push(neighborhoodBikeCount)

      console.log(neighborhoodBikeCount)
      
      // console.log(d3.polygonContains(hood, point))
    })

    const densityValues = Object.values(neighborhoodBikeCount);

    const maxDensity = Math.max(...densityValues)
    const minDensity = Math.min(...densityValues)

    console.log(maxDensity, minDensity)

    // var colorScale = d3.scaleLinear().domain([0,112703512.412]).range(['beige', 'red']);
    var colorScale = d3.scaleLinear().domain([minDensity, maxDensity]).range(['white', 'red']);

      
    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll( "path" )
      .data( neighborhoods.features ) // outline of seattle
      .enter()
      .append( "path" )
      // .attr( "fill", "#F7FCE8" )
      .attr( "fill", function(d, i) {
        console.log(d.id)
        console.log(neighborhoodBikeCount[d.id])
        // return colorScale(d.properties.area);
        return colorScale(neighborhoodBikeCount[d.id]);

      } )
      .attr("num-of-bikes", function(d,i) {
        
      })
      .attr( "stroke", "grey")      
      .attr("stroke-width", 1)
      .attr( "d", path )
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    var coordinates = this.state.dots.features.map(feature => {
      return feature.geometry.coordinates;
    })

    this.setState({
      coordinates: coordinates,
      projection: projection,
      svg: svg
    });
    
    // this.drawContours(svg, coordinates, projection);
    // this.drawDots(svg, coordinates, projection);
  }

  drawDots(svg, coordinates, projection) {
    const circleColorScale = d3.scaleLinear().domain([0,100]).range(['#ff1612', '#12ff22']);
    const dots = this.state.dots

    function handleMouseOver(d, i) {
      const circle = d3.select(this)
        // .attr("fill", "orange")
        .attr("r", "6px");
      
      // console.log(d)

      const that = this;

      svg.append("text")
        .attr("id", "i" + (this.getAttribute("name"))) // Create an id for text so we can select it later for removing on mouseout
        .attr("x", function() { return 100; })
        .attr("y", function() { return 100; })
        .text(function() {
          // console.log(circle._groups[0][0].attributes[6].value ) // this is hacky but works..
          // return that.getAttribute("name");  // Value of the text
          return i;  // Value of the text

        });
    }

    function handleMouseOut(d, i) {
      const circle = d3.select(this)
        // .attr("fill", function(d, i) { return circleColorScale(parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))) })
        .attr("r", "2px")
        
      d3.select("#i" + `${this.getAttribute("name")}`).remove();  // Remove text location
    }

    function handleMouseClick(d, i) {
      const circle = d3.select(this)

      const that = this
      // const dots = this.state.dots

      console.log("click!")
      d3.select("#description").remove();  // Remove text location

      svg.append("text")
        .attr("id", "description") // Create an id for text so we can select it later for removing on mouseout
        .attr("x", function() { return 700; })
        .attr("y", function() { return 350; })
        .text(function() {
          console.log(this)
          return dots.features[i].properties.jump_ebike_battery_level;  // Value of the text
        });
    }
    svg.selectAll("circle")
      .data(coordinates).enter()
      .append("circle")
      .attr("cx", function (d) { return projection(d)[0]; })
      .attr("cy", function (d) { return projection(d)[1]; })
      .attr("r", "2px")
      // .attr("fill", "transparent")
      .attr("fill", function(d, i) { 
        const percentage = parseInt(dots.features[i].properties.jump_ebike_battery_level.slice(0, -1))
        return circleColorScale(percentage) 
      })
      .attr("stroke", "black")
      .attr("stroke-width", 0.1)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleMouseClick)
      .attr('name', function(d, i) {return dots.features[i].properties.name})
  }


  // // not needed here, but keeping the code for reference for how to parse API
  // geoJsonify(response_data) {
  //   // console.log(response.data)
  //   const time = response_data.last_updated

  //   const jsonFeatures = response_data.data.bikes.map(bike => {
  //     return {
  //       'type': 'Feature',
  //       'geometry': {
  //         'type': 'Point',
  //         'coordinates': [bike.lon, bike.lat]
  //       },
  //       'properties': {
  //         'time': time,
  //         'bike_id': bike.bike_id,
  //         'name': bike.name,
  //         'is_reserved': bike.is_reserved,
  //         'is_disabled': bike.is_disabled,
  //         'jump_ebike_battery_level': bike.jump_ebike_battery_level,
  //         'jump_vehicle_type': bike.jump_vehicle_type
  //       }
  //     };
  //   });

  //   const collection = {
  //     'type': 'FeatureCollection',
  //     'features': jsonFeatures
  //   }

  //   return collection
  // }
  

  datify(secondsSinceEpoch) {
    const date = new Date(secondsSinceEpoch * 1000);
    return `${date.toLocaleDateString()} || ${date.toLocaleTimeString('en-US')}`;
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