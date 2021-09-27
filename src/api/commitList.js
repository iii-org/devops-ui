import request from '@/utils/request'

export const getCommitListByBranch = (rId, params) => request.get('repositories/' + rId + '/commits', { params })
export const getMemberCommitListByBranch = (rId, params) => request.get(`repositories/${rId}/members_commits`, { params })
