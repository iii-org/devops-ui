import request from '@/utils/request'

export function getCommitListByBranch(rId, bName) {
  return request({
    url: '/repositories/rd/'+rId+'/branch/'+ bName,
    method: 'get'
  })
}
