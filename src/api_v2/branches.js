import request from '@/utils/request'

export const getBranchesByProject = (repository_id) => request.get(`/v2/repositories/${repository_id}/branches`)
