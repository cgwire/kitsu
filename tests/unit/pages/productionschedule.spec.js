import { flushPromises, shallowMount } from '@vue/test-utils'
import moment from 'moment-timezone'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import assetStore from '@/store/modules/assets'
import assetTypeStore from '@/store/modules/assettypes'
import taskTypeStore from '@/store/modules/tasktypes'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import ProductionSchedule from '@/components/pages/ProductionSchedule.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TextField from '@/components/widgets/TextField.vue'

// The page is driven through what it renders and what it calls: the
// schedule widget events, the comboboxes, the buttons and the modals, the
// route and the store actions. None of these tests reaches its internals.

const taskTypes = [
  {
    id: 'tt-modeling',
    name: 'Modeling',
    for_entity: 'Asset',
    color: '#111111',
    priority: 1
  },
  {
    id: 'tt-layout',
    name: 'Layout',
    for_entity: 'Shot',
    color: '#222222',
    priority: 1
  },
  {
    id: 'tt-animation',
    name: 'Animation',
    for_entity: 'Shot',
    color: '#333333',
    priority: 2
  }
]

const production = {
  id: 'production-1',
  name: 'Wing It',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  team: [],
  from_schedule_version_id: null
}

const unlockedVersion = {
  id: 'version-1',
  name: 'Plan B',
  created_at: '2026-09-01T10:00:00',
  locked: false,
  canceled: false
}

const buildTaskTypeBars = () => [
  {
    id: 'bar-modeling',
    task_type_id: 'tt-modeling',
    object_id: null,
    start_date: '2026-02-01',
    end_date: '2026-03-01'
  },
  {
    id: 'bar-layout',
    task_type_id: 'tt-layout',
    object_id: null,
    start_date: '2026-03-01',
    end_date: '2026-04-01'
  },
  {
    id: 'bar-animation',
    task_type_id: 'tt-animation',
    object_id: null,
    start_date: '2026-04-01',
    end_date: '2026-06-01'
  }
]

const buildAssetTypeBars = () => [
  {
    id: 'bar-props',
    task_type_id: 'tt-modeling',
    object_id: 'asset-type-props',
    name: 'Props',
    start_date: '2026-02-01',
    end_date: '2026-02-20'
  }
]

const people = [
  {
    id: 'person-1',
    active: true,
    departments: [],
    first_name: 'Alice',
    full_name: 'Alice Smith',
    role: 'user'
  },
  {
    id: 'person-2',
    active: true,
    departments: [],
    first_name: 'Bob',
    full_name: 'Bob Jones',
    role: 'user'
  }
]

const propAssets = [
  { id: 'asset-1', name: 'Chair', asset_type_id: 'asset-type-props' },
  { id: 'asset-2', name: 'Table', asset_type_id: 'asset-type-props' },
  { id: 'asset-3', name: 'Lamp', asset_type_id: 'asset-type-props' }
]

const day = date => moment.utc(date)
const format = date => date.format('YYYY-MM-DD')

// The page loads after a debounce of its own.
const waitForLoad = async () => {
  await new Promise(resolve => setTimeout(resolve, 60))
  await flushPromises()
}

// Unmounted after each test, a failed one included
let mountedPage = null

const mountPage = async ({
  actions = {},
  getters = {},
  query = {},
  stubs = {},
  versions = []
} = {}) => {
  const storeActions = {
    applyScheduleVersionToProduction: vi.fn(),
    assignSelectedTasks: vi.fn(),
    createScheduleVersionedTask: vi.fn(() => ({ id: 'versioned-task-1' })),
    editProduction: vi.fn(),
    loadAssetTypeScheduleItems: vi.fn(() => buildAssetTypeBars()),
    loadAssets: vi.fn(),
    loadProductionDaysOff: vi.fn(() => ({})),
    loadScheduleItems: vi.fn(() => buildTaskTypeBars()),
    loadScheduleVersions: vi.fn(({ state }) => state.scheduleVersions),
    loadSequenceScheduleItems: vi.fn(() => []),
    loadShots: vi.fn(),
    loadTasks: vi.fn(() => []),
    loadTasksFromScheduleVersion: vi.fn(() => []),
    saveScheduleItem: vi.fn(),
    unassignSelectedTasks: vi.fn(),
    updateScheduleVersionedTask: vi.fn(),
    updateTask: vi.fn(),
    ...actions
  }
  const store = createStore({
    state: { scheduleVersions: versions },
    mutations: {
      SET_VERSIONS(state, scheduleVersions) {
        state.scheduleVersions = scheduleVersions
      }
    },
    getters: {
      currentEpisode: () => null,
      currentProduction: () => production,
      dateFormat: () => 'YYYY-MM-DD',
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isTVShow: () => false,
      organisation: () => ({
        hours_by_day: 8,
        format_duration_in_hours: false
      }),
      personMap: () => new Map(),
      productionAssetTypes: () => [],
      scheduleVersions: state => state.scheduleVersions,
      use12HourClock: () => false,
      user: () => ({ id: 'manager-1', departments: [] }),
      ...getters
    },
    actions: storeActions
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/schedule', component: { template: '<div />' } }]
  })
  await router.push({ path: '/schedule', query })
  await router.isReady()

  const scheduleWidget = {
    name: 'Schedule',
    props: { hierarchy: { type: Array, default: () => [] } },
    template: '<div />',
    methods: {
      exportData: vi.fn(),
      refreshItemPositions: vi.fn(),
      resetSelection: vi.fn(),
      scrollToToday: vi.fn()
    }
  }
  const wrapper = shallowMount(ProductionSchedule, {
    global: {
      plugins: [store, router],
      // the values show, so a test can read the count of a plural message
      mocks: {
        $t: (key, values) => (values ? `${key} ${JSON.stringify(values)}` : key)
      },
      stubs: { Schedule: scheduleWidget, ...stubs }
    }
  })
  mountedPage = wrapper
  await waitForLoad()
  return { router, scheduleWidget, storeActions, wrapper }
}

const findSchedule = wrapper => wrapper.findComponent({ name: 'Schedule' })
const rowsOf = wrapper => findSchedule(wrapper).props('hierarchy')
const rowNames = wrapper => rowsOf(wrapper).map(row => row.name)
const payloadsOf = action => action.mock.calls.map(([, payload]) => payload)

const findButton = (wrapper, text) =>
  wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('text') === text)

const findCombobox = (wrapper, label) =>
  wrapper
    .findAllComponents(Combobox)
    .find(combobox => combobox.props('label') === label)

const findTextField = (wrapper, label) =>
  wrapper
    .findAllComponents(TextField)
    .find(field => field.props('label') === label)

const setTaskTypeVisible = async (wrapper, taskTypeId, value) => {
  wrapper
    .findComponent(ComboboxOptions)
    .vm.$emit('change', { key: taskTypeId, value })
  await flushPromises()
}

const toggleSidePanel = async wrapper => {
  findButton(wrapper, 'menu.assign_tasks').vm.$emit('click')
  await flushPromises()
}

const closeSidePanel = async wrapper => {
  await wrapper.find('.side-column .close-button').trigger('click')
  await flushPromises()
}

const pickTaskType = async (wrapper, taskTypeId) => {
  wrapper
    .findComponent(ComboboxTaskType)
    .vm.$emit('update:model-value', taskTypeId)
  await flushPromises()
}

const changeItem = async (wrapper, item) => {
  findSchedule(wrapper).vm.$emit('item-changed', item)
  await flushPromises()
}

// A click on a task bar opens the side panel on it, in task edit mode.
const selectTask = async (wrapper, entityTypeRow, task) => {
  findSchedule(wrapper).vm.$emit(
    'task-selected',
    rowsOf(wrapper)[0],
    entityTypeRow,
    task,
    [task]
  )
  await flushPromises()
}

describe('ProductionSchedule page', () => {
  beforeEach(() => {
    taskTypes.forEach(taskType => {
      taskTypeStore.cache.taskTypeMap.set(taskType.id, taskType)
    })
    assetTypeStore.cache.assetTypeMap.set('asset-type-props', {
      id: 'asset-type-props',
      name: 'Props',
      task_types: []
    })
  })

  afterEach(() => {
    mountedPage?.unmount()
    mountedPage = null
    taskTypeStore.cache.taskTypeMap.clear()
    assetTypeStore.cache.assetTypeMap.clear()
    assetStore.cache.assets = []
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('task type filter', () => {
    it('hides a type and keeps the types hidden outside the entity filter', async () => {
      const { router, wrapper } = await mountPage({
        query: { type: 'Shot', hiddenTypes: 'tt-modeling' }
      })
      const push = vi.spyOn(router, 'push')
      const replace = vi.spyOn(router, 'replace')

      expect(rowNames(wrapper)).toEqual(['Shot / Layout', 'Shot / Animation'])

      await setTaskTypeVisible(wrapper, 'tt-animation', false)

      expect(rowNames(wrapper)).toEqual(['Shot / Layout'])
      expect(router.currentRoute.value.query.hiddenTypes).toBe(
        'tt-modeling,tt-animation'
      )
      // one history entry per ticked checkbox would take as many Back presses
      expect(replace).toHaveBeenCalledTimes(1)
      expect(push).not.toHaveBeenCalled()
    })

    it('clears the query param once every type is shown again', async () => {
      const { router, wrapper } = await mountPage({
        query: { hiddenTypes: 'tt-animation' }
      })

      expect(rowNames(wrapper)).toEqual(['Asset / Modeling', 'Shot / Layout'])

      await setTaskTypeVisible(wrapper, 'tt-animation', true)

      expect(rowNames(wrapper)).toHaveLength(3)
      expect(router.currentRoute.value.query.hiddenTypes).toBeUndefined()
    })

    // Hidden rows leave the schedule while their tasks stay selected: the
    // next drag would move them out of sight.
    it('drops the selection when a type is hidden', async () => {
      const { scheduleWidget, wrapper } = await mountPage()
      await toggleSidePanel(wrapper)
      await pickTaskType(wrapper, 'tt-layout')

      await setTaskTypeVisible(wrapper, 'tt-animation', false)

      expect(scheduleWidget.methods.resetSelection).toHaveBeenCalled()
      expect(wrapper.find('.side-column').exists()).toBe(true)

      await setTaskTypeVisible(wrapper, 'tt-layout', false)

      expect(wrapper.find('.side-column').exists()).toBe(false)
    })

    it('ticks and counts the visible types of the current view', async () => {
      const { wrapper } = await mountPage({
        query: { hiddenTypes: 'tt-animation' }
      })
      const filter = wrapper.findComponent(ComboboxOptions)

      expect(filter.props('options')).toEqual([
        { label: 'Asset / Modeling', value: 'tt-modeling' },
        { label: 'Shot / Layout', value: 'tt-layout' },
        { label: 'Shot / Animation', value: 'tt-animation' }
      ])
      expect(filter.props('modelValue')).toEqual({
        'tt-modeling': true,
        'tt-layout': true,
        'tt-animation': false
      })
      expect(filter.props('title')).toBe('(2/3)')

      await setTaskTypeVisible(wrapper, 'tt-animation', true)

      expect(wrapper.findComponent(ComboboxOptions).props('title')).toBe(
        'main.all'
      )
    })

    // Without it the only type of an entity view, once hidden, would leave
    // no way to bring its row back.
    it('stays on screen while the only type of the view is hidden', async () => {
      const { wrapper } = await mountPage({
        query: { type: 'Asset', hiddenTypes: 'tt-modeling' }
      })

      expect(rowNames(wrapper)).toEqual([])
      expect(wrapper.findComponent(ComboboxOptions).exists()).toBe(true)
    })

    it('hides itself when a single type is left to choose from', async () => {
      const { wrapper } = await mountPage({ query: { type: 'Asset' } })

      expect(rowNames(wrapper)).toEqual(['Asset / Modeling'])
      expect(findCombobox(wrapper, 'schedule.mode')).toBeDefined()
      expect(wrapper.findComponent(ComboboxOptions).exists()).toBe(false)
    })
  })

  describe('side panel', () => {
    // The side panel lists every task type of the production: picking a
    // hidden one used to fill the panel while the schedule showed nothing.
    it('shows a hidden type again when the panel picks it', async () => {
      const { router, storeActions, wrapper } = await mountPage({
        query: { hiddenTypes: 'tt-animation' }
      })
      await toggleSidePanel(wrapper)

      await pickTaskType(wrapper, 'tt-animation')

      expect(rowNames(wrapper)).toContain('Shot / Animation')
      expect(router.currentRoute.value.query.hiddenTypes).toBeUndefined()
      expect(storeActions.loadSequenceScheduleItems).toHaveBeenCalled()
    })

    it('clears the entity filter and the task type filter at once', async () => {
      const { router, wrapper } = await mountPage({
        query: { type: 'Asset', hiddenTypes: 'tt-animation' }
      })
      await toggleSidePanel(wrapper)
      const push = vi.spyOn(router, 'push')
      const replace = vi.spyOn(router, 'replace')

      await pickTaskType(wrapper, 'tt-animation')

      expect(router.currentRoute.value.query.type).toBeUndefined()
      expect(router.currentRoute.value.query.hiddenTypes).toBeUndefined()
      expect(replace).toHaveBeenCalledTimes(1)
      expect(push).not.toHaveBeenCalled()
    })

    // Expanding a row selects it, and Expand all or the export expand the
    // hidden rows too: the last one would open the panel on a row out of
    // sight.
    it('opens empty when the row of its task type is hidden', async () => {
      const { storeActions, wrapper } = await mountPage()
      await toggleSidePanel(wrapper)
      await pickTaskType(wrapper, 'tt-animation')
      await closeSidePanel(wrapper)
      await setTaskTypeVisible(wrapper, 'tt-animation', false)
      const taskLoads = storeActions.loadTasks.mock.calls.length

      await toggleSidePanel(wrapper)

      expect(wrapper.find('.side-column').exists()).toBe(true)
      expect(
        wrapper.findComponent(ComboboxTaskType).props('modelValue')
      ).toBeFalsy()
      expect(storeActions.loadTasks).toHaveBeenCalledTimes(taskLoads)
    })

    it('opens on the row of its task type when the row is shown', async () => {
      const { storeActions, wrapper } = await mountPage()
      await toggleSidePanel(wrapper)
      await pickTaskType(wrapper, 'tt-layout')
      await closeSidePanel(wrapper)
      const taskLoads = storeActions.loadTasks.mock.calls.length

      await toggleSidePanel(wrapper)

      expect(wrapper.findComponent(ComboboxTaskType).props('modelValue')).toBe(
        'tt-layout'
      )
      expect(storeActions.loadTasks).toHaveBeenCalledTimes(taskLoads + 1)
    })

    // The estimation of a task is shown and typed in the unit printed next
    // to it, the one the organisation displays durations in.
    it.each([
      ['hours', true, 'schedule.hours', 8, 16],
      ['days', false, 'schedule.md', 1, 2]
    ])(
      'edits the estimation of a task in %s',
      async (_, isDurationInHours, unit, shown, typed) => {
        const { storeActions, wrapper } = await mountPage({
          getters: {
            organisation: () => ({
              hours_by_day: 8,
              format_duration_in_hours: isDurationInHours
            })
          }
        })
        // Monday 9 February, one working day
        const task = {
          type: 'Task',
          id: 'task-1',
          entity: { id: 'asset-1', name: 'Cat' },
          estimation: 8 * 60,
          assignees: [],
          startDate: day('2026-02-09'),
          endDate: day('2026-02-09')
        }
        await selectTask(wrapper, buildAssetTypeBars()[0], task)
        const field = findTextField(wrapper, 'main.estimation')

        expect(field.props('unitLabel')).toBe(unit)
        expect(field.props('modelValue')).toBe(shown)

        field.vm.$emit('update:model-value', typed)
        await wrapper.find('.side-column form').trigger('submit')
        await flushPromises()

        expect(payloadsOf(storeActions.updateTask)[0]).toEqual({
          taskId: 'task-1',
          data: {
            estimation: 16 * 60,
            start_date: '2026-02-09',
            due_date: '2026-02-10'
          }
        })
      }
    )

    // The field takes 0.01 steps: an estimation shown with more decimals
    // failed the form validation, and Apply did nothing.
    it.each([
      ['days', false, 500, '1.04', '2026-02-10'],
      ['hours', true, 50, '0.83', '2026-02-09']
    ])(
      'applies a task whose estimation has more decimals in %s',
      async (_, isDurationInHours, minutes, shown, dueDate) => {
        const { storeActions, wrapper } = await mountPage({
          getters: {
            organisation: () => ({
              hours_by_day: 8,
              format_duration_in_hours: isDurationInHours
            })
          },
          stubs: { TextField: false }
        })
        const task = {
          type: 'Task',
          id: 'task-1',
          entity: { id: 'asset-1', name: 'Cat' },
          estimation: minutes,
          assignees: [],
          startDate: day('2026-02-09'),
          endDate: day('2026-02-09')
        }
        await selectTask(wrapper, buildAssetTypeBars()[0], task)

        // what a click on Apply does, validation included
        wrapper.find('.side-column form').element.requestSubmit()
        await flushPromises()

        // the estimation left as shown keeps its minutes
        expect(payloadsOf(storeActions.updateTask)[0]).toEqual({
          taskId: 'task-1',
          data: {
            estimation: minutes,
            start_date: '2026-02-09',
            due_date: dueDate
          }
        })
        const field = wrapper.find('.side-column .estimation input')
        expect(field.element.value).toBe(shown)
      }
    )

    // Rounded to 0.01, an estimation under 0.005 showed as 0, which left
    // Apply disabled: the dates and assignees of the task could not be saved.
    it.each([
      ['days', false, 2],
      ['hours', true, 0.1]
    ])(
      'applies a task whose estimation rounds to 0 in %s',
      async (_, isDurationInHours, minutes) => {
        const { storeActions, wrapper } = await mountPage({
          getters: {
            organisation: () => ({
              hours_by_day: 8,
              format_duration_in_hours: isDurationInHours
            })
          },
          stubs: { TextField: false }
        })
        const task = {
          type: 'Task',
          id: 'task-1',
          entity: { id: 'asset-1', name: 'Cat' },
          estimation: minutes,
          assignees: [],
          startDate: day('2026-02-09'),
          endDate: day('2026-02-09')
        }
        await selectTask(wrapper, buildAssetTypeBars()[0], task)

        expect(findButton(wrapper, 'main.apply').props('disabled')).toBe(false)
        wrapper.find('.side-column form').element.requestSubmit()
        await flushPromises()

        expect(payloadsOf(storeActions.updateTask)[0]).toEqual({
          taskId: 'task-1',
          data: {
            estimation: minutes,
            start_date: '2026-02-09',
            due_date: '2026-02-09'
          }
        })
        const field = wrapper.find('.side-column .estimation input')
        expect(field.element.value).toBe('0')
      }
    )

    // A 0 typed once the task is saved stands for no estimation, not for
    // the minutes the task had before that save.
    it('disables Apply for a cleared estimation and for a 0 typed after a save', async () => {
      const { storeActions, wrapper } = await mountPage()
      const task = {
        type: 'Task',
        id: 'task-1',
        entity: { id: 'asset-1', name: 'Cat' },
        estimation: 2,
        assignees: [],
        startDate: day('2026-02-09'),
        endDate: day('2026-02-09')
      }
      await selectTask(wrapper, buildAssetTypeBars()[0], task)
      const typeEstimation = async value => {
        findTextField(wrapper, 'main.estimation').vm.$emit(
          'update:model-value',
          value
        )
        await flushPromises()
      }
      const isApplyDisabled = () =>
        findButton(wrapper, 'main.apply').props('disabled')

      await typeEstimation(null)
      expect(isApplyDisabled()).toBe(true)

      await typeEstimation(1)
      await wrapper.find('.side-column form').trigger('submit')
      await flushPromises()
      expect(payloadsOf(storeActions.updateTask)[0].data.estimation).toBe(480)

      await typeEstimation(0)
      expect(isApplyDisabled()).toBe(true)
    })
  })

  describe('drill-down', () => {
    it('loads the days off of the schedule range when a row expands', async () => {
      const { storeActions, wrapper } = await mountPage()

      findSchedule(wrapper).vm.$emit('root-element-expanded', rowsOf(wrapper)[0])
      await waitForLoad()

      expect(payloadsOf(storeActions.loadProductionDaysOff)).toEqual([
        { startDate: '2026-01-01', endDate: '2026-12-31' }
      ])
      expect(rowsOf(wrapper)[0].children.map(row => row.name)).toEqual([
        'Props'
      ])
    })
  })

  describe('route', () => {
    it('pushes a history entry when the mode changes', async () => {
      const { router, wrapper } = await mountPage()
      const push = vi.spyOn(router, 'push')
      const replace = vi.spyOn(router, 'replace')

      findCombobox(wrapper, 'schedule.mode').vm.$emit(
        'update:model-value',
        'real'
      )
      await flushPromises()

      expect(router.currentRoute.value.query.mode).toBe('real')
      expect(push).toHaveBeenCalledTimes(1)
      expect(replace).not.toHaveBeenCalled()
    })
  })

  // The date fields of the page are utc ones: they hold a day at UTC
  // midnight. At 00:30 local time, east of UTC, the UTC day is still the
  // day before.
  describe('default dates', () => {
    const today = new Date('2026-10-06T00:00:00.000Z')
    const fieldDates = parent =>
      parent
        .findAllComponents({ name: 'DateField' })
        .map(field => field.props('modelValue'))

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 9, 6, 0, 30))
    })

    afterEach(() => {
      vi.useRealTimers()
      assetStore.cache.assets = []
      assetStore.cache.assetMap.clear()
    })

    it('dates an assignment from the panel on the local day', async () => {
      const asset = {
        id: 'asset-1',
        name: 'Chair',
        asset_type_id: 'asset-type-props'
      }
      assetStore.cache.assets = [asset]
      assetStore.cache.assetMap.set(asset.id, asset)
      const { wrapper } = await mountPage({
        actions: {
          loadTasks: vi.fn(() => [
            {
              id: 'task-1',
              entity_id: 'asset-1',
              task_type_id: 'tt-modeling',
              assignees: []
            }
          ])
        },
        getters: {
          productionAssetTypes: () => [
            { id: 'asset-type-props', name: 'Props', task_types: [] }
          ]
        }
      })
      await toggleSidePanel(wrapper)
      await pickTaskType(wrapper, 'tt-modeling')

      await wrapper.find('.side-column .assignment-item').trigger('click')

      expect(fieldDates(wrapper.find('.side-column'))).toEqual([today, today])
    })

    it('ranges a production without dates from the local day', async () => {
      const { wrapper } = await mountPage({
        getters: {
          currentProduction: () => ({
            ...production,
            start_date: null,
            end_date: null
          })
        }
      })

      expect(fieldDates(wrapper.find('.project-dates'))).toEqual([
        today,
        new Date('2027-04-06T23:59:59.999Z')
      ])
    })
  })

  describe('bar and task changes', () => {
    const buildBar = (start, end) => ({
      start_date: '2026-03-01',
      end_date: '2026-03-02',
      startDate: day(start),
      endDate: day(end)
    })

    // Monday 9 February, one working day
    const buildVersionedTask = (assignees, parentElement) => ({
      type: 'Task',
      id: 'task-1',
      versionedTaskId: 'link-1',
      estimation: 8 * 60,
      assignees,
      startDate: day('2026-02-09'),
      endDate: day('2026-02-09'),
      parentElement
    })

    // The drill-down groups unassigned tasks under a local 'unassigned' row
    // that is not a person id known to the API.
    it('drops the unassigned placeholder when a task of a version moves', async () => {
      const { storeActions, wrapper } = await mountPage({
        query: { version: unlockedVersion.id },
        versions: [unlockedVersion]
      })
      const entityBar = buildBar('2026-02-02', '2026-02-27')
      entityBar.parentElement = rowsOf(wrapper)[0]

      await changeItem(wrapper, buildVersionedTask(['unassigned'], entityBar))
      await changeItem(wrapper, buildVersionedTask(['person-1'], entityBar))

      expect(payloadsOf(storeActions.updateScheduleVersionedTask)).toEqual([
        {
          id: 'link-1',
          estimation: 480,
          startDate: '2026-02-09',
          dueDate: '2026-02-09',
          assignees: []
        },
        {
          id: 'link-1',
          estimation: 480,
          startDate: '2026-02-09',
          dueDate: '2026-02-09',
          assignees: ['person-1']
        }
      ])
      expect(storeActions.updateTask).not.toHaveBeenCalled()
    })

    // The Excel export and the side panel date ranges read the raw
    // start_date / end_date strings, while a drag moves the moments.
    it('saves a moved entity bar and its task type bar with their raw dates', async () => {
      const { storeActions, wrapper } = await mountPage()
      const taskTypeBar = rowsOf(wrapper)[0]
      const movedBar = buildBar('2026-04-01', '2026-04-10')
      const otherBar = buildBar('2026-05-01', '2026-05-20')
      taskTypeBar.children = [movedBar, otherBar]
      movedBar.parentElement = taskTypeBar
      otherBar.parentElement = taskTypeBar

      await changeItem(wrapper, movedBar)

      const saved = payloadsOf(storeActions.saveScheduleItem)
      expect(saved.map(bar => [bar.start_date, bar.end_date])).toEqual([
        ['2026-04-01', '2026-05-20'],
        ['2026-04-01', '2026-04-10']
      ])
      expect(saved[0].id).toBe('bar-modeling')
    })

    // An episode view only holds the sequences and edits of that episode,
    // and the main pack view its asset types, while the task type bar spans
    // the whole production: their dates can widen it, never shrink it.
    it.each([
      ['an episode', { id: 'episode-3', name: 'E03' }],
      ['the main pack', { id: 'main', name: 'Main Pack' }]
    ])('never shrinks the task type bar from %s view', async (_, episode) => {
      const { storeActions, wrapper } = await mountPage({
        getters: {
          currentEpisode: () => episode,
          isTVShow: () => true
        }
      })
      const taskTypeBar = rowsOf(wrapper)[0]
      const movedBar = buildBar('2026-02-10', '2026-02-20')
      taskTypeBar.children = [movedBar]
      movedBar.parentElement = taskTypeBar

      await changeItem(wrapper, movedBar)

      expect(format(taskTypeBar.startDate)).toBe('2026-02-01')
      expect(format(taskTypeBar.endDate)).toBe('2026-03-01')
      expect(payloadsOf(storeActions.saveScheduleItem)).toEqual([movedBar])

      movedBar.endDate = day('2026-03-15')
      await changeItem(wrapper, movedBar)

      expect(format(taskTypeBar.startDate)).toBe('2026-02-01')
      expect(taskTypeBar.end_date).toBe('2026-03-15')
      expect(payloadsOf(storeActions.saveScheduleItem)[1].id).toBe(
        'bar-modeling'
      )
    })

    // A task stretching past both ends of its bars must save each bar once
    // with its two new dates: two requests racing could keep a stale end.
    it('saves each bar a task widens once', async () => {
      const { storeActions, wrapper } = await mountPage()
      const taskTypeBar = buildBar('2026-01-06', '2026-01-15')
      const entityBar = buildBar('2026-01-07', '2026-01-14')
      entityBar.parentElement = taskTypeBar
      // Monday 5 to Friday 16: ten working days
      const task = {
        type: 'Task',
        id: 'task-1',
        assignees: [],
        estimation: 10 * 8 * 60,
        startDate: day('2026-01-05'),
        endDate: day('2026-01-16'),
        parentElement: entityBar
      }

      await changeItem(wrapper, task)

      expect(payloadsOf(storeActions.saveScheduleItem)).toEqual([
        entityBar,
        taskTypeBar
      ])
      expect(
        [entityBar, taskTypeBar].map(bar => [bar.start_date, bar.end_date])
      ).toEqual([
        ['2026-01-05', '2026-01-16'],
        ['2026-01-05', '2026-01-16']
      ])
      expect(payloadsOf(storeActions.updateTask)).toEqual([
        {
          taskId: 'task-1',
          data: {
            estimation: 4800,
            start_date: '2026-01-05',
            due_date: '2026-01-16'
          }
        }
      ])
    })
  })

  // Applying a version locks it: the rows built while it was open must be
  // rebuilt read-only, once the version list says it is locked.
  describe('apply to production', () => {
    const applyVersion = async wrapper => {
      findButton(wrapper, 'schedule.apply_to_prod').vm.$emit('click')
      await flushPromises()
      wrapper.findComponent(ConfirmModal).vm.$emit('confirm')
      await waitForLoad()
    }

    const expandFirstRow = async wrapper => {
      findSchedule(wrapper).vm.$emit('root-element-expanded', rowsOf(wrapper)[0])
      await waitForLoad()
    }

    // The apply locks the version on the server only: the page learns it
    // from the version list it reloads afterwards.
    it('rebuilds the rows read-only once the version is applied', async () => {
      let isLockedOnServer = false
      const { scheduleWidget, storeActions, wrapper } = await mountPage({
        actions: {
          applyScheduleVersionToProduction: vi.fn(() => {
            isLockedOnServer = true
          }),
          loadScheduleVersions: vi.fn(({ commit, state }) => {
            if (isLockedOnServer) {
              commit(
                'SET_VERSIONS',
                state.scheduleVersions.map(version => ({
                  ...version,
                  locked: true
                }))
              )
            }
            return state.scheduleVersions
          })
        },
        query: { version: unlockedVersion.id },
        versions: [unlockedVersion]
      })
      await expandFirstRow(wrapper)
      await toggleSidePanel(wrapper)
      await pickTaskType(wrapper, 'tt-layout')
      const selectionResets =
        scheduleWidget.methods.resetSelection.mock.calls.length
      expect(rowsOf(wrapper).every(row => row.editable)).toBe(true)
      expect(rowsOf(wrapper)[0].children[0].editable).toBe(true)

      await applyVersion(wrapper)

      expect(payloadsOf(storeActions.applyScheduleVersionToProduction)).toEqual(
        [unlockedVersion.id]
      )
      expect(rowsOf(wrapper).some(row => row.editable)).toBe(false)
      expect(storeActions.loadAssetTypeScheduleItems).toHaveBeenCalledTimes(2)
      expect(rowsOf(wrapper)[0].children[0].editable).toBe(false)
      // the side panel leaves with the selection it worked on
      expect(scheduleWidget.methods.resetSelection).toHaveBeenCalledTimes(
        selectionResets + 1
      )
    })

    it('leaves the rows editable when the apply fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { storeActions, wrapper } = await mountPage({
        actions: {
          applyScheduleVersionToProduction: vi.fn(() =>
            Promise.reject(new Error('refused'))
          )
        },
        query: { version: unlockedVersion.id },
        versions: [unlockedVersion]
      })
      await expandFirstRow(wrapper)

      await applyVersion(wrapper)

      expect(wrapper.findComponent(ConfirmModal).props('isError')).toBe(true)
      expect(rowsOf(wrapper).every(row => row.editable)).toBe(true)
      expect(storeActions.loadAssetTypeScheduleItems).toHaveBeenCalledTimes(1)
    })
  })

  // The side panel assigns the props of the Modeling row to a team of two.
  describe('task assignments', () => {
    const versionOptions = {
      query: { version: unlockedVersion.id },
      versions: [unlockedVersion]
    }

    const mountAssignments = ({
      actions = {},
      nbAssets = 2,
      ...options
    } = {}) => {
      const assets = propAssets.slice(0, nbAssets)
      assetStore.cache.assets = assets
      return mountPage({
        ...options,
        actions: {
          loadTasks: vi.fn(() =>
            assets.map(asset => ({
              id: `task-${asset.id}`,
              entity_id: asset.id,
              assignees: []
            }))
          ),
          ...actions
        },
        getters: {
          currentProduction: () => ({
            ...production,
            team: people.map(person => person.id)
          }),
          personMap: () => new Map(people.map(person => [person.id, person])),
          productionAssetTypes: () => [
            { id: 'asset-type-props', name: 'Props', task_types: [] }
          ]
        }
      })
    }

    const selectProps = async wrapper => {
      await toggleSidePanel(wrapper)
      await pickTaskType(wrapper, 'tt-modeling')
      await wrapper.find('.side-column .assignment-item').trigger('click')
    }

    // Monday 6 to Wednesday 8 April: three working days. A null start keeps
    // the one the panel opened with.
    const setRange = async (
      wrapper,
      startDate = '2026-04-06',
      endDate = '2026-04-08'
    ) => {
      const [startField, endField] = wrapper
        .find('.side-column form')
        .findAllComponents(DateField)
      if (startDate) startField.vm.$emit('update:model-value', startDate)
      endField.vm.$emit('update:model-value', endDate)
      await flushPromises()
    }

    const forceQuota = async (wrapper, quota) => {
      wrapper
        .find('.side-column form')
        .findComponent(TextField)
        .vm.$emit('update:model-value', quota)
      await flushPromises()
    }

    const overrideAssignments = async wrapper => {
      wrapper
        .find('.side-column form')
        .findComponent(Checkbox)
        .vm.$emit('update:model-value', true)
      await flushPromises()
    }

    const apply = async wrapper => {
      await wrapper.find('.side-column form').trigger('submit')
      await flushPromises()
    }

    const panelText = wrapper => wrapper.find('.side-column').text()

    const writesOf = storeActions =>
      [
        'assignSelectedTasks',
        'createScheduleVersionedTask',
        'unassignSelectedTasks',
        'updateScheduleVersionedTask',
        'updateTask'
      ].filter(action => storeActions[action].mock.calls.length)

    // A refused request left the Apply button spinning for good, with no
    // word of the failure.
    it.each([
      ['the reference', {}, 'updateTask'],
      ['a version', versionOptions, 'createScheduleVersionedTask']
    ])(
      'stops the spinner and tells when a save of %s fails',
      async (_, options, saveAction) => {
        const error = new Error('Bad request')
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const { wrapper } = await mountAssignments({
          ...options,
          actions: { [saveAction]: vi.fn(() => Promise.reject(error)) }
        })
        await selectProps(wrapper)
        await setRange(wrapper)

        await apply(wrapper)

        expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(
          false
        )
        expect(panelText(wrapper)).toContain('schedule.assign_error')
        expect(consoleError).toHaveBeenCalledWith(error)
      }
    )

    it('clears the error when Apply runs again', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { storeActions, wrapper } = await mountAssignments({
        actions: {
          updateTask: vi.fn().mockRejectedValueOnce(new Error('Bad request'))
        }
      })
      await selectProps(wrapper)
      await setRange(wrapper)
      await apply(wrapper)
      expect(panelText(wrapper)).toContain('schedule.assign_error')

      await apply(wrapper)

      expect(panelText(wrapper)).not.toContain('schedule.assign_error')
      expect(payloadsOf(storeActions.assignSelectedTasks)).toEqual([
        { personId: 'person-1', taskIds: ['task-asset-1'] },
        { personId: 'person-2', taskIds: ['task-asset-2'] }
      ])
    })

    // The panel moved on to a task while the run waited on its requests:
    // the failure of the run showed under the task, and stopped the
    // spinner of the task save.
    it('keeps a failed run out of the task the panel moved on to', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const saves = []
      const { wrapper } = await mountAssignments({
        actions: {
          updateTask: vi.fn(
            () => new Promise((_resolve, reject) => saves.push(reject))
          )
        }
      })
      await selectProps(wrapper)
      await setRange(wrapper)
      await apply(wrapper)
      const runSaves = [...saves]
      const task = {
        id: 'task-asset-1',
        type: 'Task',
        assignees: ['person-1'],
        entity: propAssets[0],
        estimation: 480,
        startDate: day('2026-04-06'),
        endDate: day('2026-04-06')
      }
      findSchedule(wrapper).vm.$emit(
        'task-selected',
        rowsOf(wrapper)[0],
        { id: 'asset-type-props', name: 'Props' },
        task,
        [task]
      )
      await flushPromises()
      await apply(wrapper)

      runSaves.forEach(reject => reject(new Error('Bad request')))
      await flushPromises()

      expect(panelText(wrapper)).toContain('schedule.edit_task')
      expect(panelText(wrapper)).not.toContain('schedule.assign_error')
      expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(true)
    })

    const goBack = wrapper =>
      wrapper.find('.side-column button.is-link').trigger('click')

    const panelReuses = [
      [
        'a new selection',
        async wrapper => {
          await goBack(wrapper)
          await wrapper.find('.side-column .assignment-item').trigger('click')
        }
      ],
      [
        'a drop on the schedule',
        async wrapper => {
          await goBack(wrapper)
          findSchedule(wrapper).vm.$emit(
            'item-drop',
            { start_date: '2026-04-06' },
            { start_date: '2026-04-06', end_date: '2026-04-08' }
          )
          await flushPromises()
        }
      ],
      ['another task type', wrapper => pickTaskType(wrapper, 'tt-layout')],
      [
        'a task edit',
        async wrapper => {
          const task = {
            id: 'task-asset-1',
            assignees: [],
            entity: propAssets[0],
            estimation: 480,
            startDate: day('2026-04-06'),
            endDate: day('2026-04-06')
          }
          findSchedule(wrapper).vm.$emit(
            'task-selected',
            rowsOf(wrapper)[0],
            { id: 'asset-type-props', name: 'Props' },
            task,
            [task]
          )
          await flushPromises()
        }
      ]
    ]

    it.each(panelReuses)(
      'clears the error when the panel goes on with %s',
      async (_, reuse) => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const { wrapper } = await mountAssignments({
          actions: {
            updateTask: vi.fn(() => Promise.reject(new Error('Bad request')))
          }
        })
        await selectProps(wrapper)
        await setRange(wrapper)
        await apply(wrapper)
        expect(panelText(wrapper)).toContain('schedule.assign_error')

        await reuse(wrapper)

        expect(wrapper.find('.side-column form').exists()).toBe(true)
        expect(panelText(wrapper)).not.toContain('schedule.assign_error')
      }
    )

    // The bars of the tasks show once the Modeling row is expanded.
    const editTask = async (wrapper, task) => {
      const modelingRow = rowsOf(wrapper)[0]
      if (!modelingRow.expanded) {
        findSchedule(wrapper).vm.$emit('root-element-expanded', modelingRow)
        await waitForLoad()
      }
      await selectTask(wrapper, { id: 'asset-type-props', name: 'Props' }, task)
    }

    // One working day, assigned to Alice: Chair on Monday 6 April, Table on
    // Monday 13 April
    const buildTask = (asset, date) => ({
      id: `task-${asset.id}`,
      type: 'Task',
      assignees: ['person-1'],
      entity: asset,
      estimation: 480,
      startDate: day(date),
      endDate: day(date)
    })
    const buildChairTask = () => buildTask(propAssets[0], '2026-04-06')
    const buildTableTask = () => buildTask(propAssets[1], '2026-04-13')

    // A refused task save only reached the console: the panel kept the
    // typed values as if they were saved.
    it.each([
      ['the reference', {}, 'updateTask'],
      ['a version', versionOptions, 'updateScheduleVersionedTask']
    ])(
      'stops the spinner and tells when a task edit of %s fails',
      async (_, options, saveAction) => {
        const error = new Error('Bad request')
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const { wrapper } = await mountAssignments({
          ...options,
          actions: { [saveAction]: vi.fn(() => Promise.reject(error)) }
        })
        await editTask(wrapper, buildChairTask())

        await apply(wrapper)

        expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(false)
        expect(panelText(wrapper)).toContain('schedule.save_task_error')
        expect(panelText(wrapper)).not.toContain('schedule.assign_error')
        expect(consoleError).toHaveBeenCalledWith(error)
      }
    )

    it('clears the task error when Apply runs again', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { storeActions, wrapper } = await mountAssignments({
        actions: {
          updateTask: vi.fn().mockRejectedValueOnce(new Error('Bad request'))
        }
      })
      await editTask(wrapper, buildChairTask())
      await apply(wrapper)
      expect(panelText(wrapper)).toContain('schedule.save_task_error')

      await apply(wrapper)

      expect(panelText(wrapper)).not.toContain('schedule.save_task_error')
      expect(payloadsOf(storeActions.updateTask).slice(1)).toEqual([
        {
          taskId: 'task-asset-1',
          data: {
            estimation: 480,
            start_date: '2026-04-06',
            due_date: '2026-04-06'
          }
        },
        { taskId: 'task-asset-1', data: { assignees: ['person-1'] } }
      ])
    })

    it.each([
      ['another task', wrapper => editTask(wrapper, buildTableTask())],
      ['another task type', wrapper => pickTaskType(wrapper, 'tt-layout')],
      [
        'the assign mode',
        async wrapper => {
          await toggleSidePanel(wrapper)
          await wrapper.find('.side-column .assignment-item').trigger('click')
        }
      ]
    ])(
      'clears the task error when the panel goes on with %s',
      async (_, reuse) => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const { wrapper } = await mountAssignments({
          actions: {
            updateTask: vi.fn(() => Promise.reject(new Error('Bad request')))
          }
        })
        await editTask(wrapper, buildChairTask())
        await apply(wrapper)
        expect(panelText(wrapper)).toContain('schedule.save_task_error')

        await reuse(wrapper)

        expect(wrapper.find('.side-column form').exists()).toBe(true)
        expect(panelText(wrapper)).not.toContain('schedule.save_task_error')
        expect(panelText(wrapper)).not.toContain('schedule.assign_error')
      }
    )

    // The panel moved on to another task while the save waited on its
    // request: the end of the save stopped the spinner of the next one.
    it('keeps a failed task save out of the task the panel moved on to', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const saves = []
      const { wrapper } = await mountAssignments({
        actions: {
          updateTask: vi.fn(
            () => new Promise((_resolve, reject) => saves.push(reject))
          )
        }
      })
      await editTask(wrapper, buildChairTask())
      await apply(wrapper)
      const chairSaves = [...saves]
      await editTask(wrapper, buildTableTask())
      await apply(wrapper)

      chairSaves.forEach(reject => reject(new Error('Bad request')))
      await flushPromises()

      expect(panelText(wrapper)).not.toContain('schedule.save_task_error')
      expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(true)
    })

    // A task save that failed once Assign tasks had replaced the task form
    // showed as an assignment error.
    it('keeps a failed task save out of the assign mode the panel went on to', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const saves = []
      const { wrapper } = await mountAssignments({
        actions: {
          updateTask: vi
            .fn()
            .mockResolvedValueOnce()
            .mockResolvedValueOnce()
            .mockImplementation(
              () => new Promise((_resolve, reject) => saves.push(reject))
            )
        }
      })
      await editTask(wrapper, buildChairTask())
      await apply(wrapper)
      await apply(wrapper)
      await toggleSidePanel(wrapper)
      await wrapper.find('.side-column .assignment-item').trigger('click')

      saves.forEach(reject => reject(new Error('Bad request')))
      await flushPromises()

      expect(wrapper.find('.side-column h2').text()).toBe('menu.assign_tasks')
      expect(wrapper.find('.side-column form').exists()).toBe(true)
      expect(panelText(wrapper)).not.toContain('schedule.assign_error')
      expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(false)
    })

    // After a saved task edit, Assign tasks kept the state of the task form:
    // only the assignees of that task listed, and Override on. The next run
    // then cleared the assignees of the tasks it gave them.
    it('starts Assign tasks from a clean panel after a task edit', async () => {
      const { storeActions, wrapper } = await mountAssignments()
      await editTask(wrapper, buildChairTask())
      await apply(wrapper)

      await toggleSidePanel(wrapper)
      await wrapper.find('.side-column .assignment-item').trigger('click')

      expect(
        wrapper.findComponent(ComboboxTaskType).props('modelValue')
      ).toBe('tt-modeling')
      expect(
        wrapper
          .find('.side-column table.assignees')
          .findAllComponents(PeopleName)
          .map(name => name.props('person').id)
      ).toEqual(['person-1', 'person-2'])
      expect(
        wrapper.find('.side-column form').findComponent(Checkbox).props()
      ).toMatchObject({ disabled: false, modelValue: false })

      await setRange(wrapper)
      await apply(wrapper)

      expect(storeActions.unassignSelectedTasks).not.toHaveBeenCalled()
      expect(payloadsOf(storeActions.assignSelectedTasks)).toEqual([
        { personId: 'person-1', taskIds: ['task-asset-1'] },
        { personId: 'person-2', taskIds: ['task-asset-2'] }
      ])
    })

    // With the row of the edited task hidden, the panel dropped its task
    // type but kept listing its entity types: a click on one broke it.
    it('opens Assign tasks empty after a task edit once its row is hidden', async () => {
      const { wrapper } = await mountAssignments()
      await editTask(wrapper, buildChairTask())
      await apply(wrapper)
      findCombobox(wrapper, 'main.entities').vm.$emit(
        'update:model-value',
        'Shot'
      )
      await flushPromises()

      await toggleSidePanel(wrapper)

      expect(
        wrapper.findComponent(ComboboxTaskType).props('modelValue')
      ).toBeFalsy()
      expect(wrapper.findAll('.side-column .assignment-item')).toHaveLength(0)
    })

    // The save of a task wrote its dates into the form of the task the
    // panel had moved on to.
    it('keeps the dates of a task save out of the task the panel moved on to', async () => {
      const saves = []
      const { wrapper } = await mountAssignments({
        actions: {
          updateTask: vi.fn(() => new Promise(resolve => saves.push(resolve)))
        }
      })
      await editTask(wrapper, buildChairTask())
      await apply(wrapper)
      await editTask(wrapper, buildTableTask())

      while (saves.length) {
        saves.shift()()
        await flushPromises()
      }

      const [, , taskStartField] = wrapper
        .find('.side-column form')
        .findAllComponents(DateField)
      expect(taskStartField.props('modelValue')).toBe('2026-04-13')
    })

    // Answers the held requests one by one, the requests they lead to
    // included.
    const releaseAll = async requests => {
      while (requests.length) {
        requests.shift()({ id: 'versioned-task-1' })
        await flushPromises()
      }
    }

    // The Apply button spins while the panel saves, but Enter in a field of
    // the form still submitted it: a second run sent its writes again,
    // interleaved with the first.
    it.each([
      ['the reference', {}, 'updateTask'],
      ['a version', versionOptions, 'createScheduleVersionedTask']
    ])(
      'ignores Apply while a run of %s is saving',
      async (_, options, writeAction) => {
        const writes = []
        const { storeActions, wrapper } = await mountAssignments({
          ...options,
          actions: {
            [writeAction]: vi.fn(
              () => new Promise(resolve => writes.push(resolve))
            )
          }
        })
        await selectProps(wrapper)
        await setRange(wrapper)
        await apply(wrapper)

        await apply(wrapper)
        expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(true)
        await releaseAll(writes)

        expect(
          payloadsOf(storeActions[writeAction]).map(payload => payload.taskId)
        ).toEqual(['task-asset-1', 'task-asset-2'])
        expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(false)
      }
    )

    it.each([
      ['the reference', {}, 'updateTask', 2],
      ['a version', versionOptions, 'updateScheduleVersionedTask', 1]
    ])(
      'ignores Apply while a task edit of %s is saving',
      async (_, options, saveAction, nbSaves) => {
        const saves = []
        const { storeActions, wrapper } = await mountAssignments({
          ...options,
          actions: {
            [saveAction]: vi.fn(
              () => new Promise(resolve => saves.push(resolve))
            )
          }
        })
        await editTask(wrapper, buildChairTask())
        await apply(wrapper)

        await apply(wrapper)
        expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(true)
        await releaseAll(saves)

        expect(storeActions[saveAction]).toHaveBeenCalledTimes(nbSaves)
        expect(findButton(wrapper, 'main.apply').props('isLoading')).toBe(false)
      }
    )

    // Each task goes to a single person, but the auto quota shared every
    // task among the whole team: with fewer entities than people, no task
    // fitted the range and Apply did nothing.
    it('fits the task of a single entity to one person', async () => {
      const { storeActions, wrapper } = await mountAssignments({ nbAssets: 1 })
      await selectProps(wrapper)
      await setRange(wrapper)

      expect(panelText(wrapper)).toContain(
        'schedule.estimated_daily_quotas 0.33'
      )

      await apply(wrapper)

      expect(payloadsOf(storeActions.updateTask)).toEqual([
        {
          taskId: 'task-asset-1',
          data: {
            estimation: 3 * 8 * 60,
            start_date: '2026-04-06',
            due_date: '2026-04-08'
          }
        }
      ])
      expect(payloadsOf(storeActions.assignSelectedTasks)).toEqual([
        { personId: 'person-1', taskIds: ['task-asset-1'] }
      ])
      expect(panelText(wrapper)).not.toContain('schedule.assign_no_fit')
    })

    // The panel opens on today at the current time: the day count left
    // that first day out once the end date was picked.
    it('counts the first day of a range that starts now', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-04-06T10:30:00Z'))
      const { storeActions, wrapper } = await mountAssignments()
      await selectProps(wrapper)
      await setRange(wrapper, null, '2026-04-07')

      expect(panelText(wrapper)).toContain(
        'schedule.estimated_daily_quotas 0.50'
      )

      await apply(wrapper)

      const twoDays = {
        estimation: 2 * 8 * 60,
        start_date: '2026-04-06',
        due_date: '2026-04-07'
      }
      expect(payloadsOf(storeActions.updateTask)).toEqual([
        { taskId: 'task-asset-1', data: twoDays },
        { taskId: 'task-asset-2', data: twoDays }
      ])
    })

    // 1 / (1 / 49) is 49.00000000000001 days: rounded up, the task outlasted
    // the range by a day and fitted nobody.
    it('fits a task as long as the range', async () => {
      const { storeActions, wrapper } = await mountAssignments({ nbAssets: 1 })
      await selectProps(wrapper)
      // Monday 6 April to Thursday 11 June: 49 working days
      await setRange(wrapper, '2026-04-06', '2026-06-11')

      await apply(wrapper)

      expect(payloadsOf(storeActions.updateTask)).toEqual([
        {
          taskId: 'task-asset-1',
          data: {
            estimation: 49 * 8 * 60,
            start_date: '2026-04-06',
            due_date: '2026-06-11'
          }
        }
      ])
      expect(panelText(wrapper)).not.toContain('schedule.assign_no_fit')
    })

    // The same noise ended the first task of 49 days a day late and pushed
    // the second one out of the range.
    it('chains tasks of whole days for one person', async () => {
      const { storeActions, wrapper } = await mountAssignments()
      await selectProps(wrapper)
      // Monday 6 April to Wednesday 19 August: 98 working days
      await setRange(wrapper, '2026-04-06', '2026-08-19')
      const [, removeBob] = wrapper
        .find('.side-column table.assignees')
        .findAllComponents(ButtonSimple)
      removeBob.vm.$emit('click')
      await flushPromises()

      await apply(wrapper)

      const estimation = 49 * 8 * 60
      expect(payloadsOf(storeActions.updateTask)).toEqual([
        {
          taskId: 'task-asset-1',
          data: { estimation, start_date: '2026-04-06', due_date: '2026-06-11' }
        },
        {
          taskId: 'task-asset-2',
          data: { estimation, start_date: '2026-06-12', due_date: '2026-08-19' }
        }
      ])
      expect(payloadsOf(storeActions.assignSelectedTasks)).toEqual([
        { personId: 'person-1', taskIds: ['task-asset-1', 'task-asset-2'] }
      ])
    })

    // 1 / (3 / 17) is 5.666666666666666 days, a minute short of 2720 once
    // rounded down.
    it('saves the estimation of the quota in whole minutes', async () => {
      const { storeActions, wrapper } = await mountAssignments({ nbAssets: 3 })
      await selectProps(wrapper)
      // Monday 6 to Tuesday 28 April: 17 working days
      await setRange(wrapper, '2026-04-06', '2026-04-28')
      const [, removeBob] = wrapper
        .find('.side-column table.assignees')
        .findAllComponents(ButtonSimple)
      removeBob.vm.$emit('click')
      await flushPromises()

      await apply(wrapper)

      const estimation = 2720
      expect(payloadsOf(storeActions.updateTask)).toEqual([
        {
          taskId: 'task-asset-1',
          data: { estimation, start_date: '2026-04-06', due_date: '2026-04-13' }
        },
        {
          taskId: 'task-asset-2',
          data: { estimation, start_date: '2026-04-13', due_date: '2026-04-21' }
        },
        {
          taskId: 'task-asset-3',
          data: { estimation, start_date: '2026-04-21', due_date: '2026-04-28' }
        }
      ])
    })

    it.each([
      ['the reference', {}],
      ['a version', versionOptions]
    ])(
      'tells how many tasks do not fit the range in %s',
      async (_, options) => {
        const { storeActions, wrapper } = await mountAssignments(options)
        await selectProps(wrapper)
        await setRange(wrapper)
        await forceQuota(wrapper, '0.01')

        await apply(wrapper)

        expect(panelText(wrapper)).toContain(
          'schedule.assign_no_fit {"count":2}'
        )
        expect(writesOf(storeActions)).toEqual([])
      }
    )

    it.each([
      ['the reference', {}],
      ['a version', versionOptions]
    ])(
      'tells that no task fits a range without a working day in %s',
      async (_, options) => {
        const { storeActions, wrapper } = await mountAssignments(options)
        await selectProps(wrapper)
        // Saturday 11 and Sunday 12 April
        await setRange(wrapper, '2026-04-11', '2026-04-12')
        expect(panelText(wrapper)).toContain(
          'schedule.estimated_daily_quotas 0.00'
        )

        await apply(wrapper)

        expect(panelText(wrapper)).toContain(
          'schedule.assign_no_fit {"count":2}'
        )
        expect(writesOf(storeActions)).toEqual([])
      }
    )

    // Two days per task: one task per person in three days
    it('assigns the tasks that fit and tells how many did not', async () => {
      const { storeActions, wrapper } = await mountAssignments({ nbAssets: 3 })
      await selectProps(wrapper)
      await setRange(wrapper)
      await forceQuota(wrapper, '0.5')

      await apply(wrapper)

      expect(payloadsOf(storeActions.assignSelectedTasks)).toEqual([
        { personId: 'person-1', taskIds: ['task-asset-1'] },
        { personId: 'person-2', taskIds: ['task-asset-2'] }
      ])
      expect(panelText(wrapper)).toContain('schedule.assign_no_fit {"count":1}')
    })

    // The override cleared the assignees of every selected task before the
    // distribution: a task that then fit nobody was left with no assignee.
    it.each([
      ['the reference', {}],
      ['a version', versionOptions]
    ])(
      'keeps the assignees of the tasks that do not fit in %s',
      async (_, options) => {
        const { storeActions, wrapper } = await mountAssignments(options)
        await selectProps(wrapper)
        await setRange(wrapper)
        await forceQuota(wrapper, '0.01')
        await overrideAssignments(wrapper)

        await apply(wrapper)

        expect(panelText(wrapper)).toContain(
          'schedule.assign_no_fit {"count":2}'
        )
        expect(writesOf(storeActions)).toEqual([])
      }
    )

    it('overrides the assignees of the tasks that fit only', async () => {
      const { storeActions, wrapper } = await mountAssignments({ nbAssets: 3 })
      await selectProps(wrapper)
      await setRange(wrapper)
      await forceQuota(wrapper, '0.5')
      await overrideAssignments(wrapper)

      await apply(wrapper)

      expect(payloadsOf(storeActions.unassignSelectedTasks)).toEqual([
        { taskIds: ['task-asset-1', 'task-asset-2'] }
      ])
      expect(payloadsOf(storeActions.assignSelectedTasks)).toEqual([
        { personId: 'person-1', taskIds: ['task-asset-1'] },
        { personId: 'person-2', taskIds: ['task-asset-2'] }
      ])
    })

    it('overrides the assignees of the tasks that fit only in a version', async () => {
      const { storeActions, wrapper } = await mountAssignments({
        ...versionOptions,
        nbAssets: 3,
        actions: {
          loadTasksFromScheduleVersion: vi.fn(() =>
            propAssets.map(asset => ({
              id: `link-${asset.id}`,
              task_id: `task-${asset.id}`,
              assignees: ['person-3']
            }))
          )
        }
      })
      await selectProps(wrapper)
      await setRange(wrapper)
      await forceQuota(wrapper, '0.5')
      await overrideAssignments(wrapper)

      await apply(wrapper)

      expect(
        payloadsOf(storeActions.updateScheduleVersionedTask).map(link => [
          link.id,
          link.assignees
        ])
      ).toEqual([
        ['link-asset-1', ['person-1']],
        ['link-asset-2', ['person-2']]
      ])
      expect(storeActions.createScheduleVersionedTask).not.toHaveBeenCalled()
    })

    it.each(panelReuses)(
      'clears the no-fit message when the panel goes on with %s',
      async (_, reuse) => {
        const { wrapper } = await mountAssignments()
        await selectProps(wrapper)
        await setRange(wrapper)
        await forceQuota(wrapper, '0.01')
        await apply(wrapper)
        expect(panelText(wrapper)).toContain('schedule.assign_no_fit')

        await reuse(wrapper)

        expect(wrapper.find('.side-column form').exists()).toBe(true)
        expect(panelText(wrapper)).not.toContain('schedule.assign_no_fit')
      }
    )
  })
})
