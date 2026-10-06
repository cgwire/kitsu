import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'

// Estimated at one working day
const task = {
  id: 'task-1',
  entity_id: 'asset-1',
  entity: { id: 'asset-1' },
  task_status_id: 'status-1',
  task_type_id: 'task-type-1',
  estimation: 8 * 60,
  assignees: []
}

const mountHelper = isDurationInHours => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      dateFormat: () => 'YYYY-MM-DD',
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      organisation: () => ({
        hours_by_day: 8,
        format_duration_in_hours: isDurationInHours
      }),
      personMap: () => new Map(),
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ id: 'manager-1', departments: [] })
    }
  })
  return shallowMount(EstimationHelper, {
    props: { entityType: 'Asset', tasks: [task] },
    global: { plugins: [store], mocks: { $t: key => key } }
  })
}

describe('EstimationHelper', () => {
  // The estimations are shown in the unit the organisation displays
  // durations in: a typed one is read in that unit too.
  it.each([
    ['hours', true, '8', '16'],
    ['days', false, '1', '2']
  ])(
    'saves the estimation typed in %s',
    async (_, isDurationInHours, shown, typed) => {
      const wrapper = mountHelper(isDurationInHours)
      const input = wrapper.find('td.estimation input')

      expect(input.element.value).toBe(shown)

      await input.setValue(typed)

      expect(wrapper.emitted('estimation-changed')).toEqual([
        [{ taskId: 'task-1', estimation: 16 * 60 }]
      ])
      wrapper.unmount()
    }
  )
})
