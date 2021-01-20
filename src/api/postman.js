import request from '@/utils/request'

export function getPostmanReport(result_id) {
  return request({
    url: `/postman_report/${result_id}`,
    method: 'get'
  })
}

export function getPostmanResult(project_id) {
  return request({
    url: `/postman_results/${project_id}`,
    method: 'get'
  })
}
