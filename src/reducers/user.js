import types from '../actions/index'
import initialState from './initialState'
import _ from 'lodash'

export default function (state = initialState.user, action) {
  switch (action.type){
    case types.USER_LOGIN:
      return {
        ...state,
        ...action.user
      }

    case types.USER_REGISTER:
      return {
        ...state,
        ...action.user
      }

    default: 
      return state
  }

}