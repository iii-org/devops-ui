import {
  getProjectList,
  queryProjectList as QPL,
  addNewProject as ANP,
  editProject as EP,
  deleteProject as DP,
  getProjectIssueProgress as GPIP,
  getProjectIssueStatistics as GPIS,
  getProjectUserList as GPUL
} from '@/api/projects'
import { getTagsId as GTID } from '@/api/tags'

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
  async getRDProjectList({ commit, rootState }, params) {
    try {
      const response = await getProjectList(rootState.user.userId, params)
      let { data } = response
      data = data.sort(function(a, b) {
        return a.id < b.id ? 1 : -1
      })
      const dataWithTag = await data.reduce(async (acc, cur) => {
        const res = await acc
        if (!cur.repository_ids || !cur.repository_ids[0]) {
          res.push(cur)
          return Promise.resolve(res)
        }
        const tags = await GTID(cur.repository_ids[0])
        res.push({ ...cur, tags })
        return Promise.resolve(res)
      }, Promise.resolve([]))
      commit('SET_LIST', dataWithTag)
      commit('SET_TOTAL', dataWithTag.length)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getMyProjectList({ commit }) {
    try {
      const res = await QPL()
      const { data } = res
      commit('SET_LIST', data.project_list)
      commit('SET_TOTAL', data.project_list.length)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async addNewProject({ commit, dispatch }, data) {
    try {
      const res = await ANP(data)
      dispatch('user/getInfo', null, { root: true })
      return Promise.resolve(res)
    } catch (error) {
      console.error(error.toString())
      return Promise.reject(error)
    }
  },
  async editProject({ commit, dispatch }, { pId, data }) {
    try {
      return await EP(pId, data)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async deleteProject({ commit, dispatch }, pId) {
    try {
      const res = await DP(pId)
      dispatch('user/getInfo', null, { root: true })
      return res
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectIssueProgress({ commit }, pId) {
    try {
      return await GPIP(pId)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectIssueStatistics({ commit }, pId) {
    try {
      return await GPIS(pId)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectUserList({ commit }, pId) {
    try {
      return await GPUL(pId)
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
