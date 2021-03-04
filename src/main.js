import Vue from 'vue'
import VueShowdown from 'vue-showdown'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import i18n from './lang' // internationalization

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router/router'

import '@/icons' // icon
import '@/permission' // permission control

import * as filters from './filters' // global filters
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
Vue.use(ElementUI, { i18n: (key, value) => i18n.t(key, value) })
Vue.use(VueShowdown, {
  options: {
    emoji: true,
    tables: true,
    simplifiedAutoLink: true,
    tasklists: true,
    openLinksInNewWindow: true,
    underline: true,
    ghCodeBlocks: true,
    encodeEmails: true,
    simpleLineBreaks: true,
    strikethrough: true
  }
})
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
