import request from '@/utils/request'

export function getSideexReport(sideex_id) {
  return request({
    url: `/sideex_report/${sideex_id}`,
    method: 'get'
  })
}