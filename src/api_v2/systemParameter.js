import request from '@/plugins/axios'

export const getSystemParameter = () => request.get(`/v2/system_parameter`)
export const updateSystemParameter = (param_id, data) => request.put(`/v2/system_parameter/${param_id}`, data)
export const runSystemParameter = (data) => request.post(`/v2/system_parameter`, data)
export const getGithubVerifyStatus = () => request.get(`/v2/system_parameter/github_verify/status`)
