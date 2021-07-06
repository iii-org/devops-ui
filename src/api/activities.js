import request from '@/utils/request'

export const getAllActivities = (params) => request.get(`/all_activities`, { params })
export const getProjectActivities = (pId) => request.get(`/project/${pId}/activities`)
