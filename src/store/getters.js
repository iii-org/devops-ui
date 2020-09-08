const getters = {
  sidebar: state => state.app.sidebar,
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
  userProjectList: state => state.user.projectList,
  projectSelectedId: state => state.projects.projectSelectedId,
  projectSelectedObject: state => state.projects.projectSelectedObject
}
export default getters
