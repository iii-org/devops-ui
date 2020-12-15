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

export function getProjectArtifacts(pId) {
  return {
    message: 'success',
    data: [
      { tags: '4.6.0-jdk8-alpine', size: '139.95MB', vulnerabilities: 'Unknown (42)', digest: '7418f477', labels: ['release'], pushTime: '2020/03/31' },
      { tags: '4.7.0-jdk8-alpine', size: '141.05MB', vulnerabilities: 'Unknown (42)', digest: '6093ee35', pushTime: '2020/03/31' }
    ]
  }
  // return request({
  //   url: `/project/${pId}`,
  //   method: 'GET'
  // })
}
