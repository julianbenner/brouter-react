import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import * as A from '../actions';
import ReactDOM from 'react-dom';
import Search from './Search.jsx';

class Application extends Component {  

  componentDidMount() {
    var el = ReactDOM.findDOMNode();
    L.mapbox.accessToken = this.props.token;
    const view = {
      container: 'map',
      style: this.props.style,
      center: [7, 50],
      zoom: 7
    };
    this.map = L.mapbox.map('map', this.props.style, {
      zoomControl: false
    }).setView([50, 7], 9);
    this.geoJSONwaypoints = L.mapbox.featureLayer({
      "type": "FeatureCollection",
      "features": []
    }).addTo(this.map);
    this.geoJSONroute = L.mapbox.featureLayer({
      "type": "FeatureCollection",
      "features": []
    }).addTo(this.map);
    this.map.on('click', (e) => {
      e.originalEvent.preventDefault();
      this.setLocation(e.latlng);
    })
  }
  
  setLocation(latLng) {
    this.props.dispatch(A.setLocation(latLng));
  }

  componentWillUnmount() {
    this.map.remove();
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode());
  }
  
  startRouting() {
    this.props.waypoints.forEach(waypoint => {
      if (!waypoint.found) {
        this.props.dispatch(A.resolveLocation(waypoint));
      }
    });
    this.props.dispatch(A.queueRouting());
  }
  
  ingestNewRoute(route) {
    this.props.dispatch(A.flagRouteAsOld());
    
    if (route.features && route.features[0]) {
      const routeContent = route.features[0];
      
      this.geoJSONroute.setGeoJSON(routeContent);
      
      if (routeContent.geometry && routeContent.geometry.coordinates) {
        this.scaleMap(routeContent.geometry.coordinates);
      }
    }
  }
  
  removeCurrentRoute() {
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
    }
    if (this.map.getSource('route')) {
      this.map.removeSource('route');
    }
  }
  
  scaleMap(coordinates) {
    let smallestLng = coordinates[0][0];
    let smallestLat = coordinates[0][1];
    let biggestLng = coordinates[0][0];
    let biggestLat = coordinates[0][1];
    coordinates.forEach(coordinates => {
      if (coordinates[0] < smallestLng) {
        smallestLng = coordinates[0];
      } else if (coordinates[0] > biggestLng) {
        biggestLng = coordinates[0];
      }
      if (coordinates[1] < smallestLat) {
        smallestLat = coordinates[1];
      } else if (coordinates[1] > biggestLat) {
        biggestLat = coordinates[1];
      }
    });
    const scaleFactor = 0.05;
    this.map.fitBounds([[
      smallestLat - (biggestLat - smallestLat) * scaleFactor,
      smallestLng - (biggestLng - smallestLng) * scaleFactor
    ], [
      biggestLat + (biggestLat - smallestLat) * scaleFactor,
      biggestLng + (biggestLng - smallestLng) * scaleFactor
    ]]);
  }
  
  componentWillReceiveProps(nextProps) {    
    if (nextProps.routing.queued) {
      if (nextProps.waypoints.filter(waypoint => !waypoint.found || waypoint.resolving).length === 0) {
        if (nextProps.waypoints.length > 1) {
          this.props.dispatch(A.startRouting(nextProps.waypoints, nextProps.routing.profile));
        }
      }
    }
    
    if (nextProps.routing.newRoute) {
      this.ingestNewRoute(nextProps.routing.route);
    }
    
    this.updateWaypoints(nextProps.waypoints);
  }
  
  updateWaypoints(waypoints) {
    this.geoJSONwaypoints.setGeoJSON({
      type: "FeatureCollection",
      features: (
        waypoints.
          filter(waypoint => waypoint.found === true && waypoint.location[0] && waypoint.location[1]).
          map(waypoint => {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [
                  waypoint.location[0],
                  waypoint.location[1]
                ]
              }
            };
          })
      )
    });
  }
  
  render() {
    const { dispatch, waypoints } = this.props;
    
    return (
      <div id="map-parent">
        <Search
          waypoints={this.props.waypoints}
          addWaypoint={() => dispatch(A.addWaypoint())}
          changeWaypointText={(id, text) => dispatch(A.changeWaypointText(id, text))}
          selectSuggestion={(id, suggestion) => dispatch(A.selectSuggestion(id, suggestion))}
          startRouting={() => this.startRouting()}
          setSelected={(id, selected) => dispatch(A.setSelected(id, selected))}
          profile={this.props.routing.profile}
          changeProfile={e => dispatch(A.changeProfile(e.target.value))}
          route={this.props.routing.route}
        />
        <div id="map"></div>
      </div>
    );
  }
}

Application.propTypes = {
  waypoints: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    location: PropTypes.array.isRequired
  }).isRequired).isRequired,
  routing: PropTypes.shape({
    queued: PropTypes.bool.isRequired
  }).isRequired
}

function select(state) {
  return {
    waypoints: state.waypoints,
    routing: state.routing
  }
}

export default connect(select)(Application)