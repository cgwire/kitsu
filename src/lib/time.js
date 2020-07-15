import moment from 'moment-timezone'

export const range = (start, end) => {
  let length = end - start + 1
  if (length < 0) length = 0
  return [...Array(length).keys()]
    .map(i => i + start)
}

export const parseDate = (date) => {
  return moment.tz(date, 'YYYY-MM-DDTHH:mm:ss', 'UTC')
}

export const formatDate = (date) => {
  const utcDate = moment.tz(date, 'UTC')
  if (moment().diff(utcDate, 'days') > 1) {
    return utcDate.format('YYYY-MM-DD HH:mm')
  } else {
    return utcDate.fromNow()
  }
}

export const monthToString = (month) => {
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
  if (currentYear === year &&
      currentMonth === month) {
    return range(1, moment().date())
  } else {
    const currentDate = moment(
      `${year}-${Number(month)}`, 'YYYY-M', 'en'
    )
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

export const getFirstStartDate = (items) => {
  let startDate = moment()
  items.forEach((item) => {
    if (item.startDate.isBefore(startDate)) startDate = item.startDate.clone()
  })
  return startDate
}

export const getLastEndDate = (items) => {
  let endDate = moment().add(3, 'months')
  items.forEach((item) => {
    if (item.endDate.isAfter(endDate)) endDate = item.endDate.clone()
  })
  return endDate
}

export const getStartDateFromString = (startDateString) => {
  if (startDateString) {
    return moment(startDateString, 'YYYY-MM-DD', 'en')
  } else {
    return moment()
  }
}

export const getEndDateFromString = (startDate, endDateString) => {
  if (endDateString) {
    return moment(endDateString, 'YYYY-MM-DD', 'en')
  } else {
    return startDate.clone().add('days', 1)
  }
}

export const formatSimpleDate = (date) => {
  return moment(date).format('YYYY-MM-DD')
}

export const getDatesFromStartDate = (startDate, dueDate, estimation) => {
  if (estimation && estimation > 0) {
    dueDate = addBusinessDays(startDate, Math.ceil(estimation) - 1)
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

export const getDatesFromEndDate = (startDate, dueDate, estimation) => {
  if (estimation && estimation > 0) {
    startDate = removeBusinessDays(dueDate, Math.ceil(estimation) - 1)
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

export const addBusinessDays = (originalDate, numDaysToAdd) => {
  const Sunday = 0
  const Saturday = 6
  let daysRemaining = numDaysToAdd
  const newDate = originalDate.clone()

  while (daysRemaining > 0) {
    newDate.add(1, 'days')
    if (newDate.day() !== Sunday && newDate.day() !== Saturday) {
      daysRemaining--
    }
  }

  return newDate
}

export const removeBusinessDays = (originalDate, numDaysToRemove) => {
  const Sunday = 0
  const Saturday = 6
  let daysRemaining = numDaysToRemove
  const newDate = originalDate.clone()

  while (daysRemaining > 0) {
    newDate.subtract(1, 'days')
    if (newDate.day() !== Sunday && newDate.day() !== Saturday) {
      daysRemaining--
    }
  }

  return newDate
}

export const daysToMinutes = (organisation, days) => {
  const nbHoursByDay = organisation.hours_by_day
  return Math.floor(days * nbHoursByDay * 60)
}

export const minutesToDays = (organisation, minutes) => {
  return minutes / 60 / organisation.hours_by_day
}
