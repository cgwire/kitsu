import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import ToCheckList from '@/components/lists/ToCheckList.vue'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const task = {
  id: 'task-1',
  project_id: 'production-1',
  task_type_id: 'task-type-1',
  entity_type_name: 'Shot',
  full_entity_name: 'SQ010 / SH0010',
  assignees: [],
  estimation: 240
}

const mountList = ({ getters = {}, actions = {} } = {}) =>
  shallowMount(ToCheckList, {
    global: {
      plugins: [
        createStore({
          getters: {
            dateFormat: () => 'YYYY-MM-DD',
            isCurrentUserManager: () => false,
            isCurrentUserSupervisor: () => false,
            nbSelectedTasks: () => 0,
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            productionMap: () => new Map(),
            taskMap: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false,
            ...getters
          },
          actions: {
            addSelectedTask: () => {},
            clearSelectedTasks: () => {},
            removeSelectedTask: () => {},
            ...actions
          }
        })
      ],
      stubs: { RouterLink: true }
    },
    props: { tasks: [task] }
  })

// What a browser reports once "1." is left in a number field: no number, so
// an empty value with a bad input
const leaveInvalidEntry = async input => {
  input.element.value = '1.'
  Object.defineProperty(input.element, 'validity', {
    configurable: true,
    value: { badInput: true }
  })
  await input.trigger('change')
}

describe('lists/ToCheckList', () => {
  // 2.05 hours make 122.99999999999999 minutes in floats.
  test('saves an estimation typed in hours in whole minutes', async () => {
    const updateTask = vi.fn()
    const wrapper = mountList({
      getters: {
        isCurrentUserManager: () => true,
        organisation: () => ({
          hours_by_day: 8,
          format_duration_in_hours: true
        }),
        taskMap: () => new Map([[task.id, task]])
      },
      actions: { updateTask }
    })
    await wrapper.find('tbody td.duration').trigger('click')
    const input = wrapper.find('tbody td.estimation input')

    // setValue fires the change event the list saves on
    await input.setValue('2.05')

    expect(updateTask.mock.calls.map(([, payload]) => payload)).toEqual([
      { taskId: 'task-1', data: { estimation: 123 } }
    ])

    wrapper.unmount()
  })

  describe('estimation field', () => {
    const mountEditableList = updateTask =>
      mountList({
        getters: {
          isCurrentUserManager: () => true,
          taskMap: () => new Map([[task.id, task]])
        },
        actions: { updateTask }
      })

    // It read as an emptied field and saved 0 for every selected task.
    test('ignores an entry that is no number', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.duration').trigger('click')
      const input = wrapper.find('tbody td.estimation input')

      await leaveInvalidEntry(input)

      expect(updateTask).not.toHaveBeenCalled()
      // the half day stored comes back
      expect(input.element.value).toBe('0.5')

      wrapper.unmount()
    })

    // A valid number, it saved -480 minutes for every selected task.
    test('ignores a negative entry', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.duration').trigger('click')
      const input = wrapper.find('tbody td.estimation input')

      await input.setValue('-1')

      expect(updateTask).not.toHaveBeenCalled()
      // the half day stored comes back
      expect(input.element.value).toBe('0.5')

      wrapper.unmount()
    })

    test('saves 0 for an emptied field', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.duration').trigger('click')

      await wrapper.find('tbody td.estimation input').setValue('')

      expect(updateTask.mock.calls.map(([, payload]) => payload)).toEqual([
        { taskId: 'task-1', data: { estimation: 0 } }
      ])

      wrapper.unmount()
    })
  })
})
