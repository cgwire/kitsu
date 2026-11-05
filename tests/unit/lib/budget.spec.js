// @vitest-environment node

import moment from 'moment'

import { getMonthCost } from '@/lib/budget'

describe('lib/budget', () => {
  describe('getMonthCost', () => {
    const personEntry = {
      monthCosts: { '2026-01': 3000, '2026-02': 3000 },
      exceptions: { '2026-02': '1500' }
    }

    it('takes the cost of the month, by key or by moment', () => {
      expect(getMonthCost(personEntry, '2026-01')).toEqual(3000)
      expect(getMonthCost(personEntry, moment('2026-01-15'))).toEqual(3000)
    })

    it('prefers a salary exception of the month', () => {
      expect(getMonthCost(personEntry, '2026-02')).toEqual(1500)
    })

    it('costs nothing outside the planned months', () => {
      expect(getMonthCost(personEntry, '2026-03')).toEqual(0)
      expect(getMonthCost({ monthCosts: {} }, '2026-01')).toEqual(0)
    })
  })
})
