import dayjs from 'dayjs'
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-tw'
dayjs.extend(dayjsRelativeTime)
dayjs.extend(utc)
dayjs.extend(duration)

/**
 *! Before using this module, you need to know:
 * 1. utc time vs Taiwan local time
 *  utc time(世界協調時間) is UTC +00:00, while Taiwan local time is UTC +08:00
 *    ex:
 *      utc time: 2022-11-02 09:17:19
 *      Taiwan local time: 2022-11-02 17:17:19
 *
 * 2. dayjs time format
 *  check https://day.js.org/docs/en/display/format to define the format
 *  for example: to get the localTime like '05:06 PM', you should use 'hh:mm A' as the format
 */

/**
 * Get local time from utc
 * @param {string} utcTime - utc time
 * @param {string} format - default value would be 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} localTime
 */
export const UTCtoLocalTime = (utcTime, format = 'YYYY-MM-DD HH:mm:ss') => {
  const localTime = dayjs
    .utc(utcTime)
    .local()
    .format(format)
  return isValid(utcTime) ? localTime : '-'
}

/**
 * Get the time difference between the incoming time and the actual time
 * @param {string} utcTime - utc time
 * @returns {string} relativeTime
 */
export const relativeTime = (utcTime) => {
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
export const formatTime = (dateTime, format = 'YYYY-MM-DD HH:mm:ss') => {
  const localTime = dayjs
    .utc(dateTime)
    .format(format)
  return isValid(dateTime) ? localTime : '-'
}

/**
 * check if time is valid
 * @param {string} time
 * @returns {boolean}
 */
export const isValid = (time) => {
  return dayjs(time).isValid()
}
