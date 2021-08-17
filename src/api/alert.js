import request from '@/utils/request'

export const changeProjectAlertSettings = (pId, params) => request.post(`/project/${pId}/alert`, params)
export const getAlertSettingsByProject = (pId) => request.get(`/project/${pId}/alert`)
export const updateAlertSettingsByProject = (alert_id, data) => request.patch(`/alert/${alert_id}`, data)
