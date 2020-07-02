import Cookies from 'js-cookie'

const TokenKey = 'jwtToken'
const TokenContentKey = 'jwtTokenContent'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function getTokenContent() {
  return Cookies.get(TokenContentKey)
}

export function setTokenContent(data) {
  return Cookies.set(TokenContentKey, data)
}

export function removeToken() {
  Cookies.remove(TokenContentKey)
  return Cookies.remove(TokenKey)
}
