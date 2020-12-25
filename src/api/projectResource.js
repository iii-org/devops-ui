import request from '@/utils/request'

export function getProjectUsage(pId) {
  return request({
    url: `/project/${pId}/resource`,
    method: 'get'
  })
}

export function updateProjectUsage(pId) {
  return request({
    url: `/project/${pId}/resource`,
    method: 'put'
  })
}

export function getPodList(pId) {
  return request({
    url: `/project/${pId}/resource/list/pod`,
    method: 'get'
  })
}

export function deletePod(pId, pod_name) {
  return request({
    url: `/project/${pId}/resource/list/pod/${pod_name}`,
    method: 'delete'
  })
}

export function getDeploymentList(pId) {
  return request({
    url: `project/${pId}/resource/list/deployment`,
    method: 'get'
  })
}

export function deleteDeployment(pId, deployment_name) {
  return request({
    url: `/project/${pId}/resource/list/deployment/${deployment_name}`,
    method: 'delete'
  })
}

export function getServiceList(pId) {
  return request({
    url: `/project/${pId}/resource/list/service`,
    method: 'get'
  })
}

export function deleteService(pId, service_name) {
  return request({
    url: `/project/${pId}/resource/list/service/${service_name}`,
    method: 'delete'
  })
}

export function getSecretList(pId) {
  return request({
    url: `/project/${pId}/resource/list/secret`,
    method: 'get'
  })
}

export function deleteSecret(pId, secret_name) {
  return request({
    url: `/project/${pId}/resource/list/secret/${secret_name}`,
    method: 'delete'
  })
}

export function getConfigmapList(pId) {
  return request({
    url: `/project/${pId}/resource/list/configmap`,
    method: 'get'
  })
}

export function deleteConfigmap(pId, config_map_name) {
  return request({
    url: `/project/${pId}/resource/list/configmap/${config_map_name}`,
    method: 'delete'
  })
}
