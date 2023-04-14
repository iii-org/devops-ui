import request from '@/utils/request'

export const getWebInspectScans = (project_id, params) => request.get(`/v2/project/${project_id}/webinspect/scan`, { params })
export const getWebInspectReport = (project_id, params) => request.get(`/v2/project/${project_id}/webinspect/scan/report`, { params, responseType: 'blob' })
