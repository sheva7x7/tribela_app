import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import {Link} from 'react-router-dom'
import moment from 'moment'
import axios from 'axios' 
import * as userActions from '../actions/user'
import { TRIBELA_URL } from '../utils/constants'
import _ from 'lodash'
import {validateEmail} from '../utils/helper'

import { getPath } from '../selectors'

import './styles/verification.less'

class Verification extends React.Component {
  constructor(props){
    super(props)

    this.state = {}
    this.state.loginEmail = ''
    this.state.loginPassword = ''
    this.state.validation_string = this.props.match.params.validation_string
    
    this._verifyAccount = this._verifyAccount.bind(this)
    this.verifyCallback = this.verifyCallback.bind(this)
  }

  _verifyAccount(event) {
    event.preventDefault()
    if (!validateEmail(this.state.loginEmail)){
      alert("You have entered an invalid email address!")
    }
    else {
      this.props.actions.userVerification({email: this.state.loginEmail, password: this.state.loginPassword, validation_string: this.state.validation_string}, this.verifyCallback)
    }
  }

  verifyCallback() {
    this.props.history.push("/")
  }

  render() {
    return (
      <div className='verification_container'>
        <div className='verification_frame'>
          {
            this.state.validation_string? 
            <div className='login_form'>
              <div className='form_title'>
                Please enter your login email and password to verify your account
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
                <input type='submit' value='Verify' onClick={this._verifyAccount} />
              </div>
            </div>:
            <div className='verification_default'>
              <p>
                A verification email has been sent to your email address. Please clcik the corresponding link to verify your account.
              </p>
              <Link to='/' className='return_button'>
                Return to Home
              </Link>
            </div>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    location: getPath(state),
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: bindActionCreators(userActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Verification)