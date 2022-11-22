import request from '@/utils/request'
import User from '@/data/user'

export const login = (data) => request.post('/v2/user/login', data)
export const logout = () => request.post(`/v2/user/logout`)
export const addUser = (data) => request.post(`/v2/user`, data)
export const updateUser = (user_id, data) => request.put(`/v2/user/${user_id}`, data)
export const deleteUser = (user_id) => request.delete(`/v2/user/${user_id}`)
export const getK8SConfig = (user_id) => request.get(`/v2/user/${user_id}/config`)
export const getRoleList = () => request.get('/v2/user/role/list')
export const getUserListByFilter = (params) => request.get('/v2/user/list', { params })
export const getUserIssueList = (user_id, params, config) =>
  request.get(`/v2/user/${user_id}/issues`, { params, ...config })
export const getRoutes = () => request.get(`/v2/router`)
export const getUserInfo = async (user_id) => {
  const res = await request.get(`/v2/user/${user_id}`)
  return new User(res.data)
}
export const getUser = async (page = 1, per_page = 10, search = '') => {
  const res = await request.get(`/v2/user/list?page=${page}&per_page=${per_page}&search=${search}`)
  const userList = []
  for (const user of res.data.user_list) {
    userList.push(new User(user))
  }
  return {
    page: res.data.page,
    user_list: userList
  }
}

export const getUserMessageInfo = (user_id) => request.get(`/v2/user/message_type/${user_id}`)
export const updateUserMessageInfo = (user_id, data) => request.patch(`/v2/user/message_type/${user_id}`, data)
export const getRouter = () => request.get(`/v2/ui_router`)
export const getServerPasswordInfo = (user_id) => request.get(`/v2/user/${user_id}/newpasswordinfo`)
