import { Manager } from 'socket.io-client'

const manager = new Manager(process.env.VUE_APP_BASE_API)

export function getRancherLogs() {
  return manager.socket('/rancher/websocket/logs')
}
