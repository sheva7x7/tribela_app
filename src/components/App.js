import React from "react";
import PropTypes from 'prop-types';
import Modal from 'react-modal'
import {connect} from 'react-redux'
import { bindActionCreators } from 'redux'
import {Link, Redirect} from 'react-router-dom'
import styles from './styles/app.less'
import {Checkbox} from 'react-bootstrap'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import * as userActions from '../actions/user'
import * as campaignActions from '../actions/campaigns'
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
    this.state.referralCode = ''
    this.state.user = this.props.user
    this.state.mailingListCheckbox = true
    this.state.consentCheckbox = true

    this.handleModalCloseRequest = this.handleModalCloseRequest.bind(this)
    this._submitLogIn = this._submitLogIn.bind(this)
    this._submitSignUp = this._submitSignUp.bind(this)
    this._logout = this._logout.bind(this)
    this.getVotedCampaigns = this.getVotedCampaigns.bind(this)
    this._routeToVerication = this._routeToVerication.bind(this)
  }

  componentDidMount() {
    this.getVotedCampaigns()
    const token = JSON.parse(localStorage.getItem('token'))
    if (!token && this.state.user.loggedIn){
      this._logout()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(!prevState.user.loggedIn && this.state.user.loggedIn){
      this.getVotedCampaigns()
    }
  }

  getVotedCampaigns() {
    if (this.state.user.loggedIn){
      this.props.campaignActions.getVotedCampaigns(this.state.user.id)
    }
  }

  handleModalCloseRequest() {
    this.setState({
      openedModel: null,
      loginEmail: '',
      loginPassword: '',
      signUpEmail: '',
      signUpPassword: '',
      signUpPasswordVerify: ''
    })
  }

  _routeToVerication() {
    this.handleModalCloseRequest()
    this.props.history.push("/emailverification")
  }

  _submitLogIn(event) {
    event.preventDefault()
    if (!validateEmail(this.state.loginEmail)){
      alert("You have entered an invalid email address!")
    }
    else {
      const data = {email: this.state.loginEmail, password: this.state.loginPassword, mailingList: this.state.mailingListCheckbox}
      this.props.userActions.userLogin(
        data, 
        this.handleModalCloseRequest
      )
    }
  }

  _submitSignUp(event) {
    event.preventDefault()
    if (!this.state.consentCheckbox) {
      alert('You have to consent the use of your submitted information in order to sign up to Stuff War')
    }
    else if (!validateEmail(this.state.signUpEmail)){
      alert("You have entered an invalid email address!")
    }
    else if (this.state.signUpPassword !== this.state.signUpPasswordVerify){
      alert('Passwords do not match!')
    } else if (!validatePassword(this.state.signUpPassword)){
      alert('Password is not secure')
    }else {
      const data = {email: this.state.signUpEmail, password: this.state.signUpPassword, mailingList: this.state.mailingListCheckbox}
      if (this.state.referralCode !== '') {
        data.referral_code = this.state.referralCode
      }
      this.props.userActions.userRegister(data, this._routeToVerication)
    }
  }

  _logout() {
    this.props.userActions.userLogOut()
  }

 	render() {
    	return (
        <div className={`app_container ${this.state.openedModel !== null? 'app_blur' : ''}`}>
          <Navbar inverse collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to='/'>
                  <img src="./assets/SW_logo.png"  width='24px'/>
                </Link>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav>
                <NavItem componentClass={Link} href='/trending' to="/trending" eventKey={1}>
                  Trending
                </NavItem>
              </Nav>
              <Nav>
                <NavItem componentClass={Link} href='/hof' to="/hof" eventKey={2}>
                  Hall Of Fame
                </NavItem>
              </Nav>
              {
                this.state.user.loggedIn ? 
                <Nav pullRight>
                  <NavItem componentClass={Link} href='/announcements' to="/announcements" eventKey={1}>
                    Announcements
                  </NavItem>
                  <NavDropdown title='Account' id='app_account_dropdown' >
                    <NavItem className='app_nav_dropdown_item' componentClass={Link} href='/profile' to="/profile" eventKey={1}>
                        Profile
                    </NavItem>
                    <NavItem className='app_nav_dropdown_item' componentClass={Link} href='/wallet' to="/wallet" eventKey={1}>
                        Wallet
                    </NavItem>
                    <MenuItem divider/>
                    <NavItem className='app_nav_dropdown_item' eventKey={2} onClick={() => {
                      this._logout()
                    }} >
                      Log Out
                    </NavItem>
                  </NavDropdown>
                  <NavItem eventKey={3} href="http://tribela.io">
                    About Us
                  </NavItem>
                </Nav>:
                <Nav pullRight>
                  <NavItem componentClass={Link} href='/announcements' to="/announcements" eventKey={1}>
                    Announcements
                  </NavItem>
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
                  * Include 1 uppercase, number and symbol
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
              <div className='form_field'>
                <label htmlFor='referral-code'>
                  Referral Code
                </label>
                <input type='text' name='referral-code' value={this.state.referralCode} onChange={(event) => {
                  this.setState({
                    referralCode: event.target.value
                  })
                }}/>
              </div>
              <div className='form_checkbox'>
                <Checkbox 
                  checked={this.state.mailingListCheckbox} 
                  inline
                  onChange={evt => {
                    this.setState({
                      mailingListCheckbox: evt.target.checked
                    })
                  }}
                >
                  I wish to subsribe to Stuff War mailing list
                </Checkbox>
              </div>
              <div className='form_checkbox'>
                <Checkbox 
                  checked={this.state.consentCheckbox} 
                  inline
                  onChange={evt => {
                    this.setState({
                      consentCheckbox: evt.target.checked
                    })
                  }}
                >
                  I consent to having my submitted information stored
                </Checkbox>
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
    userActions: bindActionCreators(userActions, dispatch),
    campaignActions: bindActionCreators(campaignActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);