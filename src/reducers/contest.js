import types from '../actions/index'
import initialState from './initialState'
import _ from 'lodash'

export default function(state = initialState.campaigns, action) {
  switch (action.type){
    case types.TRENDING_CAMPAIGNS:
      console.log({
        ...state,
        trendingCampaigns: action.trendingCampaigns
      })
      return {
        ...state,
        trendingCampaigns: action.trendingCampaigns
      }

    default: 
      return state
  }
}