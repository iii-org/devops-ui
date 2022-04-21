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

const handleErrorMessage = (data) => {
  let res_msg = ''
  if (data.error.details && data.error.details.response && data.error.details.response.hasOwnProperty('errors')) {
    // only for #3600 issue
    res_msg = handleRedmineError(data.error.details.response.errors)
  } else if (data.error.details) {
    res_msg = handleRegularError(data.error)
  } else {
    res_msg = i18n.t(`errorMessage.${data.error.code}`)
  }
  return res_msg
}

const handleRedmineError = (errors) => {
  let message = ''
  for (const key in errors) {
    message = errors[key]
  }
  return message
}

const handleRegularError = (error) => {
  const details = {}
  for (const key in error.details) {
    details[key] = i18n.te(`errorDetail.${error.details[key]}`) ? i18n.t(`errorDetail.${error.details[key]}`) : error.details[key]
  }
  return i18n.t(`errorMessage.${error.code}`, details)
}

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
      res_msg = handleErrorMessage(data)
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
