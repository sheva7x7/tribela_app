import types from './index'
import _ from 'lodash'
import axios from 'axios'
import { TRIBELA_URL } from '../utils/constants'

export function getFeaturedCampaigns(data) {
  return function(dispatch) {
    const postData = {
      offset: data.offset
    }
    return axios.post(`${TRIBELA_URL}/featuredcampaigns`, postData)
                .then((res) => {
                  console.log(res.data)
                  dispatch(getFeaturedCampaignsDispatch(res.data))
                })
                .catch((err) => {
                  console.log(err)
                })
  }
}

function getFeaturedCampaignsDispatch(data) {
  return {
    type: types.FEATURED_CAMPAIGNS,
    featuredCampaigns: data
  }
}

export function getTrendingCampaigns(data) {
  return function(dispatch) {
    const postData = {
      offset: data.offset
    }
    return axios.post(`${TRIBELA_URL}/trendingcampaigns`, postData)
                .then((res) => {
                  console.log(res.data)
                  dispatch(getTrendingCampaignsDispatch(res.data))
                })
                .catch((err) => {
                  console.log(err)
                })
  }
}

function getTrendingCampaignsDispatch(data) {
  return {
    type: types.TRENDING_CAMPAIGNS,
    trendingCampaigns: data
  }
}