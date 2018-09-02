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

const getVotedOptionIcon = (campaign) => {
  const votedOption = _.find(campaign.options, {id: campaign.voted_option_id})
  return (
    <img src={`./assets/option_${votedOption.option_no}.png`} />
  )
}

const getVotedPercentage = (campaign, option_no) => {
  const now = moment()
  const expiryTime = moment(campaign.expiration_time)
  const timeLeft = expiryTime.diff(now)
  if (moment.duration(timeLeft)._milliseconds <= 0){
    return '-'
  }else {
    const voteOption = _.find(campaign.options, {option_no})
    return `${Math.round(voteOption.vote_count / Number(campaign.total_vote_count) * 100)} %`
  }
}

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
    this.state.myCampaignsEndReached = false
    this.state.myCampaigns = []
    this.state.totalCampaignCount = 0

    this._changeUsername = this._changeUsername.bind(this)
    this._changePassword = this._changePassword.bind(this)
    this.trackScrolling = this.trackScrolling.bind(this)
    this.loadMyCampaigns = this.loadMyCampaigns.bind(this)
    this.loadMoreCampaigns = this.loadMoreCampaigns.bind(this)
    this.loadMyCampaignCount = this.loadMyCampaignCount.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.trackScrolling)
    this.props.actions.retrieveUserProfile(this.state.user.user_id)
    this.loadMyCampaigns()
    this.loadMyCampaignCount()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.trackScrolling)
  }

  trackScrolling() {
    const wrappedElement = document.getElementById('my_campaigns_section')
    if (wrappedElement){
      if (wrappedElement.getBoundingClientRect().bottom < window.innerHeight + 100){
        this.loadMoreCampaigns()
      }
    }
  }

  loadMoreCampaigns(){
    console.log('load more')
    if (!this.state.myCampaignsEndReached){
      this.loadMyCampaigns()
    }
  }

  loadMyCampaigns(){
    const data = {
      user: {
        id: this.state.user.id
      },
      offset: this.state.myCampaigns.length
    }
    axios.post(`${TRIBELA_URL}/myvotedcampaigns`, data)
          .then((res) => {
            if (res.data.length > 0){
              const newCampaigns = res.data
              const myCampaigns = this.state.myCampaigns.concat(newCampaigns)
              this.setState({
                myCampaigns
              })
            }else {
              this.state.myCampaignsEndReached = true
            }
          })
          .catch((err) => {
            if (err.response.status === 600 ){
              this.state.myCampaignsEndReached = true
            }
            console.log(err)
          })
  }

  loadMyCampaignCount() {
    const data = {
      user: {
        id: this.state.user.id
      }
    }
    axios.post(`${TRIBELA_URL}/myvotedcampaignscount`, data)
          .then((res) => {
            console.log(res.data)
            this.setState({
              totalCampaignCount: res.data.count
            })
          })
          .catch((err) => {
            console.log(err)
          })
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
          <div className='profile_section'>
            <img width='100%' src='./assets/profile_banner.png'/>
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
              <div className='form_field new_password_field'>
                <label htmlFor='new-password'>
                  New Password
                </label>
                <img src='/assets/edit.png' />
                <div className='input_container'>
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
          <div id='my_campaigns_section' className='my_campaigns_section'>
            <div className='campaigns_title'>
              <p>
                My Campaigns
              </p>
              <img className='my_campaigns_image' src='./assets/mycampaigns.png' />
              <p className='my_campaign_count'>
                {this.state.totalCampaignCount} Campaigns
              </p>
            </div>
            <div className='my_campaigns_list'>
              <div className='my_campaigns_row my_campaigns_header'>
                <div className='my_campaigns_title'>
                  Campaigns
                </div>
                <div className='my_campaigns_my_vote'>
                  <img src='./assets/voteicon.png' />
                </div>
                <div className='my_campaigns_option'>
                  <img src='./assets/option_1_prevote.png' />
                </div>
                <div className='my_campaigns_option'>
                  <img src='./assets/option_2_prevote.png' />
                </div>
              </div>
              {
                this.state.myCampaigns.map((campaign, i) => (
                  <div key={i} className='my_campaigns_row'>
                    <div className='my_campaigns_title'>
                      {campaign.title}
                    </div>
                    <div className='my_campaigns_my_vote'>
                      {getVotedOptionIcon(campaign)}
                    </div>
                    <div className='my_campaigns_option'>
                      {getVotedPercentage(campaign, 1)}
                    </div>
                    <div className='my_campaigns_option'>
                      {getVotedPercentage(campaign, 2)}
                    </div>
                  </div>
                ))
              }
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