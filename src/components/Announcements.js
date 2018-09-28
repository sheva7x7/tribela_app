import React from "react";
import {connect} from 'react-redux'
import { bindActionCreators } from 'redux'
import {Link} from 'react-router-dom'
import moment from 'moment'
import axios from '../utils/axios'
import { TRIBELA_URL } from '../utils/constants'
import _ from 'lodash'

import { getPath } from '../selectors'

import './styles/announcements.less'

const formatDate = (date) => {
  const now = moment()
  if (now.diff(date, 'days') === 0){
    return 'Today'
  }else if (now.diff(date, 'days') === 1){
    return 'Yesterday'
  }else {
    return moment(date).format('MMM DD, YYYY')
  }
}

class Announcements extends React.Component {
  constructor(props){
    super(props)

    this.state = {}
    this.state.articleData = {}
    this.state.articleDateKeys = []

    this.retrieveAnnouncements = this.retrieveAnnouncements.bind(this)
  }

  componentDidMount() {
    this.retrieveAnnouncements()
  }

  retrieveAnnouncements() {
    axios.post(`${TRIBELA_URL}/announcements`)
        .then((res) => {
          const articleData = _.groupBy(res.data, (article, i) => {
            return moment(article.publish_time).format('YYYY-MM-DD')
          })
          const articleDateKeys = _.keys(articleData).sort((a, b)=> {
            moment(b).diff(moment(a), 'days')
          })
          this.setState({
            articleData,
            articleDateKeys
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
              this.state.articleDateKeys.map((date, i) => (
                <div className='announcement_date_section' key={i}>
                  <div className='announcement_date_text'>
                    {formatDate(date)}
                  </div>
                  {
                    this.state.articleData[date].map((article, j) => (
                      <Link to={`/article/${article.id}`} key={j} className='announcements_row' >
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
    user: state.user
  }
}

export default connect(
  mapStateToProps
)(Announcements)