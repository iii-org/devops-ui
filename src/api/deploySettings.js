import request from '@/utils/request'

// cluster
export const getDeployedHostsLists = () => request.get(`/deploy/clusters`)
export const getDeployedHostsByList = (cluster_id) => request.get(`/deploy/clusters/${cluster_id}`)
export const addDeployHosts = (data) => request.post(`/deploy/clusters`, data)
export const updateDeployHostsById = (cluster_id, data) => request.put(`/deploy/clusters/${cluster_id}`, data)

// registry
export const getRegistryHostsLists = () => request.get(`/harbor/registries`)
export const addRegistryHosts = (data) => request.post(`/harbor/registries`, data)
export const updateRegistryHostsById = (registry_id, data) => request.put(`/harbor/registries/${registry_id}`, data)
