// import parseTime, formatTime and set to filter

import moment from 'moment'

export function relativeTime(dateTime) {
  return dateTime ? moment.utc(dateTime).local().fromNow() : '-'
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

export function UTCtoTimestamp(utcTime) {
  return moment.utc(utcTime).unix()
}

export function hmA(dateTime) {
  const hmA = moment(dateTime).format('hh:mm A')
  if (dateTime === 'Invalid date') {
    return '-'
  }
  return hmA
}
