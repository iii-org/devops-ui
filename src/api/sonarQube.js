import request from '@/utils/request'

export function getSonarQubeData(project_name) {
  return request({
    url: `/sonarqube/${project_name}`,
    method: 'get'
  })
}
