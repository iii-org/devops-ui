import request from '@/utils/request'

// secret
export const getSecretList = (project_id) => request.get(`/project/${project_id}/resource/secrets`)
export const addSecret = (project_id, secret_name) => request.post(`/project/${project_id}/resource/secret/${secret_name}`)
export const updateSecretList = (project_id, secret_name, data) => request.put(`/project/${project_id}/resource/secrets/${secret_name}`, data)
export const getSecret = (project_id, secret_name) => request.get(`/project/${project_id}/resource/secrets/${secret_name}`)
export const deleteSecret = (project_id, secret_name) => request.delete(`/project/${project_id}/resource/secrets/${secret_name}`)

// config map
export const getConfigmapList = (project_id) => request.get(`/project/${project_id}/resource/configmaps`)
export const deleteConfigmap = (project_id, config_map_name) => request.delete(`/project/${project_id}/resource/configmaps/${config_map_name}`)
export const updateConfigmapList = (project_id, config_map_name, data) => request.put(`/project/${project_id}/resource/configmaps/${config_map_name}`, data)

// pod
export const getPodList = (project_id) => request.get(`/project/${project_id}/resource/pods`)
export const getPodLog = (project_id, pod_name, params) => request.get(`/project/${project_id}/resource/pods/${pod_name}/log`, { params })
export const deletePod = (project_id, pod_name) => request.delete(`/project/${project_id}/resource/pods/${pod_name}`)

// service
export const getServiceList = (project_id) => request.get(`/project/${project_id}/resource/services`)

export const deleteService = (project_id, service_name) => request.delete(`/project/${project_id}/resource/services/${service_name}`)

// deployment
export const getDeploymentList = (project_id) => request.get(`project/${project_id}/resource/deployments`)
export const deleteDeployment = (project_id, deployment_name) => request.delete(`/project/${project_id}/resource/deployments/${deployment_name}`)
export const updateDeployment = (project_id, deployment_name) => request.put(`/project/${project_id}/resource/deployments/${deployment_name}`)

// ingresses
export const getIngressList = (project_id) => request.get(`/project/${project_id}/resource/ingresses`)

// project usage
export const getProjectUsage = (project_id) => request.get(`/project/${project_id}/resource`)
export const setProjectUsageLimit = (project_id, data) => request.put(`/project/${project_id}/resource`)

// environment
export const getEnvironmentList = (pId) => request.get(`/project/${pId}/environments`)
export const redeployEnvironmentByBranchName = (pId, brachName) => request.put(`/project/${pId}/environments/branch/${brachName}`)
export const deleteEnvironmentByBranchName = (pId, brachName) => request.delete(`/project/${pId}/environments/branch/${brachName}`)
