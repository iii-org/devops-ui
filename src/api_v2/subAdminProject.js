import request from '@/utils/request'

export const getAdminProjects = () => request.get(`/v2/project_permission/admin_projects`)
export const getSubAdminProjects = (params) => request.get(`/v2/project_permission/subadmin_projects`, { params })
export const getSubAdmins = () => request.get(`/v2/project_permission/subadmins`)
export const setProjectPermission = (data) => request.post(`/v2/project_permission/set_permission`, data)
export const deleteProjectPermission = (data) => request.delete(`/v2/project_permission/set_permission`, { data: data })
