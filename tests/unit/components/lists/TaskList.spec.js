import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import TaskList from '@/components/lists/TaskList.vue'

vi.mock('@/store', () => ({ default: {} }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRouter: () => ({ resolve: () => ({ href: '/tasks/task-1' }) })
}))

const task = {
  id: 'task-1',
  project_id: 'production-1',
  task_type_id: 'task-type-1',
  task_status_id: 'task-status-1',
  entity: { id: 'asset-1' },
  assignees: [],
  difficulty: 3,
  estimation: 240,
  retake_count: 0
}

const mountList = (
  config,
  { getters = {}, actions = {}, props = {} } = {}
) =>
  shallowMount(TaskList, {
    global: {
      config,
      plugins: [
        createStore({
          getters: {
            currentEpisode: () => null,
            currentProduction: () => ({ id: 'production-1' }),
            dateFormat: () => 'YYYY-MM-DD',
            isCurrentUserProductionManager: () => false,
            isCurrentUserProductionSupervisor: () => false,
            isPaperProduction: () => false,
            isTVShow: () => false,
            nbSelectedTasks: () => 0,
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            selectedTasks: () => new Map(),
            taskMap: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false,
            user: () => ({ id: 'user-1', departments: [] }),
            ...getters
          },
          actions: {
            addSelectedTask: () => {},
            clearSelectedTasks: () => {},
            removeSelectedTask: () => {},
            ...actions
          }
        })
      ]
    },
    props: { entityType: 'Asset', tasks: [task], ...props }
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

// The click target when the pointer is on the drawn line of an icon
const appendIconStroke = cell => {
  const svgNamespace = 'http://www.w3.org/2000/svg'
  const icon = document.createElementNS(svgNamespace, 'svg')
  const stroke = document.createElementNS(svgNamespace, 'path')
  icon.appendChild(stroke)
  cell.appendChild(icon)
  return stroke
}

describe('lists/TaskList', () => {
  test('selects a task when its row is clicked', async () => {
    const wrapper = mountList()

    await wrapper.find('tbody td.name').trigger('click')

    expect(wrapper.emitted('task-selected')).toHaveLength(1)

    wrapper.unmount()
  })

  test('does not select a task from a click on an icon', () => {
    const errorHandler = vi.fn()
    const wrapper = mountList({ errorHandler })
    const stroke = appendIconStroke(wrapper.find('tbody td.name').element)

    stroke.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(errorHandler).not.toHaveBeenCalled()
    expect(wrapper.emitted('task-selected')).toBeUndefined()

    wrapper.unmount()
  })

  // 2.05 hours make 122.99999999999999 minutes in floats.
  test('saves an estimation typed in hours in whole minutes', async () => {
    const updateTask = vi.fn()
    const wrapper = mountList(undefined, {
      getters: {
        isCurrentUserProductionManager: () => true,
        organisation: () => ({
          hours_by_day: 8,
          format_duration_in_hours: true
        }),
        taskMap: () => new Map([[task.id, task]])
      },
      actions: { updateTask },
      // the task type page passes the dates of the production
      props: { disabledDates: {} }
    })
    await wrapper.find('tbody td.name').trigger('click')
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
      mountList(undefined, {
        getters: {
          isCurrentUserProductionManager: () => true,
          taskMap: () => new Map([[task.id, task]])
        },
        actions: { updateTask },
        props: { disabledDates: {} }
      })

    // It read as an emptied field and saved 0 for every selected task.
    test('ignores an entry that is no number', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.name').trigger('click')
      const input = wrapper.find('tbody td.estimation input')

      await leaveInvalidEntry(input)

      expect(updateTask).not.toHaveBeenCalled()
      // the half day stored comes back
      expect(input.element.value).toBe('0.5')

      wrapper.unmount()
    })

    test('saves 0 for an emptied field', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.name').trigger('click')

      await wrapper.find('tbody td.estimation input').setValue('')

      expect(updateTask.mock.calls.map(([, payload]) => payload)).toEqual([
        { taskId: 'task-1', data: { estimation: 0 } }
      ])

      wrapper.unmount()
    })
  })
})
