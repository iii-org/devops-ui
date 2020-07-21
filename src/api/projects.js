import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/devops-ui/projects/list',
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