import request from '@/utils/request'

export function getSideexScans(project_id) {
  return request({
    url: `/project/${project_id}/sideex`,
    method: 'get'
  })
}

export function getSideexReport(sideex_id) {
  return request({
    url: `/sideex_report/${sideex_id}`,
    method: 'get'
  })
}
