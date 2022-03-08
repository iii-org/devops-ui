import request from '@/plugins/axios'

export const getZapScans = (project_id) => request.get(`/v2/project/${project_id}/zap`)
