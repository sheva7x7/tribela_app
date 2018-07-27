import React from "react"
import { Router, Route, IndexRoute, Switch } from "react-router"
import { ConnectedRouter } from 'react-router-redux'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { history } from "./store.js"
import App from "./containers/App"
import Home from "./components/Home"
import Contest from './components/Contest'
import Profile from './components/Profile'

class PrivateRouteContainer extends React.Component {
  render() {
    const {
      isAuthenticated,
      component: Component,
      ...props
    } = this.props

    return (
      <Route
        {...props}
        render={props =>
          isAuthenticated
            ? <Component {...props} />
            : (
            <Redirect to={{
              pathname: '/',
              state: { from: props.location }
            }} />
          )
        }
      />
    )
  }
}

const PrivateRoute = connect(state => ({
  isAuthenticated: state.user.loggedIn
}))(PrivateRouteContainer)

const router = (
  <ConnectedRouter onUpdate={() => window.scrollTo(0, 0)} history={history}>
    <App path="/">
      <Route exact path="/" component={Home}/>
      <Route path="/campaign/:id" component={Contest}/>
      <PrivateRoute path="/profile" component={Profile}/>
    </App>
  </ConnectedRouter>
);

export default router