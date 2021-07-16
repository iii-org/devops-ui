const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  device: state => state.app.device,
  roleList: state => state.app.roleList,
  token: state => state.user.token,
  userId: state => state.user.userId,
  userName: state => state.user.userName,
  userRole: state => state.user.userRole,
  permission_routes: state => state.permission.routes,
  projectOptions: state => state.projects.options,
  projectList: state => state.projects.list,
  projectListTotal: state => state.projects.total,
  branchesByProject: state => state.branches.list,
  branchesTotalNumByProject: state => state.branches.total,
  commitListByBranch: state => state.commitList.list,
  commitListTotalByBranch: state => state.commitList.total,
  userProjectList: state => state.projects.options,
  selectedProjectId: state => state.projects.selectedProject.id,
  selectedProject: state => state.projects.selectedProject,
  kanbanFilter: state => state.projects.kanbanFilter,
  kanbanGroupBy: state => state.projects.kanbanGroupBy,
  kanbanDisplayClosed: state => state.projects.kanbanDisplayClosed,
  kanbanKeyword: state => state.projects.kanbanKeyword,
  initKanban: state => state.projects.initKanban,
  initIssueList: state => state.projects.initIssueList,
  issueListFilter: state => state.projects.issueListFilter,
  issueListKeyword: state => state.projects.issueListKeyword,
  issueListListQuery: state => state.projects.issueListListQuery,
  issueListPageInfo: state => state.projects.issueListPageInfo,
  issueListDisplayClosed: state => state.projects.issueListDisplayClosed,
  fixedVersionShowClosed: state => state.projects.fixedVersionShowClosed
}
export default getters
