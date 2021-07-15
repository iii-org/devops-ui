import { getUserInfo, login } from '@/api/user'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { resetRouter } from '@/router/router'
import VueJwtDecode from 'vue-jwt-decode'

const getDefaultState = () => {
  return {
    token: getToken(),
    userId: 0,
    userRole: '',
    userName: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState())
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  },
  SET_USER_ROLE: (state, userRole) => {
    state.userRole = userRole
  },
  SET_USER_NAME: (state, userName) => {
    state.userName = userName
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response
          const { token } = data
          const jwtContent = VueJwtDecode.decode(token)
          if (!('identity' in jwtContent)) {
            Promise.reject('userId not exist')
          }
          commit('SET_USER_ID', jwtContent['identity'].user_id)
          commit('SET_TOKEN', token)
          setToken(token)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  async getInfo({ commit, state, dispatch, rootState }) {
    const token = getToken()
    const jwtContent = VueJwtDecode.decode(token)
    if (!('identity' in jwtContent)) {
      Promise.reject('userId not exist')
    }
    commit('SET_USER_ID', jwtContent['identity'].user_id)
    commit('SET_TOKEN', token)

    const user = await getUserInfo(state.userId)
    if (!user.default_role_id) {
      throw new Error('role is not exist in user info')
    }
    commit('SET_USER_NAME', user.name)

    await dispatch('projects/getMyProjectOptions', null, { root: true })
    dispatch('app/setRoleList', null, { root: true })
    commit('SET_USER_ROLE', user.default_role_name)
    const myProjects = rootState.projects.options
    if (myProjects.length > 0) {
      const projectStorage = myProjects.find(elm => String(elm.id) === localStorage.getItem('projectId'))
      if (projectStorage) {
        commit('projects/SET_SELECTED_PROJECT', projectStorage, { root: true })
      } else {
        commit('projects/SET_SELECTED_PROJECT', myProjects[0], { root: true })
      }
    }
  },

  logout({ commit }) {
    localStorage.clear()
    removeToken()
    resetRouter()
    commit('RESET_STATE')
  },

  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove token first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
