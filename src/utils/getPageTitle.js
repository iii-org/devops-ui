import defaultSettings from '@/settings'
import i18n from '@/lang'

const appTitle = defaultSettings.title || 'III DevOps'

export default function getPageTitle(key) {
  const title = []
  const hasKey = i18n.te(`route.${key.title}`)
  if (key.hasOwnProperty('subject') && key.subject) {
    title.push(`${key.subject}`)
  }
  if (hasKey) {
    title.push(i18n.t(`route.${key.title}`))
  }
  title.push(appTitle)
  return title.join(' - ')
}
