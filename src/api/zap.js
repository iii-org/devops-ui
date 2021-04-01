import request from '@/utils/request'

export function getZapScans(project_id) {
  return request({
    url: `/project/${project_id}/zap`,
    method: 'get'
  })
}
