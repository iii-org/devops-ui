import request from '@/utils/request'

export const getGitlabStatus = () => request.get(`/repositories/connection/status`)
export const editGitlabStatus = (data) => request.post(`/repositories/connection`, data)
export const isGitlabDomainIP = () => request.get(`/repositories/is_ip`)
