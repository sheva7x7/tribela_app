import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import axios from 'axios' 
import { TRIBELA_URL } from '../utils/constants'
import _ from 'lodash'

import { getPath } from '../selectors'

import {thousandSeparator} from '../utils/helper'

import './styles/contest.less'

const calcTimeLeft = date => {
  const now = moment()
  const expiryTime = moment(date)
  const timeLeft = expiryTime.diff(now)
  if (moment.duration(timeLeft)._milliseconds <= 0){
    return 'Completed'
  }
  return `${moment.duration(timeLeft).get('days')} D, ${moment.duration(timeLeft).get('hours')} H, ${moment.duration(timeLeft).get('minutes')} M, ${moment.duration(timeLeft).get('seconds')} S`
}

const winningOptionClass = (date, index, options) => {
  const maxOption = _.maxBy(options, 'vote_count')
  if (calcTimeLeft(date) === 'Completed' && maxOption.vote_count === options[index].vote_count){
    return 'voting_option_big'
  }
  return ''
}

class Contest extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState){
    if (prevState.user !== nextProps.user){
      return {
        user: nextProps.user
      }
    }
    return null
  }

  constructor(props){
    super(props)

    console.log(this.props)
    const id = this.props.match.params.id
    this.state = {}
    this.state.campaign = {}
    this.state.timeLeft = 'expired'
    this.state.intervalId = ''
    this.state.loading = true
    this.state.user = this.props.user
    this.state.voted = false

    this.timer = this.timer.bind(this)
    this._vote = this._vote.bind(this)
    this.retrieveCampaign = this.retrieveCampaign.bind(this)
    this.retrieveVoted = this.retrieveVoted.bind(this)
    this.voting = this.voting.bind(this)
  }

  componentDidMount() {
    console.log('Campaign: mounting', this.props.match.params.id)
    this.retrieveCampaign()
  }

  componentWillUnmount() {
    if (!_.isEmpty(this.state.intervalId)){
      clearInterval(this.state.intervalId)
    }
  }

  componentDidUpdate(prevProps) {
    console.log(this.props.location, prevProps.location)
    if (this.props.location !== prevProps.location) {
    }
  }

  retrieveCampaign() {
    axios.get(`${TRIBELA_URL}/campaign/${this.props.match.params.id}`)
          .then((res) => {
            console.log(res.data)
            const timeLeft = calcTimeLeft(res.data.expiration_time)
            this.setState({
              campaign: res.data,
              timeLeft,
              loading: false
            })
            if (timeLeft !== 'expired'){
              this.timer()
            }
            if (this.state.user.loggedIn){
              this.retrieveVoted()
            }
          })
          .catch((err) => {
            console.log(err)
          })
  }

  retrieveVoted() {
    const data = {
      vote : {
        voter_id: this.state.user.id,
        campaign_id: this.state.campaign.id
      }
    }
    console.log(data)
    axios.post(`${TRIBELA_URL}/campaignvoted`, data)
          .then((res) => {
            console.log(res.data)
            this.setState({
              voted: res.data
            })
          })
          .catch((err) => {
            console.log(err)
          })
  }

  voting(option) {
    const data = {
      vote: {
        voter_id: this.state.user.id,
        campaign_id: this.state.campaign.id,
        option_id: option.id
      }
    }
    axios.post(`${TRIBELA_URL}/voting`, data)
        .then((res) => {
          this.setState({voted: true})
        })
        .catch(err => {
          this.setState({voted: false})
          console.log(err)
        })
  }
  
  timer() {
    const intervalId = setInterval(() => {
      this.setState({
        timeLeft: calcTimeLeft(this.state.campaign.expiration_time)
      })
    }, 1000)
    this.setState({
      intervalId
    })
  }

  _vote(option) {
    console.log(option, this.state.user, this.state.voted)
    if (this.state.user.loggedIn){
      if (!this.state.voted){
        console.log(option)
        this.voting(option)
      }
    } else {
      alert('Please login before voting')
    }
  }

  render() {
    return (
      this.state.loading ?
      <div/> :
      <div className='contest_container'>
        <div className='contest_frame'>
          <div className='contest_image'>
            <img src={this.state.campaign.featured_image} width='100%' height='100%'/>
          </div>
          <div className='contest_title'> 
            <h3>
              {this.state.campaign.title}
            </h3>
          </div>
          <div className='contest_description'>
            <p>
              {this.state.campaign.description}
            </p>
          </div>
          <div className='voting_section'>
            {
              this.state.campaign.options.map((option, i) => (
                <div className={`voting_option ${winningOptionClass(this.state.campaign.expiration_time, i, this.state.campaign.options)}`} onClick={() => {this._vote(option)}}>
                  <img src='../assets/option_1.png' />
                  <p className='contest_option_text'>
                    {option.description}
                  </p>
                  {
                    calcTimeLeft(this.state.campaign.expiration_time) === 'Completed' ? 
                    <p>
                      {thousandSeparator(option.vote_count)} votes
                    </p>:
                    null
                  }
                </div>
              ))
            }
          </div>
          <div className='vote_count_section'>
            <img src='../assets/votecount.png' />
            <p className='vote_count_text'>
              {thousandSeparator(this.state.campaign.total_vote_count)} votes
            </p>
          </div>
          <div className='timer_section'>
            <img src='../assets/timeleft.png' width='100px' />
            <p className='timer_text'>
              {calcTimeLeft(this.state.campaign.expiration_time)}
            </p>
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
    
  }
}

export default connect(
  mapStateToProps
)(Contest)