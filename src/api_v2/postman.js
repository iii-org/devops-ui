import request from '@/utils/request'

export const getPostmanReport = (result_id) => request.get(`/v2/postman_report/${result_id}`)
export const getPostmanResult = (project_id) => request.get(`/v2/postman_results/${project_id}`)
