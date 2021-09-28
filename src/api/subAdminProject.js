import request from '@/utils/request'

export const getAdminProjects = () => request.get(`/project_permission/admin_projects`)
export const getSubAdminProjects = (params) => request.get(`/project_permission/subadmin_projects`, { params })
export const getSubAdmins = () => request.get(`/project_permission/subadmins`)
export const setProjectPermission = (data) => request.post(`/project_permission/set_permission`, data)
export const deleteProjectPermission = (data) => request.delete(`/project_permission/set_permission`, { data: data })
