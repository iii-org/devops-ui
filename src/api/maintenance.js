import request from '@/utils/request'

export function getSystemSecrets() {
  return request({
    url: `/maintenance/secretes_into_rc_all`,
    method: 'get'
  })
}

export function addSystemSecret(data) {
  return request({
    url: `/maintenance/secretes_into_rc_all`,
    method: 'post',
    data
  })
}

export function deleteSystemSecret(secretName) {
  return request({
    url: `/maintenance/secretes_into_rc_all/${secretName}`,
    method: 'delete'
  })
}

export function getSystemRegistries() {
  return request({
    url: `/maintenance/registry_into_rc_all`,
    method: 'get'
  })
}

export function addSystemRegistry(data) {
  return request({
    url: `/maintenance/registry_into_rc_all`,
    method: 'post',
    data
  })
}

export function deleteSystemRegistry(registryName) {
  return request({
    url: `/maintenance/registry_into_rc_all/${registryName}`,
    method: 'delete'
  })
}
