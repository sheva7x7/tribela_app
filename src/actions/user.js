import types from './index'
import _ from 'lodash'
import axios from 'axios'
import { TRIBELA_URL } from '../utils/constants'

export function userLogin(data, callback) {
  return function(dispatch) {
    const userData = {
      user: {
        login_id: data.email,
        password: data.password
      }
    }
    return axios.post(`${TRIBELA_URL}/login`, userData)
                .then((res) => {
                  if (_.isEmpty(res.data)){
                    alert('Username or Password Error')
                  }
                  else {
                    const user = _.assign(res.data, {
                      loggedIn: true
                    })
                    dispatch(userLoginDispatch(user))
                    localStorage.setItem('user', JSON.stringify(user))
                    callback()
                  }
                })
                .catch((err) => {
                  console.log(err)
                  alert('Login failed')
                })
  }
}

function userLoginDispatch(user) {
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
        email: data.email,
        password: data.password
      }
    }
    return axios.post(`${TRIBELA_URL}/newuser`, userData)
                .then((res) => {
                  const user = _.assign({
                    email: data.email,
                    loggedIn: true
                  })
                  dispatch(userRegisterDispatch(user))
                  callback()
                })
                .catch((err) => {
                  console.log(err)
                  alert('Registration failed')
                })
  }
}

function userRegisterDispatch(user) {
  return {
    type: types.USER_REGISTER,
    user
  }
}