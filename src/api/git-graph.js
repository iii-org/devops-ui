import request from '@/utils/request'

export function getGitGraphByRepo(rId) {
  return request({
    url: '/repositories/'+rId,
    method: 'get'
  })
}
