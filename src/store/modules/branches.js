import { getBranchesByProject as GBBP, newBranch as NB, deleteBranch as DB, mergeBranch as MB } from '@/api/branches'

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
  },
  async newBranch({ commit, dispatch }, { rId, data }) {
    try {
      const response = await NB(rId, data)
      await new Promise(resolve => {
        setTimeout(() => {
          dispatch('getBranchesByProject', rId)
          resolve()
        }, 1000)
      })
    } catch (error) {
      console.error(error.toString())
    }
  },
  async deleteBranch({ dispatch }, { rId, bName }) {
    try {
      const response = await DB(rId, bName)
      await new Promise(resolve => {
        setTimeout(() => {
          dispatch('getBranchesByProject', rId)
          resolve()
        }, 1000)
      })
    } catch (error) {
      console.error(error.toString())
    }
  },
  async mergeBranch({ dispatch }, { rId, data }) {
    try {
      const response = await MB(rId, data)
      await new Promise(resolve => {
        setTimeout(async () => {
          await dispatch('getBranchesByProject', rId)
          resolve()
        }, 1000)
      })
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
