const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  projectList: state => state.projects.list,
  projectListTotal: state => state.projects.total,
  branchesByProject: state => state.branches.list,
  branchesTotalNumByProject: state => state.branches.total,
  fileListByBranch: state => state.fileList.list,
  fileListTotalByBranch: state => state.fileList.total,
  commitListByBranch: state => state.commitList.list,
  commitListTotalByBranch: state => state.commitList.total
}
export default getters
