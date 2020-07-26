// import parseTime, formatTime and set to filter

import moment from 'moment'

/**
 * @param {string} datetime
 */
export function relativeTime(datetime) {
  return moment(datetime).fromNow();
}