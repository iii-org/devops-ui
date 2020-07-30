import request from '@/utils/request'

export function getProjectList(userId, params) {
  return request({
    url: '/project/rd/'+userId,
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