import request from '@/utils/request'

export const getBranchesByProject = (rId) => request.get('/repositories/' + rId + '/branches')
