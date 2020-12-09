import request from '@/utils/request'

export function getCheckMarxScans(project_id) {
  return request({
    url: `/checkmarx/scans/${project_id}`,
    method: 'get'
  })
}

export function getCheckMarxReportStatus(scan_id) {
  return request({
    url: `/checkmarx/scan_status/${scan_id}`,
    method: 'get'
  })
}

export function getCheckMarxReportStats(scan_id) {
  return request({
    url: `/checkmarx/scan_stats/${scan_id}`,
    method: 'get'
  })
}

export function registerCheckMarxReport(scan_id) {
  return request({
    url: `/checkmarx/report/${scan_id}`,
    method: 'post'
  })
}

export function getCheckMarxReport(report_id) {
  return request({
    url: `/checkmarx/report/${report_id}`,
    responseType: 'blob',
    method: 'get'
  })
}
