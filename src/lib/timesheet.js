import moment from 'moment-timezone'

import { formatAmount } from '@/lib/number'
import {
  getDayRange,
  getMonthRange,
  getWeekRange,
  hoursToDays,
  monthToString,
  range
} from '@/lib/time'

// Logged hours in the timesheet display unit: hours, days, or the salary
// they represent at the person's daily rate.
export const convertHours = (hours, unit, organisation, dailyRate = 0) => {
  if (unit === 'hour') return hours
  const days = hoursToDays(organisation, hours)
  return unit === 'salary' ? days * dailyRate : days
}

// One decimal max without padding, whole units of currency for salaries.
export const formatTimesheetValue = (value, unit, use12HourClock) =>
  unit === 'salary'
    ? formatAmount(value, use12HourClock)
    : Math.round(value * 10) / 10

// Snapshot of the current period indices, shared by the grid and the chart
// so their current column marker cannot disagree.
const now = moment()
export const today = {
  day: now.date(),
  month: now.month() + 1,
  week: now.isoWeek(),
  year: now.year()
}

// The column indices of a timesheet level: years since the first one, then
// the months, ISO weeks or days of the displayed year or month, up to today.
export const getTimesheetColumns = (level, { year, month, firstYear }) =>
  ({
    year: range(firstYear, today.year),
    month: getMonthRange(year, today.year, today.month),
    week: getWeekRange(year, today.year),
    day: getDayRange(year, month, today.year, today.month)
  })[level]

export const isCurrentTimesheetColumn = (level, index, { year, month }) =>
  ({
    year: index === today.year,
    month: year === today.year && index === today.month,
    week: year === today.year && index === today.week,
    day: year === today.year && month === today.month && index === today.day
  })[level]

export const timesheetColumnLabel = (level, index) =>
  level === 'month' ? monthToString(index) : `${index}`

// Start and end of one column; weeks start on the Monday of the ISO week,
// as aggregated by the backend.
export const getTimesheetPeriod = (level, { year, month, week, day }) => {
  const start = {
    year: moment({ year }),
    month: moment({ year, month: month - 1 }),
    week: moment(`${year}-${week}`, 'YYYY-W'),
    day: moment({ year, month: month - 1, day })
  }[level]
  const end =
    level === 'week' ? start.clone().add(6, 'days') : start.clone().endOf(level)
  return { start, end }
}

const DATE_FORMAT = 'YYYY-MM-DD'

// The rows of one request cover every column of the view: the week view
// runs from the Monday of ISO week 1 to the Sunday of the last ISO week.
// Jan 4 always falls in the first ISO week and Dec 28 in the last.
export const getProductivityRange = (level, { year, month }) => {
  const start = {
    day: moment({ year, month: month - 1 }),
    week: moment({ year, month: 0, day: 4 }).startOf('isoWeek'),
    month: moment({ year })
  }[level]
  const end = {
    day: start.clone().endOf('month'),
    week: moment({ year, month: 11, day: 28 }).endOf('isoWeek'),
    month: start.clone().endOf('year')
  }[level]
  return {
    startDate: start.format(DATE_FORMAT),
    endDate: end.format(DATE_FORMAT)
  }
}

// Zou sends either 'YYYY-MM-DD' or a full timestamp: keep the date part.
const columnIndex = (level, date) => {
  const day = moment(date.slice(0, 10), DATE_FORMAT)
  return { day: day.date(), week: day.isoWeek(), month: day.month() + 1 }[level]
}

export const getTimeSpentColumnTotals = (
  rows,
  level,
  columns,
  { productionId, taskTypeId } = {}
) => {
  const totals = rows
    .filter(
      row =>
        (!productionId || row.project_id === productionId) &&
        (!taskTypeId || row.task_type_id === taskTypeId)
    )
    .reduce((acc, row) => {
      const index = columnIndex(level, row.date)
      acc.set(index, (acc.get(index) || 0) + row.duration)
      return acc
    }, new Map())
  return columns.map(index => totals.get(index) || 0)
}

const quotaKey = (level, index, { year, month }) =>
  ({
    day: `${year}-${String(month).padStart(2, '0')}-${String(index).padStart(2, '0')}`,
    week: `${year}-${index}`,
    month: `${year}-${String(index).padStart(2, '0')}`
  })[level]

export const getQuotaColumnTotals = (
  quotas,
  level,
  columns,
  { year, month, taskTypeId, countMode }
) =>
  columns.map(index => {
    const key = quotaKey(level, index, { year, month })
    return quotas.reduce(
      (sum, quota) =>
        sum +
        (quota?.[taskTypeId || 'total']?.[level]?.[countMode]?.[key] || 0),
      0
    )
  })
