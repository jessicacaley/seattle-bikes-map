
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from "d3";
import axios from "axios";
import coordinates from "../data/coordinates"


class Map2 extends Component { 
  constructor(props) {
    super(props);
    this.state = {
      dots: null,
      date: null
    };
  }
  
  // width = x max minus x min 
  // height = y max minus y min


  componentDidMount() {
    const data = coordinates;
    console.log(data)

    // let maxX = -100000;
    // let maxY = -100000;
    // let minX = 100000;
    // let minY = 100000;

    // data.forEach(set => {
    //   if(set["x"] > maxX) {
    //     maxX = set["x"];
    //   }
    //   if(set["y"] > maxY) {
    //     maxY = set["y"];
    //   }
    //   if(set["x"] < minX) {
    //     minX = set["x"];
    //   }
    //   if(set["y"] < minY) {
    //     minY = set["y"];
    //   }
    // })

    // let width = maxX - minX;
    // let height = maxY - minY;

    // console.log(maxX,maxY)

    // const width = 75998.91153031375;
    // const height = 41593.33075809463;
    const width = 500;
    const height = 500;

    var svg = d3.select( 'svg' );

    function updateGraph() {
      
      svg
        .selectAll( 'path' )
        .remove();
      
      svg
        .selectAll( 'circle' )
        .remove();  
      
      svg
        .selectAll( 'circle' )
        .data( data )
        .enter()
        .append( 'circle' )
          .attr( 'cx', function( d ) { console.log(d); return d.x; })
          .attr( 'cy', function( d ) { return d.y; })
          .attr( 'r', 2 )
          .attr( 'stroke', 'none' )
          .attr( 'fill', 'none' );  

      var contours = svg
        .selectAll( 'path' )
        .data( d3.contourDensity()
          .x( function( d ) { return d.x; } )
          .y( function( d ) { return d.y; } )
          .size( [width, height] )
          .bandwidth( 4 )
          ( data )
      );
      
      contours
        .enter()
        .append( "path" )
        .attr( "d", d3.geoPath() )
        .attr( 'fill', '#300')
        .attr( 'opacity', '0.1');
    }

    // updateData();
    updateGraph();

    // setInterval( function() {
    //   updateData();
    //   updateGraph();
    // }, 2000 );
  }

  width = 500;
  height = 500;
      
  render() {
    return (
      // <svg viewBox="-4611.97848088295 73.26541638819617 71386.93304943081 41666.596174482824" width={this.width} height={this.height} stroke="transparent" strokeLinejoin="round"></svg>
      <svg width="500" height="500" stroke="transparent" strokeLinejoin="round"></svg>

    );
  }
}

export default Map2;


// import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
// import * as d3 from "d3";
// import axios from "axios";
// import seattleJson from "../data/seattleJson"
// import jumpApiCache from "../data/jumpApiCache"


// class Map2 extends Component { 
//   constructor(props) {
//     super(props);
//     this.state = {
//       dots: null,
//       date: null
//     };
//   }
  
//   // width = x max minus x min 
//   // height = y max minus y min


//   componentDidMount() {
//     const coordinates = [{"x":457.6077541579306,"y":513.5174886594863},{"x":13.693361390423497,"y":111.92957928195186},{"x":35.21996769904305,"y":367.298535312491},{"x":413.0319669263189,"y":535.4995242052642},{"x":224.34627101032163,"y":576.9025564897652},{"x":413.89085859845096,"y":427.69587752898525},{"x":456.1943664933297,"y":120.62731374942786},{"x":721.2023035688427,"y":300.8682729347622},{"x":411.8876357967821,"y":104.91651426492359},{"x":333.89470794724934,"y":433.1145998503553},{"x":408.35030702788765,"y":237.05072680456115},{"x":775.4283069329742,"y":553.6802846659023},{"x":503.93988689972673,"y":330.54519308581376},{"x":619.0108218693423,"y":508.42649301696434},{"x":525.1949991900848,"y":461.0233572323813},{"x":31.158389622184046,"y":309.3826737161417},{"x":452.1870722234139,"y":570.4092912158377},{"x":146.3391591691483,"y":67.17687280841784},{"x":298.12998067835093,"y":320.70706796949884},{"x":522.8433076237043,"y":355.5571117018298},{"x":103.17688658740227,"y":471.2476371676742},{"x":344.1713833111857,"y":263.0464439386394},{"x":382.2962180894221,"y":491.1540168930684},{"x":531.3463218002233,"y":550.979988448791},{"x":85.1476051571531,"y":250.29391801246},{"x":322.40668195041326,"y":473.71886596079577},{"x":222.15241571517961,"y":555.4623400694596},{"x":334.2642549880869,"y":97.29700224695108},{"x":594.6879376562069,"y":49.07945485235703},{"x":367.4220916574887,"y":444.45797412343916},{"x":249.4739281308984,"y":598.5593595203195},{"x":352.69172207132635,"y":280.6159235590234},{"x":317.77471409607807,"y":411.46193077314865},{"x":183.68253148168722,"y":524.4404762642515},{"x":764.0372341385721,"y":259.70973524396686},{"x":414.9305457096819,"y":316.2570065555483},{"x":452.02375149441957,"y":370.3028115551287},{"x":692.9493728637175,"y":453.2459381409735},{"x":185.7043414144453,"y":400.53079004869494},{"x":754.0329339949196,"y":559.3377619142567},{"x":308.7878693405434,"y":329.28349974358065},{"x":103.1468211452312,"y":227.72396551580422},{"x":91.0047878386802,"y":569.1207331316554},{"x":549.7134447632843,"y":433.2053588507629},{"x":191.98323872748605,"y":554.4378813013662},{"x":585.3895584868417,"y":10.637521185398846},{"x":53.84060698594766,"y":265.3486055835056},{"x":566.6397889590946,"y":73.27772541560242},{"x":109.2438254124545,"y":596.1877416570017},{"x":276.8711582582906,"y":344.3211224449196}]

//     let maxX = -100000;
//     let maxY = -100000;
//     let minX = 100000;
//     let minY = 100000;

//     coordinates.forEach(set => {
//       if(set["x"] > maxX) {
//         maxX = set["x"];
//       }
//       if(set["y"] > maxY) {
//         maxY = set["y"];
//       }
//       if(set["x"] < minX) {
//         minX = set["x"];
//       }
//       if(set["y"] < minY) {
//         minY = set["y"];
//       }
//     })

//     let w = maxX - minX;
//     let h = maxY - minY;

//     console.log(maxX, maxY, minX, minY, w, h)

//     var data = [];

//     var svg = d3.select( 'svg' );
//     var width = parseInt( svg.attr( 'width' ) );
//     var height = parseInt( svg.attr( 'height' ) );

//     function updateData() {
//       for( var i = 0; i < 50; i++ ) {
//         data[i] = {
//           x: Math.random() * 800,
//           y: Math.random() * 600
//         }
//       }
//     }

//     console.log(data);
//     // array of x, y objects
    
//     console.log(coordinates)

//     function updateGraph() {
      
//       svg
//         .selectAll( 'path' )
//         .remove();
      
//       svg
//         .selectAll( 'circle' )
//         .remove();  
      
//       svg
//         .selectAll( 'circle' )
//         .data( data )
//         .enter()
//         .append( 'circle' )
//           .attr( 'cx', function( d ) { return d.x; })
//           .attr( 'cy', function( d ) { return d.y; })
//           .attr( 'r', 2 )
//           .attr( 'stroke', 'none' )
//           .attr( 'fill', 'red' );  

//       var contours = svg
//         .selectAll( 'path' )
//         .data( d3.contourDensity()
//           .x( function( d ) { return d.x; } )
//           .y( function( d ) { return d.y; } )
//           .size( [width, height] )
//           .bandwidth( 70 )
//           ( data )
//       );
      
//       contours
//         .enter()
//         .append( "path" )
//         .attr( "d", d3.geoPath() )
//         .attr( 'fill', '#300')
//         .attr( 'opacity', '0.1');
//     }

//     updateData();
//     updateGraph();

//     // setInterval( function() {
//     //   updateData();
//     //   updateGraph();
//     // }, 2000 );
//   }
      
//   render() {
//     return (
//       <svg width="39.33977866536458" height="13.956409999999998" fill="none" stroke="transparent" strokeLinejoin="round"></svg>
//     );
//   }
// }

// export default Map2;