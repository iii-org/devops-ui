import request from '@/utils/request'

// cluster
export const getDeployedHostsLists = () => request.get(`/deploy/clusters`)
export const getDeployedHostsByList = (cluster_id) => request.get(`/deploy/clusters/${cluster_id}`)
export const addDeployHosts = (data) => request.post(`/deploy/clusters`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const updateDeployHostsById = (cluster_id, data) => request.put(`/deploy/clusters/${cluster_id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const getDeployedStorageLists = (cluster_id) => request.get(`/deploy/clusters/storage/${cluster_id}`)
export const syncDeployedStorageLists = (cluster_id) => request.post(`/deploy/clusters/storage/${cluster_id}`)
export const patchStorageStatus = (storage_id, data) => request.patch(`/deploy/storage/${storage_id}`, data)
export const getPVCLists = (storage_id) => request.get(`/deploy/clusters/storage/pvc/${storage_id}`)

// registry
export const getRegistryHostsLists = () => request.get(`/deploy/registries`)
export const addRegistryHosts = (data) => request.post(`/harbor/registries`, data)
export const updateRegistryHostsById = (registry_id, data) => request.put(`/harbor/registries/${registry_id}`, data)

// services
export const getService = (application_id) => request.get(`/deploy/applications/${application_id}`)
export const patchService = (application_id, data) => request.patch(`/deploy/applications/${application_id}`, data)
export const getMultiServices = (config) => request.get(`/deploy/app_headers`, { config })
export const getMultiService = (app_header_id) => request.get(`/deploy/app_headers/${app_header_id}`)
export const postMultiService = (data) => request.post(`/deploy/app_headers`, data)
export const putMultiService = (app_header_id, data) => request.put(`/deploy/app_headers/${app_header_id}`, data)
export const patchMultiService = (app_header_id, data) => request.patch(`/deploy/app_headers/${app_header_id}`, data)
export const deleteMultiService = (app_header_id) => request.delete(`/deploy/app_headers/${app_header_id}`)
export const patchServiceRedeploy = (application_id) => request.patch(`/deploy/applications/${application_id}/redeploy`)
export const getReleaseEnvironments = (release_id) => request.get(`/deploy/release/${release_id}`)
export const isExposePortAvailable = (cluster_name, expose_port, data) => request.post(`/deploy/clusters/${cluster_name}/outer_port/${expose_port}/can_use`, data)
