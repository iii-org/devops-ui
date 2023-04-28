import dayjs from 'dayjs'
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-tw'

dayjs.extend(dayjsRelativeTime)
dayjs.extend(utc)
dayjs.extend(duration)

const calendars = {
  google: {
    url: 'http://www.google.com/calendar/render?action=TEMPLATE&trp=false',
    parameters (title, details, start, end) {
      const parameters = {
        text: title,
        details: details
      }

      if (start && end) {
        parameters.dates = `${start}/${end}`
      }

      return parameters
    }
  },

  microsoft: {
    url: 'https://outlook.live.com/owa/?rru=addevent',
    parameters (title, details, start, end) {
      return {
        subject: title,
        body: details,
        startdt: start,
        enddt: end
      }
    }
  },

  office365: {
    url: 'https://outlook.office.com/owa/?path=/calendar/action/compose&rru=addevent',
    parameters (title, details, start, end) {
      return {
        subject: title,
        body: details,
        startdt: start,
        enddt: end
      }
    }
  }
}

export function calendarUrl (calendar) {
  let url = calendars[calendar.type].url
  const parameters = calendars[calendar.type].parameters(
    formatString(calendar.title),
    formatString(calendar.details),
    formatDate(calendar.start),
    formatDate(calendar.end)
  )

  for (const key in parameters) {
    if (parameters.hasOwnProperty(key) && parameters[key]) {
      url += `&${key}=${parameters[key]}`
    }
  }
  return url
}

function formatString (item) {
  return encodeURIComponent(item).replace(/%20/g, '+')
}

function formatDate (date) {
  return date
    ? dayjs
      .utc(date)
      .local()
      .toISOString()
      .replace(/-|:|\.\d+/g, '')
    : null
}
