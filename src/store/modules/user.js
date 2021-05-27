import { getInfo, login } from '@/api/user'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { resetRouter } from '@/router/router'
import VueJwtDecode from 'vue-jwt-decode'
import User from '@/data/user'
import { getMyProjectListSimple } from '@/api/projects'

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
  async getInfo({ commit, state, dispatch }) {
    const token = getToken()
    const jwtContent = VueJwtDecode.decode(token)
    if (!('identity' in jwtContent)) {
      Promise.reject('userId not exist')
    }
    commit('SET_USER_ID', jwtContent['identity'].user_id)
    commit('SET_TOKEN', token)

    const response = await getInfo(state.userId)
    const user = new User(response.data)
    if (!user.default_role_id) {
      throw new Error('role is not exist in user info')
    }
    commit('SET_USER_NAME', user.name)

    const res = await getMyProjectListSimple()
    const myProjects = res.data.project_list.sort(function (a, b) {
      return a.id - b.id
    })

    dispatch('app/setRoleList', null, { root: true })
    commit('SET_USER_ROLE', user.default_role_name)
    commit('SET_USER_PROJECT', myProjects)
    if (myProjects.length > 0) {
      const projectStorage = myProjects.filter(elm => {
        if (String(elm.id) === localStorage.getItem('projectId')) {
          return true
        }
      })
      if (projectStorage.length === 1) {
        commit('projects/SET_SELECTED_PROJECT', projectStorage[0], { root: true })
      } else {
        commit('projects/SET_SELECTED_PROJECT', myProjects[0], { root: true })
      }
    }
  },

  // user logout
  logout({ commit }) {
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
