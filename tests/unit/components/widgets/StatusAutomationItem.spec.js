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
  out_task_status_id: 'ready'
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

})
