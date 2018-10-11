import React from "react";
import {connect} from 'react-redux'
import moment from 'moment'
import axios from '../utils/axios'
import { TRIBELA_URL } from '../utils/constants'
import _ from 'lodash'

import ArticleList from './common/ArticleList'

import { getPath } from '../selectors'

import './styles/announcements.less'

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
      <ArticleList
        title='Announcements'
        articleData={this.state.articleData}
        articleDateKeys={this.state.articleDateKeys}
      />
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