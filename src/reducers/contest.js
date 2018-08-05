import types from '../actions/index'
import initialState from './initialState'
import _ from 'lodash'

export default function(state = initialState.campaigns, action) {
  switch (action.type){
    case types.FEATURED_CAMPAIGNS:
      return {
        ...state,
        featuredCampaigns: action.featuredCampaigns
      }

    case types.TRENDING_CAMPAIGNS:
      return {
        ...state,
        trendingCampaigns: action.trendingCampaigns
      }

    default: 
      return state
  }
}