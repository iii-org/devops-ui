import request from '@/utils/request'

export const getCheckMarxScans = (project_id) => request.get(`/checkmarx/scans/${project_id}`)
export const getCheckMarxScanStatus = (scan_id) => request.get(`/checkmarx/scan_status/${scan_id}`)
export const getCheckMarxScanStats = (scan_id) => request.get(`/checkmarx/scan_stats/${scan_id}`)
export const registerCheckMarxReport = (scan_id) => request.post(`/checkmarx/report/${scan_id}`)
export const getCheckMarxReportStatus = (report_id) => request.get(`/checkmarx/report_status/${report_id}`)
export const getCheckMarxReport = (report_id) => request.get(`/checkmarx/report/${report_id}`, { responseType: 'blob' })
export const cancelCheckMarxScans = (scan_id) => request.post(`/checkmarx/scan/${scan_id}/cancel`)
