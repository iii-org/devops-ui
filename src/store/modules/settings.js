import defaultSettings from '@/settings'
import { getDevopsVersion } from '@/api/devopsVersion'

const { showSettings, fixedHeader, sidebarLogo } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  hasSystemUpdate: false,
  updateVersionName: ''
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_UPDATE_STATUS: (state, data) => {
    state.hasSystemUpdate = data.hasSystemUpdate
    state.updateVersionName = data.versionName
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  async checkApiVersion({ commit }) {
    try {
      const res = await getDevopsVersion()
      const { has_update, latest_version } = res.data
      this.hasUpdate = has_update
      const data = {
        hasSystemUpdate: has_update,
        versionName: latest_version.version_name
      }
      commit('SET_UPDATE_STATUS', data)
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
