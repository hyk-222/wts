import axios from 'axios'
import { getToken } from './auth'

const service = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
  withCredentials: true
})

service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token && token !== 'undefined') {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    if (config.headers.isToken === false) {
      delete config.headers['Authorization']
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      console.error('Response error:', res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    console.error('Response error:', error.message)
    return Promise.reject(error)
  }
)

export default service