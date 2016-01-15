import fetch from 'isomorphic-fetch';

export const CHANGE_WAYPOINT_TEXT = 'CHANGE_WAYPOINT_TEXT';
export const CHANGE_WAYPOINT_LOC = 'CHANGE_WAYPOINT_LOC'; 
export const ADD_WAYPOINT = 'ADD_WAYPOINT'; 
export const START_ROUTING = 'START_ROUTING';
export const QUEUE_ROUTING = 'QUEUE_ROUTING';
export const RECEIVE_LOCATION = 'RECEIVE_LOCATION';
export const RECEIVE_SUGGESTIONS = 'RECEIVE_SUGGESTIONS';
export const SELECT_SUGGESTION = 'SELECT_SUGGESTION';
export const REQUEST_LOCATION = 'REQUEST_LOCATION';
export const RECEIVE_ROUTING = 'RECEIVE_ROUTING';
export const REQUEST_ROUTING = 'REQUEST_ROUTING';
export const FLAG_ROUTE_AS_OLD = 'FLAG_ROUTE_AS_OLD';
export const SET_LOCATION = 'SET_LOCATION';
export const SET_SELECTED = 'SET_SELECTED';
export const CHANGE_PROFILE = 'CHANGE_PROFILE';

let waypointId = 0;
let keystrokeId = 0;

export function changeProfile(profile) {
  return {
    type: CHANGE_PROFILE,
    profile: profile
  };
}

export function setSelected(id, selected) {
  return {
    type: SET_SELECTED,
    id: id,
    selected: selected
  }
}

export function addWaypoint() {
  return {
    type: ADD_WAYPOINT,
    id: waypointId++
  }
}

export function setLocation(latLng) {
  return {
    type: SET_LOCATION,
    latLng: latLng
  }
}

export function changeWaypointText(id, text) {
  
  return dispatch => {
    dispatch({
      type: CHANGE_WAYPOINT_TEXT,
      id: id,
      text: text
    });
    
    return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA`)
      .then(response => response.json())
      .then(json => 
        dispatch(receiveSuggestions(id, json, keystrokeId++))
      );
  };
}

export function selectSuggestion(id, suggestion) {
  return {
    type: SELECT_SUGGESTION,
    id: id,
    suggestion: suggestion
  }
}

export function queueRouting() {
  return {
    type: QUEUE_ROUTING
  }
}

export function startRouting(waypoints, profile) {
  return dispatch => {
    dispatch(requestRouting());
    
    const lonlats = waypoints.map(waypoint => waypoint.location[0] + ',' + waypoint.location[1]).join('|');
    return fetch(`http://localhost:17777/brouter?lonlats=${lonlats}&nogos=&profile=${profile}&alternativeidx=0&format=geojson`)
      .then(response => response.json())
      .then(json =>
        dispatch(receiveRouting(json))
      );
  }
}

function requestRouting() {
  return {
    type: REQUEST_ROUTING
  };
}

function receiveRouting(response) {
  return {
    type: RECEIVE_ROUTING,
    response: response
  };
}

function requestLocation(waypoint) {
  return {
    type: REQUEST_LOCATION,
    id: waypoint.id
  };
}

function receiveLocation(waypoint, response) {
  return {
    type: RECEIVE_LOCATION,
    id: waypoint.id,
    response: response
  };
}

function receiveSuggestions(id, response, keystrokeId) {
  return {
    type: RECEIVE_SUGGESTIONS,
    id: id,
    response: response,
    keystrokeId: keystrokeId
  };
}

export function flagRouteAsOld() {
  return {
    type: FLAG_ROUTE_AS_OLD
  }
}

export function resolveLocation(waypoint) {
  return dispatch => {
    dispatch(requestLocation(waypoint));
    
    return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${waypoint.text}.json?access_token=pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA`)
      .then(response => response.json())
      .then(json => 
        dispatch(receiveLocation(waypoint, json))
      );
  };
}