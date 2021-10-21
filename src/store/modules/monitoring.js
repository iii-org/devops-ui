import { getSystemServerStatus } from '@/api/monitoring'

const getDefaultState = () => {
  return {
    serverStatus: {
      all_alive: true
    }
  }
}

const state = getDefaultState()

const mutations = {
  SET_SERVER_STATUS: (state, status) => {
    state.serverStatus = status
  }
}

const actions = {
  async getSystemServerStatus({ commit }) {
    try {
      const status = await getSystemServerStatus()
      commit('SET_SERVER_STATUS', status.data)
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