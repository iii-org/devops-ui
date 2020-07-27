import { login, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import VueJwtDecode from 'vue-jwt-decode'

const getDefaultState = () => {
  return {
    token: getToken(),
    // jwtContent: getJWTContent(),
    userId: 0,
    userRole: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  },
  SET_USER_ROLE: (state, userRole) => {
    state.userRole = userRole
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        const { token } = data
        const jwtContent = VueJwtDecode.decode(token)
        if(!'identity' in jwtContent) {
          Promise.reject('userId not exist')
        }

        commit('SET_USER_ID', jwtContent['identity'])
        commit('SET_TOKEN', token)
        setToken(token)

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      const token = getToken()
      const jwtContent = VueJwtDecode.decode(token)
      if(!'identity' in jwtContent) {
        Promise.reject('userId not exist')
      }
      commit('SET_USER_ID', jwtContent['identity'])
      commit('SET_TOKEN', token)

      getInfo(state.userId).then(response => {
        const { data } = response
        const { role } = data
        if(!role) {
          reject('role is not exist in user info')
        }
        const { name } = role
        if(!name) {
          reject('name is not exist in role')
        }

        commit('SET_USER_ROLE', role.name)

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    removeToken()
    resetRouter()
    commit('RESET_STATE')
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
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

