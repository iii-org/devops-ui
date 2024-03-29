import router from './router/router'
import store from './store'
import { Message, MessageBox } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken, getTokenExpiration, removeToken } from '@/utils/auth'
import getPageTitle from '@/utils/getPageTitle'
import i18n from '@/lang'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']
const showLogoutNotifyDialog = (to, next) => {
  MessageBox.confirm(i18n.t('Notify.logoutNotifications'), i18n.t('general.Notify'), {
    confirmButtonText: i18n.t('general.ReLogin'),
    cancelButtonText: i18n.t('general.Continue'),
    type: 'warning',
    showClose: false,
    showCancelButton: false,
    closeOnClickModal: false,
    closeOnPressEscape: false
  }).then(() => {
    removeToken()
    next(`/login?redirect=${to.path}`)
    NProgress.done()
  })
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta)
  const hasToken = getToken()
  if (hasToken) {
    onHasToken(to, next)
  } else {
    onNoToken(to, next)
  }
})

const onHasToken = async (to, next) => {
  const isTokenExist = getTokenExpiration()
  const hasRoles = store.getters.userRole
  if (!isTokenExist) {
    showLogoutNotifyDialog(to, next)
  } else if (to.path === '/login') {
    next({ path: '/' })
    NProgress.done()
  } else {
    if (hasRoles) {
      next()
    } else {
      try {
        await store.dispatch('user/getInfo')
        next({ ...to, replace: true })
      } catch (error) {
        await store.dispatch('user/resetToken')
        Message.error(error || 'Has Error')
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  }
}

const onNoToken = async (to, next) => {
  if (whiteList.indexOf(to.path) !== -1) {
    next()
  } else {
    next(`/login?redirect=${to.path}`)
    NProgress.done()
  }
}

router.afterEach(() => {
  NProgress.done()
})
