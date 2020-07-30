// import parseTime, formatTime and set to filter

import moment from 'moment'

/**
 * @param {string} datetime
 */
export function relativeTime(datetime) {
  const relativeTime = moment(datetime).fromNow()
  if (relativeTime === 'Invalid date') {
    return '-'
  }
  return relativeTime
}
