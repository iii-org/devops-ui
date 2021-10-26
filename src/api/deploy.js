import request from '@/utils/request'

// cluster
export const getDeployedHostsLists = () => request.get(`/deploy/clusters`)
export const getDeployedHostsByList = (cluster_id) => request.get(`/deploy/clusters/${cluster_id}`)
export const addDeployHosts = (data) => request.post(`/deploy/clusters`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const updateDeployHostsById = (cluster_id, data) => request.put(`/deploy/clusters/${cluster_id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }})

// registry
export const getRegistryHostsLists = () => request.get(`/deploy/registries`)
export const addRegistryHosts = (data) => request.post(`/harbor/registries`, data)
export const updateRegistryHostsById = (registry_id, data) => request.put(`/harbor/registries/${registry_id}`, data)

// services
export const getServices = (params, config) => request.get(`/deploy/applications`, { params, config })
export const getService = (application_id) => request.get(`/deploy/applications/${application_id}`)
export const postService = (data) => request.post(`/deploy/applications`, data)
export const putService = (application_id, data) => request.put(`/deploy/applications/${application_id}`, data)
export const patchService = (application_id, data) => request.patch(`/deploy/applications/${application_id}`, data)
export const deleteService = (application_id) => request.delete(`/deploy/applications/${application_id}`)
export const patchServiceRedeploy = (application_id) => request.patch(`/deploy/applications/${application_id}/redeploy`)
export const getReleaseEnvironments = (release_id) => request.get(`/deploy/release/${release_id}`)
