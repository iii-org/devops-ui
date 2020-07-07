import request from '@/utils/request'

export function getFileListByBranch(bId) {
  return request({
    url: '/devops-ui/fileList/' + bId,
    method: 'get'
  })
}
