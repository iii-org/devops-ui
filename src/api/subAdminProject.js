import request from '@/utils/request'

export function getAdminProjects() {
  return request({
    url: `/project_permission/admin_projects`,
    method: 'get'
  })
}

export function getSubAdminProjects(params) {
  return request({
    url: `/project_permission/subadmin_projects`,
    method: 'get',
    params
  })
}

export function getSubAdmins() {
  return request({
    url: `/project_permission/subadmins`,
    method: 'get'
  })
}

export function setProjectPermission(data) {
  return request({
    url: `/project_permission/set_permission`,
    method: 'post',
    data
  })
}

export function deleteProjectPermission(data) {
  return request({
    url: `/project_permission/set_permission`,
    method: 'delete',
    data
  })
}
