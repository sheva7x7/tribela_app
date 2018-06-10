import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import contests from './contest'

console.log(contests)
export const reducers = combineReducers({
  contests,
  routing: routerReducer
});