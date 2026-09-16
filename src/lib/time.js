import moment from 'moment-timezone'

const SUNDAY = 0
const SATURDAY = 6

// Cache formatDuration results. toLocaleString is expensive (~0.05ms per
// call) and the function is hammered by tables (3000+ calls per render). Key
// includes every parameter that affects the output. Capped and cleared.
const _durationCache = new Map()

export const range = (start, end) => {
  let length = end - start + 1
  if (length < 0) length = 0
  return [...Array(length).keys()].map(i => i + start)
}

export const formatDuration = (organisation, minutes, toLocale = true) => {
  if (!minutes) {
    return 0
  }
  const inHours = organisation.format_duration_in_hours
  const hpd = organisation.hours_by_day || 8
  const cacheKey = `${minutes}-${inHours ? 1 : 0}-${toLocale ? 1 : 0}-${hpd}`
  const cached = _durationCache.get(cacheKey)
  if (cached !== undefined) return cached

  const duration = inHours ? minutes / 60 : minutesToDays(organisation, minutes)

  let result
  if (toLocale) {
    result = duration.toLocaleString('fullwide', {
      maximumFractionDigits: 2
    })
  } else {
    result = Math.round(duration * 100) / 100
  }
  if (_durationCache.size > 10000) _durationCache.clear()
  _durationCache.set(cacheKey, result)
  return result
}

export const parseDate = date => {
  return moment.tz(date, 'YYYY-MM-DDTHH:mm:ss', 'UTC')
}

export const parseSimpleDate = date => {
  if (date) {
    return moment.tz(date, 'YYYY-MM-DD', 'UTC')
  } else {
    return moment.tz(new Date(), 'YYYY-MM-DD', 'UTC')
  }
}

export const formatSimpleDate = date => {
  if (date) return moment(date).format('YYYY-MM-DD')
  else return ''
}

export const formatTimeOfDay = (
  date,
  use12HourClock = false,
  withSeconds = false
) => {
  let format
  if (use12HourClock) {
    format = withSeconds ? 'h:mm:ss A' : 'h:mm A'
  } else {
    format = withSeconds ? 'HH:mm:ss' : 'HH:mm'
  }
  return moment(date).format(format)
}

export const formatFullDate = date => {
  if (date) {
    const utcDate = moment.tz(date, 'UTC')
    return utcDate.format('YYYY-MM-DD HH:mm:ss')
  } else {
    return ''
  }
}

export const formatMonth = date => {
  if (date && date.month === 1) return moment(date).format('YY-MM')
  else if (date) return moment(date).format('MM')
  else return ''
}

export const formatFullDateWithTimezone = (dateString, timezone) => {
  return moment.tz(dateString, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss')
}

export const formatFullDateWithRevertedTimezone = (date, timezone) => {
  if (!date) return ''
  const dateString = formatSimpleDate(date)
  return moment.tz(dateString, timezone).tz('UTC').format('YYYY-MM-DDTHH:mm:ss')
}

export const formatDate = (
  date,
  dateFormat = 'YYYY-MM-DD',
  use12HourClock = false
) => {
  const utcDate = moment.tz(date, 'UTC')
  if (moment().diff(utcDate, 'days') > 1) {
    return `${formatDisplayDate(utcDate, dateFormat)} ${formatTimeOfDay(utcDate, use12HourClock)}`
  } else {
    return utcDate.fromNow()
  }
}

export const DATE_DISPLAY_FORMATS = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']

export const formatDisplayDate = (date, dateFormat = 'YYYY-MM-DD') => {
  if (!date) return ''
  const format = DATE_DISPLAY_FORMATS.includes(dateFormat)
    ? dateFormat
    : 'YYYY-MM-DD'
  return moment(date).format(format)
}

export const formatShortDate = (date, dateFormat = 'YYYY-MM-DD') => {
  if (!date) return ''
  return moment(date).format(dateFormat === 'DD/MM/YYYY' ? 'DD/MM' : 'MM/DD')
}

export const formatVerboseDate = (date, dateFormat = 'YYYY-MM-DD') => {
  if (!date) return ''
  return moment(date).format(dateFormat === 'DD/MM/YYYY' ? 'D MMMM YYYY' : 'LL')
}

export const monthToString = month => {
  return moment(`${month}`, 'M').format('MMM')
}

export const getMonthRange = (year, currentYear, currentMonth) => {
  if (currentYear === year) {
    return range(1, currentMonth)
  } else {
    return range(1, 12)
  }
}

export const getDayRange = (year, month, currentYear, currentMonth) => {
  if (currentYear === year && currentMonth === month) {
    return range(1, moment().date())
  } else {
    const currentDate = moment(`${year}-${Number(month)}`, 'YYYY-M', 'en')
    return range(1, currentDate.endOf('month').date())
  }
}

export const getWeekRange = (year, currentYear) => {
  const now = moment()
  // Late December days can belong to ISO week 1 of the next year: only
  // truncate the range at the current week when today's ISO week still
  // belongs to the displayed year.
  if (currentYear === year && now.isoWeekYear() <= year) {
    return range(1, now.isoWeek())
  } else {
    return range(1, moment(String(year), 'YYYY').isoWeeksInYear())
  }
}

// Every calendar month the [startDate, endDate] range touches, as
// { year, month } pairs with a 1-based month. Each date is read in its own
// calendar: the team schedule mixes UTC person dates with local moments,
// and a diff in months truncates the offset away, dropping the last month.
export const getMonthsBetween = (startDate, endDate) => {
  const index = date => date.year() * 12 + date.month()
  const first = moment(startDate).startOf('month')
  const count = index(moment(endDate)) - index(first) + 1
  return Array.from({ length: Math.max(count, 0) }, (_, i) => {
    const date = first.clone().add(i, 'months')
    return { year: date.year(), month: date.month() + 1 }
  })
}

export const getFirstStartDateByField = items => {
  let startDate = moment()
  items.forEach(item => {
    const sDate = parseDate(item.start_date)
    if (sDate.isBefore(startDate)) startDate = sDate
  })
  return startDate
}

export const getLastEndDateByField = items => {
  let endDate = moment()
  items.forEach(item => {
    const eDate = parseDate(item.end_date)
    if (eDate.isAfter(endDate)) endDate = eDate
  })
  return endDate
}

export const getFirstStartDate = items => {
  let startDate = items[0].startDate
  items.forEach(item => {
    if (item.startDate.isBefore(startDate)) startDate = item.startDate.clone()
  })
  return startDate
}

export const getLastEndDate = items => {
  let endDate = items[0].endDate
  items.forEach(item => {
    if (item.endDate.isAfter(endDate)) endDate = item.endDate.clone()
  })
  return endDate
}

export const getStartDateFromString = startDateString => {
  if (startDateString) {
    return parseSimpleDate(startDateString)
  } else {
    return parseSimpleDate(formatSimpleDate(moment()))
  }
}

export const getEndDateFromString = (startDate, endDateString) => {
  if (endDateString) {
    if (parseSimpleDate(endDateString).isAfter(startDate)) {
      return parseSimpleDate(endDateString)
    } else {
      return startDate.clone()
    }
  } else {
    return startDate.clone()
  }
}

export const getDatesFromStartDate = (
  organisation,
  startDate,
  dueDate,
  estimation,
  daysOff = []
) => {
  // The estimation is always expressed in days here, whatever the display
  // preference: skipping the computation for hours-displaying studios left
  // a null due date that ended up serialized as "Invalid date".
  if (estimation > 0) {
    dueDate = addBusinessDays(startDate, Math.ceil(estimation) - 1, daysOff)
  }

  if (!startDate || !dueDate) {
    const start = startDate ? formatSimpleDate(startDate) || startDate : null
    const end = dueDate ? formatSimpleDate(dueDate) || dueDate : null
    return {
      start_date: start,
      due_date: end
    }
  } else if (startDate.isAfter(dueDate)) {
    return {
      start_date: formatSimpleDate(startDate),
      due_date: formatSimpleDate(startDate)
    }
  } else {
    return {
      start_date: formatSimpleDate(startDate),
      due_date: formatSimpleDate(dueDate)
    }
  }
}

export const getDatesFromEndDate = (
  organisation,
  startDate,
  dueDate,
  estimation,
  daysOff = []
) => {
  // Same day-based contract as getDatesFromStartDate.
  if (estimation > 0) {
    startDate = removeBusinessDays(dueDate, Math.ceil(estimation) - 1, daysOff)
  }

  if (!startDate || !dueDate) {
    const start = startDate ? formatSimpleDate(startDate) || startDate : null
    const end = dueDate ? formatSimpleDate(dueDate) || dueDate : null
    return {
      start_date: start,
      due_date: end
    }
  } else if (startDate.isAfter(dueDate)) {
    return {
      start_date: formatSimpleDate(dueDate),
      due_date: formatSimpleDate(dueDate)
    }
  } else {
    return {
      start_date: formatSimpleDate(startDate),
      due_date: formatSimpleDate(dueDate)
    }
  }
}

export const getBusinessDays = (startDate, endDate, daysOff = []) => {
  const datesOff = new Set(
    daysOff ? getDayOffRange(daysOff).map(dayOff => dayOff.date) : []
  )
  const newDate = startDate.clone()
  let nbDays = 0
  while (newDate.isSameOrBefore(endDate)) {
    if (
      newDate.day() !== SUNDAY &&
      newDate.day() !== SATURDAY &&
      !datesOff.has(newDate.format('YYYY-MM-DD'))
    ) {
      nbDays++
    }
    newDate.add(1, 'days')
  }
  return nbDays
}

const adjustBusinessDays = (originalDate, numDays, daysOff, method) => {
  if (!originalDate) return
  const datesOff = new Set(
    daysOff ? getDayOffRange(daysOff).map(dayOff => dayOff.date) : []
  )
  const newDate = originalDate.clone()
  let daysRemaining = numDays
  while (daysRemaining >= 0) {
    if (
      newDate.day() !== SUNDAY &&
      newDate.day() !== SATURDAY &&
      !datesOff.has(newDate.format('YYYY-MM-DD'))
    ) {
      daysRemaining--
    }
    if (daysRemaining >= 0) {
      newDate[method](1, 'days')
    }
  }
  return newDate
}

export const addBusinessDays = (originalDate, numDaysToAdd, daysOff = []) => {
  return adjustBusinessDays(originalDate, numDaysToAdd, daysOff, 'add')
}

export const removeBusinessDays = (
  originalDate,
  numDaysToRemove,
  daysOff = []
) => {
  return adjustBusinessDays(originalDate, numDaysToRemove, daysOff, 'subtract')
}

export const getDayOffRange = (daysOff = []) => {
  return daysOff.reduce((range, dayOff) => {
    const startDate = new Date(dayOff.date)
    const endDate = new Date(dayOff.end_date || dayOff.date)
    while (startDate <= endDate) {
      range.push({
        ...dayOff,
        date: startDate.toISOString().slice(0, 10)
      })
      startDate.setDate(startDate.getDate() + 1)
    }
    return range
  }, [])
}

export const daysToMinutes = (organisation, days = 0) => {
  return Math.floor(days * organisation.hours_by_day * 60)
}

export const minutesToDays = (organisation, minutes = 0) => {
  return minutes / 60 / organisation.hours_by_day
}

export const hoursToDays = (organisation, hours = 0) => {
  return hours / organisation.hours_by_day
}
