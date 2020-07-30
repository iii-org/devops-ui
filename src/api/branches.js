import request from '@/utils/request'

export function getBranchesByProject(rId) {
  return request({
    url: '/repositories/rd/'+rId+'/branch',
    method: 'get'
  })
}

export function newBranch(rId, data){
  return request({
    url: '/repositories/rd/'+rId+'/branch',
    method: 'POST',
    data
  })
}

export function deleteBranch(rId, bName){
  return request({
    url: '/repositories/rd/'+rId+'/branch/'+bName,
    method: 'DELETE'
  })
}

export function mergeBranch(rId, data){
  return request({
    url: '/repositories/rd/'+rId+'/merge_branches',
    method: 'POST',
    data
  })
}