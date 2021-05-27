import request from '@/utils/request'
import User from '@/data/user'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export async function getUserInfo(userId) {
  const res = await request({
    url: `/user/${userId}`,
    method: 'get'
  })
  return new User(res.data)
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export async function getUser(page = 1, per_page = 10, search = '') {
  const res = await request({
    url: `/user/list?page=${page}&per_page=${per_page}&search=${search}`,
    method: 'get'
  })
  const userList = []
  for (const user of res.data.user_list) {
    userList.push(new User(user))
  }
  return {
    page: res.data.page,
    user_list: userList
  }
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
