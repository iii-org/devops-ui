import Cookies from 'js-cookie'

const TOKEN = 'jwtToken'

export function getToken() {
  return Cookies.get(TOKEN)
}

export function setToken(token) {
  if (Cookies.set(TOKEN, token)) {
    return true
  } else {
    return false
  }
}

export function removeToken() {
  if (Cookies.remove(TOKEN)) {
    return true
  } else {
    return false
  }
}