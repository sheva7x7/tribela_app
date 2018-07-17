import types from './index'
import _ from 'lodash'
import axios from 'axios'
import { TRIBELA_URL } from '../utils/constants'

export function userLogin(data, callback) {
  return function(dispatch) {
    const userData = {
      user: {
        login_id: data.email,
        email: data.email,
        password: data.password
      }
    }
    return axios.post(`${TRIBELA_URL}/login`, userData)
                .then((res) => {
                  if (_.isEmpty(res.data)){
                    alert('Username or Password Error')
                  }
                  else {
                    dispatch(userLoginDispatch(res.data))
                    callback()
                  }
                })
                .catch((err) => {
                  console.log(err)
                  alert('Login failed')
                })
  }
}

function userLoginDispatch(data) {
  console.log(data)
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
    const userData = {
      user: {
        login_id: data.email,
        password: data.password
      }
    }
    return axios.post(`${TRIBELA_URL}/newuser`, userData)
                .then((res) => {
                  dispatch(userRegisterDispatch(res.data))
                  callback()
                })
                .catch((err) => {
                  console.log(err)
                  alert('Registration failed')
                })
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