import request from '@/plugins/axios'

export const getIssue = (issue_id) => request.get(`/v2/issues/${issue_id}`)
export const getIssueStatus = () => request.get(`/v2/issues_status`)
export const getIssueTracker = () => request.get(`/v2/issues_tracker`)
export const getIssuePriority = () => request.get(`/v2/issues_priority`)
export const updateIssue = (issue_id, data) => request.put(`/v2/issues/${issue_id}`, data)
export const deleteIssue = (issue_id, params) => request.delete(`/v2/issues/${issue_id}`, { params })
export const addIssue = (data) => request.post(`/v2/issues`, data)
export const getIssueMonthStatistics = () => request.get(`/v2/issues/month_statistics`)
export const getIssueWeekStatistics = () => request.get(`/v2/issues/week_statistics`)
export const getIssueOpenStatistics = () => request.get(`/v2/issues/open_statistics`)
export const deleteIssueFile = (file_id) => request.delete(`/v2/file/${file_id}`)
export const getCheckIssueClosable = (issue_id) => request.get(`/v2/issues/${issue_id}/check_closable`)
export const getIssueFamily = (issue_id, config) => request.get(`/v2/issue/${issue_id}/family`, config)
export const putIssueRelation = (data) => request.put('/v2/issues/relation', data)
export const deleteIssueRelation = (issue_id) => request.delete(`/v2/issues/relation/${issue_id}`)
export const getIssueFieldDisplay = (params) => request.get(`/v2/issue_field_display`, { params })
export const putIssueFieldDisplay = (data) => request.put(`/v2/issue_field_display`, data)
export const getIssueGitCommitLog = (project_id, issue_id, params) =>
  request.get(`/v2/project/${project_id}/issues_commit/${issue_id}`, { params })
