import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, Circle, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from "react-leaflet-draw"

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import data from '../assets/data';
import Markers from './VenueMarkers';

// our components
import ShSideBar from './shSideBar';
import {
  postPointLayer, postPolygonLayer
} from '../actions/layerActions';
import {
  CREATE_LAYERS_SUCCESS,
} from '../actions/types';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png',
});
let polyline;

class MapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLocation: { lat: 1.46, lng: 32.40 },
      zoom: 7,
    }
  }


  _onEdited = (e) => {

    let numEdited = 0;
    e.layers.eachLayer( (layer) => {
      numEdited += 1;
    });
    console.log(`_onEdited: edited ${numEdited} layers`, e);

    this._onChange();
  }

  _onCreated = (e) => {
    let type = e.layerType;
    let layer = e.layer;
    if (type === 'marker') {
      // Do marker specific actions
      console.log("_onCreated: marker created", e);
    }
    else {
      console.log("_onCreated: something else created:", type, e);
    }
    let geo_layer = e.layer.toGeoJSON()
    if (geo_layer.geometry.type === "Polygon") {
      this.props.postPolygonLayer(geo_layer)
    } else if (geo_layer.geometry.type === "Point") {
      // this isn't accounting for circles
      this.props.postPointLayer(geo_layer)
    }
    // Do whatever else you need to. (save to db; etc)

    this._onChange();
  }

  _onDeleted = (e) => {

    let numDeleted = 0;
    e.layers.eachLayer( (layer) => {
      numDeleted += 1;
    });
    console.log(`onDeleted: removed ${numDeleted} layers`, e);

    this._onChange();
  }

  _onMounted = (drawControl) => {
    console.log('_onMounted', drawControl);
  }

  _onEditStart = (e) => {
    console.log('_onEditStart', e);
  }

  _onEditStop = (e) => {
    console.log('_onEditStop', e);
  }

  _onDeleteStart = (e) => {
    console.log('_onDeleteStart', e);
  }

  _onDeleteStop = (e) => {
    console.log('_onDeleteStop', e);
  }

  _editableFG = null

  _onFeatureGroupReady = (reactFGref) => {

    // populate the leaflet FeatureGroup with the geoJson layers

    let leafletGeoJSON = new L.GeoJSON(getGeoJson());
    let leafletFG = reactFGref.leafletElement;

    leafletGeoJSON.eachLayer( (layer) => {
      leafletFG.addLayer(layer);
    });

    // store the ref for future access to content

    this._editableFG = reactFGref;
  }

  _onChange = () => {

    // this._editableFG contains the edited geometry, which can be manipulated through the leaflet API

    const { onChange } = this.props;

    if (!this._editableFG || !onChange) {
      return;
    }

    const geojsonData = this._editableFG.leafletElement.toGeoJSON();
    onChange(geojsonData);
  }

  render() {
    const { currentLocation, zoom } = this.state;

    return (
      <React.Fragment>
        <ShSideBar />
        <Map
          zoomControl={false}
          center={currentLocation}
          zoom={zoom}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />

          <Markers venues={data.venues}/>
          <FeatureGroup ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);} }>
              <EditControl
                position='topright'
                onEdited={this._onEdited}
                onCreated={this._onCreated}
                onDeleted={this._onDeleted}
                onMounted={this._onMounted}
                onEditStart={this._onEditStart}
                onEditStop={this._onEditStop}
                onDeleteStart={this._onDeleteStart}
                onDeleteStop={this._onDeleteStop}
                draw={{
                  rectangle: false
                }}
              />
          </FeatureGroup>
        </Map>
      </React.Fragment>
    );
  }
}

function getGeoJson() {
  return {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [33.947754, 2.251955]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [32.036133, 3.360098],
              [33.288574, 3.447824],
              [32.080078, 2.515368],
              [32.036133, 3.360098]
            ]
          ]
        }
      }
    ]
  }
}

const mapStateToProps = state => ({
  createLayersPayload: state.layers.createLayersPayload
});

export default connect(
  mapStateToProps, { postPointLayer, postPolygonLayer }
)(MapView);
