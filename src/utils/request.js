import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCodes from '../error-codes'
import { getLanguage } from '@/lang/index'

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
        duration: 5 * 1000
      })

      return Promise.reject(new Error(message || 'Error'))
    }
    // TODO(nino): because some api success will not return right format, so comment here temporarily
    // else if(res.message !== 'success') {
    //   Message({
    //     message: res.message,
    //     type: 'error',
    //     duration: 5 * 1000
    //   })
    //   return Promise.reject(new Error(res.message || 'Error'))
    // }
    // else {
    //   return res
    // }
    else {
      if (res) {
        return res
      }
      return 'test'
    }
  },
  error => {
    const res = error.response.data
    let res_msg = res.message
    if (
      'error' in res &&
      'code' in res['error'] &&
      res['error']['code'] in errorCodes
    ) {
      const error_msg = errorCodes[res['error']['code']][getLanguage() || 'zh'] // language default is zh
      const error_msg_details = res.error.details || {}
      res_msg = error_msg
      Object.keys(error_msg_details).forEach(key => {
        res_msg = res_msg.replace(new RegExp(`\\$${key}`), error_msg_details[key].toString())
      })
    }
    Message({
      message: res_msg,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
