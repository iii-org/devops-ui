import {
  getMyProjectList,
  addNewProject,
  editProject,
  deleteProject,
  getProjectIssueProgress,
  getProjectIssueStatistics,
  getProjectUserList
} from '@/api/projects'
import { getIssuePriority, getIssueStatus, getIssueTracker } from '@/api/issue'

const getDefaultState = () => {
  return {
    list: [],
    options: [],
    total: 0,
    selectedProject: { id: -1, repository_ids: [-1] },

    tracker: [],
    status: [],
    priority: [],

    kanbanFilter: {},
    kanbanGroupBy: {
      dimension: 'status',
      value: []
    },
    kanbanDisplayClosed: false,
    kanbanKeyword: '',
    issueListFilter: {},
    issueListListQuery: {},
    issueListPageInfo: {},
    issueListKeyword: '',
    issueListDisplayClosed: false,
    fixedVersionShowClosed: false
  }
}

const state = getDefaultState()

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list
  },
  SET_OPTIONS: (state, list) => {
    state.options = list
  },
  SET_TOTAL: (state, total) => {
    state.total = total
  },
  SET_SELECTED_PROJECT: (state, project) => {
    state.selectedProject = project
  },
  SET_SELECTION_OPTIONS: (state, list) => {
    state.tracker = list[0]
    state.status = list[1]
    state.priority = list[2]
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
  async getMyProjectList({ commit, dispatch }, params) {
    try {
      let projects = await getMyProjectList(false, params)
      projects = projects.sort((a, b) => (-(new Date(a.updated_time) - new Date(b.updated_time))))
        .sort((a, b) => ((a.starred === b.starred) ? 0 : a.starred ? -1 : 1))
      dispatch('getMyProjectOptions')
      commit('SET_LIST', projects)
      commit('SET_TOTAL', projects.length)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getMyProjectOptions({ commit }) {
    try {
      let projects = await getMyProjectList(true)
      projects = projects.sort((a, b) => (a.id - b.id))
        .sort((a, b) => ((a.starred === b.starred) ? 0 : a.starred ? -1 : 1))
      commit('SET_OPTIONS', projects)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getSelectionOptions({ commit }) {
    let selections = await Promise.all([getIssueTracker(), getIssueStatus(), getIssuePriority()])
    commit('SET_SELECTION_OPTIONS', selections.map((item) => (item.data)))
  }
  ,
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
    sessionStorage.removeItem('kanbanFilter')
    sessionStorage.removeItem('kanbanGroupBy.dimension')
    sessionStorage.removeItem('kanbanGroupBy.value')
    sessionStorage.removeItem('kanbanDisplayClosed')
    sessionStorage.removeItem('kanbanKeyword')
    sessionStorage.removeItem('issueListFilter')
    sessionStorage.removeItem('issueListDisplayClosed')
    sessionStorage.removeItem('issueListKeyword')
    commit('SET_SELECTED_PROJECT', project)
    commit('SET_KANBAN_FILTER', {})
    commit('SET_KANBAN_GROUP_BY_DIMENSION', 'status')
    commit('SET_KANBAN_GROUP_BY_VALUE', [])
  },
  getKanbanFilter({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('kanbanFilter')
    if (getSessionValue) {
      commit('SET_KANBAN_FILTER', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.kanbanFilter
  },
  setKanbanFilter({ commit }, value) {
    sessionStorage.setItem('kanbanFilter', JSON.stringify(value))
    commit('SET_KANBAN_FILTER', value)
  },
  getKanbanGroupByDimension({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('kanbanGroupBy.dimension')
    if (getSessionValue) {
      commit('SET_KANBAN_GROUP_BY_DIMENSION', getSessionValue)
      commit('SET_KANBAN_GROUP_BY_VALUE', [])
      return getSessionValue
    }
    return state.kanbanGroupBy.dimension
  },
  setKanbanGroupByDimension({ commit }, value) {
    sessionStorage.setItem('kanbanGroupBy.dimension', value)
    commit('SET_KANBAN_GROUP_BY_DIMENSION', value)
    commit('SET_KANBAN_GROUP_BY_VALUE', [])
  },
  getKanbanGroupByValue({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('kanbanGroupBy.value')
    if (getSessionValue) {
      commit('SET_KANBAN_GROUP_BY_VALUE', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.kanbanGroupBy.value
  },
  setKanbanGroupByValue({ commit }, value) {
    sessionStorage.setItem('kanbanGroupBy.value', JSON.stringify(value))
    commit('SET_KANBAN_GROUP_BY_VALUE', value)
  },
  getKanbanDisplayClosed({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('kanbanDisplayClosed')
    if (getSessionValue) {
      commit('SET_KANBAN_DISPLAY_CLOSED', getSessionValue)
      return JSON.parse(getSessionValue)
    }
    return state.kanbanDisplayClosed
  },
  setKanbanDisplayClosed({ commit }, value) {
    sessionStorage.setItem('kanbanDisplayClosed', value)
    commit('SET_KANBAN_DISPLAY_CLOSED', value)
  },
  getKanbanKeyword({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('kanbanKeyword')
    if (getSessionValue) {
      commit('SET_KANBAN_KEYWORD', getSessionValue)
      return getSessionValue
    }
    return state.kanbanKeyword
  },
  setKanbanKeyword({ commit }, value) {
    sessionStorage.setItem('kanbanKeyword', value)
    commit('SET_KANBAN_KEYWORD', value)
  },
  getIssueListFilter({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('issueListFilter')
    if (getSessionValue) {
      commit('SET_ISSUE_LIST_FILTER', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.issueListFilter
  },
  setIssueListFilter({ commit }, value) {
    sessionStorage.setItem('issueListFilter', JSON.stringify(value))
    commit('SET_ISSUE_LIST_FILTER', value)
  },
  getIssueListKeyword({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('issueListKeyword')
    if (getSessionValue) {
      commit('SET_ISSUE_LIST_KEYWORD', getSessionValue)
      return getSessionValue
    }
    return state.issueListKeyword
  },
  setIssueListKeyword({ commit }, value) {
    sessionStorage.setItem('issueListKeyword', value)
    commit('SET_ISSUE_LIST_KEYWORD', value)
  },
  setIssueListListQuery({ commit }, value) {
    commit('SET_ISSUE_LIST_LIST_QUERY', value)
  },
  setIssueListPageInfo({ commit }, value) {
    commit('SET_ISSUE_LIST_PAGE_INFO', value)
  },
  getIssueListDisplayClosed({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('issueListDisplayClosed')
    if (getSessionValue) {
      commit('SET_ISSUE_LIST_DISPLAY_CLOSED', getSessionValue)
      return JSON.parse(getSessionValue)
    }
    return state.issueListDisplayClosed
  },
  setIssueListDisplayClosed({ commit }, value) {
    sessionStorage.setItem('issueListDisplayClosed', value)
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
