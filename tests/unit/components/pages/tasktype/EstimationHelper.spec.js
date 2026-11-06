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
    global: { plugins: [store] }
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

  // A valid number, it saved -480 minutes for every selected task.
  it('ignores a negative entry', async () => {
    const wrapper = mountHelper(false)
    const input = wrapper.find('td.estimation input')

    await input.setValue('-1')

    expect(wrapper.emitted('estimation-changed')).toBeUndefined()
    // the day stored comes back
    expect(input.element.value).toBe('1')
    wrapper.unmount()
  })

  // The cell canceled the key, so the browser did not commit the typed
  // estimation, and selected its line again, drawn with the stored one.
  it('keeps the estimation typed when Enter is pressed in the field', async () => {
    const wrapper = mountHelper(false)
    await wrapper.find('td.estimation').trigger('click')
    const input = wrapper.find('td.estimation input')
    input.element.value = '2'
    let keydown
    wrapper.element.addEventListener('keydown', event => (keydown = event), {
      capture: true
    })

    await input.trigger('keydown', { key: 'Enter' })

    expect(keydown.defaultPrevented).toBe(false)
    expect(input.element.value).toBe('2')
    wrapper.unmount()
  })

  it('selects its line on Enter in the cell', async () => {
    const wrapper = mountHelper(false)

    await wrapper.find('td.estimation').trigger('keydown', { key: 'Enter' })

    expect(wrapper.find('tr.task-line').classes()).toContain('selected')
    wrapper.unmount()
  })
})
