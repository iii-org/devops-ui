import request from '@/utils/request'

export function getIssuesByUser(user_id, param) {
  return request({
    url: `/issues_by_user/rd/${user_id}`,
    method: 'get',
    param
  })
}

export function getIssue(issue_id) {
  return request({
    url: `/issues/rd/${issue_id}`,
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
    url: `/issues/rd/${issue_id}`,
    method: 'put',
    data
  })
}