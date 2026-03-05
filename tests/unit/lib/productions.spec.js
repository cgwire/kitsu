import { describe, it, expect } from 'vitest'

import {
  getTaskTypePriorityOfProd,
  getTaskStatusPriorityOfProd
} from '@/lib/productions'

describe('productions', () => {
  describe('getTaskTypePriorityOfProd', () => {
    it('returns 1 when taskType is null', () => {
      expect(getTaskTypePriorityOfProd(null, {})).toBe(1)
    })

    it('returns production-level priority when set', () => {
      const taskType = { id: 'tt-1', priority: 5 }
      const production = { task_types_priority: { 'tt-1': 3 } }
      expect(getTaskTypePriorityOfProd(taskType, production)).toBe(3)
    })

    it('falls back to taskType priority when production has no override', () => {
      const taskType = { id: 'tt-2', priority: 7 }
      const production = { task_types_priority: {} }
      expect(getTaskTypePriorityOfProd(taskType, production)).toBe(7)
    })

    it('falls back to taskType priority when production is null', () => {
      const taskType = { id: 'tt-3', priority: 4 }
      expect(getTaskTypePriorityOfProd(taskType, null)).toBe(4)
    })
  })

  describe('getTaskStatusPriorityOfProd', () => {
    it('returns 1 when taskStatus is null', () => {
      expect(getTaskStatusPriorityOfProd(null, {})).toBe(1)
    })

    it('returns production-level priority when set', () => {
      const taskStatus = { id: 'ts-1', priority: 5 }
      const production = {
        task_statuses_link: { 'ts-1': { priority: 2 } }
      }
      expect(getTaskStatusPriorityOfProd(taskStatus, production)).toBe(2)
    })

    it('falls back to taskStatus priority when production has no override', () => {
      const taskStatus = { id: 'ts-2', priority: 8 }
      const production = { task_statuses_link: {} }
      expect(getTaskStatusPriorityOfProd(taskStatus, production)).toBe(8)
    })

    it('falls back to taskStatus priority when production is null', () => {
      const taskStatus = { id: 'ts-3', priority: 6 }
      expect(getTaskStatusPriorityOfProd(taskStatus, null)).toBe(6)
    })
  })
})
