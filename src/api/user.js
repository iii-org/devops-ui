import request from '@/utils/request'
import User from '@/data/user'

export const login = (data) => request.post('/user/login', data)
export const logout = () => request.post(`/user/logout`)
export const addUser = (data) => request.post(`/user`, data)
export const updateUser = (userId, data) => request.put(`/user/${userId}`, data)
export const deleteUser = (userId) => request.delete(`/user/${userId}`)
export const getK8SConfig = (userId) => request.get(`/user/${userId}/config`)
export const getRoleList = () => request.get('/user/role/list')
export const getUserListByFilter = (params) => request.get('/user/list', { params })
export const getUserIssueList = (userId, params, config) => request.get(`/user/${userId}/issues`, { params, ...config })
export const getRoutes = () => request.get(`/router`)
export const getUserInfo = async (userId) => {
  const res = await request.get(`/user/${userId}`)
  return new User(res.data)
}
export const getUser = async (page = 1, per_page = 10, search = '') => {
  const res = await request.get(`/user/list?page=${page}&per_page=${per_page}&search=${search}`)
  const userList = []
  for (const user of res.data.user_list) {
    userList.push(new User(user))
  }
  return {
    page: res.data.page,
    user_list: userList
  }
}
export const getAllUser = async () => {
  const res = await request.get(`/user/list`)
  const userList = []
  for (const user of res.data.user_list) {
    userList.push({ id: user.id, name: user.name, login: user.login })
  }
  return userList
}

export const getRouter = () => request.get(`/ui_router`)
