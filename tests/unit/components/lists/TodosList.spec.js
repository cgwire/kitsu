import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import resizableColumn from '@/directives/resizable-column'

import TodosList from '@/components/lists/TodosList.vue'

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
  due_date: '2026-10-01'
}

const mountList = (props, config, { getters = {}, actions = {} } = {}) =>
  shallowMount(TodosList, {
    global: {
      config,
      plugins: [
        createStore({
          getters: {
            dateFormat: () => 'YYYY-MM-DD',
            isCurrentUserManager: () => false,
            isCurrentUserSupervisor: () => false,
            nbSelectedTasks: () => 0,
            openProductions: () => [],
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            productionMap: () => new Map(),
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
        }),
        resizableColumn
      ],
      stubs: { RouterLink: true }
    },
    props
  })

// The pages mount the list while the tasks load: the table only renders
// once the loading ends.
const mountLoadedList = async (config, store) => {
  const wrapper = mountList({ isLoading: true, tasks: [] }, config, store)
  await wrapper.setProps({ isLoading: false, tasks: [task] })
  return wrapper
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

// MouseEventInit has no pageX key, so jsdom drops it in the constructor.
const mouseEvent = (type, pageX) => {
  const event = new MouseEvent(type, { bubbles: true })
  Object.defineProperty(event, 'pageX', { value: pageX })
  return event
}

describe('lists/TodosList', () => {
  afterEach(() => {
    localStorage.clear()
  })

  test('lets the user resize the entity column once the tasks load', async () => {
    const wrapper = await mountLoadedList()

    expect(wrapper.find('thead th.name .resizable-knob').exists()).toBe(true)

    wrapper.unmount()
  })

  test('keeps the entity column width when the list reloads', async () => {
    const wrapper = await mountLoadedList()
    const knob = wrapper.find('thead th.name .resizable-knob').element

    // jsdom lays nothing out: the column starts from a 0px width.
    knob.dispatchEvent(mouseEvent('mousedown', 100))
    document.dispatchEvent(mouseEvent('mousemove', 520))
    document.dispatchEvent(mouseEvent('mouseup', 520))
    await wrapper.setProps({ isLoading: true })
    await wrapper.setProps({ isLoading: false })

    expect(wrapper.find('thead th.name').element.style.width).toBe('420px')

    wrapper.unmount()
  })

  test('selects a task when its row is clicked', async () => {
    const wrapper = await mountLoadedList()

    await wrapper.find('tbody td.duration').trigger('click')

    expect(wrapper.emitted('task-selected')).toHaveLength(1)

    wrapper.unmount()
  })

  test('does not select a task from a click on an icon', async () => {
    const errorHandler = vi.fn()
    const wrapper = await mountLoadedList({ errorHandler })
    const stroke = appendIconStroke(wrapper.find('tbody td.duration').element)

    stroke.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(errorHandler).not.toHaveBeenCalled()
    expect(wrapper.emitted('task-selected')).toBeUndefined()

    wrapper.unmount()
  })

  // 2.05 hours make 122.99999999999999 minutes in floats.
  test('saves an estimation typed in hours in whole minutes', async () => {
    const updateTask = vi.fn()
    const wrapper = await mountLoadedList(undefined, {
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
})
