import request from '@/plugins/axios'

// secret
export const getSecretList = (project_id) => request.get(`/v2/project/${project_id}/resource/secrets`)
export const addSecret = (project_id, secret_name) =>
  request.post(`/v2/project/${project_id}/resource/secret/${secret_name}`)
export const updateSecretList = (project_id, secret_name, data) =>
  request.put(`/v2/project/${project_id}/resource/secrets/${secret_name}`, data)
export const getSecret = (project_id, secret_name) =>
  request.get(`/v2/project/${project_id}/resource/secrets/${secret_name}`)
export const deleteSecret = (project_id, secret_name) =>
  request.delete(`/v2/project/${project_id}/resource/secrets/${secret_name}`)

// config map
export const getConfigmapList = (project_id) => request.get(`/v2/project/${project_id}/resource/configmaps`)
export const deleteConfigmap = (project_id, config_map_name) =>
  request.delete(`/v2/project/${project_id}/resource/configmaps/${config_map_name}`)

// pod
export const getPodList = (project_id) => request.get(`/v2/project/${project_id}/resource/pods`)
export const getPodLog = (project_id, pod_name, params, config) =>
  request.get(`/v2/project/${project_id}/resource/pods/${pod_name}/log`, { params, ...config })
export const deletePod = (project_id, pod_name) => request.delete(`/v2/project/${project_id}/resource/pods/${pod_name}`)

// service
export const getServiceList = (project_id) => request.get(`/v2/project/${project_id}/resource/services`)

export const deleteService = (project_id, service_name) =>
  request.delete(`/v2/project/${project_id}/resource/services/${service_name}`)

// deployment
export const getDeploymentList = (project_id) => request.get(`/v2/project/${project_id}/resource/deployments`)
export const deleteDeployment = (project_id, deployment_name) =>
  request.delete(`/v2/project/${project_id}/resource/deployments/${deployment_name}`)
export const updateDeployment = (project_id, deployment_name) =>
  request.put(`/v2/project/${project_id}/resource/deployments/${deployment_name}`)

// ingresses
export const getIngressList = (project_id) => request.get(`/v2/project/${project_id}/resource/ingresses`)

// project usage
export const getProjectUsage = (project_id) => request.get(`/v2/project/${project_id}/resource`)

// environment
export const getEnvironmentList = (project_id) => request.get(`/v2/project/${project_id}/environments`)
export const redeployEnvironmentByBranchName = (project_id, brachName) =>
  request.put(`/v2/project/${project_id}/environments/branch/${brachName}`)
export const deleteEnvironmentByBranchName = (project_id, brachName) =>
  request.delete(`/v2/project/${project_id}/environments/branch/${brachName}`)
