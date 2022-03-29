import request from '@/utils/request'

export const getIssueFilter = (project_id) => request.get(`/v2/project/${project_id}/issue_filter`)
export const addIssueFilter = (project_id, data) => request.post(`/v2/project/${project_id}/issue_filter`, data)
export const editIssueFilter = (project_id, filter_id, data) =>
  request.put(`/v2/project/${project_id}/issue_filter/${filter_id}`, data)
export const removeIssueFilter = (project_id, filter_id) =>
  request.delete(`/v2/project/${project_id}/issue_filter/${filter_id}`)
