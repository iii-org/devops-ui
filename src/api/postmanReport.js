import request from '@/utils/request'

export function getPostmanReport(project_id) {
  return request({
    url: `/postman_report/${project_id}`,
    method: 'get'
  })
}
