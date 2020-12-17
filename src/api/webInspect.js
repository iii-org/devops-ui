import request from '@/utils/request'

export function getWebInspectScans(project_name) {
  return request({
    url: `/webinspect/list_scan/${project_name}`,
    method: 'get'
  })
}

export function getWebInspectStatus(wi_scan_id) {
  return request({
    url: `/webinspect/status/${wi_scan_id}`,
    method: 'get'
  })
}

export function getWebInspectStats(wi_scan_id) {
  return request({
    url: `/webinspect/stats/${wi_scan_id}`,
    method: 'get'
  })
}

export function getWebInspectReport(wi_scan_id) {
  return request({
    url: `/webinspect/report/${wi_scan_id}`,
    method: 'get'
  })
}

