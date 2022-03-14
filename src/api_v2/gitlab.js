import request from '@/utils/request'

export const getGitlabStatus = () => request.get(`/v2/repositories/connection/status`)
export const editGitlabStatus = (data) => request.post(`/v2/repositories/connection`, data)
export const isGitlabDomainIP = () => request.get(`/v2/repositories/is_ip`)
