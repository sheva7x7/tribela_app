import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import campaigns from './contest'
import user from './user'
import campaignCacheState from './campaignCache'
import announcements from './announcements'

export const reducers = combineReducers({
  user,
  campaigns,
  campaignCacheState,
  announcements,
  routing: routerReducer
});