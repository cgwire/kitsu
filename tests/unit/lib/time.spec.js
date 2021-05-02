import moment from 'moment'
import {
  addBusinessDays,
  daysToMinutes,
  formatDate,
  formatFullDate,
  formatSimpleDate,
  getDayRange,
  getDatesFromEndDate,
  getDatesFromStartDate,
  getEndDateFromString,
  getFirstStartDate,
  getLastEndDate,
  getMonthRange,
  getStartDateFromString,
  getWeekRange,
  minutesToDays,
  monthToString,
  parseDate,
  parseSimpleDate,
  range,
  removeBusinessDays,
} from '@/lib/time'

describe('time', () => {
  test('range', () => {
    expect(range(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(range(1, -1)).toEqual([])
  })

  test('parseDate', () => {
    let date = parseDate('2019-09-01T08:23:12Z')
    expect(date.toString()).toEqual(
      moment.tz('2019-09-01T08:23:12Z', 'UTC').toString()
    )
    date = parseSimpleDate('2019-09-01')
    expect(date.toString()).toEqual(
      moment.tz('2019-09-01', 'UTC').toString()
    )
    date = parseSimpleDate(null)
    expect(formatSimpleDate(date)).toEqual(
      formatSimpleDate(new Date())
    )
  })

  test('formatSimpleDate', () => {
    const dateString = formatSimpleDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01')
  })

  test('formatDate', () => {
    const dateString = formatDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01 08:23')
  })

  test('formatFullDate', () => {
    const dateString = formatFullDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01 08:23:12')
  })

  test('monthToString', () => {
    expect(monthToString(1)).toEqual('Jan')
    expect(monthToString(8)).toEqual('Aug')
    expect(monthToString(12)).toEqual('Dec')
  })

  test('getMonthRange', () => {
    expect(getMonthRange(2019, 2019, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(getMonthRange(2018, 2019))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  test('getWeekRange', () => {
    expect(getWeekRange(2018, 2019)).toEqual(range(1, 52))
    expect(getWeekRange(2019, 2019)).toEqual(range(1, moment().week()))
  })

  test('getDayRange', () => {
    expect(getDayRange(2018, 8, 2019, 9)).toEqual(range(1, 31))
    expect(getDayRange(2019, 7, 2019, 9)).toEqual(range(1, 31))
    expect(getDayRange(2019, 9, 2019, 9)).toEqual(range(1, moment().date()))
  })

  test('getFirstStartDate', () => {
    const items = [
      { startDate: moment('2019-09-01T08:23:12Z') },
      { startDate: moment('2019-08-01T08:23:12Z') },
      { startDate: moment('2019-09-08T08:23:12Z') }
    ]
    expect(getFirstStartDate(items)).toEqual(items[1].startDate)
  })

  test('getLastEndDate', () => {
    const items = [
      { endDate: moment('2019-09-01T08:23:12Z') },
      { endDate: moment('2025-08-01T08:23:12Z') },
      { endDate: moment('2019-09-08T08:23:12Z') }
    ]
    expect(getLastEndDate(items)).toEqual(items[1].endDate)
  })

  test('getStartDateFromString', () => {
    expect(getStartDateFromString('2019-10-01')).toEqual(
      parseSimpleDate('2019-10-01')
    )
    expect(getStartDateFromString()).toEqual(
      parseSimpleDate(formatSimpleDate(moment()))
    )
  })

  test('getEndDateFromString', () => {
    const startDate = parseSimpleDate('2019-10-01')
    expect(getEndDateFromString(startDate, '2019-11-01')).toEqual(
      parseSimpleDate('2019-11-01')
    )
    expect(
      formatSimpleDate(getEndDateFromString(startDate, '2019-01-01'))
    ).toEqual('2019-10-01')
    expect(
      formatSimpleDate(getEndDateFromString(startDate))
    ).toEqual('2019-10-01')
  })

  test('getDatesFromStartDate', () => {
    const startDate = parseSimpleDate('2019-10-01')
    const farStartDate = parseSimpleDate('2020-10-01')
    const dueDate = parseSimpleDate('2020-01-31')
    expect(getDatesFromStartDate(startDate, dueDate, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: '2020-01-31'
    })
    expect(getDatesFromStartDate(farStartDate, dueDate, 0)).toEqual({
      start_date: '2020-10-01',
      due_date: '2020-10-01'
    })
    expect(getDatesFromStartDate(null, dueDate, 0)).toEqual({
      start_date: null,
      due_date: '2020-01-31'
    })
    expect(getDatesFromStartDate(startDate, null, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: null
    })
    expect(getDatesFromStartDate(startDate, null, 1)).toEqual({
      start_date: '2019-10-01',
      due_date: '2019-10-01'
    })
    expect(getDatesFromStartDate(startDate, null, 7)).toEqual({
      start_date: '2019-10-01', // tuesday
      due_date: '2019-10-09' // a week later + 2 days (weekend)
    })
  })
  test('getDatesFromEndDate', () => {
    const startDate = parseSimpleDate('2019-10-01')
    const farStartDate = parseSimpleDate('2020-10-01')
    const dueDate = parseSimpleDate('2020-01-31')
    expect(getDatesFromEndDate(startDate, dueDate, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate(farStartDate, dueDate, 0)).toEqual({
      start_date: '2020-01-31',
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate(null, dueDate, 0)).toEqual({
      start_date: null,
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate(startDate, null, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: null
    })
    expect(getDatesFromEndDate(null, dueDate, 1)).toEqual({
      start_date: '2020-01-31',
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate(null, dueDate, 7)).toEqual({
      start_date: '2020-01-23',
      due_date: '2020-01-31'
    })
  })
  test('addBusinessDays', () => {
    const startDate = parseSimpleDate('2019-10-01') // tuesday
    expect(formatSimpleDate(addBusinessDays(startDate, 0))).toEqual('2019-10-01')
    expect(formatSimpleDate(addBusinessDays(startDate, 1))).toEqual('2019-10-02') // wednesday
    expect(formatSimpleDate(addBusinessDays(startDate, 2))).toEqual('2019-10-03') // thursday
    expect(formatSimpleDate(addBusinessDays(startDate, 3))).toEqual('2019-10-04') // friday
    expect(formatSimpleDate(addBusinessDays(startDate, 4))).toEqual('2019-10-07') // next monday
  })
  test('removeBusinessDays', () => {
    const startDate = parseSimpleDate('2019-10-07')
    expect(formatSimpleDate(removeBusinessDays(startDate, 0))).toEqual('2019-10-07')
    expect(formatSimpleDate(removeBusinessDays(startDate, 1))).toEqual('2019-10-04')
    expect(formatSimpleDate(removeBusinessDays(startDate, 2))).toEqual('2019-10-03')
    expect(formatSimpleDate(removeBusinessDays(startDate, 3))).toEqual('2019-10-02')
    expect(formatSimpleDate(removeBusinessDays(startDate, 4))).toEqual('2019-10-01')
  })
  test('daysToMinutes', () => {
    expect(daysToMinutes({ hours_by_day: 7 }, 8)).toEqual(7 * 8 * 60)
  })
  test('minutesToDays', () => {
    expect(minutesToDays({ hours_by_day: 7 }, 7 * 8 * 60)).toEqual(8)
  })
})
