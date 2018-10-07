import React from "react"
import { Router, Route, IndexRoute, Switch } from "react-router"
import { ConnectedRouter } from 'react-router-redux'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { history } from "./store.js"
import App from "./containers/App"
import loadable from 'loadable-components'

const Home = loadable(() => import('./components/Home'), {
  LoadingComponent: () => null
})
const Contest = loadable(() => import('./components/Contest'), {
  LoadingComponent: () => null
})
const Profile = loadable(() => import('./components/Profile'), {
  LoadingComponent: () => null
})
const Trending = loadable(() => import('./components/Trending'), {
  LoadingComponent: () => null
})
const Hof = loadable(() => import('./components/Hof'), {
  LoadingComponent: () => null
})
const Verification = loadable(() => import('./components/Verification'), {
  LoadingComponent: () => null
})
const Comments = loadable(() => import('./components/Comments'), {
  LoadingComponent: () => null
})
const Wallet = loadable(() => import('./components/Wallet'), {
  LoadingComponent: () => null
})
const Announcements = loadable(() => import('./components/Announcements'), {
  LoadingComponent: () => null
})
const Article = loadable(() => import('./components/Article'), {
  LoadingComponent: () => null
})
// import Home from "./components/Home"
// import Contest from './components/Contest'
// import Profile from './components/Profile'
// import Trending from './components/Trending'
// import Hof from './components/Hof'
// import Verification from './components/Verification'
// import Comments from './components/Comments'
// import Wallet from './components/Wallet'
// import Announcements from './components/Announcements.js'
// import Article from './components/Article.js'

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
}), null, null, {pure: false})(PrivateRouteContainer)

const router = (
  <ConnectedRouter onUpdate={() => window.scrollTo(0, 0)} history={history}>
    <App path="/">
      <Route exact path="/" component={Home}/>
      <Route path="/campaign/:id" component={Contest}/>
      <Route path='/trending' component={Trending}/>
      <Route path='/hof' component={Hof}/>
      <Route exact path='/emailverification' component={Verification}/>
      <Route path='/emailverification/:validation_string' component={Verification}/>
      <Route path='/comments' component={Comments}/>
      <Route path='/announcements' component={Announcements}/>
      <Route exact path="/article/:id" component={Article}/>
      <PrivateRoute path="/profile" component={Profile}/>
      <PrivateRoute path='/wallet' component={Wallet}/>
    </App>
  </ConnectedRouter>
);

export default router