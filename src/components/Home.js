import React from "react"
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import {Link} from 'react-router-dom'
import * as campaignsActions from '../actions/campaigns' 
import { quantityFormat } from '../utils/helper'

import './styles/home.less'

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

class Home extends React.Component {

  static getDerivedStateFromProps(nextProps, prevState){
    if (prevState.trendingCampaigns.length !== nextProps.trendingCampaigns.length){
      return {
        trendingCampaigns: nextProps.trendingCampaigns
      }
    }
    return null
  }
  
  constructor(props){
    super(props)

    this.state = {}
    this.state.trendingCampaigns = this.props.trendingCampaigns
  }

  componentDidMount() {
    console.log('Will Mount')
    this.props.actions.getTrendingCampaigns({offset: 0})
  }

  render (){
    return (
      <div className='home_container'>
        <div className='home_frame'>
          <img width='100%' src='./assets/stuff_war.png'/>
          <div className='grid_container'>
            <div className='grid_title'>
              <p>
                Open Campaigns
              </p>
            </div>
            <div className='grid_section'>
              {
                this.state.trendingCampaigns.map((campaign, i) => {
                  return (
                    <Link to={`/campaign/${campaign.id}`} key={i} className='tile'>
                      <img src={campaign.featured_image} className='tile_image' />
                      <div className='tile_title'>
                        <p>
                          {campaign.title}
                        </p>
                      </div>
                      <div className='tile_description'>
                        <div className='tile_description_left'>
                          <img src='./assets/timeleft.png' height='20px' />
                          <p className='creation_time_text'>
                            {calcTimeSince(campaign.creation_time)}
                          </p>
                          <p>
                            {campaign.creator}
                          </p>
                        </div>
                        <div className='tile_description_right'>
                          <img src='./assets/votecount.png' height='20px' />
                          <p>
                            {quantityFormat(campaign.total_vote_count)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Home.propTypes = {
	trendingCampaigns: PropTypes.array
}

const mapStateToProps = (state, ownProps) => {
  return {
    users: state.users,
    trendingCampaigns: state.campaigns.trendingCampaigns
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
		actions: bindActionCreators(campaignsActions, dispatch)
	}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)