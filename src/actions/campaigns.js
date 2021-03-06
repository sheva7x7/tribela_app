import types from './index'
import _ from 'lodash'
import axios from '../utils/axios'
import { TRIBELA_URL } from '../utils/constants'

export function getFeaturedCampaigns(data) {
  return function(dispatch) {
    const postData = {
      offset: data.offset
    }
    return axios.post(`${TRIBELA_URL}/featuredcampaigns`, postData)
                .then((res) => {
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

export function getVotedCampaigns(user_id) {
  return function(dispatch) {
    const postData = {
      vote: {
        voter_id: user_id
      }
    }
    console.log(axios.defaults.headers)
    return axios.post(`${TRIBELA_URL}/votedcampaigns`, postData)
                .then((res) => {
                  dispatch(getVotedCampaignsDispatch(res.data))
                })
                .catch((err) => {
                  console.log(err)
                })
  }
}

function getVotedCampaignsDispatch(data) {
  return {
    type: types.VOTED_CAMPAIGNS,
    votedCampaigns: data
  }
}

export function cacheCampaign(state){
  return function(dispatch) {
    dispatch(cacheCampaignDispatch(state))
  }
}

function cacheCampaignDispatch(state){
  return {
    type: types.CACHE_CAMPAIGN,
    cacheCampaign: state
  }
}