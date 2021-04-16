import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhTWLocale from 'element-ui/lib/locale/lang/zh-TW' // element-ui lang
import enLocale from './en'
import zhTWLocale from './zh-TW'
import VueClipboard from 'vue-clipboard2'

Vue.use(VueI18n)
Vue.use(VueClipboard)
// console.log(elementZhLocale)
const messages = {
  'en': {
    ...enLocale,
    ...elementEnLocale
  },
  'zh-TW': {
    ...zhTWLocale,
    ...elementZhTWLocale
  }
}
export function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage

  // if has not choose language
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.toLowerCase().indexOf(locale.toLowerCase()) > -1) {
      return locale
    }
  }
  return 'zh-TW'
}
const i18n = new VueI18n({
  // set locale
  // options: en | zh-TW
  locale: getLanguage(),
  // set locale messages
  messages
})

export default i18n
