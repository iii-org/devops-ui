import request from '@/utils/request'

export function getBranchesByProject(rId) {
  return request({
    url: '/repositories/' + rId + '/branches',
    method: 'get'
  })
}

export function newBranch(rId, data) {
  return request({
    url: '/repositories/' + rId + '/branches',
    method: 'POST',
    data
  })
}

export function deleteBranch(rId, bName) {
  return request({
    url: '/repositories/' + rId + '/branch/' + bName,
    method: 'DELETE'
  })
}

export function mergeBranch(rId, data) {
  return request({
    url: '/repositories/' + rId + '/merge_branches',
    method: 'POST',
    data
  })
}
