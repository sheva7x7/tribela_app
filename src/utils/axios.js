import axios from 'axios'

const axiosInstance = axios.create()

const token = JSON.parse(localStorage.getItem('token'))
if (token){
  axiosInstance.defaults.headers.common = {
    token
  }
}

export default axiosInstance