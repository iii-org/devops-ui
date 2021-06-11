import request from '@/utils/request'

export function getIssue(issue_id) {
  return request({
    url: `/issues/${issue_id}`,
    method: 'get'
  })
}

export function getIssueStatus() {
  return request({
    url: `/issues_status`,
    method: 'get'
  })
}

export function getIssueTracker() {
  return request({
    url: `/issues_tracker`,
    method: 'get'
  })
}

export function getIssuePriority() {
  return request({
    url: `/issues_priority`,
    method: 'get'
  })
}

export function updateIssue(issue_id, data) {
  return request({
    url: `/issues/${issue_id}`,
    method: 'put',
    data
  })
}

export function deleteIssue(issue_id) {
  return request({
    url: '/issues/' + issue_id,
    method: 'DELETE'
  })
}

export function addIssue(data) {
  return request({
    url: `/issues`,
    method: 'post',
    data
  })
}

export function getIssueMonthStatistics() {
  return request({
    url: `/issues/month_statistics`,
    method: 'get'
  })
}

export function getIssueWeekStatistics() {
  return request({
    url: `/issues/week_statistics`,
    method: 'get'
  })
}

export function getIssueOpenStatistics() {
  return request({
    url: `/issues/open_statistics`,
    method: 'get'
  })
}

export function deleteIssueFile(file_id) {
  return request({
    url: '/file/' + file_id,
    method: 'DELETE'
  })
}

export const getCheckIssueClosable = (issue_id) => request.get('/issues/' + issue_id + '/check_closable')
export const getIssueFamily = (issue_id, config) => request.get('/issue/' + issue_id + '/family', config)
