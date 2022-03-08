import request from '@/plugins/axios'

export const getSideexScans = (project_id) => request.get(`/v2/project/${project_id}/sideex`)
export const getSideexReport = (sideex_id) => request.get(`/v2/sideex_report/${sideex_id}`)
