import { combineReducers } from 'redux';
import * as A from './actions';

function waypoint(state, action) {
  switch (action.type) {
    case A.REQUEST_ROUTING:
      return {
        ...state,
        suggestions: []
      }
    case A.CHANGE_WAYPOINT_TEXT:
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        text: action.text,
        found: false
      }
    case A.ADD_WAYPOINT:
      return {
        text: '',
        id: action.id,
        location: [],
        resolving: false,
        found: false,
        selected: true,
        suggestions: [],
        suggestionKeystrokeId: 0
      }
    case A.REQUEST_LOCATION:
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        resolving: true
      }
    case A.RECEIVE_LOCATION:
      if (state.id !== action.id) {
        return state;
      }
      if (action.response && action.response.features && action.response.features[0]) {
        const result = action.response.features[0];
        return {
          ...state,
          text: result.place_name,
          location: result.center,
          resolving: false,
          found: true
        }
      } else {
        return {
          ...state,
          resolving: false,
          found: false
        }
      }
    case A.RECEIVE_SUGGESTIONS:
      if (state.id !== action.id || state.suggestionKeystrokeId > action.keystrokeId) {
        return state;
      }
      return {
        ...state,
        suggestions: action.response.features
      };
    case A.SET_LOCATION:
      if (!state.selected) {
        return state;
      }
      return {
        ...state,
        found: true,
        suggestions: [],
        text: action.latLng.lat + ',' + action.latLng.lng,
        location: [action.latLng.lng, action.latLng.lat]
      };
    case A.SET_SELECTED:
      if (state.id !== action.id) {
        return {
          ...state,
          selected: false
        }
      }
      return {
        ...state,
        selected: action.selected
      };
    case A.QUEUE_ROUTING:
      return {
        ...state,
        selected: false
      }
    case A.SELECT_SUGGESTION:
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        suggestions: [],
        text: action.suggestion.place_name,
        found: true,
        location: action.suggestion.center
      }
  }
}

function waypoints(state = [], action) {
  switch (action.type) {
    case A.REQUEST_LOCATION:
    case A.RECEIVE_LOCATION:
    case A.RECEIVE_SUGGESTIONS:
    case A.SELECT_SUGGESTION:
    case A.REQUEST_ROUTING:
    case A.CHANGE_WAYPOINT_TEXT:
    case A.SET_LOCATION:
    case A.SET_SELECTED:
      return state.map(w =>
        waypoint(w, action)
      );
    case A.ADD_WAYPOINT:
      return [
        ...state.map(w =>
          waypoint(w, {
            type: A.SET_SELECTED,
            selected: false
          })
        ),
        waypoint(undefined, action)
      ];
    case A.REQUEST_LOCATION:
    default:
      return state;
  }
}

function routing(state = {
  queued: false,
  route: {},
  newRoute: false,
  profile: 'trekking'
}, action) {
  switch (action.type) {
    case A.CHANGE_PROFILE: {
      return {
        ...state,
        profile: action.profile
      };
    }
    case A.QUEUE_ROUTING:
    case A.SELECT_SUGGESTION:
      return {
        ...state,
        queued: true
      };
    case A.REQUEST_ROUTING:
      return {
        ...state,
        queued: false
      };
    case A.RECEIVE_ROUTING:
      return {
        ...state,
        route: action.response,
        newRoute: true
      };
    case A.FLAG_ROUTE_AS_OLD:
      return {
        ...state,
        newRoute: false
      };
    default:
      return state;
  }
}

const reducer = combineReducers({
    waypoints,
    routing
});

export default reducer;