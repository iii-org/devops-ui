
/**
 *! deprecated 2022/12/7
*/

import dayjs from 'dayjs'
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-tw'
dayjs.extend(dayjsRelativeTime)
dayjs.extend(utc)
dayjs.extend(duration)

/**
 *! Before using this filter, you need to know:
 * 1. utc time vs Taiwan local time
 *  utc time(世界協調時間) is UTC +00:00, while Taiwan local time is UTC +08:00
 *    ex:
 *      utc time: 2022-11-02 09:17:19
 *      Taiwan local time: 2022-11-02 17:17:19
 *
 * 2. Vue filters
 *!  Vue filters is only suitable for simple situations such as text format processing
 *  the declaration has already been moved to main.js,
 *  so you can use it directly in html of every component
 *  ElTableColumnTime.vue (@/components/ElTableColumnTime) is a good example
 *  check https://v2.vuejs.org/v2/guide/filters.html to see more details
 *
 * 3. multiple arguments
 *  for example like the function UTCtoLocalTime(),
 *  if there are two arguments called A and B
 *  you can use it like `{{ A | UTCtoLocalTime(B) }}` in template
 *
 * 4. Vue filters vs Vue methods
 *  Vue filters can't get the status in instance, while Vue methods can
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
  return isTimeValid(utcTime) ? localTime : '-'
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
  return isTimeValid(dateTime) ? localTime : '-'
}

/**
 * check if time is valid
 * @param {string} time
 * @returns {boolean}
 */
export function isTimeValid(time) {
  return dayjs(time).isValid()
}
