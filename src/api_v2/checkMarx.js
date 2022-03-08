import request from '@/plugins/axios'

export const getCheckMarxScans = (project_id) => request.get(`/v2/checkmarx/scans/${project_id}`)
export const getCheckMarxScanStatus = (scan_id) => request.get(`/v2/checkmarx/scan_status/${scan_id}`)
export const getCheckMarxScanStats = (scan_id) => request.get(`/v2/checkmarx/scan_stats/${scan_id}`)
export const registerCheckMarxReport = (scan_id) => request.post(`/v2/checkmarx/report/${scan_id}`)
export const getCheckMarxReportStatus = (report_id) => request.get(`/v2/checkmarx/report_status/${report_id}`)
export const getCheckMarxReport = (report_id) => request.get(`/v2/checkmarx/report/${report_id}`, { responseType: 'blob' })
export const cancelCheckMarxScans = (scan_id) => request.post(`/v2/checkmarx/scan/${scan_id}/cancel`)
