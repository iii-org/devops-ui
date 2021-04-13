import request from '@/utils/request'

export function getRdDashboardIssuesPriority(user_id) {
  return request({
    url: `/dashboard_issues_priority/${user_id}`,
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

export function getVersion(issue_id) {
  return request({
    url: `/system_git_commit_id`,
    method: 'get'
  })
}

export const getGitCommitLog = (limit) => request.get('/dashboard/the_last_hours_commits?the_last_hours=24&show_commit_rows=' + limit)
