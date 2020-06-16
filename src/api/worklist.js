import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/devops-ui/worklist/list',
    method: 'get',
    params
  })
}
