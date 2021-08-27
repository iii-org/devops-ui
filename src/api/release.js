import request from '@/utils/request'

export const createRelease = (project_id, data) => request.post(`/project/${project_id}/releases`, data)
export const getReleaseVersion = (project_id, params) => request.get(`/project/${project_id}/releases`, { params })
