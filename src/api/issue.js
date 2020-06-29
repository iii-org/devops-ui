import request from '@/utils/request'

export function getIssuesByUser(user_account, param) {
  console.log('user_account', user_account)
  return request({
    url: `/issues_by_user/${user_account}`,
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
