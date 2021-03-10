import request from '@/utils/request'

export function getProjectUsage(project_id) {
  return request({
    url: `/project/${project_id}/resource`,
    method: 'get'
  })
}

export function updateProjectUsage(project_id) {
  return request({
    url: `/project/${project_id}/resource`,
    method: 'put'
  })
}

export function getPodList(project_id) {
  return request({
    url: `/project/${project_id}/resource/list/pod`,
    method: 'get'
  })
}

export function getPodLog(project_id, pod_name, params) {
  return request({
    url: `/project/${project_id}/resource/list/pod/${pod_name}/log`,
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

export function getDeploymentList(project_id) {
  return request({
    url: `project/${project_id}/resource/list/deployment`,
    method: 'get'
  })
}

export function deleteDeployment(project_id, deployment_name) {
  return request({
    url: `/project/${project_id}/resource/list/deployment/${deployment_name}`,
    method: 'delete'
  })
}

export function updateDeployment(project_id, deployment_name) {
  return request({
    url: `/project/${project_id}/resource/list/deployment/${deployment_name}`,
    method: 'put'
  })
}

export function getServiceList(project_id) {
  return request({
    url: `/project/${project_id}/resource/list/service`,
    method: 'get'
  })
}

export function deleteService(project_id, service_name) {
  return request({
    url: `/project/${project_id}/resource/list/service/${service_name}`,
    method: 'delete'
  })
}

export function getSecretList(project_id) {
  return request({
    url: `/project/${project_id}/resource/list/secret`,
    method: 'get'
  })
}

export function deleteSecret(project_id, secret_name) {
  return request({
    url: `/project/${project_id}/resource/list/secret/${secret_name}`,
    method: 'delete'
  })
}

export function getConfigmapList(project_id) {
  return request({
    url: `/project/${project_id}/resource/list/configmap`,
    method: 'get'
  })
}

export function deleteConfigmap(project_id, config_map_name) {
  return request({
    url: `/project/${project_id}/resource/list/configmap/${config_map_name}`,
    method: 'delete'
  })
}

export function getIngressList(project_id) {
  return request({
    url: `/project/${project_id}/resource/list/ingress`,
    method: 'get'
  })
}

export function updateSecretList(project_id, secret_name) {
  return request({
    url: `/project/${project_id}/resource/list/secret/${secret_name}`,
    method: 'put'
  })
}
