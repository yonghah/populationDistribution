import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import { LineChart, Line, XAxis, YAxis} from 'recharts';

mapboxgl.accessToken = 'pk.eyJ1IjoieW9uZ2hhaCIsImEiOiJjaW52MTNlbnQxM2FtdWttM2loYnljeXNvIn0.chjRTLaOQ6oIaPa0r0Ggnw';


class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displaySidebar: true,
      lng: 127,
      lat: 37.5,
      zoom: 10.5,
      opacityBaseGrid: 0.15,
      opacityPopGrid: 0.7,
      magnifyBaseGrid: 1.02,
      magnifyPopGrid: 1,
      yearCurrent: "pop2019",
      yearReference: "pop2000",
      allowance: 0.2,
      plusColor: "#5577AA",
      minusColor: "#AA6655",
      grayColor: "#BBBBBB",
      popInView: null,
    };
  }
  mapMoved = (lat, lng, zoom)=>{
    this.setState({
      lng: lng,
      lat: lat,
      zoom: zoom
    });
  }
  yearCurrentChanged = (e)=>{
    this.setState({
      yearCurrent: e.target.value
    });
  }
  yearReferenceChanged = (e)=>{
    this.setState({
      yearReference: e.target.value
    });
  }
  opacityBaseGridChanged = (e)=>{
    this.setState({
      opacityBaseGrid: +e.target.value
    });
  }
  opacityPopGridChanged = (e)=>{
    this.setState({
      opacityPopGrid: +e.target.value
    });
  }
  allowanceChanged = (e)=>{
    this.setState({
      allowance: +e.target.value
    });
  }
  plusColorChanged = (e)=>{
    this.setState({
      plusColor: e.target.value
    });
  }
  minusColorChanged = (e)=>{
    this.setState({
      minusColor: e.target.value
    });
  }
  grayColorChanged = (e)=>{
    this.setState({
      grayColor: e.target.value
    });
  }
  magnifyPopGridChanged = (e)=>{
    this.setState({
      magnifyPopGrid: +e.target.value
    });
  }
  makeGridColorStyle(ycur, yref, allowance, plusColor, minusColor, grayColor) {
    if (yref === 'pop0000') {
      return plusColor
    } else {
      let year_diff = ['-', ['number', ['get', ycur]], ['number', ['get', yref]]];
      let year_diff_rate = ['/', year_diff, ['+', ['number', ['get', yref]], .0001]];
      return ["case",
        ['boolean', ['>', year_diff_rate, allowance], true], plusColor,
        ['boolean', ['<', year_diff_rate, -allowance], true], minusColor,
        grayColor,
      ];
    }
  }
  makeGridRadiusStyle(ycur, yref, magnify) {
    let year_diff;
    if (yref === 'pop0000') {
      year_diff = ['number', ['get', ycur]];
    } else {
      year_diff = ['-', ['number', ['get', ycur]], ['number', ['get', yref]]];
    }
    let year_diff_abs = ['abs', year_diff];
    return ['interpolate',  ["exponential", 2] , ['zoom'],
      8,  ['/', ['sqrt', year_diff_abs], 32   / magnify],
      17, ['/', ['sqrt', year_diff_abs], 0.25 / magnify] 
    ]
  }
  aggregateChanged = (result) => {
    this.setState({
      popInView: result
    });
  }
  topButtonClicked = () => {
    this.setState({
      displaySidebar: !this.state.displaySidebar
    })
  }
  render(){
    const lat = this.state.lat;
    const lng = this.state.lng;
    const zoom = this.state.zoom;
    const yearCurrent = this.state.yearCurrent;
    const yearReference = this.state.yearReference;
    const opacityBaseGrid = this.state.opacityBaseGrid;
    const opacityPopGrid  = this.state.opacityPopGrid;
    const allowance  = this.state.allowance;
    const magnifyBaseGrid = this.state.magnifyBaseGrid;
    const magnifyPopGrid  = this.state.magnifyPopGrid;
    const sidebarStyle = this.state.displaySidebar? 'sidebarStyle'  : 'sidebarStyle hidden'
    const colorStyle = this.makeGridColorStyle(
      yearCurrent, 
      yearReference,
      this.state.allowance,
      this.state.plusColor,
      this.state.minusColor,
      this.state.grayColor
    );
    const radiusStyle = this.makeGridRadiusStyle(
      yearCurrent, 
      yearReference,
      this.state.magnifyPopGrid
    );
    return(
      <div>
        <div className={sidebarStyle}>
          <fieldset>
            <legend>비교 연도 선택 </legend>
            <YearCurrentSelector 
              yearCurrent={yearCurrent} 
              onChange={this.yearCurrentChanged}
            />
            <YearReferenceSelector 
              yearReference={yearReference} 
              onChange={this.yearReferenceChanged}
            />
            <p>선택한 대상연도와 기준연도의 인구 차이가 지도에 표시됩니다.</p>
            <p>기준연도 '없음'을 선택할 경우, (대상연도 - 기준연도) 인구변화가 아닌 대상연도의 인구의 값이 지도에 표시됩니다.</p>
          </fieldset>
          <fieldset>
            <legend> 현재 영역 인구 변화</legend> 
            <PopInViewDisplay
              popInView={this.state.popInView}
            />
          </fieldset>
          <fieldset>
            <legend> 바탕 그리드 </legend>
            <OpacityBaseGridSlider 
              opacityBaseGrid={opacityBaseGrid} 
              onChange={this.opacityBaseGridChanged}
            />
            <p> 250m 그리드를 표시하고 색상을 통해 인구 증감의 방향을 표현합니다</p>
          </fieldset>
          <fieldset>
            <legend> 비례 그리드 </legend>
            <OpacityPopGridSlider 
              opacityPopGrid={opacityPopGrid} 
              onChange={this.opacityPopGridChanged}
            />
            <MagnifyPopGridSlider 
              magnifyPopGrid={magnifyPopGrid} 
              onChange={this.magnifyPopGridChanged}
            />
            <p>인구 증감의 절대량을 원의 크기로 표현하고 색상을 통해 인구 증감의 방향을 표시합니다.</p>
          </fieldset>
          <fieldset>
            <legend> 색상 </legend>
            <PlusColorPicker 
              allowance={allowance} 
              plusColor={this.state.plusColor}
              onChange={this.plusColorChanged}
            />
            <MinusColorPicker 
              allowance={allowance} 
              minusColor={this.state.minusColor}
              onChange={this.minusColorChanged}
            />
            <GrayColorPicker 
              allowance={allowance} 
              grayColor={this.state.grayColor}
              onChange={this.grayColorChanged}
            />
            <AllowanceSlider 
              allowance={allowance} 
              onChange={this.allowanceChanged}
            />
          </fieldset>
          <p> 그리드 인구 데이터 및 시각화 아이디어는 <a href = "https://github.com/vuski/populationDistribution">김승범 박사님의 작업</a>에서 가져온 것입니다. 
                이 데이터를 가공, 표시하는 과정에서 오류가 있을 수 있습니다. 
          <a href="https://twitter.com/pathoverlap"> -- @pathoverlap</a> -  
          <a href="https://github.com/yonghah/populationDistribution">github</a></p>
        
        </div>
        <button onClick={this.topButtonClicked} className="openbtn">&#9776; 한국의 인구분포 변화</button>
        <Map 
          lng={lng} lat={lat} zoom={zoom} 
          yearCurrent={yearCurrent}
          yearReference={yearReference}
          opacityBaseGrid={opacityBaseGrid} 
          opacityPopGrid={opacityPopGrid} 
          allowance={allowance} 
          magnifyBaseGrid={magnifyBaseGrid} 
          magnifyPopGrid={magnifyPopGrid} 
          gridColorStyle={colorStyle}
          gridRadiusStyle={radiusStyle}
          onAggregateChange={this.aggregateChanged}
          onMove={this.mapMoved} />
      </div>
    )
  }
}


class YearCurrentSelector extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const yearCurrent = this.props.yearCurrent;
    return (
      <div>
          <label>대상연도</label>
          <select value={yearCurrent} onChange={this.props.onChange}>
            <option value="pop2000">2000</option>
            <option value="pop2005">2005</option>
            <option value="pop2010">2010</option>
            <option value="pop2015">2015</option>
            <option value="pop2016">2016</option>
            <option value="pop2017">2017</option>
            <option value="pop2018">2018</option>
            <option value="pop2019">2019</option>
          </select>
      </div >
    );
  }
}


class YearReferenceSelector extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const yearReference = this.props.yearReference;
    return (
      <div>
          <label>기준연도</label>
          <select value={yearReference} onChange={this.props.onChange}>
            <option value="pop0000">없음</option>
            <option value="pop2000">2000</option>
            <option value="pop2005">2005</option>
            <option value="pop2010">2010</option>
            <option value="pop2015">2015</option>
            <option value="pop2016">2016</option>
            <option value="pop2017">2017</option>
            <option value="pop2018">2018</option>
            <option value="pop2019">2019</option>
          </select>
      </div>
    );
  }
}


class OpacityBaseGridSlider extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const opacity = this.props.opacityBaseGrid;
    return (
      <div>
        <label>불투명도</label>
        <input 
          type="range" 
          min="0" max="1" step="0.05" 
          value={opacity} 
          onChange={this.props.onChange} 
        />
      </div>
    );
  }
}


class OpacityPopGridSlider extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const opacity = this.props.opacityPopGrid;
    return (
      <div>
        <label>불투명도</label>
        <input 
          type="range" 
          min="0" max="1" step="0.05" 
          value={opacity} 
          onChange={this.props.onChange} 
        />
      </div>
    );
  }
}


class AllowanceSlider extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const allowance = this.props.allowance;
    return (
      <div>
        <label>문턱값</label>
        <input 
          type="range" 
          min="0" max="0.5" step="0.05" 
          value={allowance} 
          onChange={this.props.onChange} 
        />
      </div>
    );
  }
}

class PlusColorPicker extends React.Component {
  render() {
    const color = this.props.plusColor;
    const allowance = this.props.allowance;
    return (
      <div>
        <input type="color" value={color} 
          onChange={this.props.onChange}/>
        <label>{allowance*100}% 이상의 인구 증가</label>
      </div>
    );
  }
}


class MinusColorPicker extends React.Component {
  render() {
    const color = this.props.minusColor;
    const allowance = this.props.allowance;
    return (
      <div>
        <input type="color" value={color} 
          onChange={this.props.onChange}/>
        <label>{allowance*100}% 이상의 인구 감소</label>
      </div>
    );
  }
}


class GrayColorPicker extends React.Component {
  render() {
    const color = this.props.grayColor;
    const allowance = this.props.allowance;
    return (
      <div>
        <input type="color" value={color} 
          onChange={this.props.onChange}/>
        <label>{allowance*100}% 미만의 인구 변화</label>
      </div>
    );
  }
}



class MagnifyPopGridSlider extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const magnify = this.props.magnifyPopGrid;
    return (
      <div>
        <label>확대 배율</label>
        <input 
          type="range" 
          min="0" max="3" step="0.05" 
          value={magnify} 
          onChange={this.props.onChange} 
        />
      </div>
    );
  }
}


class PopInViewDisplay extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    if ((this.props.popInView) && (this.props.popInView.length >0)){
      let pops = this.props.popInView;
      const popBase = Math.max(pops[0].pop, 1);
      pops.forEach((pop)=>{
        pop.popIndex = pop.pop / popBase * 100;
      });
      let listItems = pops.map((pop)=>{
        return (<tr key={pop.year}> 
          <th >{pop.year} </th> 
          <td>{pop.pop.toLocaleString()}</td>
        </tr>)});
     
      return (
        <div>
          <LineChart width={170} height={80} data={this.props.popInView}>
            <Line 
              type="monotone" 
              dataKey="popIndex" 
              dot={{r:2 }}
              stroke="#883322"/>
            <XAxis 
              dataKey="year" 
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              hide={true}
              domain={[0, 'auto']}
            />
          </LineChart>
        <table className='popTable'>
          <tbody>{listItems}</tbody>
        </table>
        </div>
      );
    } else {
      return <p>더 줌인해야 표시됩니다</p>
    }
  }
}


class Map extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //   };
  // }
  handleAggregation() {
    let agg = this.aggregatePopInView();
    this.props.onAggregateChange(agg);
  }
  aggregatePopInView() {
    if (this.map.getZoom() > 11) {
      var features = this.map.queryRenderedFeatures({ layers: ['baseGrid'] });
      if (features) {
        let uniqueFeatures = this.getUniqueFeatures(features, 'fid');
        let data = uniqueFeatures.map(item => item.properties);
        var result = data.reduce(
          (acc, n)=>{
            for (var prop in n) {
              if ((prop === 'fid') || (prop === '__proto__')) {continue;}
              if (acc.hasOwnProperty(prop)) {
                acc[prop] += n[prop];
              } else {
                acc[prop] = n[prop];
              }
            }
            return acc
          },
          {}
        );
        var records = Object.keys(result).map((key)=>{return {
          'year': parseInt(key.replace("pop", "")),
          'pop': parseInt(result[key])
        }});
        return records
      }
    }
  }
  getUniqueFeatures(array, comparatorProperty) {
    var existingFeatureKeys = {};
    var uniqueFeatures = array.filter(function (el) {
        if (existingFeatureKeys[el.properties[comparatorProperty]]) {
            return false;
        } else {
            existingFeatureKeys[el.properties[comparatorProperty]] = true;
            return true;
        }
    });    
    return uniqueFeatures;
  }
  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/yonghah/ckisyamx11efv19o84dvqzosh',   // light 
      center: [this.props.lng, this.props.lat],
      zoom: this.props.zoom
    });
    const map = this.map;
    map.on('move', ()=>{
      this.props.onMove(
        map.getCenter().lng.toFixed(4), 
        map.getCenter().lat.toFixed(4),
        map.getZoom().toFixed(2)
      );
    })
    map.on('moveend', ()=>{
      this.handleAggregation();
    })
    map.on('load', () => {
      var vectorTileUrl =  
        document.location.protocol + 
        "//" + document.location.host + 
        "/tiles/{z}/{x}/{y}.pbf";
      map.addSource('grid', {
        type: 'vector',
        tiles: [vectorTileUrl],
        minzoom: 5,
        maxzoom: 13
      });
      map.addLayer({
        id: 'baseGrid',
        type: 'circle',
        source: 'grid',
        'source-layer': 'popu250grid_stacked',
        minzoom: 5,
        maxzoom: 18,
        paint: {
          'circle-radius': [
            'interpolate', 
            ['exponential', 2], 
            ['zoom'], 
            8, 1 * this.props.magnifyBaseGrid,
            19, 1024 * this.props.magnifyBaseGrid
          ],
          'circle-opacity': this.props.opacityBaseGrid,
          'circle-color': this.props.gridColorStyle,
          'circle-pitch-alignment': 'map'

        }
      });
      map.addLayer({
        id: 'popGrid',
        type: 'circle',
        source: 'grid',
        'source-layer': 'popu250grid_stacked',
        minzoom: 5,
        maxzoom: 18,
        paint: {
          'circle-radius': this.props.gridRadiusStyle,
          'circle-opacity': this.props.opacityPopGrid,
          'circle-color': this.props.gridColorStyle,
          'circle-pitch-alignment': 'map'
        }
      });
      map.on('click', 'baseGrid', e=> {
        var feature = e.features[0];
        var coordinates = feature.geometry.coordinates.slice();
        var properties = Object.keys(feature.properties).map((key) => {
          return "<tr>" + 
            "<th>" + key.replace("pop", "") + "</th>" +
            "<td>" + Math.round(feature.properties[key]) + "</td>" +
            "</tr"
        });
        console.log(feature.properties);
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            "<div class='popup'><table><tbody>" + 
            properties.join(' ') +
            "</tbody></table></div>"
            )
          .addTo(map);
      });
      map.on('mouseenter', 'baseGrid', function () {
          map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'baseGrid', function () {
          map.getCanvas().style.cursor = '';
      });
    });
  }
  componentDidUpdate(prevProps) {
    if (
      (this.props.yearCurrent !== prevProps.yearCurrent) ||
      (this.props.yearReference !== prevProps.yearReference) 
    ){
      this.map.setPaintProperty(
        'popGrid', 
        'circle-color', 
        this.props.gridColorStyle);
      this.map.setPaintProperty(
        'baseGrid', 
        'circle-color', 
        this.props.gridColorStyle);
      this.map.setPaintProperty(
        'popGrid', 
        'circle-radius', 
        this.props.gridRadiusStyle);
    }
    if (this.props.opacityBaseGrid !== prevProps.opacityBaseGrid) {
      this.map.setPaintProperty(
        'baseGrid', 
        'circle-opacity', 
        this.props.opacityBaseGrid);
    }
    if (this.props.opacityPopGrid !== prevProps.opacityPopGrid) {
      this.map.setPaintProperty(
        'popGrid', 
        'circle-opacity', 
        this.props.opacityPopGrid);
    }
    if (this.props.gridColorStyle !== prevProps.gridColorStyle) {
      this.map.setPaintProperty(
        'popGrid', 
        'circle-color', 
        this.props.gridColorStyle);
      this.map.setPaintProperty(
        'baseGrid', 
        'circle-color', 
        this.props.gridColorStyle);
    }
    if (this.props.magnifyPopGrid !== prevProps.magnifyPopGrid) {
      this.map.setPaintProperty(
        'popGrid', 
        'circle-radius', 
        this.props.gridRadiusStyle);
    }
  }
  render(){
    return(
      <div 
        ref={el => this.mapContainer = el} 
        className='mapContainer' 
      />
    )
  }
}

ReactDOM.render(
  <Application />,
  document.getElementById('app')
);
