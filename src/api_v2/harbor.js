import request from '@/utils/request'

export const getHarborRepoList = (project_id) =>
  request.get(`/v2/harbor/projects/${project_id}`)
export const editHarborRepo = (data) =>
  request.put(`/v2/harbor/repositories`, data)
export const deleteHarborRepo = (name) =>
  request.delete(`/v2/harbor/repositories?repository_fullname=${name}`)
export const getProjectArtifacts = (name) =>
  request.get(`/v2/harbor/artifacts?repository_fullname=${name}`)
export const getRepoArtifacts = (harbor_repository_name, tag_name) =>
  request.get(
    `/v2/harbor/artifacts?repository_fullname=${harbor_repository_name}&tag_name=${tag_name}`
  )
export const deleteProjectArtifact = (
  harbor_repository_name,
  digest,
  tag_name
) =>
  request.delete(
    `/v2/harbor/artifacts?repository_fullname=${harbor_repository_name}&digest=${digest}&tag_name=${tag_name}`
  )
export const getHarborRepoStorageSummary = (project_id) =>
  request.get(`/v2/harbor/projects/${project_id}/summary`)
export const getPluginResource = (project_id) =>
  request.get(`/v2/project/${project_id}/plugin/resource`)
