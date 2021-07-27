const state = {
  test_filename: null
}

const mutations = {
  TEST_FILENAME: (state, filename) => {
    state.test_filename = filename
  }
}

const actions = {
  setFileName({ commit }, filename) {
    commit('TEST_FILENAME', filename)
  },
  removeFileName({ commit }) {
    commit('TEST_FILENAME', null)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
