const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  projectList: state => state.projects.list,
  projectListTotal: state => state.projects.total
}
export default getters
