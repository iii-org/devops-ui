import request from '@/utils/request'

export const getGitlabStatus = () => request.get(`/repositories/connection/status`) // v2 backend not finish yet
export const editGitlabStatus = (data) => request.post(`/repositories/connection`, data) // v2 backend not finish yet
export const isGitlabDomainIP = () => request.get(`/repositories/is_ip`) // v2 backend not finish yet
