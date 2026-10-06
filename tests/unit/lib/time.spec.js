// @vitest-environment node

import { execFileSync } from 'node:child_process'
import process from 'node:process'

import moment from 'moment-timezone'
import {
  addBusinessDays,
  daysToMinutes,
  durationToMinutes,
  formatDate,
  formatDisplayDate,
  formatDuration,
  formatFullDate,
  formatFullDateWithRevertedTimezone,
  formatFullDateWithTimezone,
  formatShortDate,
  formatSimpleDate,
  formatTimeOfDay,
  formatVerboseDate,
  getBusinessDays,
  getDatesFromEndDate,
  getDatesFromStartDate,
  getDayOffRange,
  getDayRange,
  getEndDateFromString,
  getFirstStartDate,
  getLastEndDate,
  getMonthRange,
  getMonthsBetween,
  getStartDateFromString,
  getWeekRange,
  hoursToDays,
  minutesToDays,
  minutesToDuration,
  monthToString,
  parseDate,
  parseSimpleDate,
  range,
  removeBusinessDays
} from '@/lib/time'

describe('time', () => {
  // Several helpers read the real clock (moment().week(), moment().date());
  // freeze it so expectations are literals instead of clock-dependent.
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2019-09-10T12:00:00Z'))
  })

  afterEach(() => {
    vi.setSystemTime(new Date('2019-09-10T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

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
    expect(date.toString()).toEqual(moment.tz('2019-09-01', 'UTC').toString())
    date = parseSimpleDate(null)
    expect(formatSimpleDate(date)).toEqual('2019-09-10')
  })

  test('formatSimpleDate', () => {
    const dateString = formatSimpleDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01')
  })

  test('formatDate', () => {
    const dateString = formatDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01 08:23')
  })

  test('formatDisplayDate', () => {
    expect(formatDisplayDate('2019-09-01')).toEqual('2019-09-01')
    expect(formatDisplayDate('2019-09-01', 'YYYY-MM-DD')).toEqual('2019-09-01')
    expect(formatDisplayDate('2019-09-01', 'DD/MM/YYYY')).toEqual('01/09/2019')
    expect(formatDisplayDate('2019-09-01', 'MM/DD/YYYY')).toEqual('09/01/2019')
    // Unknown preference values fall back to the ISO default.
    expect(formatDisplayDate('2019-09-01', 'bogus')).toEqual('2019-09-01')
    expect(formatDisplayDate(null)).toEqual('')
    expect(formatDisplayDate('')).toEqual('')
  })

  test('formatShortDate', () => {
    expect(formatShortDate('2019-09-01')).toEqual('09/01')
    expect(formatShortDate('2019-09-01', 'YYYY-MM-DD')).toEqual('09/01')
    expect(formatShortDate('2019-09-01', 'MM/DD/YYYY')).toEqual('09/01')
    expect(formatShortDate('2019-09-01', 'DD/MM/YYYY')).toEqual('01/09')
    expect(formatShortDate(null)).toEqual('')
  })

  test('formatVerboseDate', () => {
    expect(formatVerboseDate('2019-09-01')).toEqual('September 1, 2019')
    expect(formatVerboseDate('2019-09-01', 'MM/DD/YYYY')).toEqual(
      'September 1, 2019'
    )
    expect(formatVerboseDate('2019-09-01', 'DD/MM/YYYY')).toEqual(
      '1 September 2019'
    )
    expect(formatVerboseDate(null)).toEqual('')
  })

  test('formatFullDate', () => {
    const dateString = formatFullDate(new Date('2019-09-01T08:23:12Z'))
    expect(dateString).toEqual('2019-09-01 08:23:12')
  })

  test('formatTimeOfDay', () => {
    const afternoon = moment.tz('2019-09-01T14:05:00', 'UTC')
    expect(formatTimeOfDay(afternoon)).toEqual('14:05')
    expect(formatTimeOfDay(afternoon, false)).toEqual('14:05')
    expect(formatTimeOfDay(afternoon, true)).toEqual('2:05 PM')

    const midnight = moment.tz('2019-09-01T00:30:00', 'UTC')
    expect(formatTimeOfDay(midnight)).toEqual('00:30')
    expect(formatTimeOfDay(midnight, true)).toEqual('12:30 AM')

    const noon = moment.tz('2019-09-01T12:00:00', 'UTC')
    expect(formatTimeOfDay(noon)).toEqual('12:00')
    expect(formatTimeOfDay(noon, true)).toEqual('12:00 PM')

    // Keeps the timezone of an already tz-converted moment.
    const paris = moment.tz('2019-09-01T14:05:00Z', 'UTC').tz('Europe/Paris')
    expect(formatTimeOfDay(paris)).toEqual('16:05')
    expect(formatTimeOfDay(paris, true)).toEqual('4:05 PM')
  })

  test('formatFullDateWithTimezone', () => {
    const dateString = formatFullDateWithTimezone(
      new Date('2019-09-01T23:23:12Z'),
      'Europe/Paris'
    )
    expect(dateString).toEqual('2019-09-02 01:23:12')
  })

  test('formatFullDateWithRevertedTimezone', () => {
    const dateString = formatFullDateWithRevertedTimezone(
      new Date('2019-09-02'),
      'Europe/Paris'
    )
    expect(dateString).toEqual('2019-09-01T22:00:00')
  })

  test('monthToString', () => {
    const locale = moment.locale()

    expect(monthToString(1)).toEqual('Jan')
    expect(monthToString(8)).toEqual('Aug')
    expect(monthToString(12)).toEqual('Dec')

    moment.locale('fr')
    expect(monthToString(1)).toEqual('janv.')
    expect(monthToString(8)).toEqual('août')
    expect(monthToString(12)).toEqual('déc.')

    moment.locale(locale) // restore locale after test
  })

  test('getMonthRange', () => {
    expect(getMonthRange(2019, 2019, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(getMonthRange(2018, 2019)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
    ])
  })

  test('getWeekRange', () => {
    expect(getWeekRange(2018, 2019)).toEqual(range(1, 52))
    // 2019-09-10 (frozen clock) falls in week 37.
    expect(getWeekRange(2019, 2019)).toEqual(range(1, 37))
    // 2020 has 53 ISO weeks.
    expect(getWeekRange(2020, 2026)).toEqual(range(1, 53))
    // Regression #1928: 2025-12-30 belongs to ISO week 1 of 2026, all the
    // weeks of 2025 must stay visible.
    vi.setSystemTime(new Date('2025-12-30T12:00:00Z'))
    expect(getWeekRange(2025, 2025)).toEqual(range(1, 52))
    // 2027-01-01 belongs to ISO week 53 of 2026, where the backend files
    // its hours in the 2027 table.
    vi.setSystemTime(new Date('2027-01-01T12:00:00Z'))
    expect(getWeekRange(2027, 2027)).toEqual(range(1, 53))
  })

  test('getDayRange', () => {
    expect(getDayRange(2018, 8, 2019, 9)).toEqual(range(1, 31))
    expect(getDayRange(2019, 7, 2019, 9)).toEqual(range(1, 31))
    expect(getDayRange(2019, 9, 2019, 9)).toEqual(range(1, 10))
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
    expect(formatSimpleDate(getEndDateFromString(startDate))).toEqual(
      '2019-10-01'
    )
  })

  test('getDatesFromStartDate', () => {
    const startDate = parseSimpleDate('2019-10-01')
    const farStartDate = parseSimpleDate('2020-10-01')
    const dueDate = parseSimpleDate('2020-01-31')
    expect(getDatesFromStartDate({}, startDate, dueDate, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: '2020-01-31'
    })
    expect(getDatesFromStartDate({}, farStartDate, dueDate, 0)).toEqual({
      start_date: '2020-10-01',
      due_date: '2020-10-01'
    })
    expect(getDatesFromStartDate({}, null, dueDate, 0)).toEqual({
      start_date: null,
      due_date: '2020-01-31'
    })
    expect(getDatesFromStartDate({}, startDate, null, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: null
    })
    expect(getDatesFromStartDate({}, startDate, null, 1)).toEqual({
      start_date: '2019-10-01',
      due_date: '2019-10-01'
    })
    expect(getDatesFromStartDate({}, startDate, null, 7)).toEqual({
      start_date: '2019-10-01', // tuesday
      due_date: '2019-10-09' // a week later + 2 days (weekend)
    })
    const daysOff = [{ date: '2019-10-09' }]
    expect(getDatesFromStartDate({}, startDate, null, 7, daysOff)).toEqual({
      start_date: '2019-10-01', // tuesday
      due_date: '2019-10-10' // a week later + 2 days (weekend) + 1 day off
    })
    // The estimation is in days regardless of the display preference: an
    // hours-displaying organisation must not end up with a null due date
    // (it was serialized as "Invalid date" by callers — issue #1977).
    expect(
      getDatesFromStartDate(
        { format_duration_in_hours: true },
        startDate,
        null,
        7
      )
    ).toEqual({
      start_date: '2019-10-01',
      due_date: '2019-10-09'
    })
    // three days of 7.6 hours
    const threeDays = minutesToDays({ hours_by_day: 7.6 }, 1368)
    expect(getDatesFromStartDate({}, startDate, null, threeDays)).toEqual({
      start_date: '2019-10-01',
      due_date: '2019-10-03'
    })
  })
  test('getDatesFromEndDate', () => {
    const startDate = parseSimpleDate('2019-10-01')
    const farStartDate = parseSimpleDate('2020-10-01')
    const dueDate = parseSimpleDate('2020-01-31')
    expect(getDatesFromEndDate({}, startDate, dueDate, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate({}, farStartDate, dueDate, 0)).toEqual({
      start_date: '2020-01-31',
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate({}, null, dueDate, 0)).toEqual({
      start_date: null,
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate({}, startDate, null, 0)).toEqual({
      start_date: '2019-10-01',
      due_date: null
    })
    expect(getDatesFromEndDate({}, null, dueDate, 1)).toEqual({
      start_date: '2020-01-31',
      due_date: '2020-01-31'
    })
    expect(getDatesFromEndDate({}, null, dueDate, 7)).toEqual({
      start_date: '2020-01-23',
      due_date: '2020-01-31'
    })
    const daysOff = [{ date: '2020-01-23' }]
    expect(getDatesFromEndDate({}, null, dueDate, 7, daysOff)).toEqual({
      start_date: '2020-01-22',
      due_date: '2020-01-31'
    })
  })
  test('getBusinessDays', () => {
    let startDate = parseSimpleDate('2024-06-03') // monday
    expect(getBusinessDays(startDate, startDate)).toEqual(1) // monday
    expect(
      getBusinessDays(startDate, startDate.clone().add(1, 'days'))
    ).toEqual(2) // tuesday
    let daysOff = [{ date: '2024-06-04' }] // monday
    expect(
      getBusinessDays(startDate, startDate.clone().add(2, 'days'), daysOff)
    ).toEqual(2) // wednesday + day off
    startDate = parseSimpleDate('2024-06-01') // saturday
    expect(getBusinessDays(startDate, startDate)).toEqual(0) // saturday
    expect(
      getBusinessDays(startDate, startDate.clone().add(1, 'days'))
    ).toEqual(0) // saturday
    expect(
      getBusinessDays(startDate, startDate.clone().add(2, 'days'))
    ).toEqual(1) // monday
    expect(
      getBusinessDays(startDate, startDate.clone().add(7, 'days'))
    ).toEqual(5) // next saturday + week-end
    daysOff = [{ date: '2024-06-03' }] // monday
    expect(
      getBusinessDays(startDate, startDate.clone().add(7, 'days'), daysOff)
    ).toEqual(4) // next saturday + week-end + day off
  })
  test('addBusinessDays', () => {
    let startDate
    expect(addBusinessDays(startDate, 0)).toBeUndefined() // no start date
    startDate = parseSimpleDate('2019-10-01') // tuesday
    expect(formatSimpleDate(addBusinessDays(startDate, 0))).toEqual(
      '2019-10-01'
    ) // tuesday
    expect(formatSimpleDate(addBusinessDays(startDate, 1))).toEqual(
      '2019-10-02'
    ) // wednesday
    expect(formatSimpleDate(addBusinessDays(startDate, 2))).toEqual(
      '2019-10-03'
    ) // thursday
    expect(formatSimpleDate(addBusinessDays(startDate, 3))).toEqual(
      '2019-10-04'
    ) // friday
    expect(formatSimpleDate(addBusinessDays(startDate, 4))).toEqual(
      '2019-10-07'
    ) // next monday
    let daysOff = [{ date: '2019-10-07' }]
    expect(formatSimpleDate(addBusinessDays(startDate, 4, daysOff))).toEqual(
      '2019-10-08'
    ) // next thuesday
    daysOff = [{ date: '2019-10-07', end_date: '2019-10-08' }]
    expect(formatSimpleDate(addBusinessDays(startDate, 4, daysOff))).toEqual(
      '2019-10-09'
    ) // next friday
    startDate = parseSimpleDate('2019-09-29') // sunday
    expect(formatSimpleDate(addBusinessDays(startDate, 0))).toEqual(
      '2019-09-30'
    ) // monday
    expect(formatSimpleDate(addBusinessDays(startDate, 1))).toEqual(
      '2019-10-01'
    ) // tuesday
    startDate = parseSimpleDate('2019-10-04') // friday
    expect(formatSimpleDate(addBusinessDays(startDate, 1))).toEqual(
      '2019-10-07'
    ) // monday
  })
  test('removeBusinessDays', () => {
    const startDate = parseSimpleDate('2019-10-07')
    expect(formatSimpleDate(removeBusinessDays(startDate, 0))).toEqual(
      '2019-10-07'
    )
    expect(formatSimpleDate(removeBusinessDays(startDate, 1))).toEqual(
      '2019-10-04'
    )
    expect(formatSimpleDate(removeBusinessDays(startDate, 2))).toEqual(
      '2019-10-03'
    )
    expect(formatSimpleDate(removeBusinessDays(startDate, 3))).toEqual(
      '2019-10-02'
    )
    expect(formatSimpleDate(removeBusinessDays(startDate, 4))).toEqual(
      '2019-10-01'
    )
    const daysOff = [{ date: '2019-10-01' }]
    expect(formatSimpleDate(removeBusinessDays(startDate, 4, daysOff))).toEqual(
      '2019-09-30'
    )
  })
  test('daysToMinutes', () => {
    expect(daysToMinutes({ hours_by_day: 8 }, 8)).toEqual(8 * 8 * 60)
    expect(daysToMinutes({ hours_by_day: 7 }, 8)).toEqual(8 * 7 * 60)
    expect(daysToMinutes({ hours_by_day: 7 }, undefined)).toEqual(0)
    expect(daysToMinutes({ hours_by_day: 8 }, 1.5)).toEqual(720)
    expect(daysToMinutes({ hours_by_day: 8 }, 1.01)).toEqual(484)
    // Float products fall just under the whole minute: 3 days of 7.6 hours
    // make 1367.9999999999998 minutes, and 1 / quota gives 3 days as
    // 2.9999999999999996.
    expect(daysToMinutes({ hours_by_day: 7.6 }, 3)).toEqual(1368)
    expect(daysToMinutes({ hours_by_day: 8 }, 2.9999999999999996)).toEqual(
      1440
    )
  })
  test('minutesToDays', () => {
    expect(minutesToDays({ hours_by_day: 8 }, 8 * 8 * 60)).toEqual(8)
    expect(minutesToDays({ hours_by_day: 7 }, 8 * 7 * 60)).toEqual(8)
    expect(minutesToDays({ hours_by_day: 7 }, undefined)).toEqual(0)
    expect(minutesToDays({ hours_by_day: 8 }, 720)).toEqual(1.5)
    expect(minutesToDays({ hours_by_day: 8 }, 500)).toEqual(500 / 60 / 8)
    // Whole days divide with float noise above them, 3.0000000000000004 for
    // 1368 minutes of 7.6 hours, which a day count rounds up a day too far.
    expect(minutesToDays({ hours_by_day: 7.6 }, 1368)).toEqual(3)
    expect(minutesToDays({ hours_by_day: 7.8 }, 6084)).toEqual(13)
  })
  test('hoursToDays', () => {
    expect(hoursToDays({ hours_by_day: 8 }, 16)).toEqual(2)
    expect(hoursToDays({ hours_by_day: 7 }, 21)).toEqual(3)
    expect(hoursToDays({ hours_by_day: 7 }, undefined)).toEqual(0)
  })
  test('minutesToDuration', () => {
    const hoursOrganisation = {
      format_duration_in_hours: true,
      hours_by_day: 7
    }
    expect(minutesToDuration({ hours_by_day: 7 }, 8 * 7 * 60)).toEqual(8)
    expect(minutesToDuration(hoursOrganisation, 8 * 7 * 60)).toEqual(56)
    expect(minutesToDuration(hoursOrganisation, 90)).toEqual(1.5)
    expect(minutesToDuration(hoursOrganisation, undefined)).toEqual(0)
  })
  test('durationToMinutes', () => {
    const hoursOrganisation = {
      format_duration_in_hours: true,
      hours_by_day: 7
    }
    expect(durationToMinutes({ hours_by_day: 7 }, 8)).toEqual(8 * 7 * 60)
    expect(durationToMinutes(hoursOrganisation, 8)).toEqual(8 * 60)
    expect(durationToMinutes(hoursOrganisation, 1.5)).toEqual(90)
    expect(durationToMinutes(hoursOrganisation, undefined)).toEqual(0)
    expect(durationToMinutes(hoursOrganisation, 0.34)).toEqual(0.34 * 60)
    // 2.05 hours make 122.99999999999999 minutes in floats
    expect(durationToMinutes(hoursOrganisation, 2.05)).toEqual(123)
  })

  test('formatDuration', () => {
    const organisation = { hours_by_day: 8 }
    const hoursOrganisation = {
      format_duration_in_hours: true,
      hours_by_day: 8
    }

    expect(formatDuration(organisation, 0)).toEqual(0)
    expect(formatDuration(organisation, null)).toEqual(0)

    // toLocale=false returns plain numbers, rounded to 2 decimals.
    expect(formatDuration(organisation, 480, false)).toEqual(1)
    expect(formatDuration(organisation, 100, false)).toEqual(0.21)
    expect(formatDuration(hoursOrganisation, 90, false)).toEqual(1.5)

    // toLocale=true formats through toLocaleString; the decimal separator
    // depends on the environment locale, so only integers are asserted.
    expect(formatDuration(organisation, 480)).toEqual('1')
    expect(formatDuration(organisation, 960)).toEqual('2')
    expect(formatDuration(hoursOrganisation, 120)).toEqual('2')
  })

  test('getDayOffRange', () => {
    expect(getDayOffRange()).toEqual([])
    expect(getDayOffRange([])).toEqual([])

    const singleDay = { id: 'off-1', date: '2023-05-01' }
    expect(getDayOffRange([singleDay])).toEqual([
      { id: 'off-1', date: '2023-05-01' }
    ])

    const multiDay = { id: 'off-2', date: '2023-05-01', end_date: '2023-05-03' }
    expect(getDayOffRange([multiDay])).toEqual([
      { id: 'off-2', date: '2023-05-01', end_date: '2023-05-03' },
      { id: 'off-2', date: '2023-05-02', end_date: '2023-05-03' },
      { id: 'off-2', date: '2023-05-03', end_date: '2023-05-03' }
    ])
  })
})

describe('getDayOffRange across DST changes', () => {
  // Vitest runs the specs in worker threads, where assigning process.env.TZ
  // leaves the timezone unchanged: expand the ranges in a process started in
  // the timezone instead.
  const expandIn = (timeZone, daysOff) => {
    const time = new URL('../../../src/lib/time.js', import.meta.url)
    const script = `
      import { getDayOffRange } from ${JSON.stringify(time.href)}
      console.log(JSON.stringify({
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dates: getDayOffRange(${JSON.stringify(daysOff)}).map(({ date }) => date)
      }))
    `
    const output = execFileSync(
      process.execPath,
      ['--input-type=module', '--eval', script],
      { encoding: 'utf8', env: { ...process.env, TZ: timeZone } }
    )
    return JSON.parse(output)
  }

  test('keeps every day off in Europe/Budapest', () => {
    // DST starts on 2026-03-29 and ends on 2026-10-25
    const daysOff = [
      { date: '2026-03-27', end_date: '2026-04-02' },
      { date: '2026-10-23', end_date: '2026-10-27' }
    ]
    expect(expandIn('Europe/Budapest', daysOff)).toEqual({
      timeZone: 'Europe/Budapest',
      dates: [
        '2026-03-27',
        '2026-03-28',
        '2026-03-29',
        '2026-03-30',
        '2026-03-31',
        '2026-04-01',
        '2026-04-02',
        '2026-10-23',
        '2026-10-24',
        '2026-10-25',
        '2026-10-26',
        '2026-10-27'
      ]
    })
  })

  test('keeps every day off in America/New_York', () => {
    // DST starts on 2026-03-08 and ends on 2026-11-01
    const daysOff = [
      { date: '2026-03-06', end_date: '2026-03-10' },
      { date: '2026-10-30', end_date: '2026-11-03' }
    ]
    expect(expandIn('America/New_York', daysOff)).toEqual({
      timeZone: 'America/New_York',
      dates: [
        '2026-03-06',
        '2026-03-07',
        '2026-03-08',
        '2026-03-09',
        '2026-03-10',
        '2026-10-30',
        '2026-10-31',
        '2026-11-01',
        '2026-11-02',
        '2026-11-03'
      ]
    })
  })
})

describe('getMonthsBetween', () => {
  it('lists every month the range touches', () => {
    expect(getMonthsBetween('2026-08-20', '2026-10-03')).toEqual([
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
      { year: 2026, month: 10 }
    ])
  })

  it('crosses the year and accepts moments', () => {
    expect(
      getMonthsBetween(moment('2026-12-31'), moment('2027-01-01'))
    ).toEqual([
      { year: 2026, month: 12 },
      { year: 2027, month: 1 }
    ])
  })

  it('keeps a single month when both dates share it', () => {
    expect(getMonthsBetween('2026-09-01', '2026-09-30')).toEqual([
      { year: 2026, month: 9 }
    ])
  })

  it('returns nothing when the end precedes the start', () => {
    expect(getMonthsBetween('2026-10-01', '2026-09-30')).toEqual([])
  })

  // The team schedule mixes UTC person dates with local moments: a diff in
  // months truncates the offset away and used to drop the last month.
  it('reads each date in its own calendar', () => {
    expect(
      getMonthsBetween(
        moment.utc('2026-09-01'),
        moment.tz('2026-12-09 10:00', 'Europe/Paris')
      ).map(({ month }) => month)
    ).toEqual([9, 10, 11, 12])
    expect(
      getMonthsBetween(
        moment.tz('2026-09-01', 'America/Los_Angeles'),
        moment.utc('2026-12-09')
      ).map(({ month }) => month)
    ).toEqual([9, 10, 11, 12])
  })
})
