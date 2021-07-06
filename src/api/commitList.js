import request from '@/utils/request'

export const getCommitListByBranch = (rId, params) => request.get('repositories/' + rId + '/commits', { params })
