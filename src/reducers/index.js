import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import campaigns from './contest'
import user from './user'

export const reducers = combineReducers({
  user,
  campaigns,
  routing: routerReducer
});