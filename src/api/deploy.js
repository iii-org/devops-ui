import request from '@/utils/request'

// cluster
export const getDeployedHostsLists = () => request.get(`/deploy/clusters`)
export const getDeployedHostsByList = (cluster_id) => request.get(`/deploy/clusters/${cluster_id}`)
export const addDeployHosts = (data) => request.post(`/deploy/clusters`, data)
export const updateDeployHostsById = (cluster_id, data) => request.put(`/deploy/clusters/${cluster_id}`, data)

// registry
export const getRegistryHostsLists = () => request.get(`/deploy/registries`)
export const addRegistryHosts = (data) => request.post(`/harbor/registries`, data)
export const updateRegistryHostsById = (registry_id, data) => request.put(`/harbor/registries/${registry_id}`, data)

// services
export const getServices = (params) => request.get(`deploy/applications`, { params })
export const postService = (data) => request.post(`deploy/applications`, data)
export const putService = (application_id, data) => request.put(`deploy/applications/${application_id}`, data)
export const deleteService = (application_id) => request.delete(`deploy/applications/${application_id}`)
