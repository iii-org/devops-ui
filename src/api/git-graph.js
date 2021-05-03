import request from '@/utils/request'

export function getGitGraphByRepo(rId) {
  return request({
    url: '/repositories/' + rId + '/overview',
    method: 'GET'
  })
}

export const getGitBranchByRepo = (rId) => request.get('/repositories/' + rId + '/branches')
export const getGitCommitByRepo = (rId, params) => request.get('/repositories/' + rId + '/commits', { params: params })
