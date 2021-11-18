import Cookies from 'js-cookie'

const TOKEN = 'jwtToken'
const EXPIRATION = 'tokenExpiration'

export function getToken() {
  return Cookies.get(TOKEN)
}

export function getTokenExpiration() {
  return Cookies.get(EXPIRATION)
}

export function setToken(token) {
  Cookies.set(TOKEN, token, { expires: (1 / 24 / 60) * 1430 })
  Cookies.set(EXPIRATION, token, { expires: (1 / 24 / 60) * 1425 })
}

export function removeToken() {
  Cookies.remove(TOKEN)
  Cookies.remove(EXPIRATION)
}
