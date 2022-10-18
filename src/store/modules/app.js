import Cookies from 'js-cookie'
import { getLanguage } from '@/lang'
import { getRoleList } from '@/api/user'
import {
  getUploadFileSize,
  updateUploadFileSize,
  getUploadFileType,
  getUploadFileTypeList
} from '@/api_v2/systemParameter'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  language: getLanguage(),
  roleList: [],
  fileSize: '',
  fileType: '',
  fileTypeList: ''
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language
    Cookies.set('language', language)
  },
  SET_ROLE_LIST: (state, roleList) => {
    state.roleList = roleList
  },
  SET_FILE_SIZE: (state, fileSize) => {
    state.fileSize = fileSize
  },
  SET_FILE_TYPE: (state, fileType) => {
    state.fileType = fileType
  },
  SET_FILE_TYPE_LIST: (state, fileTypeList) => {
    state.fileTypeList = fileTypeList
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)
  },
  async setRoleList({ commit }) {
    const result = await getRoleList()
      .then((res) => {
        return Promise.resolve(res.data.role_list)
      }).catch((e) => {
        return Promise.reject(e)
      })
    commit('SET_ROLE_LIST', result)
  },
  async setFileSize({ commit }) {
    const result = await getUploadFileSize()
      .then((res) => {
        return Promise.resolve(res.upload_file_size)
      }).catch((e) => {
        return Promise.reject(e)
      })
    commit('SET_FILE_SIZE', result + 'MB')
  },
  async updateFileSize({ commit }, data) {
    await updateUploadFileSize(data)
      .then(() => {
        commit('SET_FILE_SIZE', data.upload_file_size + 'MB')
      }).catch((error) => {
        console.error(error.toString())
      })
  },
  async setFileType({ commit }) {
    const result = await getUploadFileType()
      .then((res) => {
        return Promise.resolve(res.data.filter((item) => item !== '').toString())
      }).catch((e) => {
        return Promise.reject(e)
      })
    commit('SET_FILE_TYPE', result)
  },
  async setFileTypeList({ commit }) {
    const result = await getUploadFileTypeList()
      .then((res) => {
        return Promise.resolve(
          Object.assign({}, ...res.data.upload_file_types.map((item) => ({
            [item['MIME Type']] : item['file extension']
          })))
        )
      }).catch((e) => {
        return Promise.reject(e)
      })
    commit('SET_FILE_TYPE_LIST', result)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
