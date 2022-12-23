/**
 *! Before using this module, you need to know:
 * 1. utc time vs Taiwan local time
 *  utc time(世界協調時間) is UTC +00:00, while Taiwan's local time is UTC +08:00
 *    ex:
 *      utc time: 2022-11-02 09:17:19
 *      Taiwan local time: 2022-11-02 17:17:19
 *
 * 2. dayjs time format
 *  check https://day.js.org/docs/en/display/format to define the format
 *  for example: to get the localTime like '05:06 PM', you should use 'hh:mm A' as the format
 *
 * 3. dayjs handles ISO-8601 format
 *  --> https://day.js.org/docs/en/parse/string
 *  according to the above link,
 *  whether the date time string is with a "T" or space, dayjs can handle the ISO-8601 format correctly
 *  but we reach a consensus with backend that the date time string should always be the same
 *  so the date time format from backend should be <YYYY-MM-DDTHH:mm:ss> and must be UTC time
 *  there should be a "T" between date and time without using a space
 *   ex:
 *     <YYYY-MM-DDTHH:mm:ss> ✔
 *     <YYYY-MM-DD HH:mm:ss> ✘
 *  check https://stackoverflow.com/questions/9531524/in-an-iso-8601-date-is-the-t-character-mandatory for more informantion
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
 * Get local time from utc
 * @param {string} utcTime - utc time
 * @param {string} format - default value would be 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} localTime
 */
export const getLocalTime = (utcTime, format = 'YYYY-MM-DD HH:mm:ss') => {
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
export const getRelativeTime = (utcTime) => {
  const relativeTime = dayjs
    .utc(utcTime)
    .local()
    .fromNow()
  return isTimeValid(utcTime) ? relativeTime : '-'
}

/**
 * Get the utc time with format
 * @param {string} dateTime - date time
 * @param {string} format - default value would be 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} formatTime
 */
export const getFormatTime = (dateTime, format = 'YYYY-MM-DD HH:mm:ss') => {
  const formatTime = dayjs
    .utc(dateTime)
    .format(format)
  return isTimeValid(dateTime) ? formatTime : '-'
}

/**
 * Check if time is valid
 * @param {string} time
 * @returns {boolean} - true or false
 */
export const isTimeValid = (time) => {
  return dayjs(time).isValid()
}

/**
 * Get the duration time by two point-in-time
 * @param {string} startTime
 * @param {string} endTime
 * @returns {string} durationTime - ex: 1分鐘、幾秒
 */
export const getDurationTime = (startTime, endTime) => {
  if (endTime === null || endTime === undefined) {
    return '-'
  }
  const s = dayjs.utc(startTime).unix()
  const e = dayjs.utc(endTime).unix()
  return dayjs.duration(e - s, 'seconds').humanize()
}
