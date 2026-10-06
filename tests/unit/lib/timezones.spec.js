// @vitest-environment node

import { execFileSync } from 'node:child_process'
import process from 'node:process'

// Vitest runs the specs in worker threads, where assigning process.env.TZ
// leaves the time zone unchanged: run in a process started in the zone.
const runIn = (timeZone, script) => {
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '--eval', script],
    { encoding: 'utf8', env: { ...process.env, TZ: timeZone } }
  )
  return JSON.parse(output)
}

const time = JSON.stringify(
  new URL('../../../src/lib/time.js', import.meta.url).href
)

const convertIn = timeZone =>
  runIn(
    timeZone,
    `
    import { localDayToUtcDate, utcDayToLocalDate } from ${time}
    const localDay = date => [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours()
    ]
    console.log(JSON.stringify({
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      shown: [
        '2026-08-05',
        '2026-08-05T00:00:00',
        new Date('2026-08-05T00:00:00Z'),
        new Date('2026-08-05T23:30:00Z')
      ].map(value => localDay(utcDayToLocalDate(value))),
      saved: [
        new Date(2026, 7, 6),
        new Date(2026, 7, 6, 23, 30)
      ].map(date => localDayToUtcDate(date).toISOString()),
      roundTrips: ['2026-03-29', '2026-10-25', '2018-11-04'].map(day =>
        localDayToUtcDate(utcDayToLocalDate(day)).toISOString()
      )
    }))
  `
  )

// A utc date field holds a day as the Date at UTC midnight of that day,
// while its date picker shows and returns local dates.
describe('utc date field days', () => {
  // Sao Paulo started its DST at midnight on 2018-11-04: that day has no
  // local midnight.
  test.each([
    'UTC',
    'Europe/Budapest',
    'America/New_York',
    'Asia/Tokyo',
    'America/Sao_Paulo'
  ])('keeps the same day in %s', timeZone => {
    expect(convertIn(timeZone)).toEqual({
      timeZone,
      shown: [
        [2026, 8, 5, 0],
        [2026, 8, 5, 0],
        [2026, 8, 5, 0],
        [2026, 8, 5, 0]
      ],
      saved: ['2026-08-06T00:00:00.000Z', '2026-08-06T00:00:00.000Z'],
      roundTrips: [
        '2026-03-29T00:00:00.000Z',
        '2026-10-25T00:00:00.000Z',
        '2018-11-04T00:00:00.000Z'
      ]
    })
  })
})

// Kitsu makes the time zone of the user profile the moment default one
const userDayIn = (timeZone, profileTimeZone) =>
  runIn(
    timeZone,
    `
    import moment from 'moment-timezone'
    import { getUserDay } from ${time}
    if (${JSON.stringify(profileTimeZone)}) {
      moment.tz.setDefault(${JSON.stringify(profileTimeZone)})
    }
    const at = new Date('2026-10-05T22:30:00Z')
    console.log(JSON.stringify(getUserDay(at).toISOString()))
  `
  )

// The schedules and the utc date fields hold a day at UTC midnight, but
// today is the day of the user, not the UTC one: 2026-10-05 at 22:30 UTC is
// already 2026-10-06 east of UTC.
describe('user day', () => {
  test.each([
    { timeZone: 'UTC', profile: null, day: '2026-10-05T00:00:00.000Z' },
    {
      timeZone: 'Europe/Budapest',
      profile: null,
      day: '2026-10-06T00:00:00.000Z'
    },
    {
      timeZone: 'America/New_York',
      profile: null,
      day: '2026-10-05T00:00:00.000Z'
    },
    { timeZone: 'Asia/Tokyo', profile: null, day: '2026-10-06T00:00:00.000Z' },
    {
      timeZone: 'America/New_York',
      profile: 'Europe/Paris',
      day: '2026-10-06T00:00:00.000Z'
    }
  ])('is $day in $timeZone, profile $profile', ({ timeZone, profile, day }) => {
    expect(userDayIn(timeZone, profile)).toBe(day)
  })
})
