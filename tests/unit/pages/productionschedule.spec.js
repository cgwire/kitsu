import moment from 'moment-timezone'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import ProductionSchedule from '@/components/pages/ProductionSchedule.vue'

const { saveTaskChanged } = ProductionSchedule.methods

const buildTask = assignees => ({
  id: 'task-1',
  versionedTaskId: 'link-1',
  estimation: 480,
  assignees,
  startDate: moment.utc('2026-09-21'),
  endDate: moment.utc('2026-09-22')
})

describe('ProductionSchedule saveTaskChanged', () => {
  it('drops the unassigned placeholder from the versioned task link', async () => {
    const updateScheduleVersionedTask = vi.fn().mockResolvedValue()
    // the drill-down groups unassigned tasks under a local 'unassigned' row
    // that is not a person id known to the API
    const task = buildTask(['unassigned'])

    await saveTaskChanged.call(
      { isVersioned: true, updateScheduleVersionedTask },
      task
    )

    expect(updateScheduleVersionedTask).toHaveBeenCalledWith({
      id: 'link-1',
      estimation: 480,
      startDate: '2026-09-21',
      dueDate: '2026-09-22',
      assignees: []
    })
  })

  it('keeps the real assignees of the versioned task link', async () => {
    const updateScheduleVersionedTask = vi.fn().mockResolvedValue()
    const task = buildTask(['person-1', 'person-2'])

    await saveTaskChanged.call(
      { isVersioned: true, updateScheduleVersionedTask },
      task
    )

    expect(updateScheduleVersionedTask).toHaveBeenCalledWith(
      expect.objectContaining({ assignees: ['person-1', 'person-2'] })
    )
  })
})
