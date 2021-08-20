import request from '@/utils/request'

// cluster
export const getDeployedHostsLists = () => request.get(`/deploy/clusters`)
export const getDeployedHostsByList = (cluster_id) => request.get(`/deploy/clusters/${cluster_id}`)

// registry
export const getRegistryHostsLists = () => request.get(`/harbor/registries`)
