import request from '@/plugins/axios'

export const getAllActivities = (params) => request.get(`/v2/all_activities`, { params })
export const getProjectActivities = (project_id, params) => request.get(`/v2/project/${project_id}/activities`, { params })
