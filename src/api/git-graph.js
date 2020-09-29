import request from '@/utils/request'

export function getGitGraphByRepo(pId) {
  return request({
    url: '/repositories/' + pId + '/overview',
    method: 'GET'
  })
}
