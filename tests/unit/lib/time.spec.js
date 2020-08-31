import moment from 'moment'
import {
  formatDate,
  formatSimpleDate,
  getDayRange,
  getEndDateFromString,
  getFirstStartDate,
  getLastEndDate,
  getMonthRange,
  getStartDateFromString,
  getWeekRange,
  monthToString,
  parseDate,
  parseSimpleDate,
  range
} from '../../../src/lib/time'

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
  })

  test('formatSimpleDate', () => {
    const dateString = formatSimpleDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01')
  })

  test('formatDate', () => {
    const dateString = formatDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01 08:23')
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
      { endDate: moment('2021-08-01T08:23:12Z') },
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

  test.skip('getDatesFromStartDate', () => {
  })
  test.skip('getDatesFromEndDate', () => {
  })
  test.skip('addBusinessDays', () => {
  })
  test.skip('removeBusinessDays', () => {
  })
  test.skip('daysToMinutes', () => {
  })
  test.skip('minutesToDays', () => {
  })
})
