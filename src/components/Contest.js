import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'
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

const winningOptionClass = (date, option, other) => {
  if (calcTimeLeft(date) === 'Completed' && option.vote_count >= other.vote_count){
    return 'voting_option_big'
  }
  return ''
}

class Contest extends React.Component {
  constructor(props){
    super(props)

    console.log(this.props)
    const id = this.props.match.params.id
    this.state = {}
    this.state.contest = this.props.contests[id-1]
    this.state.timeLeft = calcTimeLeft(this.state.contest.expiration_time)
    this.state.intervalId = ''

    this.timer = this.timer.bind(this)
  }

  componentDidMount (){
    if (this.state.timeLeft !== 'expired'){
      this.timer()
    }
  }

  componentWillUnmount() {
    if (!_.isEmpty(this.state.intervalId)){
      clearInterval(this.state.intervalId)
    }
  }
  
  timer() {
    const intervalId = setInterval(() => {
      this.setState({
        timeLeft: calcTimeLeft(this.state.contest.expiration_time)
      })
    }, 1000)
    this.setState({
      intervalId
    })
  }

  render() {
    return (
      <div className='contest_container'>
        <div className='contest_frame'>
          <div className='contest_image'>
            <img src={this.state.contest.image} width='100%' height='100%'/>
          </div>
          <div className='contest_title'>
            <h3>
              {this.state.contest.title}
            </h3>
          </div>
          <div className='contest_description'>
            <p>
              {this.state.contest.description}
            </p>
          </div>
          <div className='voting_section'>
            <div className={`voting_option ${winningOptionClass(this.state.contest.expiration_time, this.state.contest.options[0], this.state.contest.options[1])}`}>
              <img src='../assets/option_1.png' />
              <p className='contest_option_text'>
                {this.state.contest.options[0].text}
              </p>
              {
                calcTimeLeft(this.state.contest.expiration_time) === 'Completed' ? 
                <p>
                  {thousandSeparator(this.state.contest.options[0].vote_count)} votes
                </p>:
                null
              }
            </div>
            <div className={`voting_option ${winningOptionClass(this.state.contest.expiration_time, this.state.contest.options[1], this.state.contest.options[0])}`}>
              <img src='../assets/option_2.png' />
              <p className='contest_option_text'>
                {this.state.contest.options[1].text}
              </p>
              {
                calcTimeLeft(this.state.contest.expiration_time) === 'Completed' ? 
                <p>
                  {thousandSeparator(this.state.contest.options[1].vote_count)} votes
                </p>:
                null
              }
            </div>
          </div>
          <div className='vote_count_section'>
            <img src='../assets/votecount.png' />
            <p className='vote_count_text'>
              {thousandSeparator(this.state.contest.vote_count)} votes
            </p>
          </div>
          <div className='timer_section'>
            <img src='../assets/timeleft.png' width='100px' />
            <p className='timer_text'>
              {calcTimeLeft(this.state.contest.expiration_time)}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    contests: state.contests,
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