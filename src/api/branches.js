import request from '@/utils/request'

export function getBranchesByProject(pId) {
  return request({
    url: '/devops-ui/branches/' + pId,
    method: 'get'
  })
}
