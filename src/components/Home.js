import React from "react"
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import {Link} from 'react-router-dom'
import {
  WindowScroller,
  Grid
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

class Home extends React.Component {

  static getDerivedStateFromProps(nextProps, prevState){
    if (prevState.trendingCampaigns.length < nextProps.trendingCampaigns.length){
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
    this.overscanIndicesGetter = this.overscanIndicesGetter.bind(this)
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
                  if (res.data.length > 0){
                    const campaigns = this.state.trendingCampaigns.concat(res.data)
                    console.log(campaigns, res.data.length, this.state.trendingCampaigns)
                    this.setState({
                      trendingCampaigns: campaigns,
                      loadingData: false
                    }, () => {
                      this.gridRef.forceUpdate()
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

  cellRenderer({ columnIndex, key, rowIndex, style }) {
    const columnCount = this.state.windowWidth < 720 ? 1 : 2
    const index = rowIndex * columnCount + columnIndex
    const campaign = this.state.trendingCampaigns[index]
    const divStyle = _.assign({}, style)
    if (columnCount > 1 && columnIndex === 0) {
      divStyle.marginRight = 2.5
    }
    if (columnCount > 1 && columnIndex === 1) {
      divStyle.marginLeft = 2.5
    }
    return (
      <div style={divStyle} key={key}>
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
    )
  }

  overscanIndicesGetter ({
    direction,          // One of "horizontal" or "vertical"
    cellCount,          // Number of rows or columns in the current axis
    scrollDirection,    // 1 (forwards) or -1 (backwards)
    overscanCellsCount, // Maximum number of cells to over-render in either direction
    startIndex,         // Begin of range of visible cells
    stopIndex           // End of range of visible cells
  }) {
    return {
      overscanStartIndex: Math.max(0, startIndex - 3),
      overscanStopIndex: Math.min(cellCount - 1, stopIndex + 3)
    }
  }

  _onScroll({scrollTop, scrollHeight}) {
    if (scrollTop > 0.75 * scrollHeight && !this.state.dataEndReached && !this.state.loadingData){
      this._loadMoreData()
    }
  }

  render (){
    const columnCount = this.state.windowWidth < 720 ? 1 : 2
    const spacer = this.state.windowWidth < 720 ? 0 : 5
    const width = this.state.windowWidth < 720 ? this.state.windowWidth : 720
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
                      <Grid
                        autoHeight={true}
                        rowCount={this.state.trendingCampaigns.length / columnCount}
                        columnCount={columnCount}
                        cellRenderer={this.cellRenderer}
                        scrollTop={scrollTop}
                        width={width}
                        height={1000}
                        rowHeight={350}
                        columnWidth={300}
                        onScroll={this._onScroll}
                        overscanIndicesGetter={this.overscanIndicesGetter}
                        tabIndex={null}
                        containerStyle={{marginRight: 'auto', marginLeft: 'auto'}}
                        ref={ref => this.gridRef = ref}
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