import request from '@/utils/request'

export const getGitGraphByRepo = (rId) => request.get('/repositories/' + rId + '/overview')
