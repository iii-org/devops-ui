import request from '@/utils/request'

export const createRelease = (project_id, data) => request.post(`/v2/project/${project_id}/releases`, data)
export const getReleaseVersion = (project_id, params) => request.get(`/v2/project/${project_id}/releases`, { params })
