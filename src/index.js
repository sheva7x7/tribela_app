import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from 'react-hot-loader'

import { loadComponents } from 'loadable-components'

import App from './App'

import { getState } from 'loadable-components'
window.snapSaveState = () => getState()

const app = document.getElementById('app')

const render = Component => {
  if (app.hasChildNodes()){
    loadComponents().then(() => ReactDOM.hydrate(
      <AppContainer>
        <Component />
      </AppContainer>,
      app
    ))
  }
  else {
    ReactDOM.render(
      <AppContainer>
        <Component />
      </AppContainer>,
      app
    )
  }
}

render(App)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
  	const NextApp = require('./App').default;
    render(NextApp)
  })
}
