import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import campaigns from './contest'
import user from './user'
import campaignCacheState from './campaignCache'

export const reducers = combineReducers({
  user,
  campaigns,
  campaignCacheState,
  routing: routerReducer
});