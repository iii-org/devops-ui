
import { getCommitListByBranch as GCLBB } from '@/api/commitList'

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
  async getCommitListByBranch({ commit }, {rId, bName}) {
    try {
      const response = await GCLBB(rId, bName)
      const { data } = response
      // commit('SET_LIST', data.items)
      // commit('SET_TOTAL', data.total)
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

