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

import assetTypeStore from '@/store/modules/assettypes'
import taskTypeStore from '@/store/modules/tasktypes'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import ProductionSchedule from '@/components/pages/ProductionSchedule.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

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
  versions = []
} = {}) => {
  const storeActions = {
    applyScheduleVersionToProduction: vi.fn(),
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
      mocks: { $t: key => key },
      stubs: { Schedule: scheduleWidget }
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
    vi.restoreAllMocks()
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
})
