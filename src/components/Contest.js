import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import Linkify from 'react-linkify'
import ReactSlider from 'react-slider'
import TextareaAutosize from 'react-autosize-textarea'
import {
  FacebookShareButton, 
  FacebookIcon,
  FacebookShareCount,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon
} from 'react-share'
import {Link} from 'react-router-dom'
import Modal from 'react-modal'
import Slider from 'react-slick'
import moment from 'moment'
import axios from 'axios' 
import { TRIBELA_URL, STUFF_WAR_URL } from '../utils/constants'
import _ from 'lodash'

import { getPath } from '../selectors'

import {thousandSeparator, calcTimeSince} from '../utils/helper'

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

const getOptionId = (votedCampaigns, campaign_id) => {
  const campaigns = votedCampaigns.filter(campaign => campaign.campaign_id == campaign_id)
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
    this.state.campaign_info = {}
    this.state.campaign_comments = {}
    this.state.windowWidth = window.innerWidth
    this.state.galleryModalOpened = false
    this.state.commentsReachedEnd = {}

    this.renderVotePanel = this.renderVotePanel.bind(this)
    this.renderOptionPanel = this.renderOptionPanel.bind(this)
    this.renderComment = this.renderComment.bind(this)
    this.postComment = this.postComment.bind(this)
    this.upvoteComment = this.upvoteComment.bind(this)
    this.downvoteComment = this.downvoteComment.bind(this)
    this.timer = this.timer.bind(this)
    this._vote = this._vote.bind(this)
    this.retrieveCampaign = this.retrieveCampaign.bind(this)
    this.retrieveVoted = this.retrieveVoted.bind(this)
    this.voting = this.voting.bind(this)
    this.resetState = this.resetState.bind(this)
    this.updateNoOfViews = this.updateNoOfViews.bind(this)
    this.retrieveOptionComments = this.retrieveOptionComments.bind(this)
    this.retrieveOptionInfo = this.retrieveOptionInfo.bind(this)
    this.updateOrientationChange = this.updateOrientationChange.bind(this)
    this.trackScrolling = this.trackScrolling.bind(this)
    this.openGalleryModal = this.openGalleryModal.bind(this)
    this.handleModalCloseRequest = this.handleModalCloseRequest.bind(this)
    this.loadMoreComments = _.debounce(this.loadMoreComments.bind(this), 1000, {leading: true})
  }

  componentDidMount() {
    window.scrollTo(0,0)
    window.addEventListener('resize', this.updateWindowDimensions)
    window.addEventListener('orientationchange', this.updateOrientationChange)
    window.addEventListener('scroll', this.trackScrolling)
    this.retrieveCampaign()
    this.updateNoOfViews()
  }

  componentWillUnmount() {
    if (!_.isEmpty(this.state.intervalId)){
      clearInterval(this.state.intervalId)
    }
    window.removeEventListener('resize', this.updateWindowDimensions)
    window.removeEventListener('orientationchange', this.updateOrientationChange)
    window.removeEventListener('scroll', this.trackScrolling)
  }

  trackScrolling() {
    const wrappedElement = document.getElementById('comments_section')
    if (wrappedElement){
      if (wrappedElement.getBoundingClientRect().bottom < window.innerHeight + 100){
        this.loadMoreComments()
      }
    }
  }

  updateOrientationChange() {
    this.setState({ 
      windowWidth: window.innerWidth
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if(!prevState.user.loggedIn && this.state.user.loggedIn){
      this.retrieveVoted()
    }
    if(prevState.user.loggedIn && !this.state.user.loggedIn){
      this.resetState()
    }
    if(!prevState.campaign.options && this.state.campaign.options){
      const campaign_comments = {}
      const campaign_info = {}
      this.state.campaign.options.forEach((option) => {
        campaign_comments[option.id] = []
        campaign_info[option.id] = {}
        this.state.commentsReachedEnd[option.id] = false
      })
      this.setState({
        campaign_comments,
        campaign_info
      }, () => {
        this.state.campaign.options.forEach((option) => {
          this.retrieveOptionComments(option.id)
          this.retrieveOptionInfo(option.id)
        })
      }) 
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

  loadMoreComments() {
    const panelOptionObj = _.find(this.state.campaign.options, {option_no: this.state.panelOption})
    if (!this.state.commentsReachedEnd[panelOptionObj.id]){
      this.retrieveOptionComments(panelOptionObj.id)
    }
  }

  retrieveOptionComments(option_id) {
    const data = {
      option_id,
      offset: this.state.campaign_comments[option_id].length
    }
    axios.post(`${TRIBELA_URL}/campaigncomments`, data)
          .then((res) => {
            if (res.data.length > 0){
              const comments = res.data
              const campaign_comments = _.cloneDeep(this.state.campaign_comments)
              campaign_comments[option_id] = campaign_comments[option_id].concat(comments)
              this.setState({
                campaign_comments
              })
            }else {
              this.state.commentsReachedEnd[option_id] = true
            }
          })
          .catch((err) => {
            if (err.response.status === 600 ){
              this.state.commentsReachedEnd[option_id] = true
            }
            console.log(err)
          })
  }

  retrieveOptionInfo(option_id) {
    axios.get(`${TRIBELA_URL}/campaigninfo/${option_id}`)
          .then((res) => {
            const info = res.data
            const campaign_info = _.cloneDeep(this.state.campaign_info)
            campaign_info[option_id] = info
            this.setState({
              campaign_info
            })
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
    axios.post(`${TRIBELA_URL}/campaignvoted`, data)
          .then((res) => {
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

  postComment() {
    const body = this.commentReplyTextarea.value
    if (!_.isEmpty(body)) {
      const panelOptionObj = _.find(this.state.campaign.options, {option_no: this.state.panelOption})
      const data = {
        comment: {
          campaign_id: this.state.campaign.id,
          option_id: panelOptionObj.id,
          body,
          creator_id: this.state.user.id,
          is_root: true
        }
      }
      axios.post(`${TRIBELA_URL}/newcampaigncomment`, data)
          .then(res => {
            const myComment = res.data
            myComment.username = this.state.user.username
            this.commentReplyTextarea.value = ''
            this.setState({
              myComment
            })
          })
          .catch(err => {
            if(err.response.status === 412){
              alert('Each user is allowed to create 1 master thread upon voting!')
            }
            else{
              console.log(err)
            }
          })
    }else {
      alert('message cannot be empty')
    }
  }

  upvoteComment(comment, e){
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const data = {
      comment_id: comment.id,
      voter_id: this.state.user.id
    }
    axios.post(`${TRIBELA_URL}/upvotecomment`, data)
          .then(res => {
            comment.upvote = comment.upvote + 1
          })
          .catch(err => {
            console.log(err)
          })
  }

  downvoteComment(comment, e){
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const data = {
      comment_id: comment.id,
      voter_id: this.state.user.id
    }
    axios.post(`${TRIBELA_URL}/downvotecomment`, data)
          .then(res => {
            comment.downvote = comment.downvote + 1
          })
          .catch(err => {
            console.log(err)
          })
  }

  openGalleryModal() {
    this.setState({
      galleryModalOpened: true
    })
  }

  handleModalCloseRequest() {
    this.setState({
      galleryModalOpened: false
    })
  }

  renderOptionPanel() {
    const panelOptionObj = _.find(this.state.campaign.options, {option_no: this.state.panelOption})
    const campaign_info = this.state.campaign_info[panelOptionObj.id]
    const campaign_comments = this.state.campaign_comments[panelOptionObj.id]
    const option_gallery = campaign_info.option_gallery
    return (
      <div className='option_panel' >
        <Modal
          ref='gallery_modal'
          id='gallery)modal'
          ariaHideApp={false}
          shouldCloseOnOverlayClick={true}
          isOpen={this.state.galleryModalOpened}
          onRequestClose={this.handleModalCloseRequest}
          className='gallery_modal'
          overlayClassName='gallery_modal_overlay'
        >
        <div className='modal_gallery_holder'>
          <Slider 
              arrows={true}
              autoplay={false}
              infinite={true}
              dots={true}
            >
              {
                option_gallery.map((optionImage, i) => (
                  <div key={i} className='gallery_image_holder'>
                    <img width='100%' src={optionImage} />
                  </div>
                ))
              }
            </Slider>
          </div>
        </Modal>
      {
        _.isEmpty(campaign_info) ?
        null:
        <div className='option_info_section'>
          <div className='option_gallery'>
            <Slider 
              arrows={option_gallery.length > 6}
              autoplay={false}
              infinite={false}
              slidesToShow={Math.min(option_gallery.length, 6)}
              slidesToScroll={3}
              variableWidth={true}
              responsive={
                [
                  {
                    breakpoint: 660,
                    settings: {
                      slidesToShow: Math.min(option_gallery.length, 5),
                      arrows: option_gallery.length > 5
                    }
                  },
                  {
                    breakpoint: 560,
                    settings: {
                      slidesToShow: Math.min(option_gallery.length, 4),
                      arrows: option_gallery.length > 4
                    }
                  },
                  {
                    breakpoint: 460,
                    settings: {
                      slidesToShow: Math.min(option_gallery.length, 3),
                      arrows: option_gallery.length > 3
                    }
                  },
                  {
                    breakpoint: 360,
                    settings: {
                      slidesToShow: Math.min(option_gallery.length, 2),
                      arrows: option_gallery.length > 2,
                      slidesToScroll: 2
                    }
                  }
                ]
              }
            >
              {
                option_gallery.map((optionImage, i) => (
                  <div className='option_gallery_image' key={i} onClick={this.openGalleryModal}>
                    <img src={optionImage} />
                  </div>
                ))
              }
            </Slider>
          </div>
          <div className='option_description'>
            <Linkify>
              {campaign_info.description}
            </Linkify>
          </div>
        </div>
      }
        <div id='comments_section' className='option_comments_section'>
          {
            this.state.votedOption === panelOptionObj.id ?
            <div className='comment_reply_section'>
              <TextareaAutosize 
                className='comment_reply_textarea' 
                rows={1}
                innerRef={ref => this.commentReplyTextarea = ref}
                style={{ maxHeight: 100 }}
              />
              <div 
                className='comment_reply_button'
                onClick={this.postComment}
              >
                <img src='./assets/reply.png' />
              </div>
            </div>:
            null
          }
          {
            this.state.myComment ? 
            this.renderComment(this.state.myComment, 'my_comment'):
            null
          }
          {
            campaign_comments.map((comment, i) => this.renderComment(comment, i))
          }
        </div>
      </div>
    )
  }

  renderComment(comment, i) {
    return (
      <Link 
        to={{
          pathname: '/comments',
          state: { root_id: comment.id, option_no: this.state.panelOption }
        }}
        key={i} className='option_comment'
      >
        <div className='comment_header'>
          <div className='comment_header_left'>
            <div className='comment_date'>
            {calcTimeSince(comment.creation_time)}
            </div>
            <div className='comment_creator'>
              {comment.username}
            </div>
          </div>
          <div className='comment_header_right'>
            <img className='comment_option_image' src={`./assets/option_${this.state.panelOption}.png`}/>
          </div>
        </div>
        <div className='comment_body'>
          {comment.body}
        </div>
        <div className='comment_footer'>
          <div className='comment_buttons' onClick={(e) => {this.upvoteComment(comment, e)}}>
            <img src='./assets/upvote.png' />
            <div>
              {comment.upvote}
            </div>
          </div>
          <div className='comment_buttons' onClick={(e) => {this.downvoteComment(comment, e)}}>
            <img src='./assets/downvote.png' />
            <div>
              {comment.downvote}
            </div>
          </div>
          <div className='comment_buttons'>
            <img src='./assets/replies.png' />
            <div>
              {comment.replies}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  renderVotePanel() {
    return (
      <div>
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
            <div onClick={evt => {
              evt.stopPropagation()
            }}>
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
    )
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
        <div className='contest_frame'>
          <div className='contest_panel'>
            <div onClick={() => {this.setState({panelOption: 1})}} className={this.state.panelOption === 1 ? 'contest_panel_selected': ''}>
              <img src={this.state.panelOption === 1 ?  './assets/option_1_prevote.png' : './assets/option1gray.png'} className='contest_panel_option_image' />
            </div>
            <div onClick={() => {this.setState({panelOption: 'vote'})}} className={this.state.panelOption === 'vote' ? 'contest_panel_selected': ''}>
              <img src={this.state.panelOption === 'vote' ? './assets/voteicon.png' : './assets/voteicon_light.png'} className='contest_panel_vote_image'/>
              <p>
                Vote
              </p>
            </div>
            <div onClick={() => {this.setState({panelOption: 2})}} className={this.state.panelOption === 2 ? 'contest_panel_selected': ''}>
              <img src={this.state.panelOption === 2 ? './assets/option_2_prevote.png' : './assets/option2gray.png'} className='contest_panel_option_image' />
            </div>
          </div>
          {
            this.state.panelOption === 'vote' ? 
            this.renderVotePanel():
            this.renderOptionPanel()
          }
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