import request from '@/utils/request'

export const getGitlabStatus = () => request.get(`/v2/repositories/connection/status`) // backend not finish yet
export const editGitlabStatus = (data) => request.post(`/v2/repositories/connection`, data) // backend not finish yet
export const isGitlabDomainIP = () => request.get(`/v2/repositories/is_ip`) // backend not finish yet
