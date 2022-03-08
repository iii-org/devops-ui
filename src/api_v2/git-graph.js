import request from '@/plugins/axios'

export const getGitGraphByRepo = (repository_id) => request.get(`/v2/repositories/${repository_id}/overview`)
