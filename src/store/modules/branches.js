import { getBranchesByProject as GBBP } from '@/api/branches'

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
  async getBranchesByProject({ commit }, pId) {
    try {
      const response = await GBBP(pId)
      const { data } = response
      commit('SET_LIST', data.branch_list)
      commit('SET_TOTAL', data.branch_list.length)
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
