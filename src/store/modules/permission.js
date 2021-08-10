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
  result[idx].children = result[idx].children.filter(item => !disabledPluginRoutes.includes(item.name))
  if (result[idx].children.length === 0) result.splice(idx, 1)
  return result
}

const appendRouter = (menuItem, pluginRoutes, pluginIndex, result) => {
  // pluginRoutes , root result,
  const resultMapByPath = result.map((item) => ((item.hasOwnProperty('path')) ? item.path : undefined))
  if (menuItem.meta.appendRoot) {
    let appendIndex = resultMapByPath.findIndex((menu) => (menu === menuItem.meta.appendRoot.path))
    if (menuItem.meta.appendRoot.position === 'after') {
      appendIndex = appendIndex + 1
    }
    result.splice(appendIndex, 0, pluginRoutes[pluginIndex])
  }
}

const state = {
  addRoutes: [],
  routes: []
}

const mutations = {
  SET_ROUTES: (states, routes) => {
    states.addRoutes = routes
    states.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  async generateRoutes({ commit }, roles) {
    const disabledPluginRoutes = (await getRoutes()).data.map(route => {
      if (route.disabled) return route.name
    })
    // views Plugin
    let accessedRoutes
    let result = asyncRoutes
    const req = require.context('@/views/Plugin', true, /(router.js)$/, 'lazy')
    for (const path of req.keys()) {
      const context = req(path).default || (await req(path))
        //combine menu by same name
      const pluginItem = context.asyncRoutes
      pluginItem.forEach((item, pluginIndex) => { // plugin root
        const mainItems = result.map((mainItem) => ((mainItem.hasOwnProperty('path')) ? mainItem.path : undefined))
        // devops root parent
        if (mainItems.includes(item.path)) { // if same
          const mainIndex = mainItems.findIndex((menu) => (menu === item.path)) // find devops root id
          if (result[mainIndex].hasOwnProperty('children') && pluginItem[pluginIndex] && pluginItem[pluginIndex].hasOwnProperty('children')) {
            // find children
            const pluginChildren = pluginItem[pluginIndex].children
            pluginChildren.forEach((subItem, subIdx) => {
              // devops root children index
              appendRouter(subItem, pluginChildren, subIdx, result[mainIndex].children)
            })
          }
        }
        // root
        appendRouter(item, pluginItem, pluginIndex, result)
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
