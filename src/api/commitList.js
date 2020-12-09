import request from '@/utils/request'

export function getCommitListByBranch(rId, params) {
  return request({
    url: 'repositories/' + rId + '/commits',
    method: 'get',
    params
  })
}
