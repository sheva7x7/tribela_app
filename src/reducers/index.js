import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import contests from './contest'
import user from './user'

export const reducers = combineReducers({
  user,
  contests,
  routing: routerReducer
});