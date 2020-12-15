import request from '@/utils/request'

export function getFileListByBranch(rId, branchName) {
  return request({
    url: '/repositories/' + rId + '/branch/' + branchName + '/tree',
    method: 'get'
  })
}

export function addFile(rId, data) {
  return request({
    url: '/repositories/' + rId + '/branch/files',
    method: 'POST',
    data
  })
}

export function deleteFile(fId) {
  return request({
    url: '/file/' + fId,
    method: 'DELETE'
  })
}
