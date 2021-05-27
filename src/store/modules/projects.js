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
    kanbanVersionValue: '-1',
    kanbanMemberValue: '-1',
    kanbanFilterDimension: 'status',
    kanbanFilterValue: []
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
  SET_KANBAN_VERSION_VALUE: (state, value) => {
    state.kanbanVersionValue = value
  },
  SET_KANBAN_MEMBER_VALUE: (state, value) => {
    state.kanbanMemberValue = value
  },
  SET_KANBAN_FILTER_DIMENSION: (state, value) => {
    state.kanbanFilterDimension = value
  },
  SET_KANBAN_FILTER_VALUE: (state, value) => {
    state.kanbanFilterValue = value
  }
}

const actions = {
  async getMyProjectList({ commit }) {
    try {
      const res = await getMyProjectList()
      const { data } = res
      commit('SET_LIST', data.project_list)
      commit('SET_TOTAL', data.project_list.length)
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
    commit('SET_KANBAN_VERSION_VALUE', '-1')
    commit('SET_KANBAN_MEMBER_VALUE', '-1')
    commit('SET_KANBAN_FILTER_DIMENSION', 'status')
    commit('SET_KANBAN_FILTER_VALUE', [])
  },
  setKanbanVersionValue({ commit }, value) {
    commit('SET_KANBAN_VERSION_VALUE', value)
  },
  setKanbanMemberValue({ commit }, value) {
    commit('SET_KANBAN_MEMBER_VALUE', value)
  },
  setKanbanFilterDimension({ commit }, value) {
    commit('SET_KANBAN_FILTER_DIMENSION', value)
    commit('SET_KANBAN_FILTER_VALUE', [])
  },
  setKanbanFilterValue({ commit }, value) {
    commit('SET_KANBAN_FILTER_VALUE', value)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
