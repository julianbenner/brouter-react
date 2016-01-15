import React from 'react';;
import { render } from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import Application from './components/Application.jsx';
import reducers from './reducers';
import DevTools from './components/DevTools.jsx';


const createStoreWithMiddleware = compose(
  applyMiddleware(
    thunkMiddleware
  ),
  DevTools.instrument()
)(createStore);

const store = createStoreWithMiddleware(reducers);

render(
    <Provider store={store}>
      <div id="main">
        <Application
          token="pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA"
          style="mapbox.outdoors"
        />
        {/*<DevTools />*/}
      </div>
    </Provider>, document.getElementById('app'));