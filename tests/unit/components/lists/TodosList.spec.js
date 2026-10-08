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
  due_date: '2026-10-01',
  estimation: 240
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

  // Phones get read-only cards from the global datatable--cards rule
  describe('cards on mobile', () => {
    const cell = (wrapper, name) =>
      wrapper.find(`.datatable-body tr > .${name}`)

    test('opts the table into the card layout', async () => {
      const wrapper = await mountLoadedList()
      expect(wrapper.find('table').classes()).toContain('datatable--cards')
      expect(cell(wrapper, 'name').classes()).toContain('card-head')
      wrapper.unmount()
    })

    test('labels the cells that carry a value', async () => {
      const wrapper = await mountLoadedList()
      expect(cell(wrapper, 'production').attributes('data-label')).toBe(
        'main.production'
      )
      expect(cell(wrapper, 'type').attributes('data-label')).toBe(
        'tasks.fields.task_type'
      )
      expect(cell(wrapper, 'status').attributes('data-label')).toBe(
        'tasks.fields.task_status'
      )
      expect(cell(wrapper, 'due-date').attributes('data-label')).toBe(
        'tasks.fields.due_date'
      )
      expect(cell(wrapper, 'estimation').attributes('data-label')).toBe(
        'main.estimation'
      )
      wrapper.unmount()
    })

    test('labels the end date of a done task', async () => {
      const wrapper = mountList({ done: true, isLoading: true, tasks: [] })
      await wrapper.setProps({
        isLoading: false,
        tasks: [{ ...task, end_date: '2026-10-02' }]
      })
      expect(cell(wrapper, 'end-date').attributes('data-label')).toBe(
        'tasks.fields.end_date'
      )
      wrapper.unmount()
    })

    test('leaves the empty and secondary cells out of the card', async () => {
      const wrapper = await mountLoadedList()
      ;['start-date', 'duration', 'last-comment'].forEach(name => {
        expect(cell(wrapper, name).attributes('data-label')).toBeUndefined()
      })
      wrapper.unmount()
    })
  })

  test('can show the empty message without the illustration', () => {
    const wrapper = mountList({
      emptyText: 'Nothing waiting',
      tasks: [],
      withIllustration: false
    })
    expect(wrapper.find('.empty-list').text()).toBe('Nothing waiting')
    expect(wrapper.find('.empty-list img').exists()).toBe(false)
    wrapper.unmount()
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

  describe('estimation field', () => {
    const mountEditableList = updateTask =>
      mountLoadedList(undefined, {
        getters: {
          isCurrentUserManager: () => true,
          taskMap: () => new Map([[task.id, task]])
        },
        actions: { updateTask }
      })

    // It read as an emptied field and saved 0 for every selected task.
    test('ignores an entry that is no number', async () => {
      const updateTask = vi.fn()
      const wrapper = await mountEditableList(updateTask)
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
      const wrapper = await mountEditableList(updateTask)
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
      const wrapper = await mountEditableList(updateTask)
      await wrapper.find('tbody td.duration').trigger('click')

      await wrapper.find('tbody td.estimation input').setValue('')

      expect(updateTask.mock.calls.map(([, payload]) => payload)).toEqual([
        { taskId: 'task-1', data: { estimation: 0 } }
      ])

      wrapper.unmount()
    })
  })
})
