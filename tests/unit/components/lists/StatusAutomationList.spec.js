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
  const mountList = (props, getters = {}) => {
    const store = createStore({
      getters: {
        getTaskType: () => () => undefined,
        isDarkTheme: () => false,
        taskStatusMap: () =>
          new Map([
            ['todo', { id: 'todo', name: 'Todo', short_name: 'todo' }],
            ['ready', { id: 'ready', name: 'Ready', short_name: 'ready' }]
          ]),
        isStatusAutomationDisabled: () => () => true,
        ...getters
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

  it('shows the statuses the applied task has to be in', () => {
    const wrapper = mountList({
      entries: [
        { ...statusAutomation, out_only_if_task_status_ids: ['todo', 'ready'] }
      ]
    })
    expect(
      wrapper.findAll('th').map(th => th.text())
    ).toContain('Only when the applied task is in')
    expect(
      wrapper.findAll('td.guard .tag').map(tag => tag.text())
    ).toEqual(['todo', 'ready'])
  })

  // The cards of the phone layout leave it out.
  it('marks a guard cell without statuses', () => {
    const wrapper = mountList({
      entries: [
        statusAutomation,
        {
          ...statusAutomation,
          id: 'automation-2',
          out_only_if_task_status_ids: ['todo']
        },
        {
          ...statusAutomation,
          id: 'automation-3',
          out_field_type: 'ready_for',
          out_only_if_task_status_ids: ['todo']
        }
      ]
    })
    expect(
      wrapper.findAll('td.guard').map(cell => cell.classes('is-empty'))
    ).toEqual([true, false, true])
  })

  // Only a direct write stores a guard that is not a list.
  it('shows a malformed guard as none', () => {
    const wrapper = mountList({
      entries: [
        { ...statusAutomation, out_only_if_task_status_ids: {} },
        {
          ...statusAutomation,
          id: 'automation-2',
          out_only_if_task_status_ids: 'todo'
        }
      ]
    })
    expect(
      wrapper.findAll('td.guard').map(cell => cell.classes('is-empty'))
    ).toEqual([true, true])
  })

  // The task status map is filled in place: a computed over it would keep
  // its first read.
  it('reads the guard statuses again at each render', async () => {
    const taskStatusMap = new Map()
    const wrapper = mountList(
      {
        entries: [{ ...statusAutomation, out_only_if_task_status_ids: ['wip'] }]
      },
      { taskStatusMap: () => taskStatusMap }
    )
    expect(wrapper.find('td.guard .tag').exists()).toBe(false)

    taskStatusMap.set('wip', { id: 'wip', name: 'WIP', short_name: 'wip' })
    await wrapper.setProps({ isLoading: true })

    expect(wrapper.findAll('td.guard .tag').map(tag => tag.text())).toEqual([
      'wip'
    ])
  })
})
