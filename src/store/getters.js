const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  device: state => state.app.device,
  token: state => state.user.token,
  userId: state => state.user.userId,
  userName: state => state.user.userName,
  userRole: state => state.user.userRole,
  permission_routes: state => state.permission.routes,
  projectList: state => state.projects.list,
  projectListTotal: state => state.projects.total,
  branchesByProject: state => state.branches.list,
  branchesTotalNumByProject: state => state.branches.total,
  fileListByBranch: state => state.fileList.list,
  fileListTotalByBranch: state => state.fileList.total,
  commitListByBranch: state => state.commitList.list,
  commitListTotalByBranch: state => state.commitList.total,
  userProjectList: state => state.user.userProjectList,
  projectSelectedId: state => state.projects.selectedProject.id,
  selectedProject: state => state.projects.selectedProject
}
export default getters
