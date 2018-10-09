import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from 'react-hot-loader'

import App from './App';

const app = document.getElementById('app')

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    app
  )
}

render(App)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
  	const NextApp = require('./App').default;
    render(NextApp)
  })
}
