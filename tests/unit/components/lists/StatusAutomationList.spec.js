import { enableAutoUnmount } from '@vue/test-utils'
import { AlertTriangleIcon } from 'lucide-vue-next'
import { createStore } from 'vuex'

import StatusAutomationList from '@/components/lists/StatusAutomationList.vue'
import StatusAutomationConditions from '@/components/widgets/StatusAutomationConditions.vue'

import { shallowMountWithI18n } from '../../fixtures/i18n'

const statusAutomation = {
  id: 'automation-1',
  entity_type: 'shot',
  in_conditions: {
    operator: 'and',
    conditions: [
      { task_type_id: 'task-type-lighting', task_status_ids: ['done'] },
      { task_type_id: 'task-type-fx', task_status_ids: ['done'] }
    ]
  },
  out_field_type: 'status',
  out_task_type_id: 'task-type-compositing',
  out_task_status_id: 'ready',
  import_last_revision: false,
  archived: false
}

enableAutoUnmount(afterEach)

describe('StatusAutomationList', () => {
  const mountList = props => {
    const store = createStore({
      getters: {
        getTaskType: () => () => undefined,
        taskStatusMap: () => new Map(),
        isStatusAutomationDisabled: () => () => true
      }
    })
    return shallowMountWithI18n(StatusAutomationList, {
      props: {
        entries: [statusAutomation],
        isLoading: false,
        ...props
      },
      global: { plugins: [store] }
    })
  }

  it('shows the trigger conditions in one column', () => {
    const wrapper = mountList()
    const headers = wrapper.findAll('th').map(th => th.text())
    expect(headers).toContain('Conditions')
    expect(headers).not.toContain('Task Type')
    expect(headers).not.toContain('Task Status')
    const conditions = wrapper.findComponent(StatusAutomationConditions)
    expect(conditions.props('statusAutomation')).toMatchObject({
      id: 'automation-1'
    })
    expect(conditions.props('withPriorityWarnings')).toBe(false)
  })

  // The admin page and the templates have no meaningful current production.
  it('warns about the priorities only when asked to', () => {
    expect(mountList().findComponent(AlertTriangleIcon).exists()).toBe(false)

    const wrapper = mountList({ withPriorityWarnings: true })
    expect(wrapper.findComponent(AlertTriangleIcon).exists()).toBe(true)
    expect(
      wrapper.findComponent(StatusAutomationConditions).props(
        'withPriorityWarnings'
      )
    ).toBe(true)
  })
})
