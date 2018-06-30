import types from '../actions/index'
import initialState from './initialState'
import _ from 'lodash'

export default function (state = initialState.user, action) {
  switch (action.type){
    case types.USER_LOGIN:
      return _.assign(state, {
        user: action.user
      })

    case types.USER_REGISTER:
      return _.assign(state, {
        user: action.user
      })

    default: 
      return state
  }

}