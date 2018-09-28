import types from './index'
import _ from 'lodash'
import axios from '../utils/axios'
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
                  console.log(res.data)
                  if (_.isEmpty(res.data)){
                    alert('Username or password is incorrect!')
                  }
                  else {
                    const user = _.assign(res.data, {
                      loggedIn: true
                    })
                    const token = user.token
                    delete user.token
                    localStorage.setItem('user', JSON.stringify(user))
                    localStorage.setItem('token', JSON.stringify(token))
                    axios.defaults.headers.common = {
                      token
                    }
                    dispatch(userLoginDispatch(user))
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
    const user = {
      ...data
    }
    user.login_id = data.email
    const userData = {
      user
    }
    return axios.post(`${TRIBELA_URL}/newuser`, userData)
                .then((res) => {
                  callback()
                })
                .catch((err) => {
                  console.log(err)
                  alert('Registration failed')
                })
  }
}

export function userVerification(data, callback){
  return function(dispatch) {
    const userData = {
      user: {
        login_id: data.email,
        password: data.password,
        validation_string: data.validation_string
      }
    }
    return axios.post(`${TRIBELA_URL}/verifyUser`, userData)
                .then((res) => {
                  if (_.isEmpty(res.data)){
                    alert('Username or password is incorrect!')
                  }
                  else {
                    const user = _.assign(res.data, {
                      loggedIn: true
                    })
                    const token = user.token
                    delete user.token
                    localStorage.setItem('user', JSON.stringify(user))
                    localStorage.setItem('token', JSON.stringify(token))
                    axios.defaults.headers.common = {
                      token
                    }
                    dispatch(userLoginDispatch(user))
                    callback()
                  }
                })
                .catch((err) => {
                  console.log(err)
                  if (err.response.status === 422) {
                    alert('User already verified!')
                  }
                  else if (err.response.status === 401) {
                    alert('Your verification link is wrong please check again!')
                  }
                  else if (err.response.status === 403) {
                    alert('Username or password is incorrect!')
                  }
                  else {
                    alert('Login failed')
                  }
                })
  }
}

export function userLogOut() {
  return function(dispatch) {
    delete axios.defaults.headers.common["token"]
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    dispatch(dispatchUserLogout())
  }
}

function dispatchUserLogout(){
  return {
    type: types.USER_LOGOUT
  }
}

export function retrieveUserProfile(id) {
  if (!id) return
  return function(dispatch) {
    const userData = {
      user: {
        id
      }
    }
    return axios.post(`${TRIBELA_URL}/profile`, userData)
                .then((res) => {
                  const user = _.assign(res.data, {
                    loggedIn: true
                  })
                  dispatch(userLoginDispatch(user))
                  localStorage.setItem('user', JSON.stringify(user))
                })
                .catch((err) => {
                  console.log(err)
                })
  }
}

export function updateUsername(user, username) {
  return function(dispatch) {
    const userData = {
      user: {
        id: user.id,
        username
      }
    }
    return axios.post(`${TRIBELA_URL}/username`, userData)
                .then((res) => {
                  const updatedUser = {
                    ...user,
                    username
                  }
                  dispatch(dispatchUsernameUpdate(updatedUser))
                  localStorage.setItem('user', JSON.stringify(updatedUser))
                })
                .catch((err) => {
                  console.log(err)
                })
  }
}

function dispatchUsernameUpdate(user) {
  return {
    type: types.USER_USERNAME_UPDATE,
    user
  }
}