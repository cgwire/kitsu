import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'
import assetStore from '@/store/modules/assets'

import TaskList from '@/components/lists/TaskList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import TaskType from '@/components/pages/TaskType.vue'
import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const SearchFieldStub = {
  template: '<div />',
  methods: {
    focus: () => {},
    getValue: () => '',
    setValue: () => {}
  }
}

const ScheduleStub = {
  name: 'Schedule',
  props: { hierarchy: { type: Array, default: () => [] } },
  template: '<div />',
  methods: {
    scrollToDate: () => {},
    scrollToToday: () => {}
  }
}

// Monday 31 August, one working day
const task = {
  id: 'task-1',
  estimation: 8 * 60,
  start_date: '2026-08-31T00:00:00',
  due_date: '2026-08-31T00:00:00'
}

const mountPage = async ({
  actions = {},
  getters = {},
  section = 'estimation'
} = {}) => {
  const storeActions = {
    clearSelectedTasks: vi.fn(),
    initTaskType: vi.fn(() => Promise.resolve()),
    updateTask: vi.fn(() => Promise.resolve()),
    ...actions
  }
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1', name: 'Production' }),
      currentTaskType: () => ({
        id: 'task-type-1',
        name: 'Modeling',
        for_entity: 'Asset'
      }),
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isPaperProduction: () => false,
      isTVShow: () => false,
      nbSelectedTasks: () => 0,
      organisation: () => ({ hours_by_day: 8 }),
      personMap: () => new Map(),
      productionTaskStatuses: () => [],
      selectedTasks: () => new Map(),
      taskMap: () => new Map([[task.id, task]]),
      taskMetadataDescriptors: () => [],
      taskSearchQueries: () => [],
      user: () => ({ id: 'manager-1', departments: [] }),
      ...getters
    },
    actions: storeActions
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/productions/:production_id/assets/task-types/:task_type_id/:section',
        component: { template: '<div />' }
      }
    ]
  })
  await router.push(
    `/productions/production-1/assets/task-types/task-type-1/${section}`
  )
  const wrapper = shallowMount(TaskType, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = { on: vi.fn(), off: vi.fn() }
            app.config.globalProperties.$t = key => key
          }
        }
      ],
      stubs: { Schedule: ScheduleStub, SearchField: SearchFieldStub }
    }
  })
  await flushPromises()
  return { storeActions, wrapper }
}

describe('TaskType page', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // The estimation helper and the schedule widget send the estimation in
  // minutes: the end date follows it.
  it('saves an estimation edited in the estimation tab', async () => {
    // the data load the page starts 100 ms after mounting is not under test
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { storeActions, wrapper } = await mountPage()

    wrapper
      .findComponent(EstimationHelper)
      .vm.$emit('estimation-changed', { taskId: 'task-1', estimation: 16 * 60 })
    await flushPromises()

    expect(storeActions.updateTask).toHaveBeenCalledTimes(1)
    expect(storeActions.updateTask.mock.calls[0][1]).toEqual({
      taskId: 'task-1',
      data: {
        estimation: 16 * 60,
        start_date: '2026-08-31',
        due_date: '2026-09-01'
      }
    })
    wrapper.unmount()
  })

  // Zou refuses a column named like another one of the task type: a close
  // keeps the error, the next opening drops it.
  describe('metadata column modal', () => {
    const descriptor = { id: 'descriptor-1', name: 'Difficulty' }
    // unmounted after each test, a failed one included
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      vi.restoreAllMocks()
    })

    it.each([
      [
        'a new column',
        () =>
          wrapper
            .findAllComponents(ButtonSimple)
            .find(button => button.props('icon') === 'plus')
            .vm.$emit('click')
      ],
      [
        'a column edit',
        () =>
          wrapper
            .findComponent(TaskList)
            .vm.$emit('edit-metadata', descriptor.id)
      ]
    ])('opens %s without the error of a refused column', async (_, open) => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      // the data load the page starts 100 ms after mounting is not under test
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const page = await mountPage({
        section: 'tasks',
        actions: {
          addMetadataDescriptor: vi.fn(() => Promise.reject(new Error('taken')))
        },
        getters: {
          currentProduction: () => ({
            id: 'production-1',
            name: 'Production',
            descriptors: [descriptor]
          })
        }
      })
      wrapper = page.wrapper
      const modal = () => wrapper.findComponent(AddMetadataModal)

      await open()
      await modal().vm.$emit('confirm', { name: 'Complexity' })
      await flushPromises()
      expect(modal().props('isError')).toBe(true)

      await modal().vm.$emit('cancel')
      await open()

      expect(modal().props('active')).toBe(true)
      expect(modal().props('isError')).toBe(false)
    })
  })

  // The timesheet stores a day logged with its preset in whole minutes, 498
  // for 8.3 hours by day, while 8.3 * 60 makes 498.00000000000006. What it
  // stored before keeps its float noise: 491.99999999999994 for 8.2 hours.
  describe('schedule timesheets', () => {
    const scheduleTask = {
      id: 'task-2',
      assignees: ['person-1'],
      entity_id: 'asset-1',
      entity_name: 'Chair',
      estimation: 0,
      start_date: '2026-10-05T00:00:00',
      due_date: '2026-10-09T00:00:00',
      task_status_id: 'status-1',
      task_type_id: 'task-type-1'
    }
    const person = {
      id: 'person-1',
      first_name: 'Alice',
      last_name: 'Smith',
      full_name: 'Alice Smith'
    }
    // unmounted after each test, a failed one included
    let wrapper = null

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      assetStore.cache.assetMap.set('asset-1', {
        id: 'asset-1',
        tasks: [scheduleTask.id]
      })
      localStorage.setItem(
        'tasktype:data_display',
        JSON.stringify({ timesheets: true })
      )
    })

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      assetStore.cache.assetMap.delete('asset-1')
      localStorage.removeItem('tasktype:data_display')
    })

    it.each([
      [8.3, 498],
      [8.2, 491.99999999999994]
    ])(
      'merges two full days in a row of %s hours',
      async (hoursByDay, minutes) => {
        const timeSpent = date => ({
          id: `time-spent-${date}`,
          date,
          duration: minutes,
          person_id: person.id,
          task_id: scheduleTask.id
        })
        const page = await mountPage({
          section: 'schedule',
          actions: {
            loadProductionDaysOff: vi.fn(() => ({})),
            loadProductionTimeSpents: vi.fn(() => ({
              [person.id]: [timeSpent('2026-10-06'), timeSpent('2026-10-05')]
            })),
            loadScheduleItems: vi.fn(() => [
              {
                id: 'schedule-item-1',
                task_type_id: 'task-type-1',
                start_date: '2026-10-01',
                end_date: '2026-10-30'
              }
            ]),
            saveScheduleItem: vi.fn()
          },
          getters: {
            assetValidationColumns: () => [],
            currentProduction: () => ({
              id: 'production-1',
              name: 'Production',
              start_date: '2026-01-01',
              end_date: '2026-12-31',
              team: [person.id]
            }),
            organisation: () => ({ hours_by_day: hoursByDay }),
            personMap: () => new Map([[person.id, person]]),
            taskMap: () => new Map([[scheduleTask.id, scheduleTask]]),
            user: () => ({
              id: 'manager-1',
              departments: [],
              full_name: 'Manager'
            })
          }
        })
        wrapper = page.wrapper
        // the data load starts 100 ms after mounting, the schedule dates
        // follow 200 ms after it
        await vi.advanceTimersByTimeAsync(400)
        await flushPromises()

        const [personRow] = wrapper
          .findComponent({ name: 'Schedule' })
          .props('hierarchy')
        expect(
          personRow.timesheet.map(({ date, duration }) => [date, duration])
        ).toEqual([['2026-10-05', minutes * 2]])
      }
    )
  })
})
