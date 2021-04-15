import { login, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router/router'
import VueJwtDecode from 'vue-jwt-decode'

const getDefaultState = () => {
  return {
    token: getToken(),
    userId: 0,
    userRole: '',
    userName: '',
    userProjectList: []
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
  },
  SET_USER_PROJECT: (state, userProjectList) => {
    state.userProjectList = userProjectList
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response
          const { token } = data
          const jwtContent = VueJwtDecode.decode(token)
          // console.log('jwtContent', jwtContent)
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

  // get e info
  getInfo({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      const token = getToken()
      const jwtContent = VueJwtDecode.decode(token)
      if (!('identity' in jwtContent)) {
        Promise.reject('userId not exist')
      }
      commit('SET_USER_ID', jwtContent['identity'].user_id)
      commit('SET_TOKEN', token)

      getInfo(state.userId)
        .then(response => {
          // console.log('getInfo', response)
          const { data } = response
          const { role, name } = data
          if (!role) {
            reject('role is not exist in user info')
          }
          commit('SET_USER_NAME', name)

          if (!role.name) {
            reject('name is not exist in role')
          }
          data.project = data.project.sort(function(a, b) {
            return a['id'] < b['id'] ? 1 : -1
          })
          dispatch('app/setRoleList', null, { root: true })
          commit('SET_USER_ROLE', role.name)
          commit('SET_USER_PROJECT', data.project)
          if (data.project.length > 0) {
            const projectstorage = data.project.filter(elm => {
              if (String(elm.id) === localStorage.getItem('project')) {
                return true
              }
            }
            )
            if (projectstorage.length === 1) {
              commit('projects/SET_SELECTED_PROJECT', projectstorage[0], { root: true })
            } else {
              commit('projects/SET_SELECTED_PROJECT', data.project[0], { root: true })
            }
            // commit('projects/SET_PROJET_SELECTED_ID', data.project[0].id, { root: true })
            // commit('projects/SET_PROJET_SELECTED', data.project[0], { root: true })
          }
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state }) {
    localStorage.clear()
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
