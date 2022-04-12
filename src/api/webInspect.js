import request from '@/utils/request'

export const getWebInspectScans = (project_name) => request.get(`/webinspect/list_scan/${project_name}`)
export const getWebInspectStatus = (wi_scan_id) => request.get(`/webinspect/status/${wi_scan_id}`)
export const getWebInspectStats = (wi_scan_id) => request.get(`/webinspect/stats/${wi_scan_id}`)
export const getWebInspectReport = (wi_scan_id) => request.get(`/webinspect/report/${wi_scan_id}`)
export const getWebInspectPod = (project_id) => request.get(`/project/${project_id}/plugin?plugin_name=test-webinspect`)
