import React from "react";
import { Router, Route, IndexRoute } from "react-router";
import { ConnectedRouter } from 'react-router-redux'
import { history } from "./store.js";

import App from "./containers/App";
import Home from "./components/Home";
import Contest from './components/Contest'

const router = (
  <ConnectedRouter onUpdate={() => window.scrollTo(0, 0)} history={history}>
    <App path="/">
      <Route exact path="/" component={Home}/>
      <Route path="/contest" component={Contest}/>
    </App>
  </ConnectedRouter>
);

export default router