import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import Linkify from 'react-linkify'
import ReactSlider from 'react-slider'
import {Helmet} from 'react-helmet'
import {
  FacebookShareButton, 
  FacebookIcon,
  FacebookShareCount,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon
} from 'react-share'
import {withRouter} from 'react-router-dom'
import moment from 'moment'
import axios from 'axios' 
import { TRIBELA_URL, STUFF_WAR_URL } from '../utils/constants'
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

const calcTimeSince = date => {
  const now = moment()
  const creationTime = moment(date)
  const timeSince = now.diff(creationTime)
  if (moment.duration(timeSince)._milliseconds <= 0){
    return 'error'
  }
  if(moment.duration(timeSince).get('days') > 0){
    if (moment.duration(timeSince).get('days') === 1){
      return '1 day ago by'
    }
    return `${moment.duration(timeSince).get('days')} days ago by`
  }
  if(moment.duration(timeSince).get('hours') > 0){
    if (moment.duration(timeSince).get('hours') === 1){
      return '1 hour ago by'
    }
    return `${moment.duration(timeSince).get('hours')} hour ago by`
  }
  if(moment.duration(timeSince).get('minutes') > 0){
    if (moment.duration(timeSince).get('minutes') === 1){
      return '1 minute ago by'
    }
    return `${moment.duration(timeSince).get('minutes')} minutes ago by`
  }
  return `just now by`
}

const winningOptionClass = (date, index, options) => {
  const maxOption = _.maxBy(options, 'vote_count')
  if (calcTimeLeft(date) === 'Completed' && maxOption.vote_count === options[index].vote_count){
    return 'voting_option_big'
  }
  return ''
}

const getOptionId = (votedCampaigns, campaign_id) => {
  console.log(votedCampaigns, campaign_id)
  const campaigns = votedCampaigns.filter(campaign => campaign.campaign_id == campaign_id)
  console.log(campaigns)
  if (campaigns.length === 0){
    return ''
  }
  else {
    return campaigns[0].option_id
  }
}

class Contest extends React.Component {
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

    const id = this.props.match.params.id
    this.state = {}
    this.state.campaign = this.props.history.location.campaign || {}
    this.state.timeLeft = 'expired'
    this.state.intervalId = ''
    this.state.loading = !this.props.history.location.campaign && true
    this.state.user = this.props.user
    this.state.votedOption = getOptionId(this.props.votedCampaigns, id)
    this.state.sliderIndex = getOptionId(this.props.votedCampaigns, id) === '' ? 0 : 100
    this.state.votingOption = ''
    this.state.panelOption = 'vote'

    this.timer = this.timer.bind(this)
    this._vote = this._vote.bind(this)
    this.retrieveCampaign = this.retrieveCampaign.bind(this)
    this.retrieveVoted = this.retrieveVoted.bind(this)
    this.voting = this.voting.bind(this)
    this.resetState = this.resetState.bind(this)
    this.updateNoOfViews = this.updateNoOfViews.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0,0)
    this.retrieveCampaign()
    this.updateNoOfViews()
  }

  componentWillUnmount() {
    if (!_.isEmpty(this.state.intervalId)){
      clearInterval(this.state.intervalId)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(!prevState.user.loggedIn && this.state.user.loggedIn){
      this.retrieveVoted()
    }
    if(prevState.user.loggedIn && !this.state.user.loggedIn){
      this.resetState()
    }
  }

  updateNoOfViews() {
    const data = {
      campaign: {
        id: this.props.match.params.id
      }
    }
    axios.post(`${TRIBELA_URL}/campaignviews`, data)
  }

  resetState(){
    this.setState({
      votedOption: '',
      sliderIndex: 0,
      votingOption: ''
    })
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
              votedOption: res.data.option_id || ''
            })
            if (res.data.option_id) {
              this.setState({
                sliderIndex: 100,
                votingOption: ''
              })
            }
          })
          .catch((err) => {
            console.log(err)
          })
  }

  voting() {
    if (this.state.votingOption !== ''){
      const data = {
        vote: {
          voter_id: this.state.user.id,
          campaign_id: this.state.campaign.id,
          option_id: this.state.votingOption
        }
      }
      this.setState({votedOption: this.state.votingOption})
      axios.post(`${TRIBELA_URL}/voting`, data)
          .then((res) => {
          })
          .catch(err => {
            this.setState({
              votedOption: '',
              sliderIndex: 0,
              votingOption: 0
            })
            console.log(err)
          })
    }else {
      this.setState({
        sliderIndex: 0
      })
    }
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
    console.log(option, this.state.user)
    if (calcTimeLeft(this.state.campaign.expiration_time) === 'Completed'){
      return
    }
    if (this.state.user.loggedIn){
      if (this.state.votedOption === ''){
        this.setState({
          votingOption: option.id
        })
      }
    } else {
      alert('Please login before voting')
    }
  }

  render() {
    return (
      this.state.loading ?
      <div className='contest_container'>
        <div className='contest_frame'>
          <div className='loading'/>
        </div>
      </div> :
      <div className='contest_container'>
        <Helmet>
          <meta property="og:title" content={`${this.state.campaign.title}`}/>
          <meta property="og:type" content="article" />
          <meta property="og:description" content={`${this.state.campaign.description}`}/>
          <meta property="og:image" content={`${this.state.campaign.featured_image}`} />
          <meta property="og:url" content={`${STUFF_WAR_URL}campaign/${this.props.match.params.id}`} />
        </Helmet>
        <div className='contest_frame'>
          <div className='contest_panel'>
            <div >
              <img src='./assets/option1gray.png' className='contest_panel_option_image' />
            </div>
            <div className={this.state.panelOption === 'vote' ? 'contest_panel_selected': ''}>
              <img src='./assets/voteicon.png' className='contest_panel_vote_image'/>
              <p>
                Vote
              </p>
            </div>
            <div>
              <img src='./assets/option2gray.png' className='contest_panel_option_image' />
            </div>
          </div>
          <div className='contest_image' style={{backgroundImage: `url(${this.state.campaign.featured_image})`}} >
            <div className='contest_image_overlay' />
            <div className='contest_title'> 
              <h3>
                {this.state.campaign.title}
              </h3>
            </div>
            <div className='voting_section'>
              {
                this.state.campaign.options.map((option, i) => (
                  <div key={i} className={`voting_option ${winningOptionClass(this.state.campaign.expiration_time, i, this.state.campaign.options)}`} onClick={() => {this._vote(option)}}>
                    <div className='option_image_container'>
                      <img className={this.state.votedOption === option.id || this.state.votingOption === option.id ? `vote_option_selected_image` : 'vote_option_image'} src={this.state.votedOption === option.id || this.state.votingOption === option.id ? `./assets/option_${option.option_no}.png` : `./assets/option_${option.option_no}_prevote.png`} />
                    </div>
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
            {
              this.state.user.loggedIn && calcTimeLeft(this.state.campaign.expiration_time) !== 'Completed' ?
              <div>
                <ReactSlider 
                  type='range' 
                  className='confirm_slider' 
                  min={0}
                  max={100}
                  orientation='horizontal'
                  disabled={this.state.sliderIndex === 100 || this.state.votingOption === ''}
                  value={this.state.sliderIndex} 
                  onAfterChange={(value) => {
                    const sliderIndex = value > 49 ? 100: 0
                    this.setState({sliderIndex})
                    if (sliderIndex > 49){
                      this.voting()
                    }
                  }}
                />
                <div className='slider_label'>
                  {this.state.sliderIndex > 49 ? 'You have voted!':(this.state.votingOption === '' ? 'Select an option' : 'Slide to vote')}
                </div>
              </div>:
              <div/>
            }
          </div>
          <div className='contest_info'>
            <div className='contest_info_clock'>
              <img src='./assets/timeleft.png' height='20px' />
              <p className='creation_time_text'>
                {calcTimeSince(this.state.campaign.creation_time)}
              </p>
              <p>
                {this.state.campaign.creator}
              </p>
            </div>
            <FacebookShareButton
              url={`${STUFF_WAR_URL}campaign/${this.props.match.params.id}`}
              quote={this.state.campaign.title}
              className='share_icon'
            >
              <FacebookIcon
                size={20}
                round />
            </FacebookShareButton>
            <TwitterShareButton
              url={`${STUFF_WAR_URL}campaign/${this.props.match.params.id}`}
              title={this.state.campaign.title}
              hashtags={this.state.campaign.options.map(option => option.description.replace(/[^a-zA-Z0-9]|\s/g, ''))}
              className='share_icon'
            >
              <TwitterIcon
                size={20}
                round />
            </TwitterShareButton>
            <WhatsappShareButton
              url={`${STUFF_WAR_URL}campaign/${this.props.match.params.id}`}
              title={this.state.campaign.title}
              separator=' - '
              className='share_icon'
            >
              <WhatsappIcon
                size={20}
                round />
            </WhatsappShareButton>
            <div className='contest_info_views'>
              <img src='./assets/view.png' height='20px' />
              <p>
                {this.state.campaign.no_of_views}
              </p>
            </div>
          </div>
          <div className='contest_description'>
            <Linkify>
              {this.state.campaign.description}
            </Linkify>
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
    user: state.user,
    votedCampaigns: state.campaigns.votedCampaigns
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    
  }
}

export default connect(
  mapStateToProps
)(Contest)