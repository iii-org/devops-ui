import request from '@/utils/request'

export function getFileListByBranch(rId, branchName) {
  return request({
    url: '/repositories/rd/' + rId + '/branch/' + branchName + '/tree',
    method: 'get'
  })
}

export function addFile(rId, data) {
  return request({
    url: '/repositories/rd/' + rId + '/branch/files',
    method: 'POST',
    data
  })
}

export function deleteFile(fId) {
  return request({
    url: '/file/rd/' + fId,
    method: 'DELETE'
  })
}
