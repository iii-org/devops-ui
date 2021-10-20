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

    issueFilter: JSON.parse(sessionStorage.getItem('issueFilter')) ||{},
    keyword: JSON.parse(sessionStorage.getItem('keyword')) || {},
    displayClosed: JSON.parse(sessionStorage.getItem('displayClosed')) ||{},
    groupBy: JSON.parse(sessionStorage.getItem('groupBy')) || {
      dimension: 'status',
      value: []
    },
    listQuery: {},
    issueListPageInfo: {},
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
  SET_FILTER: (state, value) => {
    state.issueFilter = value
  },
  SET_KEYWORD: (state, value) => {
    state.keyword = value
  },
  SET_DISPLAY_CLOSED: (state, value) => {
    state.displayClosed = value
  },
  SET_GROUP_BY: (state, value) => {
    state.groupBy = value
  },
  SET_LIST_QUERY: (state, value) => {
    state.listQuery = value
  },
  SET_PAGE_INFO: (state, value) => {
    state.pageInfo = value
  },
  SET_FIXED_VERSION_SHOW_CLOSED: (state, value) => {
    state.fixedVersionShowClosed = value
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
    const { id } = project
    if (localStorage.getItem('projectId') !== id.toString()) {
      sessionStorage.removeItem('issueFilter')
      sessionStorage.removeItem('groupBy')
      sessionStorage.removeItem('displayClosed')
      sessionStorage.removeItem('Keyword')
      commit('SET_SELECTED_PROJECT', project)
      commit('SET_FILTER', {})
      commit('SET_GROUP_BY', {dimension:'status', value:[]})
      commit('SET_DISPLAY_CLOSED', {})
    }
  },
  getIssueFilter({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('issueFilter')
    if (getSessionValue) {
      commit('SET_FILTER', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.issueFilter
  },
  setIssueFilter({ commit }, value) {
    sessionStorage.setItem('issueFilter', JSON.stringify(value))
    commit('SET_FILTER', value)
  },
  getKeyword({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('keyword')
    if (getSessionValue) {
      commit('SET_KEYWORD', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.keyword
  },
  setKeyword({ commit }, value) {
    sessionStorage.setItem('keyword', JSON.stringify(value))
    commit('SET_KEYWORD', value)
  },
  getDisplayClosed({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('displayClosed')
    if (getSessionValue) {
      commit('SET_DISPLAY_CLOSED', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.keyword
  },
  setDisplayClosed({ commit }, value) {
    sessionStorage.setItem('displayClosed', JSON.stringify(value))
    commit('SET_DISPLAY_CLOSED', value)
  },
  getGroupBy({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('groupBy')
    if (getSessionValue) {
      commit('SET_GROUP_BY', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.groupBy
  },
  setGroupBy({ commit }, value) {
    sessionStorage.setItem('groupBy', JSON.stringify(value))
    commit('SET_GROUP_BY', value)
  },
  getListQuery({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('listQuery')
    if (getSessionValue) {
      commit('SET_LIST_QUERY', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.listQuery
  },
  setListQuery({ commit }, value) {
    sessionStorage.setItem('listQuery', JSON.stringify(value))
    commit('SET_LIST_QUERY', value)
  },
  getPageInfo({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('pageInfo')
    if (getSessionValue) {
      commit('SET_PAGE_INFO', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.pageInfo
  },
  setPageInfo({ commit }, value) {
    sessionStorage.setItem('pageInfo', JSON.stringify(value))
    commit('SET_PAGE_INFO', value)
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
