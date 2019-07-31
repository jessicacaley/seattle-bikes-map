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
      .style("background-color", '#afd0e3')

    this.state = {
      dots: null,
      date: null,
      control: 'play',
      tfhour: 0,
      time: 434383,
      day: 22,
    };
  }

  averageDensityPerNeighborhood = {"Seattle:Ballard:Loyal Heights":0.0000013479719189875513,"Seattle:Ballard:Adams":0.000006387160442720656,"Seattle:Ballard:Whittier Heights":6.260756282061316e-7,"Seattle:Ballard:West Woodland":0.000002726768953506158,"Seattle:Ballard:Sunset Hill":0.000002578828697929724,"Seattle:University District:":0.0000015556583577318498,"Seattle:Queen Anne:East Queen Anne":0.0000010611614732669687,"Seattle:Queen Anne:West Queen Anne":0.0000012212895620221403,"Seattle:Queen Anne:Lower Queen Anne":0.0000025535949779964016,"Seattle:Queen Anne:North Queen Anne":0.0000011930544058082388,"Seattle:Cascade:Westlake":0.000002779057873323765,"Seattle:Cascade:Eastlake":0.000003512734711593166,"Seattle:Cascade:South Lake Union":0.000003015685514681956,"Seattle:Magnolia:Lawton Park":5.876181661960801e-7,"Seattle:Magnolia:Briarcliff":5.333056056770352e-7,"Seattle:Magnolia:Southeast Magnolia":3.982307919904958e-7,"Seattle:Central Area:Madrona":0.0000011637316125584927,"Seattle:Central Area:Harrison - Denny-Blaine":0.0000011535581313229331,"Seattle:Central Area:Minor":9.515948839147232e-7,"Seattle:Central Area:Leschi":0.00000168438030071587,"Seattle:Central Area:Mann":6.680424061187436e-7,"Seattle:Central Area:Atlantic":0.0000015928953122840751,"Seattle:Downtown:Pike-Market":0.000008279723321830738,"Seattle:Downtown:Belltown":0.0000045380322133204074,"Seattle:Downtown:International District":0.000004637335818941873,"Seattle:Downtown:Central Business District":0.000005947503758447992,"Seattle:Downtown:First Hill":0.0000015480558769971584,"Seattle:Downtown:Yesler Terrace":0.0000010852125308228164,"Seattle:Downtown:Pioneer Square":0.000004363340052019083,"Seattle:Interbay:":0.000001742089497549384,"Seattle:West Seattle:Seaview":4.4323265783664375e-7,"Seattle:West Seattle:Gatewood":2.750936369384769e-7,"Seattle:West Seattle:Arbor Heights":2.970176664508456e-7,"Seattle:West Seattle:Alki":0.000002049291653946715,"Seattle:West Seattle:North Admiral":4.3652701377628624e-7,"Seattle:West Seattle:Fairmount Park":2.4102483614730304e-7,"Seattle:West Seattle:Genesee":1.4705549157939396e-7,"Seattle:West Seattle:Fauntleroy":4.7100655212559314e-7,"Seattle:Beacon Hill:North Beacon Hill":3.365302057793541e-7,"Seattle:Beacon Hill:Mid-Beacon Hill":3.1418465343654333e-7,"Seattle:Beacon Hill:South Beacon Hill":9.249210715893065e-8,"Seattle:Beacon Hill:Holly Park":6.846167140866038e-7,"Seattle:Rainier Valley:Brighton":9.912975324746231e-7,"Seattle:Rainier Valley:Dunlap":9.765534776255919e-7,"Seattle:Rainier Valley:Rainier Beach":2.4898762115504494e-7,"Seattle:Rainier Valley:Rainier View":5.0907784956199684e-8,"Seattle:Rainier Valley:Mount Baker":0.0000014750544546931773,"Seattle:Rainier Valley:Columbia City":7.406222276642298e-7,"Seattle:Delridge:Highland Park":1.085026488473493e-7,"Seattle:Delridge:North Delridge":4.0559785630603675e-7,"Seattle:Delridge:Riverview":1.547425597583637e-7,"Seattle:Delridge:High Point":3.4879873736365557e-7,"Seattle:Delridge:South Delridge":1.7332221542394667e-7,"Seattle:Delridge:Roxhill":7.718968759030792e-8,"Seattle:Seward Park:":4.810909813800508e-7,"Seattle:Capitol Hill:Portage Bay":0.0000021077103975235304,"Seattle:Capitol Hill:Montlake":0.000001119468274023578,"Seattle:Capitol Hill:Madison Park":0.0000014008360369003275,"Seattle:Capitol Hill:Broadway":0.0000010826874089877805,"Seattle:Capitol Hill:Stevens":6.989811275170472e-7,"Seattle:Lake City:Victory Heights":9.791917296732945e-8,"Seattle:Lake City:Matthews Beach":2.4278062161232375e-7,"Seattle:Lake City:Meadowbrook":1.1983787732826084e-7,"Seattle:Lake City:Olympic Hills":3.139879627180517e-7,"Seattle:Lake City:Cedar Park":2.422848690369201e-7,"Seattle:Northgate:Haller Lake":5.553242956052007e-8,"Seattle:Northgate:Pinehurst":1.9939033998278438e-7,"Seattle:Northgate:North College Park":6.788264090223685e-7,"Seattle:Northgate:Maple Leaf":2.4370516266816016e-7,"Woodinville:Woodinville Heights:":0,"Woodinville:West Wellington:":0,"Woodinville:East Wellington:":0,"Woodinville:Tourist District:":4.6673877908341485e-8,"Woodinville:Reinwood Leota:":0,"Woodinville:Town Center:":0,"Woodinville:Lower West Ridge:":0,"Woodinville:North Industrial:":0,"Woodinville:Valley Industrial:":0,"Woodinville:Wedge:":0,"Algona::":0,"Auburn::":0,"Beaux Arts::":0,"Black Diamond::":0,"Bothell::":0,"Burien::":1.457259128735726e-9,"Carnation::":0,"Clyde Hill::":0,"Covington::":0,"Des Moines::":0,"Duvall::":0,"Enumclaw::":0,"Federal Way::":0,"Hunts Point::":4.2347127529706775e-9,"Issaquah::":0,"Kent::":0,"Kenmore::":2.7036754427881906e-10,"Lake Forest Park::":1.1671045859581117e-8,"Medina::":6.968709045597198e-9,"Mercer Island::":2.617506848812237e-9,"Milton::":0,"Maple Valley::":0,"North Bend::":0,"Newcastle::":0,"Normandy Park::":0,"Pacific::":0,"Redmond::":0,"Shoreline::":4.3961054652460585e-9,"Skykomish::":0,"Sammamish::":0,"Snoqualmie::":0,"SeaTac::":0,"Tukwila::":0,"Yarrow Point::":0,"Seattle:Phinney Ridge:":6.025264938093728e-7,"Seattle:Wallingford:":0.0000011145571955124527,"Seattle:Fremont:":0.0000026049673347446033,"Seattle:Green Lake:":7.354698984472631e-7,"Seattle:View Ridge:":4.99238365712558e-7,"Seattle:Ravenna:":0.000001295124007321969,"Seattle:Sand Point:":9.20624675920696e-7,"Seattle:Bryant:":8.586238932346213e-7,"Seattle:Windermere:":5.881714265998578e-7,"Seattle:Laurelhurst:":5.792374676317041e-7,"Seattle:Roosevelt:":5.501053207564293e-7,"Seattle:Georgetown:":4.2938416538686993e-7,"Seattle:South Park:":3.782757188731702e-7,"Seattle:Harbor Island:":4.247328827197259e-7,"Seattle:Wedgwood:":1.1486358801545865e-7,"Seattle:Industrial District:":0.0000017616539838755045,"Seattle:Broadview:":4.796355947422009e-8,"Seattle:Bitter Lake:":1.0513568910169546e-7,"Seattle:North Beach - Blue Ridge:":2.9259802524994534e-7,"Seattle:Crown Hill:":2.4391046012576247e-7,"Seattle:Greenwood:":4.4993117088682816e-7,"Kirkland:South Juanita:":0,"Kirkland:Kingsgate:":0,"Kirkland:North Juanita:":0,"Kirkland:Finn Hill:":0,"Kirkland:Bridle Trails:":0,"Kirkland:Central Houghton:":0,"Kirkland:Lakeview:":1.4591566180830763e-9,"Kirkland:Moss Bay:":6.99231603265012e-9,"Kirkland:Everest:":0,"Kirkland:South Rose Hill:":0,"Kirkland:North Rose Hill:":0,"Kirkland:Highlands:":0,"Kirkland:Norkirk:":0,"Kirkland:Totem Lake:":0,"Kirkland:Market:":0,"Renton:Kennydale:":0,"Renton:Valley:":0,"Renton:West Hill:":0,"Renton:Fairwood:":0,"Renton:Cedar River:":0,"Renton:City Center:":2.4799477415733833e-9,"Renton:Benson:":0,"Renton:Talbot:":0,"Renton:East Plateau:":0,"Renton:Highlands:":0,"Bellevue:West Bellevue:":8.589667554569644e-9,"Bellevue:Wilburton:":7.349255934919839e-10,"Bellevue:Woodridge:":0,"Bellevue:Newport:":7.916555592304469e-11,"Bellevue:Somerset:":0,"Bellevue:Bridle Trails:":3.1732008951445753e-10,"Bellevue:Northeast Bellevue:":0,"Bellevue:Crossroads:":0,"Bellevue:West Lake Hills:":0,"Bellevue:Factoria:":0,"Bellevue:Northwest Bellevue:":5.690951925323783e-9,"Bellevue:Sammamish - East Lake Hills:":0,"Bellevue:Eastgate - Cougar Mountain:":0,"Vashon::":0,"White Center::":5.432028906912626e-9,"Woodinville:Upper West Ridge:":0}
  width = 400;
  height = 700;
  startTime = 434383; // Mon 7/22 midnight
  endTime = 434551; // Mon 7/29 midnight
  overallMin = -0.9694559913247786;
  overallMax = 2.44897959183674;
  // overallMin = 0;
  // overallMax = 0;

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

    // console.log(this.averageDensityPerNeighborhood)

    const hoods = Object.keys(neighborhoodBikeCount)
    const comparedToAverage = {}

    hoods.forEach(hood => {
      if (neighborhoodBikeCount[hood]) {
        comparedToAverage[hood] = ((neighborhoodBikeCount[hood] - this.averageDensityPerNeighborhood[hood]) / this.averageDensityPerNeighborhood[hood]);
      } else {
        comparedToAverage[hood] = 0;
      }
    })

    console.log(comparedToAverage)
    const compToAverageValues = Object.values(comparedToAverage)

    // const maxDensity = Math.max(...compToAverageValues);
    // const minDensity = Math.min(...compToAverageValues);

    // if (maxDensity > this.overallMax) {
    //   this.overallMax = maxDensity;
    // }

    // if (minDensity < this.overallMin) {
    //   this.overallMin = minDensity;
    // }

    console.log(`max: ${this.overallMax} min: ${this.overallMin}`)
    // console.log(maxDensity, minDensity)
    
    var colorScale = d3.scaleLinear()
      // .domain([minDensity, 0, maxDensity])
      // .domain([-1, 0, 1])
      .domain([this.overallMin, 0, this.overallMax])
      .range(['red', '#fafcfa' ,'green']);
    
    // //
    // const densityValues = Object.values(neighborhoodBikeCount);

    // const maxDensity = Math.max(...densityValues);
    // const minDensity = Math.min(...densityValues);

    // // var colorScale = d3.scaleLinear().domain([0,112703512.412]).range(['beige', 'red']);
    // var colorScale = d3.scaleLinear()
    //   .domain([minDensity, maxDensity])
    //   .range(['#fafcfa', '#333']);

    const that = this;

    // Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
    g.selectAll( 'path' )
      .data(neighborhoods.features) // outline of seattle
      .enter()
      .append('path')
      .attr('fill', (d, i) => colorScale(comparedToAverage[d.id]))
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

    const timeColorScale = d3.scaleThreshold()
      .domain([5, 6, 7, 19, 20, 21]) // sunrise/sunset
      .range(['#88acc1', '#95b8cc', '#a2c4d7', '#afd0e3', '#a2c4d7', '#95b8cc', '#88acc1']);

    d3.select('body')
      .transition()
        .style("background-color", timeColorScale(this.state.tfhour))


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