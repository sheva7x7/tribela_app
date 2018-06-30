import types from './index'
import _ from 'lodash'

export function userLogin(data, callback) {
  return function(dispatch) {
    dispatch(userLoginDispatch(data))
    callback()
  }
}

function userLoginDispatch(data) {
  const user = _.assign(data, {
    loggedIn: true
  })
  return {
    type: types.USER_LOGIN,
    user
  }
}

export function userRegister(data, callback) {
  return function(dispatch) {
    dispatch(userRegisterDispatch(data))
    callback()
  }
}

function userRegisterDispatch(data) {
  const user = _.assign({
    email: data.email,
    loggedIn: true
  })
  return {
    type: types.USER_REGISTER,
    user
  }
}