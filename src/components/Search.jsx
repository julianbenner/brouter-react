import React, {Component, PropTypes} from 'react';
import Waypoint from './Waypoint.jsx';

export default class Search extends Component {
  
  getRouteInformation() {
    if (this.props.route.features && this.props.route.features.length === 1) {
      const route = this.props.route.features[0];
      const length = route.properties['track-length'];
      const lengthFormatted = (length => {
        if (length <= 1000) {
          return length + ' m';
        } else {
          return (length / 1000).toFixed(2) + ' km';
        }
      })(length);
      const climbNet = route.properties['filtered ascend'] + ' m';
      const climbBrut = route.properties['plain-ascend'] + ' m';
      return (<div>
        Length: {lengthFormatted}<br />
        Climb: {climbNet}<br />
        Difference: {climbBrut}
      </div>);
    } else {
      return <span>No route</span>;
    }
  }
  
  render() {
    const inputs = this.props.waypoints.map(
      waypoint => (
        <Waypoint
          key={waypoint.id}
          id={waypoint.id}
          text={waypoint.text}
          suggestions={waypoint.suggestions}
          location={waypoint.location}
          resolving={waypoint.resolving}
          changeWaypointText={this.props.changeWaypointText}
          startRouting={this.props.startRouting}
          selectSuggestion={this.props.selectSuggestion}
          setSelected={this.props.setSelected}
          selected={waypoint.selected}
        />
      )
    );
    
    return (
      <div id="search">
        {inputs}
        <div>
          <select id="profile-chooser" onChange={this.props.changeProfile} value={this.props.profile}>
            <option value="trekking">trekking</option>
            <option value="car-test">car-test</option>
          </select>
          <button id="add-waypoint" onClick={this.props.addWaypoint}>+</button>
          <button id="add-waypoint" onClick={this.props.startRouting}>R</button>
        </div>
        <div id="route-information">
          {this.getRouteInformation()}
        </div>
      </div>
    );
  }
}

Search.propTypes = {
  waypoints: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    location: PropTypes.array.isRequired
  }).isRequired).isRequired
}