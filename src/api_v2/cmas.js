import request from '@/utils/request'

export const getCmasScans = (repository_id) => request.get(`/v2/repo_project/${repository_id}/cmas`)
export const getCmasScansStatus = (task_id) => request.get(`/v2/cmas/${task_id}`)
export const getCmasReport = (task_id, file_type) =>
  request.get(`/v2/cmas/${task_id}/${file_type}`, { responseType: 'blob' })
export const getCmasPod = (project_id) => request.get(`/v2/project/${project_id}/plugin?plugin_name=cmas`)
