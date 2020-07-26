import request from '@/utils/request'

export function getRdDashboardIssuesPriority(user_id) {
  return request({
    url: `/dashboard_issues_priority/rd/${user_id}`,
    method: 'get'
  })
}

export function getRdDashboardIssuesProject(issue_id) {
  return request({
    url: `/dashboard_issues_project/${issue_id}`,
    method: 'get'
  })
}

export function getRdDashboardIssuesType(issue_id) {
  return request({
    url: `/dashboard_issues_type/${issue_id}`,
    method: 'get'
  })
}