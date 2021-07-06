import request from '@/utils/request'

export const getParameterType = () => request.get(`/parameter_types`)
export const getParameterByIssue = (issue_id) => request.get(`/parameters_by_issue/${issue_id}`)
export const addParameterByIssue = (issue_id, data) => request.post(`/parameters_by_issue/${issue_id}`, data)
export const deleteParameter = (parameter_id) => request.delete(`/parameters/${parameter_id}`)
