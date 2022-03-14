import request from '@/utils/request'

export const getWebInspectScans = (project_name) => request.get(`/v2/webinspect/list_scan/${project_name}`)
export const getWebInspectStatus = (wi_scan_id) => request.get(`/v2/webinspect/status/${wi_scan_id}`)
export const getWebInspectStats = (wi_scan_id) => request.get(`/v2/webinspect/stats/${wi_scan_id}`)
export const getWebInspectReport = (wi_scan_id) => request.get(`/v2/webinspect/report/${wi_scan_id}`)
