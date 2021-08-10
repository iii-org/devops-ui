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

const appendRouter = (menuItem, result, resultMapByPath) => {
  // pluginRoutes , root result,
  if (menuItem.meta.appendRoot) {
    let appendIndex = resultMapByPath.findIndex((menu) => (menu === menuItem.meta.appendRoot.path))
    if (menuItem.meta.appendRoot.position === 'after') {
      appendIndex = appendIndex + 1
    }
    if (menuItem.meta.appendRoot.replace) {
      result.splice(appendIndex, 1, menuItem)
    } else {
      result.splice(appendIndex, 0, menuItem)
    }
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
    let result = asyncRoutes
    let accessedRoutes
    const req = require.context('@/views/Plugin', true, /(router.js)$/, 'lazy')
    for (const path of req.keys()) {
      const context = req(path).default || (await req(path))
      //combine menu by same name
      const pluginItem = context.asyncRoutes
      const mainItems = result.map((item) => ((item.hasOwnProperty('path')) ? item.path : undefined))

      const hasSameInRoot = []
      const appendToRoot = []

      pluginItem.forEach((item) => { // plugin root
        // devops root parent
        if (mainItems.includes(item.path)) { // if same
          hasSameInRoot.push(item)
        } else {
          appendToRoot.push(item)
        }
      })

      hasSameInRoot.forEach((item, pluginIndex) => {
        const mainIndex = mainItems.findIndex((menu) => (menu === item.path)) // find devops root id
        if (result[mainIndex].hasOwnProperty('children') && hasSameInRoot[pluginIndex] && hasSameInRoot[pluginIndex].hasOwnProperty('children')) {
          // find children
          const pluginChildren = hasSameInRoot[pluginIndex].children
          pluginChildren.forEach((subItem) => {
            // devops root children index
            const childrenItem = result[mainIndex].children.map((item) => ((item.hasOwnProperty('path')) ? item.path : undefined))
            appendRouter(subItem, result[mainIndex].children, childrenItem)
          })
        }
      })

      appendToRoot.forEach((item) => {
        appendRouter(item, result, mainItems)
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
