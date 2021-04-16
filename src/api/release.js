import request from '@/utils/request'

export function createRelease(project_id, data) {
  return request({
    url: `/project/${project_id}/releases`,
    method: 'post',
    data
  })
}
