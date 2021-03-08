import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import i18n from '@/lang'

axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (response.status < 200 || response.status >= 300) {
      let message = 'Unknown Error'
      res.code === 401 && (message = 'Unauthorized')
      res.code === 403 && (message = 'Forbidden')
      res.code === 500 && (message = 'Internal Server Error')
      Message({
        message: message,
        type: 'error',
        duration: 10 * 1000
      })

      return Promise.reject(new Error(message || 'Error'))
    } else {
      if (res) {
        return res
      }
      return 'test'
    }
  },
  error => {
    const res = error.response.data
    const res_msg =
      (res.error && i18n.te(`errorMessage.${res.error.code}`))
        ? i18n.t(`errorMessage.${res.error.code}`, res.error.details || {})
        : res.message
    Message({
      message: res_msg,
      type: res.error.code < 3000 ? 'warning' : 'error',
      duration: 6000
    })
    return Promise.reject(error)
  }
)

export default service
