import request from '@/utils/request'

export const getPostmanReport = (result_id) => request.get(`/postman_report/${result_id}`)
export const getPostmanResult = (project_id) => request.get(`/postman_results/${project_id}`)
export const getPostmanPod = (project_id) => request.get(`/project/${project_id}/plugin?plugin_name=newman`)
