import moment from 'moment-timezone'

export const range = (start, end) => {
  let length = end - start + 1
  if (length < 0) length = 0
  return [...Array(length).keys()].map(i => i + start)
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

export const formatFullDate = date => {
  if (date) {
    const utcDate = moment.tz(date, 'UTC')
    return utcDate.format('YYYY-MM-DD HH:mm:ss')
  } else {
    return ''
  }
}

export const formatFullDateWithTimezone = (dateString, timezone) => {
  return moment.tz(dateString, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss')
}

export const formatFullDateWithRevertedTimezone = (date, timezone) => {
  if (!date) return ''
  const dateString = formatSimpleDate(date)
  return moment.tz(dateString, timezone).tz('UTC').format('YYYY-MM-DDTHH:mm:ss')
}

export const formatDate = date => {
  const utcDate = moment.tz(date, 'UTC')
  if (moment().diff(utcDate, 'days') > 1) {
    return utcDate.format('YYYY-MM-DD HH:mm')
  } else {
    return utcDate.fromNow()
  }
}

export const monthToString = month => {
  const currentYear = moment().year()
  return moment(`${currentYear}-${month}`, 'YYYY-M').format('MMM')
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
  if (currentYear === year) {
    return range(1, moment().week())
  } else {
    return range(1, 52)
  }
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
  startDate,
  dueDate,
  estimation,
  daysOff = []
) => {
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
  startDate,
  dueDate,
  estimation,
  daysOff = []
) => {
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
  const Sunday = 0
  const Saturday = 6
  const datesOff = daysOff
    ? getDayOffRange(daysOff).map(dayOff => dayOff.date)
    : []
  const newDate = startDate.clone()
  let nbDays = 0
  while (newDate.isSameOrBefore(endDate)) {
    if (
      newDate.day() !== Sunday &&
      newDate.day() !== Saturday &&
      !datesOff.includes(newDate.format('YYYY-MM-DD'))
    ) {
      nbDays++
    }
    newDate.add(1, 'days')
  }
  return nbDays
}

export const addBusinessDays = (originalDate, numDaysToAdd, daysOff = []) => {
  const Sunday = 0
  const Saturday = 6
  const datesOff = daysOff
    ? getDayOffRange(daysOff).map(dayOff => dayOff.date)
    : []
  const newDate = originalDate.clone()
  let daysRemaining = numDaysToAdd
  while (daysRemaining >= 0) {
    if (
      newDate.day() !== Sunday &&
      newDate.day() !== Saturday &&
      !datesOff.includes(newDate.format('YYYY-MM-DD'))
    ) {
      daysRemaining--
    }
    if (daysRemaining >= 0) {
      newDate.add(1, 'days')
    }
  }
  return newDate
}

export const removeBusinessDays = (
  originalDate,
  numDaysToRemove,
  daysOff = []
) => {
  const Sunday = 0
  const Saturday = 6
  const datesOff = daysOff
    ? getDayOffRange(daysOff).map(dayOff => dayOff.date)
    : []
  const newDate = originalDate.clone()
  let daysRemaining = numDaysToRemove
  while (daysRemaining >= 0) {
    if (
      newDate.day() !== Sunday &&
      newDate.day() !== Saturday &&
      !datesOff.includes(newDate.format('YYYY-MM-DD'))
    ) {
      daysRemaining--
    }
    if (daysRemaining >= 0) {
      newDate.subtract(1, 'days')
    }
  }
  return newDate
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

export const daysToMinutes = (organisation, days) => {
  const nbHoursByDay = organisation.hours_by_day
  return Math.floor(days * nbHoursByDay * 60)
}

export const minutesToDays = (organisation, minutes) => {
  return minutes / 60 / organisation.hours_by_day
}

export const hoursToDays = (organisation, hours) => {
  return hours / organisation.hours_by_day
}
