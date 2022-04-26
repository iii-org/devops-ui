import request from '@/utils/request'

export const getHarborRepoList = (pId) => request.get(`/harbor/projects/${pId}`)
export const editHarborRepo = (data) => request.put(`/harbor/repositories`, data)
export const deleteHarborRepo = (name) => request.delete(`/harbor/repositories?repository_fullname=${name}`)
export const getProjectArtifacts = (name) => request.get(`/harbor/artifacts?repository_fullname=${name}`)
export const getRepoArtifacts = (repo, tag) => request.get(`/harbor/artifacts?repository_fullname=${repo}&tag_name=${tag}`)
export const deleteProjectArtifact = (name, digest, tag) => request.delete(`/harbor/artifacts?repository_fullname=${name}&digest=${digest}&tag_name=${tag}`)
export const getHarborRepoStorageSummary = (pId) => request.get(`/harbor/projects/${pId}/summary`)
export const getPluginResource = (pId) => request.get(`/project/${pId}/plugin/resource`)
