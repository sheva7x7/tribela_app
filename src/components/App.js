import React from "react";
import PropTypes from 'prop-types';
import Modal from 'react-modal'
import {connect} from 'react-redux'
import { bindActionCreators } from 'redux'
import styles from './styles/app.less'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import * as userActions from '../actions/user'
import _ from 'lodash'
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import {validateEmail, validatePassword} from '../utils/helper'

class App extends React.Component {

  static getDerivedStateFromProps(nextProps, prevState){
    if (!_.isEqual(prevState.user, nextProps.user)){
      console.log(nextProps.user)
      return {
        user: nextProps.user
      }
    }
    return null
  }

  constructor(props) {
    super(props)
    console.log(this.props)
    this.state = {}
    this.state.openedModel = null
    this.state.loginEmail = ''
    this.state.loginPassword = ''
    this.state.signUpEmail = ''
    this.state.signUpPassword = ''
    this.state.signUpPasswordVerify = ''
    this.state.user = this.props.user

    this.handleModalCloseRequest = this.handleModalCloseRequest.bind(this)
    this._submitLogIn = this._submitLogIn.bind(this)
    this._submitSignUp = this._submitSignUp.bind(this)
    this._logout = this._logout.bind(this)
  }

	componentWillMount() {
		this.props.onCreate()
  }

  handleModalCloseRequest() {
    this.setState({
      openedModel: null
    })
  }

  _submitLogIn(event) {
    event.preventDefault()
    if (!validateEmail(this.state.loginEmail)){
      alert("You have entered an invalid email address!")
    }
    else {
      this.props.actions.userLogin({email: this.state.loginEmail, password: this.state.loginPassword}, this.handleModalCloseRequest)
    }
  }

  _submitSignUp(event) {
    event.preventDefault()
    if (!validateEmail(this.state.signUpEmail)){
      alert("You have entered an invalid email address!")
    }
    else if (this.state.signUpPassword !== this.state.signUpPasswordVerify){
      alert('Passwords do not match!')
    } else if (!validatePassword(this.state.signUpPassword)){
      alert('Password is not secure')
    }else {
      this.props.actions.userRegister({email: this.state.signUpEmail, password: this.state.signUpPassword}, this.handleModalCloseRequest)
    }
  }

  _logout() {
    this.props.actions.userLogOut()
  }

 	render() {
    	return (
        <div className={`app_container ${this.state.openedModel !== null? 'app_blur' : ''}`}>
          <Navbar inverse collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/"><img src="./assets/logo_no_bg.png"  width='24px'/></a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav>
                <NavItem eventKey={1} href="/trending">
                  Trending
                </NavItem>
              </Nav>
              {
                this.state.user.loggedIn ? 
                <Nav pullRight>
                  <NavItem eventKey={1} href="/profile">
                    Profile
                  </NavItem>
                  <NavItem eventKey={2} onClick={() => {
                    this._logout()
                  }} >
                    Log Out
                  </NavItem>
                  <NavItem eventKey={3} href="http://tribela.io">
                    About Us
                  </NavItem>
                </Nav>:
                <Nav pullRight>
                  <NavItem eventKey={1} onClick={() => {
                    console.log(this.state)
                    if (this.state.openedModel === null) {
                      this.setState({openedModel: 'signup'})
                    }
                  }}>
                    Sign Up
                  </NavItem>
                  <NavItem eventKey={2} onClick={() => {
                    console.log(this.state)
                    if (this.state.openedModel === null) {
                      this.setState({openedModel: 'login'})
                    }
                  }}>
                    Log In
                  </NavItem>
                  <NavItem eventKey={3} href="http://tribela.io">
                    About Us
                  </NavItem>
                </Nav>
              }
            </Navbar.Collapse>
          </Navbar>
          {this.props.children}
          <Modal
            ref='signup_modal'
            id='signup_modal'
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            isOpen={this.state.openedModel === 'signup'}
            onRequestClose={this.handleModalCloseRequest}
            className='app_modal'
            overlayClassName='modal_overlay'
          >
            <div className='modal_form'>
               <CloseIcon className='form_close_icon' onClick={this.handleModalCloseRequest} style={{color: '#cccccc'}}/>
              <div className='modal_title'>
                Sign Up
              </div>
              <div className='form_field'>
                <label htmlFor='email'>
                  Email Address
                </label>
                <input type='email' name='email' value={this.state.signUpEmail} onChange={(event) => {
                  this.setState({
                    signUpEmail: event.target.value
                  })
                }}/>
              </div>
              <div className='form_field'>
                <label htmlFor='password'>
                  Password
                </label>
                <input type='password' name='password' value={this.state.signUpPassword} onChange={(event) => {
                  this.setState({
                    signUpPassword: event.target.value
                  })
                }}/>
                <div className='password_prompt'>
                  * At least one Uppercase alphabet, one number and one special character in your password
                </div>
              </div>
              <div className='form_field'>
                <label htmlFor='repeat-password'>
                  Confirm Password
                </label>
                <input type='password' name='repeat-password' value={this.state.signUpPasswordVerify} onChange={(event) => {
                  this.setState({
                    signUpPasswordVerify: event.target.value
                  })
                }}/>
              </div>
              <div className='form_button'>
                <input type='submit' value='Join' onClick={this._submitSignUp}/>
              </div>
            </div>
          </Modal>
          <Modal
            ref='login_modal'
            id='login_modal'
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            isOpen={this.state.openedModel === 'login'}
            onRequestClose={this.handleModalCloseRequest}
            className='app_modal'
            overlayClassName='modal_overlay'
          >
            <div className='modal_form'>
               <CloseIcon className='form_close_icon' onClick={this.handleModalCloseRequest} style={{color: '#cccccc'}}/>
              <div className='modal_title'>
                Login
              </div>
              <div className='form_field'>
                <label htmlFor='email'>
                  Email Address
                </label>
                <input type='email' name='email' value={this.state.loginEmail} onChange={(event) => {
                  this.setState({
                    loginEmail: event.target.value
                  })
                }}/>
              </div>
              <div className='form_field'>
                <label htmlFor='password'>
                  Password
                </label>
                <input type='password' name='password' value={this.state.loginPassword} onChange={(event) => {
                  this.setState({
                    loginPassword: event.target.value
                  })
                }}/>
              </div>
              <div className='form_button'>
                <input type='submit' value='Log In' onClick={this._submitLogIn} />
              </div>
            </div>
          </Modal>
        </div>
      )
  	}

}

App.propTypes = {
	onCreate: PropTypes.func.isRequired,
	location: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
		actions: bindActionCreators(userActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);