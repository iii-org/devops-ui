import request from '@/utils/request'

export function getAllActivities(params) {
  return request({
    url: '/all_activities',
    method: 'get',
    params
  })
}

export function getProjectActivities(pId) {
  return request({
    url: `/project/${pId}/activities`,
    method: 'get'
  })
}
