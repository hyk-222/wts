import axios from 'axios'
import { getToken, getWdsToken } from './auth'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || 'http://localhost:8080',
  timeout: 15000,
  withCredentials: true
})

service.interceptors.request.use(
  config => {
    // 优先使用 wdsToken，其次使用 Admin-Token
    const wdsToken = getWdsToken()
    const adminToken = getToken()
    const token = wdsToken || adminToken
    
    if (token && token !== 'undefined' && token !== undefined) {
      config.headers['Authorization'] = 'Bearer ' + token
      config.headers['token'] = token
    }
    if (config.headers.isToken === false) {
      delete config.headers['Authorization']
      delete config.headers['token']
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