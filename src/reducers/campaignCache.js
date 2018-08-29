import types from '../actions/index'
import initialState from './initialState'
import _ from 'lodash'

export default function(state = initialState.campaignCacheState, action) {
  switch (action.type){
    case types.CACHE_CAMPAIGN:
      return {
        ...action.cacheCampaign
      }

    default: 
      return state
  }
}