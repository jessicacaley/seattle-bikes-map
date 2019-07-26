import React, {Component} from 'react';
import * as d3 from 'd3';
import seattleJson from '../data/seattleJson'
import neighborhoods from '../data/seattle-neighborhoods'
import fakeAPI from '../data/fakeAPI'

// would be cool to do this one as a comparison to average amount or density in each neighborhood instead of compared to other neighborhoods
//// maybe i should have these maps all inherit from a Map class for some basic functions?

class Map extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null,
      playButton: true,
    };
  }

  width = 800;
  height = 750;

  componentDidMount() {
    var i = 0;
    var intervalId = setInterval(() => {
      if(i === (fakeAPI.length - 1)) clearInterval(intervalId);
      console.log(`Rendering map #${i+1}/${fakeAPI.length}...`)
      this.getPoints(i);
      i++;
    }, 1500);
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.state.dots !== previousState.dots) this.drawMap();
  }

  getPoints(i) {
    const data = fakeAPI[i]
    this.setState({
      dots: data,
      date: this.datify(data.features[0].properties.time),
      i: i
    });
  }

  drawMap() {
    d3.selectAll('svg').remove();

    // Create SVG
    var svg = d3.select( '.seattle' )
      .append( 'svg' )
      .attr( 'width', this.width )
      .attr( 'height', this.height );

    // Append empty placeholder g element to the SVG
    // g will contain geometry elements
    var g = svg.append( 'g' );

    // Create a unit projection.
    var projection = d3.geoAlbers()
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
    
    const handleMouseOver = function handleMouseOver() {
      const that = this

      svg.append('text')
        .attr('id', 'i' + (that.getAttribute('name')).split(' ').join('').split(':').join(''))
        .attr('x', () => 100)
        .attr('y', () => 100)
        .text(() => that.getAttribute('name'));
    } 

    const handleMouseOut = function handleMouseOut() {
      d3.select(
        `${'#i' + this.getAttribute('name')
          .split(' ')
          .join('')
          .split(':')
          .join('')}`)
        .remove();
    }

    let neighborhoodBikeCount = {}

    neighborhoods.features.forEach((feature, i) => {
      let bikeCount = 0

      if (feature.geometry.type === 'Polygon') {
        const hood = neighborhoods.features[i].geometry.coordinates[0];

        const points = fakeAPI[this.state.i].features;
        
        points.forEach(point => {
          if(d3.polygonContains(hood, point.geometry.coordinates)) {
            bikeCount += 1;
          }
        })

        neighborhoodBikeCount[feature.id] = bikeCount / feature.properties.area;
      } else {
        feature.geometry.coordinates.forEach(coordinate => {
          if (coordinate.length === 1) {
            const hood = coordinate[0];

            const points = fakeAPI[this.state.i].features;
            
            points.forEach(point => {
              if(d3.polygonContains(hood, point.geometry.coordinates)) {
                bikeCount += 1;
              }
            })
            if(neighborhoodBikeCount[feature.id]) {
              neighborhoodBikeCount[feature.id] += bikeCount / feature.properties.area;
            } else {
              neighborhoodBikeCount[feature.id] = bikeCount / feature.properties.area;
            }
          } else {
            coordinate.forEach(section => {
              // const hood = set

              const points = fakeAPI[this.state.i].features
              
              points.forEach(point => {
                if(d3.polygonContains(section, point.geometry.coordinates)) {
                  bikeCount += 1;
                }
              })

              if(neighborhoodBikeCount[feature.id]) {
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
  }

  datify = (secondsSinceEpoch) => {
    const date = new Date(secondsSinceEpoch * 1000);
    return `${date.toLocaleDateString()} / ${date.toLocaleTimeString('en-US')}`;
  }

  render() {
    return (
      <div className='map'>
        <h1> {this.state.date} </h1>
        <section className='seattle'></section>
      </div>
    );
  }
}

export default Map;