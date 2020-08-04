import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(userId) {
  return request({
    url: `/user/${userId}`,
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function updateUser(userId, data) {
  return request({
    url: `/user/${userId}`,
    method: 'put',
    data
  })
}
