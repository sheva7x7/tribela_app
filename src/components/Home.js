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
import Slider from "react-slick"
import axios from 'axios'
import { TRIBELA_URL } from '../utils/constants'
import * as campaignsActions from '../actions/campaigns' 
import { quantityFormat, calcTimeSince } from '../utils/helper'

import './styles/home.less'

class Home extends React.Component {

  static getDerivedStateFromProps(nextProps, prevState){
    if (prevState.featuredCampaigns.length < nextProps.featuredCampaigns.length){
      return {
        featuredCampaigns: nextProps.featuredCampaigns
      }
    }
    return null
  }
  
  constructor(props){
    super(props)

    this.state = {}
    this.state.windowHeight = window.innerHeight
    this.state.windowWidth = window.innerWidth
    this.state.columnCount = window.innerWidth < 720 ? 1 : 2
    this.state.featuredCampaigns = this.props.featuredCampaigns
    this.state.dataEndReached = false
    this.state.loadingData = false
    this.cellRenderer = this.cellRenderer.bind(this)
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    this._onScroll = this._onScroll.bind(this)
    this._loadMoreData = _.debounce(this._loadMoreData.bind(this), 1000, {leading: true})
    this.overscanIndicesGetter = this.overscanIndicesGetter.bind(this)
    this.updateOrientationChange = _.debounce(this.updateOrientationChange.bind(this), 100)
  }

  componentDidMount() {
    console.log('mount')
    this.props.actions.getFeaturedCampaigns({offset: 0})
    window.addEventListener('resize', this.updateWindowDimensions)
    window.addEventListener('orientationchange', this.updateOrientationChange)
  }

  updateWindowDimensions() {
    this.setState({ 
      windowWidth: window.innerWidth, 
      windowHeight: window.innerHeight,
      columnCount: window.innerWidth < 720 ? 1 : 2
    })
  }

  updateOrientationChange() {
    console.log(window.orientation, window.innerWidth)
    this.setState({ 
      windowWidth: window.innerWidth, 
      windowHeight: window.innerHeight,
      columnCount: window.innerWidth < 720 ? 1 : 2
    })
  }

  componentWillUnmount() {
    console.log('unmount')
    window.removeEventListener('resize', this.updateWindowDimensions)
    window.removeEventListener('orientationchange', this.updateOrientationChange)
  }

  _loadMoreData(){
    console.log('loading more data')
    this.setState({
      loadingData: true
    })
    const postData = {
      offset: this.state.featuredCampaigns.length
    }
    return axios.post(`${TRIBELA_URL}/featuredcampaigns`, postData)
                .then((res) => {
                  if (res.data.length > 0){
                    const campaigns = this.state.featuredCampaigns.concat(res.data)
                    console.log(campaigns, res.data.length, this.state.featuredCampaigns)
                    this.setState({
                      featuredCampaigns: campaigns,
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
    const index = rowIndex * this.state.columnCount + columnIndex
    const campaign = this.state.featuredCampaigns[index]
    const divStyle = _.assign({}, style)
    if (this.state.columnCount > 1 && columnIndex === 0) {
      divStyle.marginRight = 2.5
    }
    if (this.state.columnCount > 1 && columnIndex === 1) {
      divStyle.marginLeft = 2.5
    }
    if (index >= this.state.featuredCampaigns.length) {
      return null
    }
    return (
      <div style={divStyle} key={key}>
        <Link to={{pathname :`/campaign/${campaign.id}`, campaign}} className='tile'>
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
    const width = this.state.windowWidth < 720 ? this.state.windowWidth : 720
    return (
      <div className='home_container'>
        <div className='home_frame'>
          <WindowScroller>
            {({ height, isScrolling, registerChild, scrollTop }) => (
              <div>
                <Slider 
                  dots={true}
                  arrows={false}
                  autoplay={true}
                >
                  <Link to='/' className='image_container'>
                    <div className='overlay' />
                    <img width='100%' src='http://img.stuffwar.com/gallery/stuffwar.jpg' />
                  </Link>
                  <a href='http://tribela.io' className='image_container'>
                    <div className='overlay' />
                    <img width='100%' src='http://img.stuffwar.com/gallery/tribelasite.jpg' />
                  </a>
                  <a href='http://tribela.io/faq' className='image_container'>
                    <div className='overlay' />
                    <img width='100%' src='http://img.stuffwar.com/gallery/FAQ.jpg' />
                  </a>
                  <a href='http://tribela.io/the-currency-of-influence' className='image_container'>
                    <div className='overlay' />
                    <img width='100%' src='http://img.stuffwar.com/gallery/influence.jpg' />
                  </a>
                </Slider>
                <div className='grid_container'>
                  <div className='grid_title'>
                    <p>
                      Open Campaigns
                    </p>
                  </div>
                  <div className='grid_section'>
                      <Grid
                        autoHeight={true}
                        rowCount={Math.ceil(this.state.featuredCampaigns.length / this.state.columnCount)}
                        columnCount={this.state.columnCount}
                        cellRenderer={this.cellRenderer}
                        scrollTop={scrollTop}
                        width={width}
                        height={1000}
                        rowHeight={350}
                        columnWidth={300}
                        onScroll={this._onScroll}
                        overscanIndicesGetter={this.overscanIndicesGetter}
                        tabIndex={null}
                        containerStyle={{
                          marginRight: 'auto', 
                          marginLeft: 'auto', 
                          width: 300*this.state.columnCount + 5 * (this.state.columnCount - 1),
                          minWidth: 300*this.state.columnCount + 5 * (this.state.columnCount - 1)
                        }}
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
	featuredCampaigns: PropTypes.array
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    featuredCampaigns: state.campaigns.featuredCampaigns
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