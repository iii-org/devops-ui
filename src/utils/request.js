import axios from 'axios'
import i18n from '@/lang'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'

axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
const blobToJson = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = res => {
      const { result } = res.target
      const parseResult = JSON.parse(result)
      resolve(parseResult)
    } 
    reader.onerror = err => {
      reject(err)
    } 
    reader.readAsText(new Blob([blob]), 'utf-8')
  })
}

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API
})

service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (response.status >= 300) {
      return Promise.reject(new Error())
    }
    return res
  },
  async error => {
    if (axios.isCancel(error)) {
      return Promise.resolve({})
    }
    const { data, config } = error.response
    let res_msg
    if (data.error && i18n.te(`errorMessage.${data.error.code}`)) {
      const details = {}
      if (data.error.details) {
        for (const key in data.error.details) {
          details[key] = i18n.te(`errorDetail.${data.error.details[key]}`) ? i18n.t(`errorDetail.${data.error.details[key]}`) : data.error.details[key]
        }
      }
      res_msg = i18n.t(`errorMessage.${data.error.code}`, details)
    } else if (config.responseType === 'blob') {
      const errorJson = await blobToJson(data)
      return Promise.reject(errorJson)
    } else {
      res_msg = data.message
    }
    Message({
      message: res_msg,
      type: data.error.code < 3000 ? 'warning' : 'error',
      duration: 6000
    })
    return Promise.reject(error)
  }
)

export default service
