import React, {Component} from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import seattleJson from '../data/seattleJson'
import neighborhoods from '../data/seattle-neighborhoods'
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
      showDetails: false,
    };
  }

  averageDensityPerNeighborhood = {"Seattle:Ballard:Loyal Heights":0.0000013479719189875513,"Seattle:Ballard:Adams":0.000006387160442720656,"Seattle:Ballard:Whittier Heights":6.260756282061316e-7,"Seattle:Ballard:West Woodland":0.000002726768953506158,"Seattle:Ballard:Sunset Hill":0.000002578828697929724,"Seattle:University District:":0.0000015556583577318498,"Seattle:Queen Anne:East Queen Anne":0.0000010611614732669687,"Seattle:Queen Anne:West Queen Anne":0.0000012212895620221403,"Seattle:Queen Anne:Lower Queen Anne":0.0000025535949779964016,"Seattle:Queen Anne:North Queen Anne":0.0000011930544058082388,"Seattle:Cascade:Westlake":0.000002779057873323765,"Seattle:Cascade:Eastlake":0.000003512734711593166,"Seattle:Cascade:South Lake Union":0.000003015685514681956,"Seattle:Magnolia:Lawton Park":5.876181661960801e-7,"Seattle:Magnolia:Briarcliff":5.333056056770352e-7,"Seattle:Magnolia:Southeast Magnolia":3.982307919904958e-7,"Seattle:Central Area:Madrona":0.0000011637316125584927,"Seattle:Central Area:Harrison - Denny-Blaine":0.0000011535581313229331,"Seattle:Central Area:Minor":9.515948839147232e-7,"Seattle:Central Area:Leschi":0.00000168438030071587,"Seattle:Central Area:Mann":6.680424061187436e-7,"Seattle:Central Area:Atlantic":0.0000015928953122840751,"Seattle:Downtown:Pike-Market":0.000008279723321830738,"Seattle:Downtown:Belltown":0.0000045380322133204074,"Seattle:Downtown:International District":0.000004637335818941873,"Seattle:Downtown:Central Business District":0.000005947503758447992,"Seattle:Downtown:First Hill":0.0000015480558769971584,"Seattle:Downtown:Yesler Terrace":0.0000010852125308228164,"Seattle:Downtown:Pioneer Square":0.000004363340052019083,"Seattle:Interbay:":0.000001742089497549384,"Seattle:West Seattle:Seaview":4.4323265783664375e-7,"Seattle:West Seattle:Gatewood":2.750936369384769e-7,"Seattle:West Seattle:Arbor Heights":2.970176664508456e-7,"Seattle:West Seattle:Alki":0.000002049291653946715,"Seattle:West Seattle:North Admiral":4.3652701377628624e-7,"Seattle:West Seattle:Fairmount Park":2.4102483614730304e-7,"Seattle:West Seattle:Genesee":1.4705549157939396e-7,"Seattle:West Seattle:Fauntleroy":4.7100655212559314e-7,"Seattle:Beacon Hill:North Beacon Hill":3.365302057793541e-7,"Seattle:Beacon Hill:Mid-Beacon Hill":3.1418465343654333e-7,"Seattle:Beacon Hill:South Beacon Hill":9.249210715893065e-8,"Seattle:Beacon Hill:Holly Park":6.846167140866038e-7,"Seattle:Rainier Valley:Brighton":9.912975324746231e-7,"Seattle:Rainier Valley:Dunlap":9.765534776255919e-7,"Seattle:Rainier Valley:Rainier Beach":2.4898762115504494e-7,"Seattle:Rainier Valley:Rainier View":5.0907784956199684e-8,"Seattle:Rainier Valley:Mount Baker":0.0000014750544546931773,"Seattle:Rainier Valley:Columbia City":7.406222276642298e-7,"Seattle:Delridge:Highland Park":1.085026488473493e-7,"Seattle:Delridge:North Delridge":4.0559785630603675e-7,"Seattle:Delridge:Riverview":1.547425597583637e-7,"Seattle:Delridge:High Point":3.4879873736365557e-7,"Seattle:Delridge:South Delridge":1.7332221542394667e-7,"Seattle:Delridge:Roxhill":7.718968759030792e-8,"Seattle:Seward Park:":4.810909813800508e-7,"Seattle:Capitol Hill:Portage Bay":0.0000021077103975235304,"Seattle:Capitol Hill:Montlake":0.000001119468274023578,"Seattle:Capitol Hill:Madison Park":0.0000014008360369003275,"Seattle:Capitol Hill:Broadway":0.0000010826874089877805,"Seattle:Capitol Hill:Stevens":6.989811275170472e-7,"Seattle:Lake City:Victory Heights":9.791917296732945e-8,"Seattle:Lake City:Matthews Beach":2.4278062161232375e-7,"Seattle:Lake City:Meadowbrook":1.1983787732826084e-7,"Seattle:Lake City:Olympic Hills":3.139879627180517e-7,"Seattle:Lake City:Cedar Park":2.422848690369201e-7,"Seattle:Northgate:Haller Lake":5.553242956052007e-8,"Seattle:Northgate:Pinehurst":1.9939033998278438e-7,"Seattle:Northgate:North College Park":6.788264090223685e-7,"Seattle:Northgate:Maple Leaf":2.4370516266816016e-7,"Woodinville:Woodinville Heights:":0,"Woodinville:West Wellington:":0,"Woodinville:East Wellington:":0,"Woodinville:Tourist District:":4.6673877908341485e-8,"Woodinville:Reinwood Leota:":0,"Woodinville:Town Center:":0,"Woodinville:Lower West Ridge:":0,"Woodinville:North Industrial:":0,"Woodinville:Valley Industrial:":0,"Woodinville:Wedge:":0,"Algona::":0,"Auburn::":0,"Beaux Arts::":0,"Black Diamond::":0,"Bothell::":0,"Burien::":1.457259128735726e-9,"Carnation::":0,"Clyde Hill::":0,"Covington::":0,"Des Moines::":0,"Duvall::":0,"Enumclaw::":0,"Federal Way::":0,"Hunts Point::":4.2347127529706775e-9,"Issaquah::":0,"Kent::":0,"Kenmore::":2.7036754427881906e-10,"Lake Forest Park::":1.1671045859581117e-8,"Medina::":6.968709045597198e-9,"Mercer Island::":2.617506848812237e-9,"Milton::":0,"Maple Valley::":0,"North Bend::":0,"Newcastle::":0,"Normandy Park::":0,"Pacific::":0,"Redmond::":0,"Shoreline::":4.3961054652460585e-9,"Skykomish::":0,"Sammamish::":0,"Snoqualmie::":0,"SeaTac::":0,"Tukwila::":0,"Yarrow Point::":0,"Seattle:Phinney Ridge:":6.025264938093728e-7,"Seattle:Wallingford:":0.0000011145571955124527,"Seattle:Fremont:":0.0000026049673347446033,"Seattle:Green Lake:":7.354698984472631e-7,"Seattle:View Ridge:":4.99238365712558e-7,"Seattle:Ravenna:":0.000001295124007321969,"Seattle:Sand Point:":9.20624675920696e-7,"Seattle:Bryant:":8.586238932346213e-7,"Seattle:Windermere:":5.881714265998578e-7,"Seattle:Laurelhurst:":5.792374676317041e-7,"Seattle:Roosevelt:":5.501053207564293e-7,"Seattle:Georgetown:":4.2938416538686993e-7,"Seattle:South Park:":3.782757188731702e-7,"Seattle:Harbor Island:":4.247328827197259e-7,"Seattle:Wedgwood:":1.1486358801545865e-7,"Seattle:Industrial District:":0.0000017616539838755045,"Seattle:Broadview:":4.796355947422009e-8,"Seattle:Bitter Lake:":1.0513568910169546e-7,"Seattle:North Beach - Blue Ridge:":2.9259802524994534e-7,"Seattle:Crown Hill:":2.4391046012576247e-7,"Seattle:Greenwood:":4.4993117088682816e-7,"Kirkland:South Juanita:":0,"Kirkland:Kingsgate:":0,"Kirkland:North Juanita:":0,"Kirkland:Finn Hill:":0,"Kirkland:Bridle Trails:":0,"Kirkland:Central Houghton:":0,"Kirkland:Lakeview:":1.4591566180830763e-9,"Kirkland:Moss Bay:":6.99231603265012e-9,"Kirkland:Everest:":0,"Kirkland:South Rose Hill:":0,"Kirkland:North Rose Hill:":0,"Kirkland:Highlands:":0,"Kirkland:Norkirk:":0,"Kirkland:Totem Lake:":0,"Kirkland:Market:":0,"Renton:Kennydale:":0,"Renton:Valley:":0,"Renton:West Hill:":0,"Renton:Fairwood:":0,"Renton:Cedar River:":0,"Renton:City Center:":2.4799477415733833e-9,"Renton:Benson:":0,"Renton:Talbot:":0,"Renton:East Plateau:":0,"Renton:Highlands:":0,"Bellevue:West Bellevue:":8.589667554569644e-9,"Bellevue:Wilburton:":7.349255934919839e-10,"Bellevue:Woodridge:":0,"Bellevue:Newport:":7.916555592304469e-11,"Bellevue:Somerset:":0,"Bellevue:Bridle Trails:":3.1732008951445753e-10,"Bellevue:Northeast Bellevue:":0,"Bellevue:Crossroads:":0,"Bellevue:West Lake Hills:":0,"Bellevue:Factoria:":0,"Bellevue:Northwest Bellevue:":5.690951925323783e-9,"Bellevue:Sammamish - East Lake Hills:":0,"Bellevue:Eastgate - Cougar Mountain:":0,"Vashon::":0,"White Center::":5.432028906912626e-9,"Woodinville:Upper West Ridge:":0}
  width = 400;
  height = 700;
  startTime = 434383; // Mon 7/22 midnight
  endTime = 434551; // Mon 7/29 midnight
  // overallMin = -0.9694559913247786;
  // overallMax = 2.44897959183674;
  overallMin = 0;
  overallMax = 0.000010910152128112334;
  totalNumOfBikes = {"Seattle:Ballard:Loyal Heights":4857,"Seattle:Ballard:Adams":24213,"Seattle:Ballard:Whittier Heights":1502,"Seattle:Ballard:West Woodland":10230,"Seattle:Ballard:Sunset Hill":10606,"Seattle:University District:":12974,"Seattle:Queen Anne:East Queen Anne":3471,"Seattle:Queen Anne:West Queen Anne":3710,"Seattle:Queen Anne:Lower Queen Anne":7559,"Seattle:Queen Anne:North Queen Anne":5969,"Seattle:Cascade:Westlake":1712,"Seattle:Cascade:Eastlake":4409,"Seattle:Cascade:South Lake Union":8209,"Seattle:Magnolia:Lawton Park":5471,"Seattle:Magnolia:Briarcliff":2393,"Seattle:Magnolia:Southeast Magnolia":1243,"Seattle:Central Area:Madrona":2723,"Seattle:Central Area:Harrison - Denny-Blaine":2652,"Seattle:Central Area:Minor":2884,"Seattle:Central Area:Leschi":5150,"Seattle:Central Area:Mann":1257,"Seattle:Central Area:Atlantic":5563,"Seattle:Downtown:Pike-Market":3279,"Seattle:Downtown:Belltown":11484,"Seattle:Downtown:International District":4835,"Seattle:Downtown:Central Business District":9526,"Seattle:Downtown:First Hill":2490,"Seattle:Downtown:Yesler Terrace":981,"Seattle:Downtown:Pioneer Square":8461,"Seattle:Interbay:":9864,"Seattle:West Seattle:Seaview":1383,"Seattle:West Seattle:Gatewood":1061,"Seattle:West Seattle:Arbor Heights":1315,"Seattle:West Seattle:Alki":8514,"Seattle:West Seattle:North Admiral":3584,"Seattle:West Seattle:Fairmount Park":658,"Seattle:West Seattle:Genesee":526,"Seattle:West Seattle:Fauntleroy":2697,"Seattle:Beacon Hill:North Beacon Hill":2757,"Seattle:Beacon Hill:Mid-Beacon Hill":2794,"Seattle:Beacon Hill:South Beacon Hill":601,"Seattle:Beacon Hill:Holly Park":977,"Seattle:Rainier Valley:Brighton":3077,"Seattle:Rainier Valley:Dunlap":3235,"Seattle:Rainier Valley:Rainier Beach":1394,"Seattle:Rainier Valley:Rainier View":157,"Seattle:Rainier Valley:Mount Baker":7226,"Seattle:Rainier Valley:Columbia City":4682,"Seattle:Delridge:Highland Park":730,"Seattle:Delridge:North Delridge":2019,"Seattle:Delridge:Riverview":864,"Seattle:Delridge:High Point":1376,"Seattle:Delridge:South Delridge":525,"Seattle:Delridge:Roxhill":245,"Seattle:Seward Park:":3564,"Seattle:Capitol Hill:Portage Bay":1575,"Seattle:Capitol Hill:Montlake":3739,"Seattle:Capitol Hill:Madison Park":5843,"Seattle:Capitol Hill:Broadway":5533,"Seattle:Capitol Hill:Stevens":3076,"Seattle:Lake City:Victory Heights":356,"Seattle:Lake City:Matthews Beach":1271,"Seattle:Lake City:Meadowbrook":345,"Seattle:Lake City:Olympic Hills":1371,"Seattle:Lake City:Cedar Park":837,"Seattle:Northgate:Haller Lake":443,"Seattle:Northgate:Pinehurst":992,"Seattle:Northgate:North College Park":2490,"Seattle:Northgate:Maple Leaf":1416,"Woodinville:Woodinville Heights:":0,"Woodinville:West Wellington:":0,"Seattle:Phinney Ridge:":3271,"Seattle:Wallingford:":7924,"Seattle:Fremont:":11668,"Seattle:Green Lake:":4638,"Seattle:View Ridge:":2161,"Seattle:Ravenna:":8103,"Seattle:Sand Point:":2995,"Seattle:Bryant:":2247,"Seattle:Windermere:":2223,"Seattle:Laurelhurst:":1865,"Seattle:Roosevelt:":1998,"Seattle:Georgetown:":3723,"Seattle:South Park:":1881,"Seattle:Harbor Island:":1280,"Seattle:Wedgwood:":594,"Seattle:Industrial District:":32013,"Seattle:Broadview:":390,"Seattle:Bitter Lake:":492,"Seattle:North Beach - Blue Ridge:":1536,"Seattle:Crown Hill:":654,"Seattle:Greenwood:":3197}
  totalAvgNumOfBikes = {"Seattle:Ballard:Loyal Heights":28.7396449704142,"Seattle:Ballard:Adams":143.27218934911244,"Seattle:Ballard:Whittier Heights":8.887573964497042,"Seattle:Ballard:West Woodland":60.532544378698226,"Seattle:Ballard:Sunset Hill":62.75739644970414,"Seattle:University District:":76.76923076923077,"Seattle:Queen Anne:East Queen Anne":20.53846153846154,"Seattle:Queen Anne:West Queen Anne":21.952662721893493,"Seattle:Queen Anne:Lower Queen Anne":44.72781065088758,"Seattle:Queen Anne:North Queen Anne":35.319526627218934,"Seattle:Cascade:Westlake":10.1301775147929,"Seattle:Cascade:Eastlake":26.088757396449704,"Seattle:Cascade:South Lake Union":48.57396449704142,"Seattle:Magnolia:Lawton Park":32.37278106508876,"Seattle:Magnolia:Briarcliff":14.159763313609467,"Seattle:Magnolia:Southeast Magnolia":7.355029585798817,"Seattle:Central Area:Madrona":16.11242603550296,"Seattle:Central Area:Harrison - Denny-Blaine":15.692307692307692,"Seattle:Central Area:Minor":17.06508875739645,"Seattle:Central Area:Leschi":30.473372781065088,"Seattle:Central Area:Mann":7.437869822485207,"Seattle:Central Area:Atlantic":32.917159763313606,"Seattle:Downtown:Pike-Market":19.402366863905325,"Seattle:Downtown:Belltown":67.95266272189349,"Seattle:Downtown:International District":28.609467455621303,"Seattle:Downtown:Central Business District":56.366863905325445,"Seattle:Downtown:First Hill":14.733727810650887,"Seattle:Downtown:Yesler Terrace":5.804733727810651,"Seattle:Downtown:Pioneer Square":50.06508875739645,"Seattle:Interbay:":58.366863905325445,"Seattle:West Seattle:Seaview":8.183431952662723,"Seattle:West Seattle:Gatewood":6.27810650887574,"Seattle:West Seattle:Arbor Heights":7.781065088757397,"Seattle:West Seattle:Alki":50.37869822485207,"Seattle:West Seattle:North Admiral":21.207100591715978,"Seattle:West Seattle:Fairmount Park":3.893491124260355,"Seattle:West Seattle:Genesee":3.1124260355029585,"Seattle:West Seattle:Fauntleroy":15.958579881656805,"Seattle:Beacon Hill:North Beacon Hill":16.31360946745562,"Seattle:Beacon Hill:Mid-Beacon Hill":16.532544378698226,"Seattle:Beacon Hill:South Beacon Hill":3.5562130177514795,"Seattle:Beacon Hill:Holly Park":5.781065088757397,"Seattle:Rainier Valley:Brighton":18.207100591715978,"Seattle:Rainier Valley:Dunlap":19.142011834319526,"Seattle:Rainier Valley:Rainier Beach":8.248520710059172,"Seattle:Rainier Valley:Rainier View":0.9289940828402367,"Seattle:Rainier Valley:Mount Baker":42.75739644970414,"Seattle:Rainier Valley:Columbia City":27.70414201183432,"Seattle:Delridge:Highland Park":4.319526627218935,"Seattle:Delridge:North Delridge":11.946745562130177,"Seattle:Delridge:Riverview":5.112426035502959,"Seattle:Delridge:High Point":8.142011834319527,"Seattle:Delridge:South Delridge":3.106508875739645,"Seattle:Delridge:Roxhill":1.4497041420118344,"Seattle:Seward Park:":21.088757396449704,"Seattle:Capitol Hill:Portage Bay":9.319526627218934,"Seattle:Capitol Hill:Montlake":22.124260355029588,"Seattle:Capitol Hill:Madison Park":34.57396449704142,"Seattle:Capitol Hill:Broadway":32.739644970414204,"Seattle:Capitol Hill:Stevens":18.201183431952664,"Seattle:Lake City:Victory Heights":2.106508875739645,"Seattle:Lake City:Matthews Beach":7.520710059171598,"Seattle:Lake City:Meadowbrook":2.0414201183431953,"Seattle:Lake City:Olympic Hills":8.112426035502958,"Seattle:Lake City:Cedar Park":4.952662721893491,"Seattle:Northgate:Haller Lake":2.621301775147929,"Seattle:Northgate:Pinehurst":5.8698224852071,"Seattle:Northgate:North College Park":14.733727810650887,"Seattle:Northgate:Maple Leaf":8.378698224852071,"Woodinville:Woodinville Heights:":0,"Woodinville:West Wellington:":0,"Seattle:Phinney Ridge:":19.355029585798817,"Seattle:Wallingford:":46.887573964497044,"Seattle:Fremont:":69.0414201183432,"Seattle:Green Lake:":27.443786982248522,"Seattle:View Ridge:":12.78698224852071,"Seattle:Ravenna:":47.946745562130175,"Seattle:Sand Point:":17.72189349112426,"Seattle:Bryant:":13.29585798816568,"Seattle:Windermere:":13.153846153846153,"Seattle:Laurelhurst:":11.035502958579881,"Seattle:Roosevelt:":11.822485207100591,"Seattle:Georgetown:":22.02958579881657,"Seattle:South Park:":11.1301775147929,"Seattle:Harbor Island:":7.57396449704142,"Seattle:Wedgwood:":3.514792899408284,"Seattle:Industrial District:":189.42603550295857,"Seattle:Broadview:":2.3076923076923075,"Seattle:Bitter Lake:":2.911242603550296,"Seattle:North Beach - Blue Ridge:":9.088757396449704,"Seattle:Crown Hill:":3.8698224852071004,"Seattle:Greenwood:":18.91715976331361}

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

    if(this.state.neighborhood) {
      d3.select('.bike-info')
        .html('')

      d3.select('.bike-info')
        .append('text')
        .html(() => `
          <li>neighborhood: <b>${this.state.neighborhood.properties.name}</b></li>
          <li>average # of bikes: <b>${Math.round(this.totalAvgNumOfBikes[this.state.neighborhood.id])}</b></li>
          <li>current # of bikes: <b>${this.state.numOfBikes[this.state.neighborhood.id]}</b></li>
        `);
    }
    
    const tip = d3Tip();

    tip.attr("class", "d3-tip")
      .html((d) => {
        return d.properties.name
        // (
        //   <div>
        //     <p>{d.properties.name}</p>
        //     <p>{d.properties.number}</p>
        //     <p>{d.properties.average}</p>
        //   </div>
        // );
      })
   
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

    let bikeDensity = {}
    let numOfBikes = {}

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

        bikeDensity[feature.id] = bikeCount / feature.properties.area;
        numOfBikes[feature.id] = bikeCount;
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
            if (bikeDensity[feature.id]) {
              bikeDensity[feature.id] += bikeCount / feature.properties.area;
            } else {
              bikeDensity[feature.id] = bikeCount / feature.properties.area;
            }
            if (numOfBikes[feature.id]) {
              numOfBikes[feature.id] += bikeCount;
            } else {
              numOfBikes[feature.id] = bikeCount;
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

              

              if (bikeDensity[feature.id]) {
                bikeDensity[feature.id] += bikeCount / feature.properties.area;
              } else {
                bikeDensity[feature.id] = bikeCount / feature.properties.area;
              }

              if (numOfBikes[feature.id]) {
                numOfBikes[feature.id] += bikeCount;
              } else {
                numOfBikes[feature.id] = bikeCount;
              }
            })
          }
        })
      }
    })

    this.setState({ numOfBikes: numOfBikes })

    // console.log(this.averageDensityPerNeighborhood)

    const hoods = Object.keys(bikeDensity);
    // const hoods = Object.keys(numOfBikes);

    // hoods.forEach(hood => {
      // if (this.totalNumOfBikes[hood]) {
      //   this.totalNumOfBikes[hood] += numOfBikes[hood];
      // } else {
        // this.totalNumOfBikes[hood] -= numOfBikes[hood];
      // }
      // this.totalAvgNumOfBikes[hood] = this.totalNumOfBikes[hood] / 169;
    // })

    // console.log(this.totalAvgNumOfBikes)

    // const comparedToAverage = {}

    // hoods.forEach(hood => {
    //   if (bikeDensity[hood]) {
    //     comparedToAverage[hood] = ((bikeDensity[hood] - this.averageDensityPerNeighborhood[hood]) / this.averageDensityPerNeighborhood[hood]);
    //   } else {
    //     comparedToAverage[hood] = 0;
    //   }
    // })


    let percentageChange = {}
    hoods.forEach(hood => {
      if (this.totalAvgNumOfBikes[hood]) {
        percentageChange[hood] = ((this.totalAvgNumOfBikes[hood] - numOfBikes[hood]) / this.totalAvgNumOfBikes[hood]) * 100;
      } else {
        percentageChange[hood] = 0;
      }
    })

    console.log(this.state)
    const bikeDensityValues = Object.values(bikeDensity)

    const maxDensity = Math.max(...bikeDensityValues);
    const minDensity = Math.min(...bikeDensityValues);

    // const maxDensity = Math.max(...percentageChangeValues);
    // const minDensity = Math.min(...percentageChangeValues);


    // if (maxDensity > this.overallMax) {
    //   this.overallMax = maxDensity;
    // }
    // if (minDensity < this.overallMin) {
    //   this.overallMin = minDensity;
    // }

    // const densityValues = Object.values(bikeDensity);

    // const maxDensity = Math.max(...densityValues);
    // const minDensity = Math.min(...densityValues);
  
    var colorScale = d3.scaleLinear()
      .domain([this.overallMin, this.overallMax])
      .range(['#fafcfa', 'orange'])
    
    // var colorScale = d3.scaleLog()
    //   .domain([this.overallMin, this.overallMax])
    //   .range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
    //   .interpolate(d3.interpolateHcl);
    // //

    

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
      .attr('fill', (d, i) => colorScale(bikeDensity[d.id]))
      .attr('stroke', 'grey')     
      .attr('stroke-width', 1) 
      // .attr('stroke-width', function(d) {
      //   if (that.state.neighborhood && d.id === that.state.neighborhood.id) {
      //     return 3;
      //   } else {
      //     return 1;
      //   }
      // })
      .attr('d', path)
      // .attr('name', (d) => d.id)
      // .attr('average', (d) => that.totalAvgNumOfBikes[d.id])
      // .attr('num', (d) => numOfBikes[d.id])
      // .attr('change', (d) => percentageChange[d.id])
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
      .on('click', function(d) {
        that.setState({ neighborhood: d });

        d3.select('.bike-info')
          .html('');

        d3.select('.bike-info')
          .append('text')
          .html(() => `
            <li>neighborhood: <b>${d.properties.name}</b></li>
            <li>average # of bikes: <b>${Math.round(that.totalAvgNumOfBikes[d.id])}</b></li>
            <li>current # of bikes: <b>${numOfBikes[d.id]}</b></li>
          `);
        // NOTE: Percentage change is wildly innaccurate here!
        that.revealDetails();        
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

  revealDetails = () => {
    if (!this.state.showDetails) this.setState({ showDetails: true });
  }

  hideDetails = () => {
    if (this.state.showDetails) this.setState({ showDetails: false });
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
                <div className="controls-progress">
                  <ProgressBar min={this.startTime} max={this.endTime} now={this.state.time} className="custom-progress-bar custom-progress-bar__neighborhood" variant="secondary" />
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
              <div className={`btn-group buttons show-or-hide ${this.state.neighborhood ? 'visible' : 'invisible'}`}>
                <button className={`btn btn-sm ${!this.state.showDetails ? 'visible' : 'invisible'}`} onClick={this.revealDetails}>Show Neighborhood Details</button>
                <button className={`btn btn-sm ${this.state.showDetails ? 'visible' : 'invisible'}`} onClick={this.hideDetails}>Hide Neighborhood Details</button>
              </div>
              <div className={`current-bike ${this.state.showDetails ? 'visible' : 'invisible'}`}>
                <ul className="bike-info">
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
    )
  }
}

export default Neighborhoods;