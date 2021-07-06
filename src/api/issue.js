import request from '@/utils/request'

export const getIssue = (issue_id) => request.get(`/issues/${issue_id}`)
export const getIssueStatus = () => request.get(`/issues_status`)
export const getIssueTracker = () => request.get(`/issues_tracker`)
export const getIssuePriority = () => request.get(`/issues_priority`)
export const updateIssue = (issue_id, data) => request.put(`/issues/${issue_id}`, data)
export const deleteIssue = (issue_id) => request.delete('/issues/' + issue_id)
export const addIssue = (data) => request.post(`/issues`, data)
export const getIssueMonthStatistics = () => request.get(`/issues/month_statistics`)
export const getIssueWeekStatistics = () => request.get(`/issues/week_statistics`)
export const getIssueOpenStatistics = () => request.get(`/issues/open_statistics`)
export const deleteIssueFile = (file_id) => request.delete('/file/' + file_id)
export const getCheckIssueClosable = (issue_id) => request.get('/issues/' + issue_id + '/check_closable')
export const getIssueFamily = (issue_id, config) => request.get('/issue/' + issue_id + '/family', config)
