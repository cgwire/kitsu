// @vitest-environment node

import {
  getProductivityRange,
  getQuotaColumnTotals,
  getTimeSpentColumnTotals
} from '@/lib/timesheet'

describe('lib/timesheet', () => {
  describe('getProductivityRange', () => {
    test('covers the month in the day view', () => {
      expect(getProductivityRange('day', { year: 2026, month: 2 })).toEqual({
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      })
    })

    test('covers the ISO weeks of the year in the week view', () => {
      // ISO week 1 of 2026 starts on Monday 2025-12-29, week 53 ends on
      // Sunday 2027-01-03
      expect(getProductivityRange('week', { year: 2026 })).toEqual({
        startDate: '2025-12-29',
        endDate: '2027-01-03'
      })
    })

    test('covers the year in the month view', () => {
      expect(getProductivityRange('month', { year: 2026 })).toEqual({
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      })
    })
  })

  describe('getTimeSpentColumnTotals', () => {
    const rows = [
      { date: '2026-10-05', duration: 60, project_id: 'p1', task_type_id: 't1' },
      { date: '2026-10-05', duration: 30, project_id: 'p2', task_type_id: 't1' },
      { date: '2026-10-07', duration: 120, project_id: 'p1', task_type_id: 't2' },
      { date: '2026-11-02', duration: 240, project_id: 'p1', task_type_id: 't1' }
    ]

    test('sums the minutes of each day column', () => {
      expect(getTimeSpentColumnTotals(rows, 'day', [5, 6, 7])).toEqual([
        90, 0, 120
      ])
    })

    test('sums the minutes of each ISO week and month column', () => {
      expect(getTimeSpentColumnTotals(rows, 'week', [41, 45])).toEqual([
        210, 240
      ])
      expect(getTimeSpentColumnTotals(rows, 'month', [10, 11])).toEqual([
        210, 240
      ])
    })

    test('keeps the rows of the production and the task type', () => {
      expect(
        getTimeSpentColumnTotals(rows, 'month', [10, 11], {
          productionId: 'p1',
          taskTypeId: 't1'
        })
      ).toEqual([60, 240])
    })

    test('reads dates carrying a time part', () => {
      const longRows = [
        { date: '2026-10-05T00:00:00', duration: 15 },
        { date: '2026-10-05', duration: 45 }
      ]
      expect(getTimeSpentColumnTotals(longRows, 'day', [5])).toEqual([60])
    })
  })

  describe('getQuotaColumnTotals', () => {
    const opts = { year: 2026, month: 10, countMode: 'weighted' }
    const quota = (level, key, values) => ({
      [key]: { [level]: { weighted: values } }
    })

    test('reads zero padded days of the month', () => {
      const quotas = [quota('day', 'total', { '2026-10-02': 5, '2026-10-12': 3 })]
      expect(getQuotaColumnTotals(quotas, 'day', [1, 2, 12], opts)).toEqual([
        0, 5, 3
      ])
    })

    test('reads weeks without padding', () => {
      const quotas = [quota('week', 'total', { '2026-5': 7, '2026-41': 2 })]
      expect(getQuotaColumnTotals(quotas, 'week', [5, 41], opts)).toEqual([
        7, 2
      ])
    })

    test('reads zero padded months', () => {
      const quotas = [quota('month', 'total', { '2026-03': 4, '2026-10': 6 })]
      expect(getQuotaColumnTotals(quotas, 'month', [3, 10], opts)).toEqual([
        4, 6
      ])
    })

    test('sums the responses of several productions', () => {
      const quotas = [
        quota('month', 'total', { '2026-10': 6 }),
        quota('month', 'total', { '2026-10': 1 })
      ]
      expect(getQuotaColumnTotals(quotas, 'month', [10], opts)).toEqual([7])
    })

    test('picks the task type key over the total', () => {
      const quotas = [
        {
          total: { month: { weighted: { '2026-10': 9 } } },
          tt1: { month: { weighted: { '2026-10': 4 } } }
        }
      ]
      expect(
        getQuotaColumnTotals(quotas, 'month', [10], { ...opts, taskTypeId: 'tt1' })
      ).toEqual([4])
      expect(getQuotaColumnTotals(quotas, 'month', [10], opts)).toEqual([9])
    })

    test('gives 0 for missing keys', () => {
      const quotas = [{}, { total: {} }, { total: { month: {} } }]
      expect(getQuotaColumnTotals(quotas, 'month', [10], opts)).toEqual([0])
      expect(
        getQuotaColumnTotals(quotas, 'month', [10], { ...opts, taskTypeId: 'x' })
      ).toEqual([0])
    })
  })
})
