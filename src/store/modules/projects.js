import {
  getMyProjectList,
  addNewProject,
  editProject,
  deleteProject,
  getProjectIssueProgress,
  getProjectIssueStatistics,
  getProjectUserList
} from '@/api/projects'

const getDefaultState = () => {
  return {
    list: [],
    total: 0,
    selectedProject: { id: -1 },
    kanbanFilter: {},
    kanbanGroupBy: {
      dimension: 'status',
      value: []
    },
    initKanban: false,
    kanbanDisplayClosed: false,
    kanbanKeyword: null,
    initIssueList: false,
    issueListFilter: {},
    issueListListQuery: {},
    issueListPageInfo: {},
    issueKeyword: null,
    issueListDisplayClosed: false,
    fixedVersionShowClosed: false
  }
}

const state = getDefaultState()

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list
  },
  SET_TOTAL: (state, total) => {
    state.total = total
  },
  SET_SELECTED_PROJECT: (state, project) => {
    state.selectedProject = project
  },
  SET_KANBAN_FILTER: (state, value) => {
    state.kanbanFilter = value
  },
  SET_KANBAN_GROUP_BY_DIMENSION: (state, value) => {
    state.kanbanGroupBy.dimension = value
  },
  SET_KANBAN_GROUP_BY_VALUE: (state, value) => {
    state.kanbanGroupBy.value = value
  },
  SET_KANBAN_DISPLAY_CLOSED: (state, value) => {
    state.kanbanDisplayClosed = value
  },
  SET_KANBAN_KEYWORD: (state, value) => {
    state.kanbanKeyword = value
  },
  SET_INIT_KANBAN(state, value) {
    state.initKanban = value
  },
  SET_INIT_ISSUE_LIST(state, value) {
    state.initIssueList = value
  },
  SET_ISSUE_LIST_FILTER: (state, value) => {
    state.issueListFilter = value
  },
  SET_ISSUE_LIST_KEYWORD: (state, value) => {
    state.issueListKeyword = value
  },
  SET_ISSUE_LIST_LIST_QUERY: (state, value) => {
    state.issueListListQuery = value
  },
  SET_ISSUE_LIST_PAGE_INFO: (state, value) => {
    state.issueListPageInfo = value
  },
  SET_FIXED_VERSION_SHOW_CLOSED: (state, value) => {
    state.fixedVersionShowClosed = value
  },
  SET_ISSUE_LIST_DISPLAY_CLOSED(state, value) {
    state.issueListDisplayClosed = value
  }
}

const actions = {
  async getMyProjectList({ commit }) {
    try {
      const projects = await getMyProjectList()
      commit('SET_LIST', projects)
      commit('SET_TOTAL', projects.length)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async addNewProject({ commit, dispatch }, data) {
    try {
      const res = await addNewProject(data)
      dispatch('user/getInfo', null, { root: true })
      return Promise.resolve(res)
    } catch (error) {
      console.error(error.toString())
      return Promise.reject(error)
    }
  },
  async editProject({ commit, dispatch }, { pId, data }) {
    try {
      return await editProject(pId, data)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async deleteProject({ commit, dispatch }, pId) {
    try {
      const res = await deleteProject(pId)
      dispatch('user/getInfo', null, { root: true })
      return res
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectIssueProgress({ commit }, pId) {
    try {
      return await getProjectIssueProgress(pId)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectIssueStatistics({ commit }, pId) {
    try {
      return await getProjectIssueStatistics(pId)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectUserList({ commit }, pId) {
    try {
      return await getProjectUserList(pId)
    } catch (error) {
      console.error(error.toString())
    }
  },
  setSelectedProject({ commit }, project) {
    commit('SET_SELECTED_PROJECT', project)
    commit('SET_KANBAN_FILTER', {})
    commit('SET_KANBAN_GROUP_BY_DIMENSION', 'status')
    commit('SET_KANBAN_GROUP_BY_VALUE', [])
  },
  setKanbanFilter({ commit }, value) {
    commit('SET_KANBAN_FILTER', value)
  },
  setKanbanGroupByDimension({ commit }, value) {
    commit('SET_KANBAN_GROUP_BY_DIMENSION', value)
    commit('SET_KANBAN_GROUP_BY_VALUE', [])
  },
  setKanbanGroupByValue({ commit }, value) {
    commit('SET_KANBAN_GROUP_BY_VALUE', value)
  },
  setKanbanDisplayClosed({ commit }, value) {
    commit('SET_KANBAN_DISPLAY_CLOSED', value)
  },
  setKanbanKeyword({ commit }, value) {
    commit('SET_KANBAN_KEYWORD', value)
  },
  setInitKanban({ commit }, value) {
    commit('SET_INIT_KANBAN', value)
  },
  setIssueListFilter({ commit }, value) {
    commit('SET_ISSUE_LIST_FILTER', value)
  },
  setIssueListKeyword({ commit }, value) {
    commit('SET_ISSUE_LIST_KEYWORD', value)
  },
  setIssueListListQuery({ commit }, value) {
    commit('SET_ISSUE_LIST_LIST_QUERY', value)
  },
  setIssueListPageInfo({ commit }, value) {
    commit('SET_ISSUE_LIST_PAGE_INFO', value)
  },
  setInitIssueList({ commit }, value) {
    commit('SET_INIT_ISSUE_LIST', value)
  },
  setIssueListDisplayClosed({ commit }, value) {
    commit('SET_ISSUE_LIST_DISPLAY_CLOSED', value)
  },
  setFixedVersionShowClosed({ commit }, value) {
    commit('SET_FIXED_VERSION_SHOW_CLOSED', value)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
