import React from "react"
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import {Link} from 'react-router-dom'
import {
  WindowScroller,
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry
} from 'react-virtualized'
import axios from 'axios'
import { TRIBELA_URL } from '../utils/constants'
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

const defaultHeight = 350
const defaultWidth = 300

const cache = new CellMeasurerCache({
  defaultHeight,
  defaultWidth,
  fixedWidth: true
})

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
    this.state.windowHeight = window.innerHeight
    this.state.windowWidth = window.innerWidth
    this.state.trendingCampaigns = this.props.trendingCampaigns
    this.state.dataEndReached = false
    this.state.loadingData = false
    this.cellRenderer = this.cellRenderer.bind(this)
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    this._onScroll = this._onScroll.bind(this)
    this._loadMoreData = _.debounce(this._loadMoreData.bind(this), 1000, {leading: true})
  }

  componentDidMount() {
    console.log('Will Mount')
    this.props.actions.getTrendingCampaigns({offset: 0})
    window.addEventListener('resize', this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight })
  }

  _loadMoreData(){
    console.log('loading more data')
    this.setState({
      loadingData: true
    })
    const postData = {
      offset: this.state.trendingCampaigns.length
    }
    return axios.post(`${TRIBELA_URL}/trendingcampaigns`, postData)
                .then((res) => {
                  console.log(res.data)
                  if (res.data.length > 0){
                    const trendingCampaigns = this.state.trendingCampaigns.concat(res.data)
                    this.setState({
                      trendingCampaigns,
                      loadingData: false
                    })
                  } else {
                    this.setState({
                      loadingData: false,
                      dataEndReached: true
                    })
                  }
                })
                .catch((err) => {
                  if (err.response.status === 600 ){
                    this.setState({
                      dataEndReached: true
                    })
                  }
                  this.setState({
                    loadingData: false
                  })
                })
  }

  cellRenderer({ index, key, parent, style }) {
    const campaign = this.state.trendingCampaigns[index]
    return (
      <CellMeasurer
        cache={cache}
        index={index}
        key={key}
        parent={parent}
      >
      <div style={style} >
        <Link to={`/campaign/${campaign.id}`} className='tile'>
          <img src={campaign.featured_image} className='tile_image' />
          <div className='tile_content'>
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
            </div>
          </Link>
        </div>
      </CellMeasurer>
    )
  }

  _onScroll({scrollTop, scrollHeight}) {
    if (scrollTop > 0.75 * scrollHeight && !this.state.dataEndReached && !this.state.loadingData){
      this._loadMoreData()
    }
  }

  render (){
    const columnCount = this.state.windowWidth < 720 ? 1 : 2
    const width = this.state.windowWidth < 720 ? 300 : 605

    const cellPositioner = createMasonryCellPositioner({
      cellMeasurerCache: cache,
      columnCount,
      columnWidth: defaultWidth,
      spacer: 5
    })
    return (
      <div className='home_container'>
        <div className='home_frame'>
          <WindowScroller>
            {({ height, isScrolling, registerChild, scrollTop }) => (
              <div>
                <img width='100%' src='./assets/stuff_war.png'/>
                <div className='grid_container'>
                  <div className='grid_title'>
                    <p>
                      Open Campaigns
                    </p>
                  </div>
                  <div className='grid_section'>
                    <Masonry
                      autoHeight
                      cellCount={this.state.trendingCampaigns.length}
                      cellMeasurerCache={cache}
                      cellPositioner={cellPositioner}
                      cellRenderer={this.cellRenderer}
                      scrollTop={scrollTop}
                      height={height}
                      width={width}
                      onScroll={this._onScroll}
                      style={{margin: 'auto'}}
                      overscanByPixels={300}
                      tabIndex={null}
                    />
                  </div>
                </div>
              </div>
            )}
          </WindowScroller>
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