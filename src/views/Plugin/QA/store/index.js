import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import qa from './modules/qa'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    qa
  },
  getters
})

export default store
