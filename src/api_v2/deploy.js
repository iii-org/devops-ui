import request from '@/utils/request'

// cluster
export const getDeployedHostsLists = () => request.get(`/v2/deploy/clusters`)
export const getDeployedHostsByList = (cluster_id) => request.get(`/v2/deploy/clusters/${cluster_id}`)
export const addDeployHosts = (data) =>
  request.post(`/v2/deploy/clusters`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const updateDeployHostsById = (cluster_id, data) =>
  request.put(`/v2/deploy/clusters/${cluster_id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const getDeployedStorageLists = (cluster_id) => request.get(`/v2/deploy/clusters/storage/${cluster_id}`)
export const syncDeployedStorageLists = (cluster_id) => request.post(`/v2/deploy/clusters/storage/${cluster_id}`)
export const patchStorageStatus = (storage_id, data) => request.patch(`/v2/deploy/storage/${storage_id}`, data)
export const getPVCLists = (storage_id) => request.get(`/v2/deploy/clusters/storage/pvc/${storage_id}`)

// registry
export const getRegistryHostsLists = () => request.get(`/v2/deploy/registries`)
export const addRegistryHosts = (data) => request.post(`/v2/harbor/registries`, data)
export const updateRegistryHostsById = (registry_id, data) => request.put(`/v2/harbor/registries/${registry_id}`, data)

// services
export const getServices = (params, config) => request.get(`/v2/deploy/applications`, { params, config })
export const getService = (application_id) => request.get(`/v2/deploy/applications/${application_id}`)
export const postService = (data) => request.post(`/v2/deploy/applications`, data)
export const putService = (application_id, data) => request.put(`/v2/deploy/applications/${application_id}`, data)
export const patchService = (application_id, data) => request.patch(`/v2/deploy/applications/${application_id}`, data)
export const deleteService = (application_id) => request.delete(`/v2/deploy/applications/${application_id}`)
export const patchServiceRedeploy = (application_id) => request.patch(`/v2/deploy/applications/${application_id}/redeploy`)
export const getReleaseEnvironments = (release_id) => request.get(`/v2/deploy/release/${release_id}`)
