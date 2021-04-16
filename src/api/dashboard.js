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
export const getProjectMembers = () => request.get('/dashboard/project_members_count')
export const getProjectMembersDetail = () => request.get('/dashboard/project_members_detail')
export const getProjectMembersByProjectID = (id) => request.get('/dashboard/' + id + '/project_members')
export const getGitCommitLog = (params) => request.get('/dashboard/the_last_hours_commits', { params: params })
export const getIssueRank = () => request.get('/dashboard/issue_rank')
export const getPassingRate = () => request.get('/dashboard/passing_rate')
export const getPassingRateDetail = () => request.get('/dashboard/passing_rate_detail')
export const getProjectList = () => request.get('/dashboard/redmine_projects')
export const getProjectListDetail = () => request.get('/dashboard/redmine_projects_detail')
export const getUnclosedIssues = (id) => request.get('/dashboard/' + id + '/unclosed_issues')
export const getInvolvedProjects = (id) => request.get('/dashboard/' + id + '/involved_projects')
