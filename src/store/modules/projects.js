import {
  getProjectList,
  queryProjectList as QPL,
  addNewProject as ANP,
  editProject as EP,
  deleteProject as DP
} from '@/api/projects'
import { getTagsId as GTID } from '@/api/tags'

const getDefaultState = () => {
  return {
    list: [],
    total: 0
  }
}

const state = getDefaultState()

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list
  },
  SET_TOTAL: (state, total) => {
    state.total = total
  }
}

const actions = {
  async getProjectList({ commit, rootState }, params) {
    try {
      const response = await getProjectList(rootState.user.userId, params)
      const { data } = response
      const dataWithTag = await data.reduce(async (acc, cur) => {
        const res = await acc
        const id = cur.repository_ids[0]
        if (!id) {
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
  async addNewProject({ commit }, data) {
    try {
      const res = await ANP(data)
      return res
    } catch (error) {
      console.error(error.toString())
    }
  },
  async editProject({ commit }, { pId, data }) {
    try {
      const res = await EP(pId, data)
      return res
    } catch (error) {
      console.error(error.toString())
    }
  },
  async deleteProject({ commit }, pId) {
    try {
      const res = await DP(pId)
      return res
    } catch (error) {
      console.error(error.toString())
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
