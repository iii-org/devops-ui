import request from '@/utils/request'

const formDataHeaders = {
  headers: { 'Content-Type': 'multipart/form-data' }
}

export const createRelease = (project_id, data) => request.post(`/v2/project/${project_id}/releases`, data)
export const getReleaseVersion = (project_id, params) => request.get(`/v2/project/${project_id}/releases`, { params })
export const getImageList = (project_id, params) => request.get(`/v2/project/${project_id}/releases/image_list`, { params })
export const addReleaseRepo = (project_id, release_id, formData) =>
  request.post(`/v2/project/${project_id}/releases/${release_id}/repository`, formData, formDataHeaders)
export const deleteReleaseRepo = (project_id, release_id, repo_name) =>
  request.delete(`/v2/project/${project_id}/releases/${release_id}/repository?repo_name=${repo_name}`)
export const addReleaseTag = (project_id, release_id, formData) =>
  request.post(`/v2/project/${project_id}/releases/${release_id}/tag`, formData, formDataHeaders)
export const deleteReleaseTag = (project_id, release_id, tags) =>
  request.delete(`/v2/project/${project_id}/releases/${release_id}/tag?tags=${tags}`)
