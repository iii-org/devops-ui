import { Manager } from 'socket.io-client'

const manager = new Manager(process.env.VUE_APP_BASE_API, { reconnectionAttempts: 5 })

export function getRancherLogs() {
  return manager.socket('/rancher/websocket/logs')
}
