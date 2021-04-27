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
    selectedProject: { id: -1 }
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
  }
}

const actions = {
  async getProjectList({ commit, rootState }, params) {
    try {
      const response = await getProjectList(rootState.user.userId, params)
      let { data } = response
      data = data.sort(function(a, b) {
        return a['repository_ids'] < b['repository_ids'] ? 1 : -1
      })
      const dataWithTag = await data.reduce(async (acc, cur) => {
        const res = await acc
        // const id = cur.repository_ids[0]
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
  async queryProjectList({ commit }) {
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
      return Promise.solve(res)
    } catch (error) {
      console.error(error.toString())
      return Promise.reject(error)
    }
  },
  async editProject({ commit, dispatch }, { pId, data }) {
    try {
      const res = await EP(pId, data)
      return res
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
      const res = await GPIP(pId)
      return res
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectIssueStatistics({ commit }, pId) {
    try {
      const res = await GPIS(pId)
      return res
    } catch (error) {
      console.error(error.toString())
    }
  },
  async getProjectUserList({ commit }, pId) {
    try {
      const res = await GPUL(pId)
      return res
    } catch (error) {
      console.error(error.toString())
    }
  },
  setSelectedProject({ commit }, project) {
    commit('SET_SELECTED_PROJECT', project)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
