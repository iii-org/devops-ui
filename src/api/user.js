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

export function getAllUser() {
  return request({
    url: `/user/list`,
    method: 'get'
  })
}

export function getUser(page = 1, per_page = 10, search = '') {
  return request({
    url: `/user/list?page=${page}&per_page=${per_page}&search=${search}`,
    method: 'get'
  })
}

export function updateUser(userId, data) {
  return request({
    url: `/user/${userId}`,
    method: 'put',
    data
  })
}

export function addUser(data) {
  return request({
    url: `/user`,
    method: 'post',
    data
  })
}

export function deleteUser(userId) {
  return request({
    url: `/user/${userId}`,
    method: 'delete'
  })
}

export function getK8SConfig(userId) {
  return request({
    url: `/user/${userId}/config`,
    method: 'get'
  })
}

export const getRoleList = () => request.get('/user/role/list')
export const getUserListByFilter = (params) => request.get('/user/list', { params: params })
