/**
 * Object is named by each folder name, used as html tag like ex: location="<Object>"
 * Keys are from api, and values are from element tag type
 */

export const accountManage = {
  enable: 'success',
  disable: 'danger',
  default: 'success'
}

export const projectListPM = {
  '進行中': 'success',
  '未開始': '',
  default: ''
}

export const pipelines = {
  Failed: 'danger',
  Finished: 'success',
  Aborted: 'warning',
  Waiting: 'slow',
  Building: 'success',
  default: 'info'
}

export const projectVersions = {
  open: 'success',
  closed: 'danger',
  default: 'slow'
}

export const sideex = {
  Finished: 'success',
  Scanning: 'slow',
  Aborted: 'info',
  Failed: 'danger',
  default: 'slow'
}

export const testCasePostman = {
  Fail: 'danger',
  Pass: 'success'
}

export const webInspect = {
  Complete: 'success',
  Running: 'slow',
  NotRunning: 'warning',
  Interrupted: 'danger',
  default: 'slow'
}

export const zap = {
  Finished: 'success',
  Scanning: 'slow',
  Aborted: 'info',
  Failed: 'danger',
  default: 'slow'
}

export const systemRegistry = {
  Active: 'success',
  Removing: 'warning'
}

export const systemSecrets = {
  Active: 'success',
  Removing: 'warning'
}
