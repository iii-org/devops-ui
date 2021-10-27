import router from './router/router'
import store from './store'
import { Message, MessageBox } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'
import i18n from '@/lang'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta)
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoles = store.getters.userRole
      if (hasRoles) {
        next()
      } else {
        try {
          await store.dispatch('user/getInfo')
          const userRole = store.getters.userRole
          const accessRoutes = await store.dispatch('permission/generateRoutes', userRole)
          router.addRoutes(accessRoutes)
          next({ ...to, replace: true })
        } catch (error) {
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      MessageBox.confirm(i18n.t('Notify.logoutNotifications'), i18n.t('general.Notify'), {
        confirmButtonText: i18n.t('general.ReLogin'),
        cancelButtonText: i18n.t('general.Continue'),
        type: 'warning',
        showClose: false,
        showCancelButton: false
      }).then(() => {
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      })
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
