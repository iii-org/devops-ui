import request from '@/utils/request'

export const changeProjectAlertSettings = (pId, params) => request.post(`/project/${pId}/alert`, params)
export const getAlertByProject = (pId) => request.get(`/project/${pId}/alert`)
