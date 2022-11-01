import store from '../store'

export const isAllowedTypes = fileType => {
  const map = store.getters.allowedFileType
  return map[fileType] !== undefined
}

export const isEmptyOrTXT = fileType => {
  const map = {
    '': '',
    'text/plain': '.txt'
  }
  return map[fileType] !== undefined
}

export const isJSON = fileType => {
  const map = {
    'application/json': '.json'
  }
  return map[fileType] !== undefined
}

export const fileSizeToMB = fileSize => fileSize / 1024 ** 2

export const containSpecialChar = fileName => {
  const reg = /[\\/:*?"<>|#{}%~&]/
  return reg.test(fileName)
}
