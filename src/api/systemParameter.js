import request from '@/utils/request'

export const getSystemParameter = () => request.get(`/system_parameter`)
export const updateSystemParameter = (param_id, data) => request.put(`/system_parameter/${param_id}`, data)
export const runSystemParameter = (data) => request.post(`/system_parameter`, data)
export const getGithubVerifyStatus = () => request.get(`/system_parameter/github_verify/status`)
