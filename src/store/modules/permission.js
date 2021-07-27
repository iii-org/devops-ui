import { asyncRoutes, constantRoutes } from '@/router/router'
import { getRoutes } from '@/api/user'

function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}
export function filterAsyncPluginRoutes(accessedRoutes, disabledPluginRoutes) {
  const result = accessedRoutes.map(item => item)
  const idx = result.findIndex(item => item.name === 'scan')
  result[idx].children = result[idx].children.filter((item) => !disabledPluginRoutes.includes(item.name))
  if (result[idx].children.length === 0) result.splice(idx, 1)
  return result
}

const appendRouter = (pluginRoutes, result, item, pluginIndex, mapByPath) => {
  if (item.meta.appendRoot) {
    let appendIndex = mapByPath.findIndex((menu) => (menu === item.meta.appendRoot.path))
    if (item.meta.appendRoot.position === 'after') {
      appendIndex = appendIndex + 1
    }
    result.splice(appendIndex, 0, pluginRoutes[pluginIndex])
  }
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  async generateRoutes({ commit }, roles) {
    const disabledPluginRoutes = (await getRoutes()).data.map(route => {
      if (route.disabled) return route.name
    })
    // views Plugin
    let accessedRoutes
    const req = require.context('@/views/Plugin', true, /(router.js)$/, 'lazy')
    let result = asyncRoutes
    for (const path of req.keys()) {
      const context = req(path).default || await req(path)
      //combine menu by same name
      const pluginItem = context.asyncRoutes
      pluginItem.forEach((item, pluginIndex) => {
        const mainItem = result.map((item) => ((item.hasOwnProperty('path')) ? item.path : undefined))
        if (mainItem.includes(item.path)) {
          const mainIndex = mainItem.findIndex((menu) => (menu === item.path))
          if (result[mainIndex].hasOwnProperty('children') && context.asyncRoutes[pluginIndex] && context.asyncRoutes[pluginIndex].hasOwnProperty('children')) {
            const pluginChildren = context.asyncRoutes[pluginIndex].children
            pluginChildren.forEach((subItem, subIdx) => {
              const mainSubItem = result[mainIndex].children.map((item) => ((item.hasOwnProperty('path')) ? item.path : undefined))
              appendRouter(pluginChildren, result[mainIndex].children, subItem, subIdx, mainSubItem)
            })
          }
        }
        appendRouter(context.asyncRoutes, result, item, pluginIndex, mainItem)
      })
    }
    return new Promise(async resolve => {
      if (roles.includes('admin')) {
        accessedRoutes = result || []
      } else {
        accessedRoutes = filterAsyncRoutes(result, [roles])
        accessedRoutes = filterAsyncPluginRoutes(accessedRoutes, disabledPluginRoutes)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
