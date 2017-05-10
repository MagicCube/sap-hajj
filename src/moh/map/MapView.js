import SuperMapView from 'bd/map/MapView';

import BusLayer from './layers/BusLayer';
import StationLayer from './layers/StationLayer';
import TrafficLayer from './layers/TrafficLayer';


export default class MapView extends SuperMapView {
  metadata = {
    properties: {
      baseLayerMode: {
        type: 'string',
        default: 'street'
      },
      perspectiveAngle: {
        type: 'float',
        defaultValue: 0
      },
      defaultZoom: {
        type: 'int',
        defaultValue: 15
      }
    },
    events: {
      zoomChanged: {
      }
    }
  }

  init() {
    super.init();
    this.addStyleClass('moh-map-view');
  }

  afterInit() {
    super.afterInit();

    let zoomEndTimer = null;
    this.map.on('zoomstart', () => {
      if (zoomEndTimer) {
        clearTimeout(zoomEndTimer);
        zoomEndTimer = null;
      }
    });
    this.map.on('zoomend', () => {
      if (zoomEndTimer) {
        clearTimeout(zoomEndTimer);
      }
      zoomEndTimer = setTimeout(() => {
        this.fireZoomChanged();
      }, 500);
    });
  }

  initLayers() {
    super.initLayers();

    this.trafficLayer = new TrafficLayer('traffic-layer', {
      edges: '{gis>/edges}',
      edgeSpeed: '{traffic>/edge-speed}'
    });
    this.addLayer(this.trafficLayer);

    this.busLayer = new BusLayer('bus-layer', {
      buses: '{bus>/rt}'
    });
    this.addLayer(this.busLayer);

    this.stationLayer = new StationLayer('station-layer', {

    });
  }

  setBaseLayerMode(value) {
    this.setProperty('baseLayerMode', value);
    if (this.baseLayer) {
      this.baseLayer.setUrl(value === 'satellite' ?
        'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVucnkxOTg0IiwiYSI6ImI1a0FvUzQifQ.zLCAzKNjXNiRUQoJBzAsZQ' :
        'https://api.mapbox.com/styles/v1/mapbox/traffic-night-v2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVucnkxOTg0IiwiYSI6ImI1a0FvUzQifQ.zLCAzKNjXNiRUQoJBzAsZQ'
      );
    }
  }
}
