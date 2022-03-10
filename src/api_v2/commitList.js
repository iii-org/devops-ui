import request from '@/utils/request'

export const getCommitListByBranch = (repository_id, params) =>
  request.get(`/v2/repositories/${repository_id}/commits`, { params })
export const getMemberCommitListByBranch = (repository_id, params) =>
  request.get(`/v2/repositories/${repository_id}/members_commits`, { params })
