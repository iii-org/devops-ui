import request from '@/utils/request'

export const getSideexScans = (project_id) => request.get(`/project/${project_id}/sideex`)
export const getSideexReport = (sideex_id) => request.get(`/sideex_report/${sideex_id}`)
export const getSideexPod = (project_id) => request.get(`/project/${project_id}/plugin?plugin_name=test-sideex`)
export const getSideexVariable = (project_id, data) => request.post(`/sideex/${project_id}/jsonfile/varable`, data)
export const updateSideexVariable = (project_id, data) => request.put(`/sideex/${project_id}/jsonfile/varable`, data)
export const generateSideex = (project_id, data) => request.post(`/sideex/${project_id}/jsonfile/generate`, data)
