import request from '@/utils/request'

export const getIssueFilter = (project_id) => request.get(`/project/${project_id}/issue_filter`)
export const addIssueFilter = (project_id, data) => request.post(`/project/${project_id}/issue_filter`, data)
export const editIssueFilter = (project_id, filter_id, data) =>
  request.put(`/project/${project_id}/issue_filter/${filter_id}`, data)
export const removeIssueFilter = (project_id, filter_id) =>
  request.delete(`/project/${project_id}/issue_filter/${filter_id}`)
