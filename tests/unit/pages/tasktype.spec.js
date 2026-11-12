import { useHead } from '@unhead/vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  // The parameters of a message show in its text.
  useI18n: () => ({
    t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)
  })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'
import csv from '@/lib/csv'
import assetStore from '@/store/modules/assets'
import episodeStore from '@/store/modules/episodes'
import shotStore from '@/store/modules/shots'
import taskTypeStore from '@/store/modules/tasktypes'

import TaskList from '@/components/lists/TaskList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import TaskType from '@/components/pages/TaskType.vue'
import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxMultiple from '@/components/widgets/ComboboxMultiple.vue'
import ComboboxStatusMultiple from '@/components/widgets/ComboboxStatusMultiple.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'

import { BrokenFileReader, GoneFileReader } from '../fixtures/file-reader'
import { buildRefusal } from '../fixtures/refusal'
import { buildSearchQueryListStub } from '../fixtures/search-query-list'

const SearchFieldStub = {
  props: { canSave: { type: Boolean, default: false } },
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
  data: () => ({ isEditingDates: false }),
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
  path,
  query = '',
  routes = [
    {
      path: '/productions/:production_id/assets/task-types/:task_type_id/:section',
      component: { template: '<div />' }
    }
  ],
  section = 'estimation',
  socket = { on: vi.fn(), off: vi.fn() },
  stubs = {}
} = {}) => {
  const storeActions = {
    clearSelectedTasks: vi.fn(),
    initTaskType: vi.fn(() => Promise.resolve()),
    updateTask: vi.fn(() => Promise.resolve()),
    ...actions
  }
  const store = createStore({
    getters: {
      isInAssetTypeWorkflow: () => () => true,
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
      productionAssetTypes: () => [],
      productionTaskStatuses: () => [],
      selectedTasks: () => new Map(),
      taskMap: () => new Map([[task.id, task]]),
      taskMetadataDescriptors: () => [],
      taskSearchQueries: () => [],
      currentTaskTypeEpisode: (state, rootGetters) =>
        taskTypeStore.getters.currentTaskTypeEpisode(
          state,
          rootGetters,
          null,
          rootGetters
        ),
      user: () => ({ id: 'manager-1', departments: [] }),
      ...getters
    },
    actions: storeActions
  })
  const router = createRouter({ history: createWebHashHistory(), routes })
  await router.push(
    path ??
      `/productions/production-1/assets/task-types/task-type-1/${section}${query}`
  )
  const wrapper = shallowMount(TaskType, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = socket
          }
        }
      ],
      stubs: { Schedule: ScheduleStub, SearchField: SearchFieldStub, ...stubs }
    }
  })
  await flushPromises()
  return { router, storeActions, wrapper }
}

// The task type routes of src/router/routes.js: the episodes one has no
// entity type for the tabs to inherit.
const Page = { template: '<div />' }
const taskTypeRoute = (name, path, meta = {}) => ({
  name,
  path,
  meta,
  component: Page,
  children: [
    { name: `${name}-schedule`, path: 'schedule', component: Page },
    { name: `${name}-estimation`, path: 'estimation', component: Page }
  ]
})
const taskTypeRoutes = [
  taskTypeRoute(
    'task-type',
    '/productions/:production_id/:type/task-types/:task_type_id'
  ),
  taskTypeRoute(
    'episode-task-type',
    '/productions/:production_id/episodes/:episode_id/:type/task-types/:task_type_id'
  ),
  taskTypeRoute(
    'episodes-task-type',
    '/productions/:production_id/episodes/task-types/:task_type_id',
    { section: 'episodes' }
  ),
  // Held, so that the tabs keep the route of their first render.
  {
    name: 'not-found',
    path: '/not-found',
    component: Page,
    beforeEnter: () => new Promise(() => {})
  }
]

describe('TaskType page', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('saved searches', () => {
    const TaskListStub = {
      template: '<div />',
      methods: { resetSelection: () => {} }
    }

    const mountList = async (initTaskType = vi.fn()) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const SearchQueryList = buildSearchQueryListStub()
      const { wrapper } = await mountPage({
        section: 'tasks',
        stubs: { SearchQueryList, TaskList: TaskListStub },
        actions: { initTaskType, loadScheduleItems: vi.fn(() => []) },
        getters: {
          assetValidationColumns: () => [],
          user: () => ({ id: 'manager-1', departments: [], full_name: 'M' })
        }
      })
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      return { SearchQueryList, wrapper }
    }

    // The list that opens the modal shows once the entities are loaded.
    it('offers the Save button once the tasks are loaded', async () => {
      let endLoad
      const { wrapper } = await mountList(
        () =>
          new Promise(resolve => {
            endLoad = resolve
          })
      )
      const saveButton = () =>
        wrapper.findComponent(SearchFieldStub).props('canSave')

      expect(saveButton()).toBe(false)
      endLoad()
      await flushPromises()

      expect(saveButton()).toBe(true)
      wrapper.unmount()
    })

    // The list holds the modal: it has to be there for the first search.
    it('opens the search filter modal with no saved search', async () => {
      const { SearchQueryList, wrapper } = await mountList()

      wrapper.findComponent(SearchFieldStub).vm.$emit('save', 'retake')

      expect(SearchQueryList.methods.addSearch).toHaveBeenCalledWith('retake')
      wrapper.unmount()
    })

    it('saves its searches under its entity type', async () => {
      const { SearchQueryList, wrapper } = await mountList()

      expect(wrapper.findComponent(SearchQueryList).props('entityType')).toBe(
        'Asset'
      )
      wrapper.unmount()
    })
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

  // A task deleted elsewhere while its field holds a typed value: the field
  // fires its change when its row goes away.
  it('skips the estimation of a task that left the task map', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { storeActions, wrapper } = await mountPage()
    const errorHandler = vi.fn()
    wrapper.vm.$.appContext.config.errorHandler = errorHandler

    wrapper
      .findComponent(EstimationHelper)
      .vm.$emit('estimation-changed', { taskId: 'task-9', estimation: 16 * 60 })
    await flushPromises()

    expect(errorHandler).not.toHaveBeenCalled()
    expect(storeActions.updateTask).not.toHaveBeenCalled()
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

  describe('task filters', () => {
    const TaskListStub = {
      name: 'TaskList',
      props: { tasks: { type: Array, default: () => [] } },
      // the tasks tab shows its schedule in the slot of the list
      template: '<div><slot /></div>',
      methods: { resetSelection: () => {} }
    }
    const statusTasks = ['status-1', 'status-2', 'status-3'].map(
      (statusId, index) => ({
        id: `task-${index + 10}`,
        assignees: [],
        // task-10 on a character, the others on a prop
        entity_id: index ? 'asset-2' : 'asset-1',
        entity_name: 'Chair',
        task_status_id: statusId,
        task_type_id: 'task-type-1'
      })
    )
    // unmounted after each test, a failed one included
    let wrapper = null

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    })

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      assetStore.cache.assetMap.delete('asset-1')
      assetStore.cache.assetMap.delete('asset-2')
    })

    // The URL filters are read on the first load only, once the tasks
    // arrive: 100 ms after mounting, then 200 ms more.
    const mountTasks = async (
      query,
      getters = {},
      { actions = {}, socket } = {}
    ) => {
      const page = await mountPage({
        section: 'tasks',
        query,
        socket,
        stubs: { TaskList: TaskListStub },
        actions: {
          initTaskType: vi.fn(() => {
            assetStore.cache.assetMap.set('asset-1', {
              id: 'asset-1',
              asset_type_id: 'chars',
              tasks: ['task-10']
            })
            assetStore.cache.assetMap.set('asset-2', {
              id: 'asset-2',
              asset_type_id: 'props',
              tasks: ['task-11', 'task-12']
            })
          }),
          loadScheduleItems: vi.fn(() => []),
          ...actions
        },
        getters: {
          assetValidationColumns: () => [],
          productionAssetTypes: () => [
            { id: 'chars', name: 'Characters' },
            { id: 'props', name: 'Props' }
          ],
          taskMap: () => new Map(statusTasks.map(t => [t.id, t])),
          user: () => ({ id: 'manager-1', departments: [], full_name: 'M' }),
          ...getters
        }
      })
      wrapper = page.wrapper
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
    }

    const listedTaskIds = () =>
      wrapper
        .findComponent(TaskListStub)
        .props('tasks')
        .map(t => t.id)
        .sort()

    it('hides the tasks of the asset types outside the workflow', async () => {
      await mountTasks('', {
        isInAssetTypeWorkflow: () => assetTypeId => assetTypeId === 'chars'
      })
      expect(listedTaskIds()).toEqual(['task-10'])
    })

    it('keeps the tasks of every status the URL selects', async () => {
      await mountTasks('?task_status_id=status-1,status-3')
      expect(
        wrapper.findComponent(ComboboxStatusMultiple).props('modelValue')
      ).toEqual(['status-1', 'status-3'])
      expect(listedTaskIds()).toEqual(['task-10', 'task-12'])
    })

    it('keeps the tasks of the asset types the URL selects', async () => {
      await mountTasks('?asset_type_id=props')
      expect(
        wrapper.findComponent(ComboboxMultiple).props('modelValue')
      ).toEqual(['props'])
      expect(listedTaskIds()).toEqual(['task-11', 'task-12'])
    })

    it('combines the asset type and status filters', async () => {
      await mountTasks('?asset_type_id=props&task_status_id=status-1,status-2')
      expect(listedTaskIds()).toEqual(['task-11'])
    })

    it('lists every task again once the selection is emptied', async () => {
      await mountTasks('?task_status_id=status-2')
      expect(listedTaskIds()).toEqual(['task-11'])
      await wrapper
        .findComponent(ComboboxStatusMultiple)
        .vm.$emit('update:model-value', [])
      await flushPromises()
      expect(listedTaskIds()).toEqual(['task-10', 'task-11', 'task-12'])
    })

    // The schedule of the tasks tab lines its rows up with the list, so the
    // list waits for the drop as the rows do.
    it('waits for the drop to refresh the list on a remote update', async () => {
      const socket = { on: vi.fn(), off: vi.fn() }
      await mountTasks('', {}, { socket })
      await wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('text') === 'schedule.title')
        .vm.$emit('click')
      await flushPromises()
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      const list = wrapper.findComponent(TaskListStub)
      const listedTasks = list.props('tasks')

      wrapper.findComponent({ name: 'Schedule' }).vm.isEditingDates = true
      onTaskUpdate({ task_id: 'task-10' })
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      const tasksDuringDrag = list.props('tasks')
      wrapper.findComponent({ name: 'Schedule' }).vm.isEditingDates = false
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()

      expect(tasksDuringDrag).toBe(listedTasks)
      expect(list.props('tasks')).not.toBe(listedTasks)
    })

    // The refresh empties the selection and expects an empty search field: it
    // gives way to a task selected, or a search typed, after the update.
    const refreshAfter = async (change, getters = {}) => {
      const socket = { on: vi.fn(), off: vi.fn() }
      const clearSelectedTasks = vi.fn()
      await mountTasks('', getters, { actions: { clearSelectedTasks }, socket })
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      clearSelectedTasks.mockClear()

      onTaskUpdate({ task_id: 'task-10' })
      change()
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      return clearSelectedTasks
    }

    it('keeps a task selected right after a remote update', async () => {
      const nbSelected = ref(0)
      const clearSelectedTasks = await refreshAfter(
        () => (nbSelected.value = 1),
        { nbSelectedTasks: () => nbSelected.value }
      )

      expect(clearSelectedTasks).not.toHaveBeenCalled()
    })

    it('skips the refresh of a search typed right after a remote update', async () => {
      const getValue = vi.spyOn(SearchFieldStub.methods, 'getValue')
      try {
        const clearSelectedTasks = await refreshAfter(() =>
          getValue.mockReturnValue('chair')
        )

        expect(clearSelectedTasks).not.toHaveBeenCalled()
      } finally {
        getValue.mockRestore()
      }
    })

    // Rebuilds wait for their days off side by side: the one asked last sets
    // its rows, with the scroll reset an earlier one asked for.
    it('keeps the rows of the latest rebuild, scrolled as asked', async () => {
      const socket = { on: vi.fn(), off: vi.fn() }
      const scheduleItem = {
        id: 'schedule-item-1',
        task_type_id: 'task-type-1',
        start_date: '2026-10-01',
        end_date: '2026-10-30'
      }
      const loadProductionDaysOff = vi.fn(() => ({}))
      await mountTasks(
        '',
        {
          currentProduction: () => ({
            id: 'production-1',
            name: 'Production',
            start_date: '2026-01-01',
            end_date: '2026-12-31',
            team: []
          })
        },
        {
          actions: {
            loadProductionDaysOff,
            loadScheduleItems: vi.fn(() => [scheduleItem])
          },
          socket
        }
      )
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      let resolveDaysOff
      loadProductionDaysOff.mockImplementationOnce(
        () => new Promise(resolve => (resolveDaysOff = resolve))
      )
      // the stub binds its methods when it mounts, at the first show
      const scrollToDate = vi.spyOn(ScheduleStub.methods, 'scrollToDate')
      const scrollToToday = vi.spyOn(ScheduleStub.methods, 'scrollToToday')
      let latestRows
      let rows
      let nbScrolls
      try {
        // shown: its rebuild waits for the days off of the range
        await wrapper
          .findAllComponents(ButtonSimple)
          .find(button => button.props('text') === 'schedule.title')
          .vm.$emit('click')
        await flushPromises()
        onTaskUpdate({ task_id: 'task-unknown' })
        await vi.advanceTimersByTimeAsync(400)
        await flushPromises()
        const schedule = wrapper.findComponent({ name: 'Schedule' })
        latestRows = schedule.props('hierarchy')
        resolveDaysOff({})
        await flushPromises()

        rows = schedule.props('hierarchy')
        nbScrolls =
          scrollToDate.mock.calls.length + scrollToToday.mock.calls.length
      } finally {
        scrollToDate.mockRestore()
        scrollToToday.mockRestore()
      }
      expect(latestRows[0].children).toHaveLength(3)
      expect(rows).toBe(latestRows)
      expect(nbScrolls).toBe(1)
    })

    // The show asks for a scroll reset, then a remote update asks for the
    // rows that carry it. A press on a bar while both load works in the
    // timeline as it is: nothing resets its scroll, wherever the drop falls.
    it.each([
      ['held while the first rebuild ends', ['press', 'first', 'drop', 'last']],
      ['held while the last rebuild ends', ['press', 'first', 'last', 'drop']],
      ['made once the first rebuild ended', ['first', 'press', 'drop', 'last']],
      ['dropped before the rebuilds end', ['press', 'drop', 'first', 'last']]
    ])('keeps the scroll of a press %s', async (_, steps) => {
      const socket = { on: vi.fn(), off: vi.fn() }
      const scheduleItem = {
        id: 'schedule-item-1',
        task_type_id: 'task-type-1',
        start_date: '2026-10-01',
        end_date: '2026-10-30'
      }
      const loadProductionDaysOff = vi.fn(() => ({}))
      await mountTasks(
        '',
        {
          currentProduction: () => ({
            id: 'production-1',
            name: 'Production',
            start_date: '2026-01-01',
            end_date: '2026-12-31',
            team: []
          })
        },
        {
          actions: {
            loadProductionDaysOff,
            loadScheduleItems: vi.fn(() => [scheduleItem])
          },
          socket
        }
      )
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      const resolveDaysOff = {}
      loadProductionDaysOff
        .mockImplementationOnce(
          () => new Promise(resolve => (resolveDaysOff.first = resolve))
        )
        .mockImplementationOnce(
          () => new Promise(resolve => (resolveDaysOff.last = resolve))
        )
      // the stub binds its methods when it mounts, at the first show
      const scrollToDate = vi.spyOn(ScheduleStub.methods, 'scrollToDate')
      const scrollToToday = vi.spyOn(ScheduleStub.methods, 'scrollToToday')
      const nbScrolls = () =>
        scrollToDate.mock.calls.length + scrollToToday.mock.calls.length
      let rows
      let nbScrollsFromPress
      try {
        await wrapper
          .findAllComponents(ButtonSimple)
          .find(button => button.props('text') === 'schedule.title')
          .vm.$emit('click')
        await flushPromises()
        onTaskUpdate({ task_id: 'task-unknown' })
        await vi.advanceTimersByTimeAsync(400)
        await flushPromises()
        const schedule = wrapper.findComponent({ name: 'Schedule' })
        const runStep = {
          press: () => (schedule.vm.isEditingDates = true),
          drop: () => (schedule.vm.isEditingDates = false),
          first: () => resolveDaysOff.first({}),
          last: () => resolveDaysOff.last({})
        }
        let nbScrollsBeforePress
        for (const step of steps) {
          if (step === 'press') nbScrollsBeforePress = nbScrolls()
          runStep[step]()
          await flushPromises()
        }
        // with any rebuild the press held, run 400 ms after the drop
        await vi.advanceTimersByTimeAsync(400)
        await flushPromises()

        rows = schedule.props('hierarchy')
        nbScrollsFromPress = nbScrolls() - nbScrollsBeforePress
      } finally {
        scrollToDate.mockRestore()
        scrollToToday.mockRestore()
      }
      expect(rows[0].children).toHaveLength(3)
      expect(nbScrollsFromPress).toBe(0)
    })

    // The schedule resets its scroll each time it shows. A press on the bars
    // left from an earlier show, while the rows of a new range load, works
    // in the timeline as it is: the rows built after the drop keep its
    // scroll.
    it('keeps the scroll of a press made while the schedule loads', async () => {
      const scheduleItem = {
        id: 'schedule-item-1',
        task_type_id: 'task-type-1',
        start_date: '2026-10-01',
        end_date: '2026-10-30'
      }
      const loadProductionDaysOff = vi.fn(() => ({}))
      await mountTasks(
        '',
        {
          currentProduction: () => ({
            id: 'production-1',
            name: 'Production',
            start_date: '2026-01-01',
            end_date: '2026-12-31',
            team: []
          })
        },
        {
          actions: {
            loadProductionDaysOff,
            loadScheduleItems: vi.fn(() => [scheduleItem])
          }
        }
      )
      const toggleSchedule = async () => {
        await wrapper
          .findAllComponents(ButtonSimple)
          .find(button => button.props('text') === 'schedule.title')
          .vm.$emit('click')
        await flushPromises()
      }
      // the stub binds its methods when it mounts, at the first show
      const scrollToDate = vi.spyOn(ScheduleStub.methods, 'scrollToDate')
      const scrollToToday = vi.spyOn(ScheduleStub.methods, 'scrollToToday')
      const nbScrolls = () =>
        scrollToDate.mock.calls.length + scrollToToday.mock.calls.length
      let nbScrollsOnShow
      let leftoverRows
      let rows
      let nbScrollsAfterDrop
      try {
        await toggleSchedule()
        nbScrollsOnShow = nbScrolls()
        await toggleSchedule()
        // shown again on a new range: its days off load again
        scheduleItem.start_date = '2026-10-02'
        let resolveDaysOff
        loadProductionDaysOff.mockImplementationOnce(
          () => new Promise(resolve => (resolveDaysOff = resolve))
        )
        const nbScrollsBeforePress = nbScrolls()
        await toggleSchedule()
        const schedule = wrapper.findComponent({ name: 'Schedule' })
        leftoverRows = schedule.props('hierarchy')

        schedule.vm.isEditingDates = true
        resolveDaysOff({})
        await flushPromises()
        schedule.vm.isEditingDates = false
        await vi.advanceTimersByTimeAsync(400)
        await flushPromises()

        rows = schedule.props('hierarchy')
        nbScrollsAfterDrop = nbScrolls() - nbScrollsBeforePress
      } finally {
        scrollToDate.mockRestore()
        scrollToToday.mockRestore()
      }
      expect(nbScrollsOnShow).toBe(1)
      expect(leftoverRows[0].children).toHaveLength(3)
      expect(rows).not.toBe(leftoverRows)
      expect(nbScrollsAfterDrop).toBe(0)
    })
  })

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

    // the data load starts 100 ms after mounting, the schedule dates follow
    // 200 ms after it
    const mountSchedule = async ({
      actions = {},
      getters = {},
      socket
    } = {}) => {
      const page = await mountPage({
        section: 'schedule',
        socket,
        actions: {
          loadProductionDaysOff: vi.fn(() => ({})),
          loadProductionTimeSpents: vi.fn(() => ({})),
          loadScheduleItems: vi.fn(() => [
            {
              id: 'schedule-item-1',
              task_type_id: 'task-type-1',
              start_date: '2026-10-01',
              end_date: '2026-10-30'
            }
          ]),
          saveScheduleItem: vi.fn(),
          ...actions
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
          personMap: () => new Map([[person.id, person]]),
          taskMap: () => new Map([[scheduleTask.id, scheduleTask]]),
          user: () => ({
            id: 'manager-1',
            departments: [],
            full_name: 'Manager'
          }),
          ...getters
        }
      })
      wrapper = page.wrapper
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
    }

    // The timesheet stores a day logged with its preset in whole minutes, 498
    // for 8.3 hours by day, while 8.3 * 60 makes 498.00000000000006. What it
    // stored before keeps its float noise: 491.99999999999994 for 8.2 hours.
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
        await mountSchedule({
          actions: {
            loadProductionTimeSpents: vi.fn(() => ({
              [person.id]: [timeSpent('2026-10-06'), timeSpent('2026-10-05')]
            }))
          },
          getters: { organisation: () => ({ hours_by_day: hoursByDay }) }
        })

        const [personRow] = wrapper
          .findComponent({ name: 'Schedule' })
          .props('hierarchy')
        expect(
          personRow.timesheet.map(({ date, duration }) => [date, duration])
        ).toEqual([['2026-10-05', minutes * 2]])
      }
    )

    // The store's task type follows the route: a rebuild fired once the page
    // was left asked for the time spents of an undefined task type.
    it('drops a remote update rebuild once the page is left', async () => {
      const socket = { on: vi.fn(), off: vi.fn() }
      const loadProductionTimeSpents = vi.fn(() => ({}))
      const taskType = ref({
        id: 'task-type-1',
        name: 'Modeling',
        for_entity: 'Asset'
      })
      await mountSchedule({
        actions: { loadProductionTimeSpents },
        getters: { currentTaskType: () => taskType.value },
        socket
      })
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      loadProductionTimeSpents.mockClear()

      onTaskUpdate({ task_id: scheduleTask.id })
      wrapper.unmount()
      wrapper = null
      taskType.value = {}
      await vi.advanceTimersByTimeAsync(400)

      expect(loadProductionTimeSpents).not.toHaveBeenCalled()
    })

    // A rebuild replaces the bars: the widget went on moving the pressed one,
    // no longer shown, and the bar jumped back to its dates until the drop.
    it('waits for the drop to rebuild the rows on a remote update', async () => {
      const socket = { on: vi.fn(), off: vi.fn() }
      await mountSchedule({ socket })
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      const schedule = wrapper.findComponent({ name: 'Schedule' })
      const rows = schedule.props('hierarchy')

      schedule.vm.isEditingDates = true
      onTaskUpdate({ task_id: scheduleTask.id })
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      const rowsDuringDrag = schedule.props('hierarchy')
      schedule.vm.isEditingDates = false
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()

      expect(rowsDuringDrag).toBe(rows)
      expect(schedule.props('hierarchy')).not.toBe(rows)
    })

    // A rebuild that loads the days off of a new range ends after a press
    // made during that load: its rows wait for the drop too.
    it('waits for the drop to apply a rebuild still loading at the press', async () => {
      const socket = { on: vi.fn(), off: vi.fn() }
      const scheduleItem = {
        id: 'schedule-item-1',
        task_type_id: 'task-type-1',
        start_date: '2026-10-01',
        end_date: '2026-10-30'
      }
      const loadProductionDaysOff = vi.fn(() => ({}))
      await mountSchedule({
        actions: {
          loadProductionDaysOff,
          loadScheduleItems: vi.fn(() => [scheduleItem])
        },
        socket
      })
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      const schedule = wrapper.findComponent({ name: 'Schedule' })
      const rows = schedule.props('hierarchy')
      const nbLoads = loadProductionDaysOff.mock.calls.length
      let resolveDaysOff
      loadProductionDaysOff.mockImplementationOnce(
        () => new Promise(resolve => (resolveDaysOff = resolve))
      )

      // the range of the task type changed: its days off load again
      scheduleItem.start_date = '2026-10-02'
      onTaskUpdate({ task_id: scheduleTask.id })
      await vi.advanceTimersByTimeAsync(400)
      schedule.vm.isEditingDates = true
      resolveDaysOff({})
      await flushPromises()
      const rowsDuringDrag = schedule.props('hierarchy')
      schedule.vm.isEditingDates = false
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()

      expect(loadProductionDaysOff).toHaveBeenCalledTimes(nbLoads + 1)
      expect(rowsDuringDrag).toBe(rows)
      expect(schedule.props('hierarchy')).not.toBe(rows)
    })

    // A rebuild held by a drag tries again every 400 ms: checked before its
    // loads, it sends none of them until the drop.
    it('waits for the drop to load the data of a held rebuild', async () => {
      const socket = { on: vi.fn(), off: vi.fn() }
      const scheduleItem = {
        id: 'schedule-item-1',
        task_type_id: 'task-type-1',
        start_date: '2026-10-01',
        end_date: '2026-10-30'
      }
      const loadProductionDaysOff = vi.fn(() => ({}))
      await mountSchedule({
        actions: {
          loadProductionDaysOff,
          loadScheduleItems: vi.fn(() => [scheduleItem])
        },
        socket
      })
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      const schedule = wrapper.findComponent({ name: 'Schedule' })
      const nbLoads = loadProductionDaysOff.mock.calls.length

      // the range of the task type changed: a rebuild loads its days off
      scheduleItem.start_date = '2026-10-02'
      schedule.vm.isEditingDates = true
      onTaskUpdate({ task_id: scheduleTask.id })
      await vi.advanceTimersByTimeAsync(1200)
      await flushPromises()
      const nbLoadsDuringDrag = loadProductionDaysOff.mock.calls.length
      schedule.vm.isEditingDates = false
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()

      expect(nbLoadsDuringDrag).toBe(nbLoads)
      expect(loadProductionDaysOff).toHaveBeenCalledTimes(nbLoads + 1)
    })
  })

  describe('CSV import', () => {
    // unmounted after each test, a failed one included
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    const buildFormData = () => {
      const formData = new FormData()
      formData.append('file', new File(['Asset,Estimation'], 'import.csv'))
      return formData
    }

    const openImportModal = async () => {
      // the data load the page starts 100 ms after mounting is not under test
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const page = await mountPage({ section: 'tasks' })
      wrapper = page.wrapper
      await wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'import')
        .vm.$emit('click')
      return () => wrapper.findComponent(ImportModal)
    }

    it('shows the error of a file the browser cannot read', async () => {
      vi.stubGlobal('FileReader', GoneFileReader)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const modal = await openImportModal()

      await modal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      expect(modal().props()).toMatchObject({
        active: true,
        isError: true,
        isLoading: false
      })
    })

    it('opens again without the error of an unreadable file', async () => {
      vi.stubGlobal('FileReader', GoneFileReader)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const modal = await openImportModal()
      await modal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      await modal().vm.$emit('cancel')
      await wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'import')
        .vm.$emit('click')

      expect(modal().props()).toMatchObject({ active: true, isError: false })
    })

    // The export writes the labels of the language of the user.
    const exportedHeaders = [
      'tasks.fields.asset_type',
      'tasks.fields.entity_name',
      'tasks.fields.task_status',
      'tasks.fields.difficulty',
      'tasks.fields.estimation',
      'tasks.fields.start_date',
      'tasks.fields.due_date'
    ]

    const previewHeaders = async ({ getters } = {}) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const page = await mountPage({ getters, section: 'tasks' })
      wrapper = page.wrapper
      await wrapper
        .findComponent(ImportModal)
        .vm.$emit('confirm', exportedHeaders.join(';'), 'text')
      await flushPromises()
      return wrapper.findComponent(ImportRenderModal).props('parsedCsv')[0]
    }

    it('gives the exported labels the column names of Zou', async () => {
      expect(await previewHeaders()).toEqual([
        'Parent',
        'Entity',
        'tasks.fields.task_status',
        'Difficulty',
        'Estimation',
        'Start date',
        'Due date'
      ])
    })

    it('keeps the label of a column named after it', async () => {
      const descriptor = {
        id: 'descriptor-1',
        task_type_id: 'task-type-1',
        name: 'tasks.fields.difficulty',
        field_name: 'difficulty',
        departments: []
      }

      const headers = await previewHeaders({
        getters: { taskMetadataDescriptors: () => [descriptor] }
      })

      expect(headers).toContain('tasks.fields.difficulty')
      expect(headers).not.toContain('Difficulty')
    })

    describe('after an import', () => {
      const importRows = async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const page = await mountPage({
          actions: {
            // Zou answers the rows it imported
            uploadTaskTypeEstimations: () => Promise.resolve([{}, {}])
          },
          section: 'tasks'
        })
        wrapper = page.wrapper
        const renderModal = () => wrapper.findComponent(ImportRenderModal)
        await wrapper
          .findComponent(ImportModal)
          .vm.$emit('confirm', 'Parent;Entity\nProps;Tree\nProps;Rock', 'text')
        await flushPromises()
        await renderModal().vm.$emit(
          'confirm',
          renderModal().props('parsedCsv')
        )
        await flushPromises()
        return renderModal
      }

      it('keeps the preview open with the imported row count', async () => {
        const renderModal = await importRows()

        expect(renderModal().props()).toMatchObject({
          active: true,
          importedRows: 2,
          isError: false
        })
      })

      it('drops the row count once the preview is closed', async () => {
        const renderModal = await importRows()

        await renderModal().vm.$emit('cancel')

        expect(renderModal().props()).toMatchObject({
          active: false,
          importedRows: null
        })
      })

      it('drops the row count for another file', async () => {
        const renderModal = await importRows()
        // the stub has no file to forget
        wrapper.findComponent(ImportModal).vm.reset = vi.fn()

        await renderModal().vm.$emit('reupload')

        expect(renderModal().props('importedRows')).toBeNull()
      })

      it('drops the row count for a new preview', async () => {
        const renderModal = await importRows()
        await renderModal().vm.$emit('cancel')

        await wrapper
          .findComponent(ImportModal)
          .vm.$emit('confirm', 'Parent;Entity\nProps;Tree', 'text')
        await flushPromises()

        expect(renderModal().props()).toMatchObject({
          active: true,
          importedRows: null
        })
      })

      const startUpload = async () => {
        let answerUpload = null
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const page = await mountPage({
          actions: {
            uploadTaskTypeEstimations: () =>
              new Promise(resolve => {
                answerUpload = resolve
              })
          },
          section: 'tasks'
        })
        wrapper = page.wrapper
        const renderModal = () => wrapper.findComponent(ImportRenderModal)
        const importModal = () => wrapper.findComponent(ImportModal)
        await importModal().vm.$emit(
          'confirm',
          'Parent;Entity\nProps;Tree\nProps;Rock',
          'text'
        )
        await flushPromises()
        await renderModal().vm.$emit('confirm', renderModal().props('parsedCsv'))
        // the stub has no file to forget
        importModal().vm.reset = vi.fn()
        return {
          answerUpload: rows => answerUpload(rows),
          importModal,
          renderModal
        }
      }

      it('gives another file no count of an upload still running', async () => {
        const { answerUpload, importModal, renderModal } = await startUpload()
        await renderModal().vm.$emit('reupload')
        // A picked file confirms at once, loading or not.
        await importModal().vm.$emit('confirm', 'Parent;Entity\nProps;Tree', 'text')
        await flushPromises()

        answerUpload([{}, {}])
        await flushPromises()

        expect(renderModal().props()).toMatchObject({
          active: true,
          importedRows: null
        })
      })

      it.each(['cancel', 'reupload'])(
        'gives no count of an upload answered after a %s to the next file',
        async event => {
          const { answerUpload, importModal, renderModal } = await startUpload()
          await renderModal().vm.$emit(event)
          answerUpload([{}, {}])
          await flushPromises()

          await importModal().vm.$emit('confirm', 'Parent;Entity\nProps;Tree', 'text')
          await flushPromises()

          expect(renderModal().props()).toMatchObject({
            active: true,
            importedRows: null
          })
        }
      )
    })

    it('releases the modal on a bug, left to the error handler', async () => {
      vi.stubGlobal('FileReader', BrokenFileReader)
      const modal = await openImportModal()
      const errorHandler = vi.fn()
      wrapper.vm.$.appContext.config.errorHandler = errorHandler

      await modal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      expect(modal().props()).toMatchObject({ isError: true, isLoading: false })
      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(TypeError),
        expect.anything(),
        expect.anything()
      )
    })
  })

  // Zou finds the entity of a row by its parent and name, the parent being
  // ignored for episodes and optional for sequences and edits.
  describe('estimations import columns', () => {
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
    })

    const importColumns = async forEntity => {
      // the data load the page starts 100 ms after mounting is not under test
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const mounted = await mountPage({
        getters: {
          currentTaskType: () => ({
            id: 'task-type-1',
            name: 'Layout',
            for_entity: forEntity
          })
        },
        section: 'tasks'
      })
      wrapper = mounted.wrapper
      const renderModal = wrapper.findComponent(ImportRenderModal)
      const importModal = wrapper.findComponent(ImportModal)
      return {
        blockMissingColumns: renderModal.props('blockMissingColumns'),
        columns: renderModal.props('columns'),
        dataMatchers: renderModal.props('dataMatchers'),
        listedColumns: importModal.props('columns'),
        listedOptionalColumns: importModal.props('optionalColumns'),
        requiredValues: renderModal.props('requiredValues')
      }
    }

    const optionalColumns = ['Estimation', 'Start date', 'Due date', 'Difficulty']

    it.each(['Asset', 'Shot'])(
      'require the parent and the entity of the %s task types',
      async forEntity => {
        expect(await importColumns(forEntity)).toEqual({
          blockMissingColumns: true,
          columns: ['Parent', 'Entity', ...optionalColumns],
          dataMatchers: ['Parent', 'Entity'],
          listedColumns: ['Parent', 'Entity'],
          listedOptionalColumns: optionalColumns,
          requiredValues: ['Parent', 'Entity']
        })
      }
    )

    it('require the entity alone of the Episode task types', async () => {
      expect(await importColumns('Episode')).toEqual({
        blockMissingColumns: true,
        columns: ['Entity', ...optionalColumns],
        dataMatchers: ['Entity'],
        listedColumns: ['Entity'],
        listedOptionalColumns: optionalColumns,
        requiredValues: ['Entity']
      })
    })

    it.each(['Sequence', 'Edit'])(
      'take the parent of the %s task types as optional',
      async forEntity => {
        expect(await importColumns(forEntity)).toEqual({
          blockMissingColumns: true,
          columns: ['Entity', 'Parent', ...optionalColumns],
          dataMatchers: ['Entity'],
          listedColumns: ['Entity'],
          listedOptionalColumns: ['Parent', ...optionalColumns],
          requiredValues: ['Entity']
        })
      }
    )
  })

  // The page posts with the store episode, which a route without episode
  // keeps.
  describe('estimations import button', () => {
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
    })

    const shotTaskType = {
      id: 'task-type-1',
      name: 'Animation',
      for_entity: 'Shot'
    }

    const hasImportButton = async (getters, path) => {
      // the data load the page starts 100 ms after mounting is not under test
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const mounted = await mountPage({
        getters: {
          currentTaskType: () => shotTaskType,
          isTVShow: () => true,
          ...getters
        },
        path,
        routes: taskTypeRoutes
      })
      wrapper = mounted.wrapper
      return wrapper
        .findAllComponents(ButtonSimple)
        .some(button => button.props('icon') === 'import')
    }

    const hasPseudoEpisodeImportButton = (id, type, forEntity) =>
      hasImportButton(
        {
          currentEpisode: () => ({ id }),
          currentTaskType: () => ({ ...shotTaskType, for_entity: forEntity })
        },
        `/productions/production-1/episodes/${id}/${type}/task-types/task-type-1`
      )

    // The rows of two episodes can share their sequence or asset type, and
    // their name.
    it.each([
      ['all', 'shots', 'Shot'],
      ['all', 'assets', 'Asset']
    ])(
      'is hidden on the %s pseudo-episode of the %s',
      async (id, type, forEntity) => {
        expect(await hasPseudoEpisodeImportButton(id, type, forEntity)).toBe(
          false
        )
      }
    )

    // A sequence or an edit row names its episode, and Main pack holds the
    // assets without one.
    it.each([
      ['all', 'edits', 'Edit'],
      ['all', 'sequences', 'Sequence'],
      ['main', 'assets', 'Asset']
    ])(
      'is shown on the %s pseudo-episode of the %s',
      async (id, type, forEntity) => {
        expect(await hasPseudoEpisodeImportButton(id, type, forEntity)).toBe(
          true
        )
      }
    )

    it('is hidden on the task type route of a TV show on all episodes', async () => {
      const shown = await hasImportButton(
        { currentEpisode: () => ({ id: 'all' }) },
        '/productions/production-1/shots/task-types/task-type-1'
      )
      expect(shown).toBe(false)
    })

    it('is hidden on the episodes route of a shot task type on all episodes', async () => {
      const shown = await hasImportButton(
        { currentEpisode: () => ({ id: 'all' }) },
        '/productions/production-1/episodes/task-types/task-type-1'
      )
      expect(shown).toBe(false)
    })

    it('is shown on an episode', async () => {
      const shown = await hasImportButton(
        { currentEpisode: () => ({ id: 'episode-1' }) },
        '/productions/production-1/episodes/episode-1/shots/task-types/task-type-1'
      )
      expect(shown).toBe(true)
    })

    // A link without episode, such as the task type of a task in My Tasks,
    // keeps the Main pack of an earlier assets page, which lists nothing else.
    it.each([
      ['shots', 'Shot'],
      ['edits', 'Edit'],
      ['sequences', 'Sequence']
    ])(
      'is hidden on the %s route of a task type with Main pack in the store',
      async (type, forEntity) => {
        const shown = await hasImportButton(
          {
            currentEpisode: () => ({ id: 'main' }),
            currentTaskType: () => ({ ...shotTaskType, for_entity: forEntity })
          },
          `/productions/production-1/${type}/task-types/task-type-1`
        )
        expect(shown).toBe(false)
      }
    )

    it.each(['all', 'main'])(
      'is shown for an episode task type with %s in the store',
      async id => {
        const shown = await hasImportButton(
          {
            currentEpisode: () => ({ id }),
            currentTaskType: () => ({ ...shotTaskType, for_entity: 'Episode' })
          },
          '/productions/production-1/episodes/task-types/task-type-1'
        )
        expect(shown).toBe(true)
      }
    )
  })

  // The store keeps the episode the user came from.
  describe('title and export name', () => {
    const TaskListStub = {
      name: 'TaskList',
      template: '<div />',
      methods: { getTableData: () => [['Entity']] }
    }
    const episode = { id: 'episode-2', name: 'E02' }
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      vi.restoreAllMocks()
    })

    const readTitleAndExportName = async (
      forEntity,
      path,
      currentEpisode = episode
    ) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const mounted = await mountPage({
        getters: {
          currentEpisode: () => currentEpisode,
          currentTaskType: () => ({
            id: 'task-type-1',
            name: 'Animation',
            for_entity: forEntity
          }),
          isTVShow: () => true
        },
        path,
        routes: taskTypeRoutes,
        stubs: { TaskList: TaskListStub }
      })
      wrapper = mounted.wrapper
      const buildCsvFile = vi.spyOn(csv, 'buildCsvFile').mockReturnValue('')
      await wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'export')
        .vm.$emit('click')
      return {
        title: vi.mocked(useHead).mock.calls.at(-1)[0].title.value,
        exportName: buildCsvFile.mock.calls[0][0]
      }
    }

    it('name no episode for an Episode task type', async () => {
      const { title, exportName } = await readTitleAndExportName(
        'Episode',
        '/productions/production-1/episodes/task-types/task-type-1'
      )
      expect(title).toBe('Production / Animation - Kitsu')
      expect(exportName).toMatch(/_production_animation_tasks$/)
      expect(exportName).not.toMatch(/e02/i)
    })

    it('name the episode of a Shot task type', async () => {
      const { title, exportName } = await readTitleAndExportName(
        'Shot',
        '/productions/production-1/episodes/episode-2/shots/task-types/task-type-1'
      )
      expect(title).toBe('Production / E02 / Animation - Kitsu')
      expect(exportName).toMatch(/_e02_production_animation_tasks$/)
    })

    // The pseudo-episodes have no name: they take the label of the topbar.
    it.each([
      ['all', 'shots', 'Shot', 'main.all_shots'],
      ['all', 'assets', 'Asset', 'main.all_assets'],
      ['all', 'edits', 'Edit', 'main.all_edits'],
      ['all', 'sequences', 'Sequence', 'sequences.all_sequences'],
      ['main', 'assets', 'Asset', 'main.main_pack']
    ])(
      'name the %s pseudo-episode of the %s',
      async (id, type, forEntity, label) => {
        const { title, exportName } = await readTitleAndExportName(
          forEntity,
          `/productions/production-1/episodes/${id}/${type}/task-types/task-type-1`,
          { id }
        )
        expect(title).toBe(`Production / ${label} / Animation - Kitsu`)
        expect(exportName).toContain(label.split('.').pop())
        expect(exportName).not.toMatch(/undefined/)
      }
    )
  })

  // The episode stats linked their shot columns to the episodes route.
  describe('entity type', () => {
    const TaskListStub = {
      name: 'TaskList',
      props: {
        entityType: { type: String, default: '' },
        tasks: { type: Array, default: () => [] }
      },
      template: '<div />',
      methods: { resetSelection: () => {} }
    }
    const entities = {
      Asset: { store: assetStore.cache.assetMap, id: 'asset-1' },
      Episode: { store: episodeStore.cache.episodeMap, id: 'episode-1' },
      Shot: { store: shotStore.cache.shotMap, id: 'shot-1' }
    }
    // One task per entity type, all of the task type, so that the list
    // tells which map the page read.
    const typeTasks = Object.entries(entities).map(([type, { id }]) => ({
      id: `task-${type}`,
      assignees: [],
      entity_id: id,
      entity_name: id,
      task_type_id: 'task-type-1'
    }))
    let wrapper = null

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    })

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      Object.values(entities).forEach(({ store, id }) => store.delete(id))
    })

    const mountList = async (forEntity, path) => {
      const page = await mountPage({
        actions: {
          initTaskType: vi.fn(() => {
            Object.entries(entities).forEach(([type, { store, id }]) => {
              store.set(id, {
                id,
                episode_id: 'episode-1',
                tasks: [`task-${type}`]
              })
            })
          }),
          loadEpisodeScheduleItems: vi.fn(() => [])
        },
        getters: {
          assetValidationColumns: () => [],
          currentEpisode: () => ({ id: 'episode-1', name: 'E01' }),
          currentTaskType: () => ({
            id: 'task-type-1',
            name: 'Animation',
            for_entity: forEntity
          }),
          episodeValidationColumns: () => [],
          isTVShow: () => true,
          shotValidationColumns: () => [],
          taskMap: () => new Map(typeTasks.map(t => [t.id, t])),
          user: () => ({ id: 'manager-1', departments: [], full_name: 'M' })
        },
        path,
        routes: taskTypeRoutes,
        stubs: { TaskList: TaskListStub }
      })
      wrapper = page.wrapper
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      const list = wrapper.findComponent(TaskListStub)
      return {
        entityType: list.props('entityType'),
        taskIds: list.props('tasks').map(t => t.id)
      }
    }

    it.each([
      ['Shot', '/productions/production-1/episodes/task-types/task-type-1'],
      [
        'Shot',
        '/productions/production-1/episodes/episode-1/shots/task-types/task-type-1'
      ],
      ['Asset', '/productions/production-1/assets/task-types/task-type-1'],
      ['Episode', '/productions/production-1/episodes/task-types/task-type-1']
    ])('lists the %s tasks of its task type on %s', async (type, path) => {
      expect(await mountList(type, path)).toEqual({
        entityType: type,
        taskIds: [`task-${type}`]
      })
    })

    it('keeps the type of the route for another task type', async () => {
      expect(
        await mountList(
          'Concept',
          '/productions/production-1/assets/task-types/task-type-1'
        )
      ).toEqual({ entityType: 'Asset', taskIds: ['task-Asset'] })
    })
  })

  describe('tabs', () => {
    const routes = taskTypeRoutes
    const shotTaskType = {
      id: 'task-type-1',
      name: 'Animation',
      for_entity: 'Shot'
    }
    // unmounted after each test, a failed one included
    let wrapper = null

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      vi.restoreAllMocks()
    })

    const mountTabs = async (
      getters,
      path = '/productions/production-1/episodes/task-types/task-type-1'
    ) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const mounted = await mountPage({
        getters: { currentTaskType: () => shotTaskType, ...getters },
        path,
        routes
      })
      wrapper = mounted.wrapper
      return wrapper
        .findAll('.tabs li')
        .map(
          tab =>
            mounted.router.resolve(
              tab.findComponent({ name: 'RouterLink' }).props('to')
            ).fullPath
        )
    }

    // Where the episode stats link their shot columns.
    it('links the sections of a shot task type opened on all episodes', async () => {
      const base =
        '/productions/production-1/episodes/all/shots/task-types/task-type-1'
      const paths = await mountTabs(
        { currentEpisode: () => ({ id: 'all' }), isTVShow: () => true },
        base
      )
      expect(paths).toEqual([base, `${base}/schedule`, `${base}/estimation`])
    })

    // The episode stats linked their shot columns to the episodes route.
    it('links the sections of a shot task type opened on the episodes route', async () => {
      const paths = await mountTabs({
        currentEpisode: () => ({ id: 'episode-1' }),
        isTVShow: () => true
      })
      const base =
        '/productions/production-1/episodes/episode-1/shots/task-types/task-type-1'
      expect(paths).toEqual([base, `${base}/schedule`, `${base}/estimation`])
    })

    it('links them before the episodes are loaded', async () => {
      const paths = await mountTabs({ isTVShow: () => true })
      const base = '/productions/production-1/shots/task-types/task-type-1'
      expect(paths).toEqual([base, `${base}/schedule`, `${base}/estimation`])
    })

    // A type there would be discarded with a warning.
    it('links the sections of an episode task type to the episodes route', async () => {
      const warn = vi.spyOn(console, 'warn')
      const error = vi.spyOn(console, 'error')
      const paths = await mountTabs({
        currentEpisode: () => ({ id: 'episode-1' }),
        currentTaskType: () => ({ ...shotTaskType, for_entity: 'Episode' }),
        isTVShow: () => true
      })
      const base = '/productions/production-1/episodes/task-types/task-type-1'
      expect(paths).toEqual([base, `${base}/schedule`, `${base}/estimation`])
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    })

    // The page renders once before leaving for the not found page.
    describe('for a task type missing from the map', () => {
      it('keeps the type of the route', async () => {
        const base = '/productions/production-1/assets/task-types/task-type-1'
        const paths = await mountTabs({ currentTaskType: () => ({}) }, base)
        expect(paths).toEqual([base, `${base}/schedule`, `${base}/estimation`])
      })

      it('keeps the episodes route, which has no type', async () => {
        const paths = await mountTabs({ currentTaskType: () => ({}) })
        const base = '/productions/production-1/episodes/task-types/task-type-1'
        expect(paths).toEqual([base, `${base}/schedule`, `${base}/estimation`])
      })
    })
  })

  describe('back link of the schedule tab', () => {
    const routes = [
      ...taskTypeRoutes,
      {
        name: 'schedule',
        path: '/productions/:production_id/schedule',
        component: Page
      },
      {
        name: 'episode-schedule',
        path: '/productions/:production_id/episodes/:episode_id/schedule',
        component: Page
      }
    ]
    let wrapper

    afterEach(() => {
      wrapper.unmount()
      vi.useRealTimers()
    })

    const backPathOf = async (getters, path) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const mounted = await mountPage({ getters, path, routes })
      wrapper = mounted.wrapper
      const link = wrapper
        .findAllComponents({ name: 'RouterLink' })
        .find(routerLink => routerLink.classes('back-link'))
      return mounted.router.resolve(link.props('to')).path
    }

    it('goes back to the schedule of the current episode', async () => {
      const path = await backPathOf(
        {
          currentEpisode: () => ({ id: 'episode-1' }),
          isTVShow: () => true
        },
        '/productions/production-1/episodes/episode-1/assets/task-types/task-type-1/schedule'
      )
      expect(path).toBe('/productions/production-1/episodes/episode-1/schedule')
    })

    it('goes back to all the episodes when none is set', async () => {
      const path = await backPathOf(
        { isTVShow: () => true },
        '/productions/production-1/assets/task-types/task-type-1/schedule'
      )
      expect(path).toBe('/productions/production-1/episodes/all/schedule')
    })

    it('stays out of the episodes on a production without them', async () => {
      const path = await backPathOf(
        {},
        '/productions/production-1/assets/task-types/task-type-1/schedule'
      )
      expect(path).toBe('/productions/production-1/schedule')
    })
  })
})

// The cells save at once, with no modal to tell a refusal.
describe('TaskType page, cell saves', () => {
  beforeEach(() => {
    // the data load the page starts 100 ms after mounting is not under test
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it.each([
    ['refused', 400],
    // Its row names the entity of the task, which may still stand.
    ['on a task deleted meanwhile', 404]
  ])('tells an estimation %s in the estimation tab', async (_, status) => {
    const error = buildRefusal(status)
    const { wrapper } = await mountPage({
      actions: { updateTask: vi.fn(() => Promise.reject(error)) },
      // The entity stores give each task the name of its entity.
      getters: {
        taskMap: () =>
          new Map([[task.id, { ...task, entity_name: 'Props / Tree' }]])
      }
    })

    wrapper
      .findComponent(EstimationHelper)
      .vm.$emit('estimation-changed', { taskId: 'task-1', estimation: 16 * 60 })
    await flushPromises()

    expect(wrapper.findComponent(ErrorText).props('text')).toBe(
      'main.cell_save_error {"name":"Props / Tree"}'
    )
    expect(console.error).toHaveBeenCalledWith(error)
    wrapper.unmount()
  })

  // The row of the task list holds the schedule beside the rows.
  it('shows above the task list the refused cell save it tells', async () => {
    const TaskListStub = {
      name: 'TaskList',
      template: '<div />',
      data: () => ({ cellSaveErrorText: 'main.cells_save_error' }),
      methods: { resetSelection: () => {} }
    }
    const { wrapper } = await mountPage({
      section: 'tasks',
      stubs: { TaskList: TaskListStub }
    })

    expect(wrapper.findComponent(ErrorText).props('text')).toBe(
      'main.cells_save_error'
    )

    wrapper.findComponent(TaskListStub).vm.cellSaveErrorText = ''
    await nextTick()

    expect(wrapper.findComponent(ErrorText).exists()).toBe(false)
    wrapper.unmount()
  })
})
