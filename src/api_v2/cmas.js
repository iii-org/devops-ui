import request from '@/plugins/axios'

export const getCmasScans = (repository_id) => request.get(`/v2/repo_project/${repository_id}/cmas`)
export const getCmasScansStatus = (task_id) => request.get(`/v2/cmas/${task_id}`)
export const getCmasReport = (task_id, file_type) =>
  request.get(`/v2/cmas/${task_id}/${file_type}`, { responseType: 'blob' })
