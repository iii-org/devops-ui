import {
  getMyProjectList,
  addNewProject,
  editProject,
  deleteProject,
  getProjectIssueProgress,
  getProjectIssueStatistics,
  getProjectUserList
} from '@/api/projects'
import { forceDeleteProject } from '@/api_v2/projects'
import { getIssuePriority, getIssueStatus, getIssueTracker } from '@/api/issue'
import { getIssueStrictTracker, getIssueForceTracker } from '@/api_v2/issue'

const getDefaultState = () => {
  return {
    list: [],
    options: [],
    total: 0,
    selectedProject: { id: -1, repository_ids: [-1] },

    tracker: [],
    status: [],
    priority: [],
    strictTracker: [],
    forceTracker: [],
    enableForceTracker: false,

    issueFilter: JSON.parse(sessionStorage.getItem('issueFilter')) || {},
    keyword: JSON.parse(sessionStorage.getItem('keyword')) || {},
    displayClosed: JSON.parse(sessionStorage.getItem('displayClosed')) || {},
    groupBy: JSON.parse(sessionStorage.getItem('groupBy')) || {
      dimension: 'status',
      value: []
    },
    tableExpand: JSON.parse(sessionStorage.getItem('tableExpand')) || {},
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
  SET_STRICT_TRACKER: (state, value) => {
    state.strictTracker = value
  },
  SET_ENABLE_FORCE_TRACKER: (state, value) => {
    state.enableForceTracker = value
  },
  SET_FORCE_TRACKER: (state, value) => {
    state.forceTracker = value
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
  SET_TABLE_EXPAND: (state, value) => {
    state.tableExpand = value
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
      let { projects, page } = await getMyProjectList(true, params)
      projects = projects
        .sort((a, b) => -(new Date(a.updated_time) - new Date(b.updated_time)))
        .sort((a, b) => (a.starred === b.starred ? 0 : a.starred ? -1 : 1))
      dispatch('getMyProjectOptions')
      commit('SET_LIST', projects)
      if (page) {
        commit("SET_TOTAL", page.total);
        return page;
      } else {
        commit("SET_TOTAL", projects.length);
      }
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getMyProjectOptions({ commit }) {
    try {
      let { projects } = await getMyProjectList(true)
      // projects = projects.sort((a, b) => a.id - b.id).sort((a, b) => (a.starred === b.starred ? 0 : a.starred ? -1 : 1))
      commit('SET_OPTIONS', projects)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getSelectionOptions({ commit, dispatch }) {
    let selections = await Promise.all([getIssueTracker(), getIssueStatus(), getIssuePriority()])
    commit(
      'SET_SELECTION_OPTIONS',
      selections.map((item) => item.data)
    )
  },
  async getIssueStrictTracker({ commit }) {
    const params = {
      new: true,
      project_id: state.selectedProject.id
    }
    try {
      const tracker = await getIssueStrictTracker(params)
      commit('SET_STRICT_TRACKER', tracker.data)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getIssueForceTracker({ commit }) {
    try {
      const tracker = await getIssueForceTracker(state.selectedProject.id)
      commit('SET_ENABLE_FORCE_TRACKER', tracker.data.enable)
      commit('SET_FORCE_TRACKER', tracker.data.need_fatherissue_trackers)
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
  async forceDeleteProject({ commit, dispatch }, pId) {
    try {
      const res = await forceDeleteProject(pId)
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
  setSelectedProject({ commit, dispatch }, project) {
    const { id } = project
    if (localStorage.getItem('projectId') !== id.toString()) {
      sessionStorage.removeItem('issueFilter')
      sessionStorage.removeItem('groupBy')
      sessionStorage.removeItem('displayClosed')
      sessionStorage.removeItem('Keyword')
    }
    commit('SET_SELECTED_PROJECT', project)
    commit('SET_FILTER', {})
    commit('SET_GROUP_BY', { dimension: 'status', value: [] })
    commit('SET_DISPLAY_CLOSED', {})
    dispatch('getIssueStrictTracker')
    dispatch('getIssueForceTracker')
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
    return state.displayClosed
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
  getFixedVersionShowClosed({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('fixed_version_show_closed')
    if (getSessionValue) {
      commit('SET_FIXED_VERSION_SHOW_CLOSED', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.fixedVersionShowClosed
  },
  setFixedVersionShowClosed({ commit }, value) {
    sessionStorage.setItem('fixed_version_show_closed', JSON.stringify(value))
    commit('SET_FIXED_VERSION_SHOW_CLOSED', value)
  },
  getTableExpand({ commit, state }) {
    const getSessionValue = sessionStorage.getItem('tableExpand')
    if (getSessionValue) {
      commit('SET_TABLE_EXPAND', JSON.parse(getSessionValue))
      return JSON.parse(getSessionValue)
    }
    return state.tableExpand
  },
  setTableExpand({ commit }, value) {
    sessionStorage.setItem('tableExpand', JSON.stringify(value))
    commit('SET_TABLE_EXPAND', value)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
