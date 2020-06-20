import { getProjectList } from '@/api/projects'

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
  async getProjectList({ commit }, params) {
    try {
      const response = await getProjectList(params)
      const { data } = response
      commit('SET_LIST', data.items)
      commit('SET_TOTAL', data.total)
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

