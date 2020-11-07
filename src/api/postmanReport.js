import request from '@/utils/request'

export function getPostmanReport(project_id) {
  project_id = 210
  return request({
    url: `/postman_report/${project_id}`,
    method: 'get'
  })
}
