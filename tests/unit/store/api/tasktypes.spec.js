// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store/api/client', () => ({
  default: { pdel: vi.fn() }
}))

import client from '@/store/api/client'
import taskTypesApi from '@/store/api/tasktypes'

describe('store/api/tasktypes', () => {
  beforeEach(() => {
    client.pdel.mockClear()
  })

  describe('deleteTaskType', () => {
    // Without force Zou refuses a task type still attached to schedule
    // items or productions, and says so: that answer drives the second,
    // explicit confirmation.
    test('does not force the deletion by default', () => {
      taskTypesApi.deleteTaskType({ id: 'task-type-1' })

      expect(client.pdel).toHaveBeenCalledWith(
        '/api/data/task-types/task-type-1'
      )
    })

    test('appends force=true when the deletion is forced', () => {
      taskTypesApi.deleteTaskType({ id: 'task-type-1' }, true)

      expect(client.pdel).toHaveBeenCalledWith(
        '/api/data/task-types/task-type-1?force=true'
      )
    })
  })
})
