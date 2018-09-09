import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import {withRouter} from 'react-router'
import axios from '../utils/axios'
import * as userActions from '../actions/user'
import { TRIBELA_URL } from '../utils/constants'
import TextareaAutosize from 'react-autosize-textarea'
import _ from 'lodash'

import { getPath } from '../selectors'

import './styles/comments.less'

import {calcTimeSince} from '../utils/helper'

const constructComments = (comments, root_id) => {
  const rootComment = _.find(comments, {id: root_id})
  return [formChildren(rootComment, comments)]
}

const formChildren = (comment, comments) => {
  comment.id = Number(comment.id)
  const children = _.orderBy(_.filter(comments, {parent_id: comment.id}), ['upvote', 'downvote', 'creation_time'] , ['desc', 'desc', 'desc'])
  if (children.length > 0) {
    comment.children = []
  }
  children.forEach(child => {
    comment.children.push(formChildren(child, comments))
  })
  return comment
}

class Comments extends React.Component {
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
    this.state.root_id = this.props.history.location.state.root_id
    this.state.option_no = this.props.history.location.state.option_no
    this.state.commentInput = ''
    this.state.comments = []

    this.retrieveComments = this.retrieveComments.bind(this)
    this.renderComment = this.renderComment.bind(this)
    this.postComment = this.postComment.bind(this)
    this.downvoteComment = this.downvoteComment.bind(this)
    this.upvoteComment = this.upvoteComment.bind(this)
  }

  componentDidMount() {
    this.retrieveComments()
  }

  retrieveComments() {
    const data = {
      root_id: this.state.root_id
    }
    axios.post(`${TRIBELA_URL}/subcomments`, data)
        .then((res) => {
          if (res.data.length > 0){
            const comments = constructComments(res.data, this.state.root_id)
            this.setState({
              comments
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
  }

  postComment(parentComment, e) {
    const target = e.target
    target.classList.add('active_button')
    setTimeout(() => {
      target.classList.remove('active_button')
    }, 100)
    const body = this.commentReplyTextarea.value
    if (!_.isEmpty(body)) {
      const data = {
        comment: {
          campaign_id: parentComment.campaign_id,
          option_id: parentComment.option_id,
          body,
          root_id: parentComment.root_id,
          parent_id: parentComment.id,
          creator_id: this.state.user.id,
          is_root: false
        }
      }
      axios.post(`${TRIBELA_URL}/newcampaigncomment`, data)
          .then(res => {
            const myComment = res.data
            myComment.username = this.state.user.username
            this.commentReplyTextarea.value = ''
            if (parentComment.children){
              parentComment.children.push(myComment)
            }else {
              parentComment.children = [myComment]
            }
            this.setState({
              commentInput: ''
            })
          })
          .catch(err => {
            console.log(err)
          })
    }else {
      alert('message cannot be empty')
    }
  }

  upvoteComment(comment, e){
    const target = e.target
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    target.classList.add('active_button')
    setTimeout(() => {
      target.classList.remove('active_button')
    }, 100)
    const data = {
      comment_id: comment.id,
      voter_id: this.state.user.id
    }
    axios.post(`${TRIBELA_URL}/upvotecomment`, data)
          .then(res => {
            comment.upvote = comment.upvote + 1
            this.forceUpdate()
          })
          .catch(err => {
            console.log(err)
          })
  }

  downvoteComment(comment, e){
    const target = e.target
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    target.classList.add('active_button')
    setTimeout(() => {
      target.classList.remove('active_button')
    }, 100)
    const data = {
      comment_id: comment.id,
      voter_id: this.state.user.id
    }
    axios.post(`${TRIBELA_URL}/downvotecomment`, data)
          .then(res => {
            comment.downvote = comment.downvote + 1
            this.forceUpdate()
          })
          .catch(err => {
            console.log(err)
          })
  }

  renderComment(comment, i, master) {
    return (
      <div key={i} className={`comment ${master? '': 'child_comment'} `}>
        <div className='comment_header'>
          <div className='comment_header_left'>
            <div className='comment_date'>
            {calcTimeSince(comment.creation_time)}
            </div>
            <div className='comment_creator'>
              {comment.username}
            </div>
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
        </div>
        <div className='comment_reply_section'>
          {
            this.state.commentInput === comment.id ?
            <TextareaAutosize 
              className='comment_reply_textarea' 
              rows={1}
              innerRef={ref => this.commentReplyTextarea = ref}
              style={{ maxHeight: 100 }}
            />:
            null
          }
          <div 
            className='comment_reply_button'
            onClick={(e) => {
              if(this.state.commentInput === comment.id){
                this.postComment(comment, e)
              }
              else{
                this.setState({
                  commentInput: comment.id
                })
              }
            }}
          >
            <img src='./assets/reply.png' />
          </div>
        </div>
        {
          comment.children?
          comment.children.map((child, i) => this.renderComment(child, i)):
          null
        }
      </div>
    )
  }

  render() {
    return (
      this.state.comments.length > 0 ?
      <div className='comments_container'>
        <div className='comments_frame'>
          <div className='comments_section'>
            <div className='option_image_holder'>
              <img className='comment_option_image' src={`./assets/option_${this.state.option_no}.png`}/>
            </div>
            {
              this.renderComment(this.state.comments[0], 0, true)
            }
          </div>
        </div>
      </div>:
      <div className='comments_container'>
        <div className='comments_frame'>
          <div className='loading'/>
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
)(Comments)