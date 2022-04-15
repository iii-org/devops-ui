import request from '@/utils/request'

export const getSideexScans = (project_id) => request.get(`/project/${project_id}/sideex`)
export const getSideexReport = (sideex_id) => request.get(`/sideex_report/${sideex_id}`)
export const getSideexPod = (project_id) => request.get(`/project/${project_id}/plugin?plugin_name=test-sideex`)
