// import parseTime, formatTime and set to filter

import dayjs from 'dayjs'
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-tw'
dayjs.extend(dayjsRelativeTime)
dayjs.extend(utc)
dayjs.extend(duration)

export function relativeTime(dateTime) {
  return dateTime
    ? dayjs
      .utc(dateTime)
      .local()
      .fromNow()
    : '-'
}

export function UTCtoLocalTime(utcTime) {
  const localTime = dayjs
    .utc(utcTime)
    .local()
    .format('YYYY-MM-DD HH:mm:ss')
  if (utcTime === 'Invalid date') {
    return '-'
  }
  return localTime
}

export function hmA(dateTime) {
  const hmA = dayjs(dateTime).format('hh:mm A')
  if (dateTime === 'Invalid date') {
    return '-'
  }
  return hmA
}
