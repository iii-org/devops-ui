import request from '@/utils/request'

export const getAlertByProject = (pId) => request.get(`/project/${pId}/alert`)
