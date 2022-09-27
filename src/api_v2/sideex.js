import request from '@/utils/request'

export const getSideexScans = (project_id) => request.get(`/v2/project/${project_id}/sideex`)
export const getSideexReport = (sideex_id) => request.get(`/v2/sideex_report/${sideex_id}`)
export const getSideexPod = (project_id) => request.get(`/v2/project/${project_id}/plugin?plugin_name=test-sideex`)
export const getSideexVariable = (project_id, data) => request.post(`/v2/sideex/${project_id}/jsonfile/varable`, data)
export const updateSideexVariable = (project_id, data) => request.put(`/v2/sideex/${project_id}/jsonfile/varable`, data)
export const deleteSideexVariable = (project_id) => request.delete(`/v2/sideex/${project_id}/jsonfile/delete`)
export const generateSideex = (project_id, data) => request.post(`/v2/sideex/${project_id}/jsonfile/generate`, data)
