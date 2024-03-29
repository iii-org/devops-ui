import request from '@/utils/request'

export const getRdDashboardIssuesPriority = (user_id) => request.get(`/v2/dashboard_issues_priority/${user_id}`)
export const getRdDashboardIssuesProject = (issue_id) => request.get(`/v2/dashboard_issues_project/${issue_id}`)
export const getRdDashboardIssuesType = (issue_id) => request.get(`/v2/dashboard_issues_type/${issue_id}`)
export const getVersion = () => request.get(`/v2/system_git_commit_id`)
export const getProjectOverview = () => request.get('/v2/dashboard/project_overview')
export const getProjectMembers = () => request.get('/v2/dashboard/project_members_count')
export const getProjectMembersDetail = () => request.get('/v2/dashboard/project_members_detail')
export const getProjectMembersByProjectID = (project_id) => request.get(`/v2/dashboard/${project_id}/project_members`)
export const getGitCommitLog = (params) => request.get('/v2/dashboard/the_last_hours_commits', { params: params })
export const getIssueRank = () => request.get('/v2/dashboard/issue_rank')
export const getPassingRate = () => request.get('/v2/dashboard/passing_rate')
export const getPassingRateDetail = () => request.get('/v2/dashboard/passing_rate_detail')
export const getProjectList = () => request.get('/v2/dashboard/redmine_projects')
export const getProjectListDetail = () => request.get('/v2/dashboard/redmine_projects_detail')
export const getUnclosedIssues = (user_id) => request.get(`/v2/dashboard/${user_id}/unclosed_issues`)
export const getSyncRedmine = () => request.get(`/v2/sync_redmine/now`)
export const getSyncRedmineStatus = () => request.get(`/v2/lock?name=sync_redmine`)
