import request from '@/utils/request'

export function getIssuesByUser(user_account) {
  return request({
    url: `/issues_by_user/${user_account}`,
    method: 'get'
  })
}

export function getIssue(issue_id) {
  return request({
    url: `/issues/${issue_id}`,
    method: 'get'
  })
}
