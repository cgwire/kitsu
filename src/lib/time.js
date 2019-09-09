import moment from 'moment-timezone'

export const range = (start, end) => {
  let length = end - start + 1
  if (length < 0) length = 0
  return [...Array(length).keys()]
    .map(i => i + start)
}

export const formatDate = (date) => {
  const utcDate = moment.tz(date, 'UTC')
  if (moment().diff(utcDate, 'days') > 1) {
    return utcDate.format('YYYY-MM-DD HH:mm')
  } else {
    return moment(utcDate.format()).fromNow()
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
