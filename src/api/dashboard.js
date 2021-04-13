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

export function getVersion() {
  return request({
    url: `/system_git_commit_id`,
    method: 'get'
  })
}

export const getProjectOverview = () => request.get('/dashboard/project_overview')
export const getProjectMembers = () => request.get('/dashboard/project_mumbers')
export const getGitCommitLog = (limit) => request.get('/dashboard/the_last_hours_commits?the_last_hours=24&show_commit_rows=' + limit)
export const getIssueRank = () => request.get('/dashboard/issue_rank')
export const getPassingRate = () => request.get('/dashboard/passing_rate')
export const getProjectList = () => request.get('/dashboard/redmine_projects')

