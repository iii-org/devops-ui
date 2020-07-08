import Cookies from 'js-cookie'

const JWT = 'jwtToken'
const JWTContent = 'jwtTokenContent'

export function getToken() {
  return Cookies.get(JWT)
}

export function setToken({ token, jwtContent }) {
  if (Cookies.set(JWT, token) && Cookies.set(JWTContent, jwtContent)) {
    return true
  } else {
    return false
  }
}

export function getJWTContent() {
  return Cookies.get(JWTContent)
}

export function removeToken() {
  if (Cookies.remove(JWT) && Cookies.remove(JWTContent)) {
    return true
  } else {
    return false
  }
}
