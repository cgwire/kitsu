import moment from 'moment'
import {
  formatDate,
  getDayRange,
  getMonthRange,
  getWeekRange,
  monthToString,
  range
} from '../../../src/lib/time'

describe('time', () => {

  test('range', () => {
    expect(range(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(range(1, -1)).toEqual([])
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
})
