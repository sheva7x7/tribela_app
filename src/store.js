import { createStore, applyMiddleware, compose } from "redux";
// import { browserHistory } from "react-router";
import { syncHistoryWithStore, routerMiddleware } from "react-router-redux";
import { reducers } from "./reducers/index";
import { createBrowserHistory } from 'history';
import initialStore from './reducers/initialState'

const history = createBrowserHistory()

let middlewares = [];

middlewares.push(routerMiddleware(history));

let middleware = applyMiddleware(...middlewares);

if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  middleware = compose(middleware, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = createStore(reducers, initialStore, middleware);

export { store, history };