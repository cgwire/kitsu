import { enableAutoUnmount } from '@vue/test-utils'
import { createStore } from 'vuex'

import StatusAutomationItem from '@/components/widgets/StatusAutomationItem.vue'
import StatusAutomationConditions from '@/components/widgets/StatusAutomationConditions.vue'

import { shallowMountWithI18n } from '../../fixtures/i18n'

const taskStatusMap = new Map([
  ['todo', { id: 'todo', name: 'Todo', short_name: 'todo' }],
  ['ready', { id: 'ready', name: 'Ready', short_name: 'ready' }]
])

const statusAutomation = {
  id: 'automation-1',
  entity_type: 'shot',
  in_conditions: {
    operator: 'and',
    conditions: [{ task_type_id: 'task-type-lighting', task_status_ids: [] }]
  },
  out_field_type: 'status',
  out_task_type_id: 'task-type-compositing',
  out_task_status_id: 'ready',
  out_only_if_task_status_ids: ['todo']
}

enableAutoUnmount(afterEach)

describe('StatusAutomationItem', () => {
  const mountItem = props =>
    shallowMountWithI18n(StatusAutomationItem, {
      props,
      global: {
        plugins: [
          createStore({
            getters: {
              getTaskStatus: () => id => taskStatusMap.get(id),
              getTaskType: () => () => undefined,
              isDarkTheme: () => false,
              taskStatusMap: () => taskStatusMap
            }
          })
        ]
      }
    })

  it('shows the trigger conditions inline', () => {
    const wrapper = mountItem({ statusAutomation })
    const conditions = wrapper.findComponent(StatusAutomationConditions)
    expect(conditions.props('inline')).toBe(true)
    expect(conditions.props('statusAutomation')).toEqual(statusAutomation)
  })

  // Two automations that differ by their guard only must look apart.
  it('shows the statuses the applied task has to be in', () => {
    const wrapper = mountItem({ statusAutomation })
    expect(wrapper.find('.guard').text().replace(/\s+/g, ' ')).toBe(
      'only from todo'
    )
    expect(
      mountItem({
        statusAutomation: { ...statusAutomation, out_only_if_task_status_ids: [] }
      })
        .find('.guard')
        .exists()
    ).toBe(false)
  })

  // Only a direct write stores a guard that is not a list.
  it('shows a malformed guard as none', () => {
    const wrapper = mountItem({
      statusAutomation: { ...statusAutomation, out_only_if_task_status_ids: {} }
    })
    expect(wrapper.find('.status-automation').exists()).toBe(true)
    expect(wrapper.find('.guard').exists()).toBe(false)
  })
})
