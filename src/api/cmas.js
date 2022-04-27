import request from '@/utils/request'

export const getCmasScans = (rId) => request.get(`/repo_project/${rId}/cmas`)
export const getCmasScansStatus = (task_id) => request.get(`/cmas/${task_id}`)
export const getCmasReport = (task_id, file_type) => request.get(`/cmas/${task_id}/${file_type}`, { responseType: 'blob' })
export const getCmasPod = (project_id) => request.get(`/project/${project_id}/plugin?plugin_name=cmas`)
