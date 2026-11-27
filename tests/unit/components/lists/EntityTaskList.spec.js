import { flushPromises, shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => ({ path: '/', query: {} })
}))

import { markRequestFailure } from '@/lib/errors'

import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import DateField from '@/components/widgets/DateField.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'

const task = {
  id: 'task-1',
  task_type_id: 'task-type-1',
  task_status_id: 'task-status-1',
  estimation: 0,
  duration: 0,
  start_date: null,
  due_date: null,
  assignees: []
}

const mountList = (errors = [], { getters = {}, props = {}, updateTask } = {}) =>
  shallowMount(EntityTaskList, {
    props: { entries: [task], ...props },
    global: {
      config: { errorHandler: err => errors.push(err) },
      mocks: { $t: key => key },
      plugins: [
        createStore({
          getters: {
            currentProduction: () => ({ id: 'production-1' }),
            dateFormat: () => 'YYYY-MM-DD',
            getTaskTypePriority: () => () => 1,
            isCurrentUserClient: () => false,
            isCurrentUserProductionManager: () => true,
            isCurrentUserProductionSupervisor: () => false,
            isCurrentUserVendor: () => false,
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            taskMap: () => new Map(),
            taskStatusMap: () => new Map(),
            taskTypeMap: () =>
              new Map([
                [
                  'task-type-1',
                  { id: 'task-type-1', name: 'Modeling', department_id: 'cg' }
                ]
              ]),
            use12HourClock: () => false,
            user: () => ({ departments: [] }),
            ...getters
          },
          actions: { updateTask: updateTask ?? vi.fn() }
        })
      ]
    }
  })

// The header sits in its own table, so it follows the body scroll by hand.
describe('EntityTaskList, body scroll', () => {
  it('moves the header with the horizontal scroll of the body', () => {
    const errors = []
    const wrapper = mountList(errors)
    const body = wrapper.find('.task-list-body').element
    body.scrollLeft = 30

    body.dispatchEvent(new Event('scroll'))

    expect(wrapper.find('table').element.style.left).toBe('-30px')
    expect(errors).toEqual([])
    wrapper.unmount()
  })

  // The browser still delivers a scroll queued before the unmount, once the
  // template refs are null.
  it('ignores a scroll that reaches the detached body', () => {
    const errors = []
    const wrapper = mountList(errors)
    const body = wrapper.find('.task-list-body').element
    wrapper.unmount()

    body.dispatchEvent(new Event('scroll'))

    expect(errors).toEqual([])
  })
})

describe('EntityTaskList, planning edit', () => {
  // three days of work, from a Monday to the Wednesday
  const planned = {
    ...task,
    estimation: 3 * 8 * 60,
    duration: 480,
    start_date: '2026-01-12T00:00:00',
    due_date: '2026-01-14T00:00:00'
  }
  const other = { ...planned, id: 'task-2' }

  const mountSelected = options =>
    mountList([], {
      ...options,
      props: { entries: [planned, other], selectedTaskId: 'task-1' }
    })

  const row = (wrapper, index = 0) => wrapper.findAll('tbody tr')[index]

  it('lets a manager edit the estimation and the dates of the selected task', () => {
    const wrapper = mountSelected()

    expect(row(wrapper).find('td.estimation input').element.value).toBe('3')
    expect(
      row(wrapper)
        .findAllComponents(DateField)
        .map(field => field.props('modelValue'))
    ).toEqual([new Date(2026, 0, 12), new Date(2026, 0, 14)])
    // the time spent comes from the timesheets
    expect(row(wrapper).find('td.duration input').exists()).toBe(false)
    expect(row(wrapper, 1).find('input').exists()).toBe(false)
    expect(row(wrapper, 1).findComponent(DateField).exists()).toBe(false)
  })

  it('keeps the values under the fields, for the cards of a phone', () => {
    const wrapper = mountSelected()

    expect(row(wrapper).find('td.estimation .value').text()).toBe('3')
    expect(row(wrapper).find('td.startdate .value').text()).toBe('2026-01-12')
  })

  it.each([
    ['an artist', { isCurrentUserProductionManager: () => false }],
    [
      'a supervisor of another department',
      {
        isCurrentUserProductionManager: () => false,
        isCurrentUserProductionSupervisor: () => true,
        user: () => ({ departments: ['2d'] })
      }
    ]
  ])('gives %s no field', (_, getters) => {
    const wrapper = mountSelected({ getters })

    expect(row(wrapper).find('input').exists()).toBe(false)
    expect(row(wrapper).findComponent(DateField).exists()).toBe(false)
  })

  it('gives the supervisor of the department the fields', () => {
    const wrapper = mountSelected({
      getters: {
        isCurrentUserProductionManager: () => false,
        isCurrentUserProductionSupervisor: () => true,
        user: () => ({ departments: ['cg'] })
      }
    })

    expect(row(wrapper).find('td.estimation input').exists()).toBe(true)
  })

  it('saves an estimation with the due date it moves', async () => {
    const updateTask = vi.fn()
    const wrapper = mountSelected({ updateTask })

    await row(wrapper).find('td.estimation input').setValue('5')

    expect(updateTask.mock.calls.map(call => call[1])).toEqual([
      {
        taskId: 'task-1',
        data: {
          estimation: 5 * 8 * 60,
          start_date: '2026-01-12',
          due_date: '2026-01-16'
        }
      }
    ])
  })

  it('saves nothing for an estimation left as it was', async () => {
    const updateTask = vi.fn()
    const wrapper = mountSelected({ updateTask })

    await row(wrapper).find('td.estimation input').setValue('3')

    expect(updateTask).not.toHaveBeenCalled()
  })

  it('saves a start date with the due date it moves', async () => {
    const updateTask = vi.fn()
    const wrapper = mountSelected({ updateTask })

    row(wrapper)
      .findAllComponents(DateField)[0]
      .vm.$emit('update:modelValue', new Date(2026, 0, 15))

    expect(updateTask.mock.calls[0][1]).toEqual({
      taskId: 'task-1',
      data: { start_date: '2026-01-15', due_date: '2026-01-19' }
    })
  })

  it('saves a due date with the start date it moves', async () => {
    const updateTask = vi.fn()
    const wrapper = mountSelected({ updateTask })

    row(wrapper)
      .findAllComponents(DateField)[1]
      .vm.$emit('update:modelValue', new Date(2026, 0, 16))

    expect(updateTask.mock.calls[0][1]).toEqual({
      taskId: 'task-1',
      data: { start_date: '2026-01-14', due_date: '2026-01-16' }
    })
  })

  it('keeps the task selected on a click in a field', async () => {
    const wrapper = mountSelected()

    await row(wrapper).find('td.estimation input').trigger('click')
    await row(wrapper).find('td.estimation input').trigger('keydown.enter')

    expect(wrapper.emitted('task-selected')).toBeUndefined()
  })

  it('tells a save Zou refused', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    const refusal = new Error('refused')
    markRequestFailure(refusal)
    const updateTask = vi.fn(() => Promise.reject(refusal))
    const wrapper = mountSelected({ updateTask })

    await row(wrapper).find('td.estimation input').setValue('5')
    await flushPromises()

    expect(wrapper.findComponent(ErrorText).props('text')).toBe(
      'main.cell_save_error'
    )
    errorLog.mockRestore()
  })
})
