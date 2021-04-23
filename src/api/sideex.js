import request from '@/utils/request'

export function getSideexScans(project_id) {
  return request({
    url: `/project/${project_id}/sideex`,
    method: 'get'
  })
}