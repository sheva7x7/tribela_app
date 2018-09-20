import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import {Link} from 'react-router-dom'
import moment from 'moment'
import axios from '../utils/axios'
import * as announcementsActions from '../actions/announcements'
import { TRIBELA_URL } from '../utils/constants'
import _ from 'lodash'
import {validateEmail} from '../utils/helper'

import { getPath } from '../selectors'

import './styles/announcements.less'

class Announcements extends React.Component {
  constructor(props){
    super(props)

    this.state = {}
    this.state.articles = this.props.announcements.articles

    this.retrieveAnnouncements = this.retrieveAnnouncements.bind(this)
  }

  componentDidMount() {
    this.retrieveAnnouncements()
  }

  retrieveAnnouncements() {
    axios.post(`${TRIBELA_URL}/announcements`)
        .then((res) => {
          this.setState({
            articles: res.data
          })
        })
        .catch((err) => {
          console.log(err)
        })
  }

  render() {
    return (
      <div className='announcements_container'>
        <div className='announcements_frame'>
          <div className='announcements_section'>
            <div className='announcements_title'>
              <p>
                Announcements
              </p>
            </div>
          </div>
          <div className='announcements_section'>
            {
              this.state.articles.map((article, i) => (
                <Link to={`/article/${article.id}`} key={i} className='announcements_row' >
                  {
                    article.thumbnail_url ? 
                    <img src={article.thumbnail_url} className='announcement_thumbnail'/>:
                    null
                  }
                  <div className='announcement_headline'>
                    <div className='announcement_title'>
                      {article.title}
                    </div>
                    <div className='announcement_summary'>
                      {article.summary}
                    </div>
                  </div>
                </Link>
              ))
            }
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
    announcements: state.announcements
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: bindActionCreators(announcementsActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Announcements)