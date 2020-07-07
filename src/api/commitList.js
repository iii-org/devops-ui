import request from '@/utils/request'

export function getCommitListByBranch(bId) {
  return request({
    url: '/devops-ui/commitList/' + bId,
    method: 'get'
  })
}
