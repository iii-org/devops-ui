import request from '@/utils/request'

export function getBranchesByProject(rId) {
  return request({
    url: '/repositories/' + rId + '/branches',
    method: 'get'
  })
}
