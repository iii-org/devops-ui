import dayjs from 'dayjs'
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-tw'
dayjs.extend(dayjsRelativeTime)
dayjs.extend(utc)
dayjs.extend(duration)

/**
 * Before using this filter, you need to know:
 * 1. utc time vs Taiwan local time
 *  utc time(世界協調時間) is UTC +00:00, while Taiwan local time is UTC +08:00
 *    ex:
 *      utc time: 2022-11-02 09:17:19
 *      Taiwan local time: 2022-11-02 17:17:19
 *
 * 2. Vue filters
 *  check https://v2.vuejs.org/v2/guide/filters.html to see more details
 *  ElTableColumnTime.vue (@/components/ElTableColumnTime) is a good example
 */

/**
 * Get local time from utc, check https://day.js.org/docs/en/display/format to define the format
 * @param {string} utcTime - utc time
 * @param {string} format - default value would be 'YYYY-MM-DD HH:mm:ss'
 *  For example: To get the localTime like '05:06 PM', you should use 'hh:mm A' as the format
 * @returns {string} localTime
 */
export function UTCtoLocalTime(utcTime, format = 'YYYY-MM-DD HH:mm:ss') {
  const localTime = dayjs
    .utc(utcTime)
    .local()
    .format(format)
  if (utcTime === 'Invalid date') {
    return '-'
  }
  return localTime
}

/**
 * Get the time difference between the incoming time and the actual time
 * @param {string} utcTime - utc time
 * @returns {string} relativeTime
 */
export function relativeTime(utcTime) {
  return utcTime
    ? dayjs
      .utc(utcTime)
      .local()
      .fromNow()
    : '-'
}

/**
 * Get the time with format
 * If you give utc time as the dateTime, then you will get utc time
 * @param {string} dateTime - date time
 * @param {string} format - default value would be 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} localTime
 */
export function formatTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  const localTime = dayjs
    .utc(dateTime)
    .format(format)
  if (dateTime === 'Invalid date') {
    return '-'
  }
  return localTime
}
