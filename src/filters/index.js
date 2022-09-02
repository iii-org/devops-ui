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

export function formatTime(dateTime) {
  const localTime = dayjs
    .utc(dateTime)
    .format('YYYY-MM-DD HH:mm:ss')
  if (dateTime === 'Invalid date') {
    return '-'
  }
  return localTime
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
  const time = dayjs(dateTime).format('hh:mm A')
  if (dateTime === 'Invalid date') {
    return '-'
  }
  return time
}
