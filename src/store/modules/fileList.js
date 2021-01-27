import { getFileListByBranch as GFLBB, addFile as AF } from '@/api/fileList'

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
  async getFileListByBranch({ commit }, { rId, bName }) {
    try {
      const response = await GFLBB(rId, bName)
      commit('SET_LIST', response.data.file_list)
      commit('SET_TOTAL', response.data.file_list.length)
    } catch (error) {
      console.error(error.toString())
    }
  },
  async addFile({ commit }, { rId, data }) {
    try {
      const response = await AF(rId, data)
      // console.log(response)
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
