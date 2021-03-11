import request from '@/utils/request'

// secret
export function getSecretList(project_id) {
  return request({
    url: `/project/${project_id}/resource/secrets`,
    method: 'get'
  })
}

export function addSecret(project_id, secret_name) {
  return request({
    url: `/project/${project_id}/resource/secret/${secret_name}`,
    method: 'post'
  })
}

export function updateSecretList(project_id, secret_name) {
  return request({
    url: `/project/${project_id}/resource/secret/${secret_name}`,
    method: 'put'
  })
}

export function getSecret(project_id, secret_name) {
  return request({
    url: `/project/${project_id}/resource/secret/${secret_name}`,
    method: 'get'
  })
}

export function deleteSecret(project_id, secret_name) {
  return request({
    url: `/project/${project_id}/resource/list/secret/${secret_name}`,
    method: 'delete'
  })
}

// config map
export function getConfigmapList(project_id) {
  return request({
    url: `/project/${project_id}/resource/configmaps`,
    method: 'get'
  })
}

export function deleteConfigmap(project_id, config_map_name) {
  return request({
    url: `/project/${project_id}/resource/configmaps/${config_map_name}`,
    method: 'delete'
  })
}

// pod
export function getPodList(project_id) {
  return request({
    url: `/project/${project_id}/resource/pods`,
    method: 'get'
  })
}

export function getPodLog(project_id, pod_name, params) {
  return request({
    url: `/project/${project_id}/resource/pods/${pod_name}/log`,
    method: 'get',
    params
  })
}

export function deletePod(project_id, pod_name) {
  return request({
    url: `/project/${project_id}/resource/list/pod/${pod_name}`,
    method: 'delete'
  })
}

// service
export function getServiceList(project_id) {
  return request({
    url: `/project/${project_id}/resource/services`,
    method: 'get'
  })
}

export function deleteService(project_id, service_name) {
  return request({
    url: `/project/${project_id}/resource/list/service/${service_name}`,
    method: 'delete'
  })
}

// deployment
export function getDeploymentList(project_id) {
  return request({
    url: `project/${project_id}/resource/deployments`,
    method: 'get'
  })
}

export function deleteDeployment(project_id, deployment_name) {
  return request({
    url: `/project/${project_id}/resource/deployments/${deployment_name}`,
    method: 'delete'
  })
}

export function updateDeployment(project_id, deployment_name) {
  return request({
    url: `/project/${project_id}/resource/list/deployment/${deployment_name}`,
    method: 'put'
  })
}

// ingress
export function getIngressList(project_id) {
  return request({
    url: `/project/${project_id}/resource/ingresses`,
    method: 'get'
  })
}

// project usage
export function getProjectUsage(project_id) {
  return request({
    url: `/project/${project_id}/resource`,
    method: 'get'
  })
}

export function setProjectUsageLimit(project_id, data) {
  return request({
    url: `/project/${project_id}/resource`,
    method: 'put',
    data
  })
}

// environment
export function getEnvironmentList(pId) {
  return request({
    url: `/project/${pId}/environment`,
    method: 'get'
  })
}

export function redeployEnvironmentByBranchName(pId, brachName) {
  return request({
    url: `/project/${pId}/environment/branch/${brachName}`,
    method: 'put'
  })
}

export function deleteEnvironmentByBranchName(pId, brachName) {
  return request({
    url: `/project/${pId}/environment/branch/${brachName}`,
    method: 'delete'
  })
}
