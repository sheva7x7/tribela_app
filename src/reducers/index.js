import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import contests from './contest'

export const reducers = combineReducers({
  contests,
  routing: routerReducer
});