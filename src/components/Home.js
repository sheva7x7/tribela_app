import React from "react"
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'
import {Link} from 'react-router-dom'
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
  constructor(props){
    super(props)

    console.log(props)
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
                this.props.contests.map((contest, i) => {
                  return (
                    <Link to={`/contest/${contest.id}`} key={i} className='tile'>
                      <img src={contest.image} className='tile_image' />
                      <div className='tile_title'>
                        <p>
                          {contest.title}
                        </p>
                      </div>
                      <div className='tile_description'>
                        <div className='tile_description_left'>
                          <img src='./assets/timeleft.png' height='20px' />
                          <p className='creation_time_text'>
                            {calcTimeSince(contest.creation_time)}
                          </p>
                          <p>
                            {contest.creator}
                          </p>
                        </div>
                        <div className='tile_description_right'>
                          <img src='./assets/votecount.png' height='20px' />
                          <p>
                            {quantityFormat(contest.vote_count)}
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
	contests: PropTypes.array
}

const mapStateToProps = (state, ownProps) => {
  return {
    contests: state.contests
  }
}

export default connect(
  mapStateToProps
)(Home)