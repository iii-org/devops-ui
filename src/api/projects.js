import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/devops-ui/projects/list',
    method: 'get',
    params
  })
}
