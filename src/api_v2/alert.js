import request from '@/plugins/axios'

export const changeProjectAlertSettings = (project_id, params) => request.post(`/v2/project/${project_id}/alert`, params)
export const getAlertSettingsByProject = (project_id) => request.get(`/v2/project/${project_id}/alert`)
export const updateAlertSettingsByProject = (alert_id, data) => request.patch(`/v2/alert/${alert_id}`, data)
