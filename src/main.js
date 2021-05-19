import Vue from 'vue'
import VueShowdown from 'vue-showdown'
import '@/assets/styles/tailwind.css'
import 'normalize.css/normalize.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import i18n, { getLanguage } from './lang'
import VueGtag from 'vue-gtag'
import '@/styles/index.scss'

import App from './App'
import store from './store'
import router from './router/router'

import '@/icons'
import '@/permission'

import * as filters from './filters'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-tw'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(duration)

dayjs.locale(getLanguage().toLowerCase())
Vue.prototype.$dayjs = dayjs

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
Vue.use(VueGtag, {
  config: { id: 'GTM-W2KLWN4' }
})

// Filters
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
