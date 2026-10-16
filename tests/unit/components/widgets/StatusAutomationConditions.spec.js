import { enableAutoUnmount } from '@vue/test-utils'
import { createStore } from 'vuex'

import StatusAutomationConditions from '@/components/widgets/StatusAutomationConditions.vue'

import { mountWithI18n } from '../../fixtures/i18n'

const taskTypeMap = new Map([
  ['task-type-lighting', { id: 'task-type-lighting', name: 'Lighting' }],
  ['task-type-fx', { id: 'task-type-fx', name: 'FX' }]
])
const taskStatusMap = new Map([
  ['task-status-done', { id: 'task-status-done', short_name: 'done' }],
  ['task-status-na', { id: 'task-status-na', short_name: 'na' }]
])

const automation = (operator, conditions) => ({
  id: 'automation-1',
  entity_type: 'shot',
  in_conditions: { operator, conditions },
  out_field_type: 'status',
  out_task_type_id: 'task-type-compositing'
})

const lightingDone = {
  task_type_id: 'task-type-lighting',
  task_status_ids: ['task-status-done']
}
const fxDoneOrNa = {
  task_type_id: 'task-type-fx',
  task_status_ids: ['task-status-done', 'task-status-na']
}

enableAutoUnmount(afterEach)

describe('StatusAutomationConditions', () => {
  const mountConditions = props => {
    const store = createStore({
      getters: {
        getTaskType: () => id => taskTypeMap.get(id),
        taskStatusMap: () => taskStatusMap,
        isDarkTheme: () => false,
        // FX comes after the applied task type in the current production.
        getGuardOnlyConditions: () => statusAutomation =>
          statusAutomation.in_conditions.conditions.filter(
            condition => condition.task_type_id === 'task-type-fx'
          )
      }
    })
    return mountWithI18n(StatusAutomationConditions, {
      props,
      global: {
        plugins: [store],
        stubs: {
          TaskTypeName: {
            props: ['taskType'],
            template: '<span class="task-type">{{ taskType.name }}</span>'
          }
        }
      }
    })
  }

  // The spacing comes from the styles, not from text nodes.
  const lines = wrapper =>
    wrapper.findAll('.condition').map(line =>
      line
        .findAll('.task-type, .task-status')
        .map(part => part.text())
        .join(' ')
    )

  // Only a sync or a direct write stores such a trigger.
  it('renders a malformed trigger as far as it goes', () => {
    const wrapper = mountConditions({
      statusAutomation: {
        ...automation('and', []),
        in_conditions: {
          conditions: [{ task_type_id: 'task-type-lighting' }, fxDoneOrNa]
        }
      }
    })
    expect(lines(wrapper)).toEqual(['Lighting', 'FX done na'])
    expect(wrapper.findAll('.connector').map(c => c.text())).toEqual(['and'])
  })

  it('renders each condition joined by the operator word', () => {
    const wrapper = mountConditions({
      statusAutomation: automation('and', [lightingDone, fxDoneOrNa])
    })
    expect(lines(wrapper)).toEqual(['Lighting done', 'FX done na'])
    expect(wrapper.findAll('.connector').map(c => c.text())).toEqual(['and'])

    const orWrapper = mountConditions({
      statusAutomation: automation('or', [lightingDone, fxDoneOrNa])
    })
    expect(orWrapper.findAll('.connector').map(c => c.text())).toEqual(['or'])
  })

  it('renders the legacy single condition', () => {
    const wrapper = mountConditions({
      statusAutomation: {
        entity_type: 'shot',
        in_task_type_id: 'task-type-lighting',
        in_task_status_id: 'task-status-done',
        out_field_type: 'status'
      }
    })
    expect(lines(wrapper)).toEqual(['Lighting done'])
    expect(wrapper.find('.connector').exists()).toBe(false)
  })

  it('skips the task types and statuses the store does not hold', () => {
    const wrapper = mountConditions({
      statusAutomation: automation('and', [
        { task_type_id: 'task-type-gone', task_status_ids: ['task-status-done'] },
        { task_type_id: 'task-type-fx', task_status_ids: ['task-status-gone'] }
      ])
    })
    expect(lines(wrapper)).toEqual(['done', 'FX'])
  })

  it('marks the guard-only conditions with the priority warnings only', () => {
    const statusAutomation = automation('and', [lightingDone, fxDoneOrNa])
    expect(
      mountConditions({ statusAutomation }).find('.guard-only').exists()
    ).toBe(false)

    const wrapper = mountConditions({
      statusAutomation,
      withPriorityWarnings: true
    })
    const guardOnly = wrapper.findAll('.guard-only')
    expect(guardOnly).toHaveLength(1)
    expect(guardOnly[0].attributes('title')).toBe(
      'In this production, FX comes after the applied task type: its status changes do not run this automation, but the condition must still be met.'
    )

    const orWrapper = mountConditions({
      statusAutomation: automation('or', [lightingDone, fxDoneOrNa]),
      withPriorityWarnings: true
    })
    expect(orWrapper.find('.guard-only').attributes('title')).toBe(
      'In this production, FX comes after the applied task type: this condition is ignored.'
    )
  })
})
