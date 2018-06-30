import { createStore, applyMiddleware, compose } from "redux";
// import { browserHistory } from "react-router";
import { syncHistoryWithStore, routerMiddleware } from "react-router-redux";
import { reducers } from "./reducers/index";
import { createBrowserHistory } from 'history';
import thunk from 'redux-thunk'
import initialStore from './reducers/initialState'

const history = createBrowserHistory()

history.listen((location, action) => {
  console.log(
    `The current URL is ${location.pathname}${location.search}${location.hash}`
  )
  console.log(`The last navigation action was ${action}`)
})

let middlewares = [thunk];

middlewares.push(routerMiddleware(history));

let middleware = applyMiddleware(...middlewares);

if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  middleware = compose(middleware, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = createStore(reducers, initialStore, middleware);

export { store, history };