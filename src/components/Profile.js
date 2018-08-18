import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import axios from 'axios' 
import * as userActions from '../actions/user'
import { TRIBELA_URL } from '../utils/constants'
import _ from 'lodash'
import { validatePassword } from '../utils/helper'

import { getPath } from '../selectors'

import './styles/profile.less'

class Profile extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState){
    if (!_.isEqual(prevState.user, nextProps.user)){
      return {
        user: nextProps.user
      }
    }
    return null
  }

  constructor(props){
    super(props)
    
    this.state = {}
    this.state.user = this.props.user
    this.state.username = this.state.user.username
    this.state.currentPassword = ''
    this.state.newPassword = ''
    this.state.confirmPassword = ''

    this._changeUsername = this._changeUsername.bind(this)
    this._changePassword = this._changePassword.bind(this)
  }

  componentDidMount() {
    this.props.actions.retrieveUserProfile(this.state.user.user_id)
  }

  _changeUsername() {
    console.log(this.state.user)
    if (this.state.username !== this.state.user.username) {
      this.props.actions.updateUsername(this.state.user, this.state.username)
    }
  }

  _changePassword() {
    if (this.state.currentPassword === '') {
      alert('Please enter current password!')
    }
    else if (this.state.newPassword === ''){
      alert('Please enter new password!')
    }else if(this.state.confirmPassword === ''){
      alert('Please confirm your new password!')
    }
    else if (this.state.newPassword !== this.state.confirmPassword){
      alert('Passwords do not match!')
    }
    else if (!validatePassword(this.state.newPassword)) {
      alert('Password is not secure!')
    } else {
      const data = {
        user: {
          user_id: this.state.user.user_id,
          password: this.state.currentPassword,
          newPassword: this.state.newPassword
        }
      }
      axios.post(`${TRIBELA_URL}/password`, data)
          .then((res) => {
            console.log(res.data)
            if (res.data.rowCount) {
              alert('Password changed!')
              this.setState({
                currentPassword: '',
                confirmPassword: '',
                newPassword: ''
              })
            }else {
              alert('Current password is wrong!')
            }
          })
          .catch((err) => {
            console.log(err)
          })
    }
  }

  render() {
    return (
      <div className='profile_container'>
        <div className='profile_frame'>
          <img width='100%' src='./assets/stuff_war.png'/>
          <div className='profile_title'>
            <p>
              My Profile
            </p>
          </div>
          <img src='/assets/profile.png' className='profile_icon' />
          <div className='form_field'>
            <label htmlFor='email'>
              Email
            </label>
            <div className='div_placeholder' />
            <input type='email' name='email' value={this.state.user.email} readOnly/>
            <div className='confirm_placeholder'/>
          </div>
          <div className='form_field'>
            <label htmlFor='username'>
              Username
            </label>
            <img src='/assets/edit.png' />
            <input type='text' name='username' value={this.state.username} onChange={(event) => {
              this.setState({
                username: event.target.value
              })
            }}/>
            <div className='confirm_placeholder'>
              {
                this.state.username !== this.state.user.username ? 
                <div className='confirm_button' onClick={this._changeUsername} >
                  Confirm
                </div>:
                <div />
              }
            </div>
          </div>
          <div className='password-fields'>
            <div className='form_field'>
              <label htmlFor='current-password'>
                Current Password
              </label>
              <img src='/assets/edit.png' />
              <input type='password' name='current-password' value={this.state.currentPassword} onChange={(event) => {
                this.setState({
                  currentPassword: event.target.value
                })
              }} />
              <div className='confirm_placeholder'/>
            </div>
            <div className='form_field'>
              <label htmlFor='new-password'>
                New Password
              </label>
              <img src='/assets/edit.png' />
              <div>
              <input type='password' name='new-password' value={this.state.newPassword} onChange={(event) => {
                this.setState({
                  newPassword: event.target.value
                })
              }} />
              <div className='password_prompt'>
                * Include 1 uppercase, number and symbol
              </div>
              </div>
              <div className='confirm_placeholder'/>
            </div>
            <div className='form_field'>
              <label htmlFor='confirm-password'>
                Re-enter Password
              </label>
              <img src='/assets/edit.png' />
              <input type='password' name='confirm-password' value={this.state.confirmPassword}  onChange={(event) => {
                this.setState({
                  confirmPassword: event.target.value
                })
              }}/>
              <div className='confirm_placeholder'>
                <div className='confirm_button' onClick={this._changePassword} >
                  Confirm
                </div>
              </div>
            </div>
          </div>
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
)(Profile)