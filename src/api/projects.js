import request from '@/utils/request'

export function getProjectList(userId, params) {
  return request({
    url: '/project/rd/' + userId,
    method: 'get',
    params
  })
}

export function getActivityLog(activity_id) {
  return request({
    url: `/devops-ui/projects/activity/log/${activity_id}`,
    method: 'get'
  })
}

export function queryProjectList() {
  return request({
    url: `/project/list`,
    method: 'get'
  })
}

export function addNewProject(data = { name: '', identifier: '', description: '' }) {
  return request({
    url: `/project`,
    method: 'POST',
    data
  })
}

export function editProject(pId = '80', data = { name: '', identifier: '', description: '' }) {
  return request({
    url: `/project/${pId}`,
    method: 'PUT',
    data
  })
}

export function deleteProject(pId = '80') {
  return request({
    url: `/project/${pId}`,
    method: 'DELETE'
  })
}

export function getProjectAssignable(pId) {
  return request({
    url: `/project/${pId}/user/list?exclude=1`,
    method: 'GET'
  })
}
