// import parseTime, formatTime and set to filter

import moment from 'moment'

/**
 * @param {string} datetime
 */
export function relativeTime(dateTime) {
  const relativeTime = moment(dateTime).fromNow()
  if (relativeTime === 'Invalid date') {
    return '-'
  }
  return relativeTime
}

export function YMDhmA(time) {
  const formateTime = moment(time).format('YYYY-MM-DD hh:mm A')
  if (time === 'Invalid date') {
    return '-'
  }
  return formateTime
}
export function YMDHms(time) {
  const formateTime = moment(time).format('YYYY-MM-DD HH:mm:ss')
  if (time === 'Invalid date') {
    return '-'
  }
  return formateTime
}
export function UTCtoLocalTime(utcTime) {
  const localTime = moment
    .utc(utcTime)
    .local()
    .format('YYYY-MM-DD HH:mm:ss')
  if (utcTime === 'Invalid date') {
    return '-'
  }
  return localTime
}

export function hmA(dateTime) {
  const hmA = moment(dateTime).format('hh:mm A')
  if (dateTime === 'Invalid date') {
    return '-'
  }
  return hmA
}

export function formatTime(time) {
  time = moment(time)
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = Math.abs((now - d) / 1000)

  if (diff < 30) {
    return 'Just Now'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + ' mins ago'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + ' hrs ago'
  } else if (diff < 3600 * 24 * 2) {
    return '1 day ago'
  } else {
    return moment(d).format('YYYY-MM-DD HH:mm:ss')
  }
}
