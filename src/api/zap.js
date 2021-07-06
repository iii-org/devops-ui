import request from '@/utils/request'

export const getZapScans = (project_id) => request.get(`/project/${project_id}/zap`)
