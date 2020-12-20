import request from '@/utils/request'

export function getHarborRepoList(pId) {
  return request({
    url: `/harbor/projects/${pId}`,
    method: 'get'
  })
}

export function editHarborRepo(name, data) {
  return request({
    url: `/harbor/repositories/${name}`,
    method: 'put',
    data
  })
}

export function deleteHarborRepo(name) {
  return request({
    url: `/harbor/repositories/${name}`,
    method: 'delete'
  })
}

export function getProjectArtifacts(name) {
  return request({
    url: `/harbor/artifacts/${name}`,
    method: 'GET'
  })
}

export function deleteProjectArtifact(name, digest, tag) {
  return request({
    url: `/harbor/artifacts/${name}?digest=${digest}&tag=${tag}`,
    method: 'delete'
  })
}

export function getHarborRepoStorageSummary(pId) {
  return request({
    url: `/harbor/projects/${pId}/summary`,
    method: 'get'
  })
}