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
import scheduleStore from '@/store/modules/schedule'
import shotStore from '@/store/modules/shots'
import taskTypeStore from '@/store/modules/tasktypes'

import TaskList from '@/components/lists/TaskList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import PanelLayout from '@/components/layouts/PanelLayout.vue'
import TaskType from '@/components/pages/TaskType.vue'
import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxMultiple from '@/components/widgets/ComboboxMultiple.vue'
import ComboboxStatusMultiple from '@/components/widgets/ComboboxStatusMultiple.vue'
import DateField from '@/components/widgets/DateField.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import FiltersToggle from '@/components/widgets/FiltersToggle.vue'

import { BrokenFileReader, GoneFileReader } from '../fixtures/file-reader'
import { buildRefusal } from '../fixtures/refusal'
import { trackTaskSelection } from '../fixtures/task-selection'

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
    refreshItemPositions: () => {},
    refreshManDays: vi.fn(),
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
  state,
  mutations = {},
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
    state,
    mutations,
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
      stubs: {
        // The layout holds the page in its slots.
        PanelLayout: false,
        Schedule: ScheduleStub,
        SearchField: SearchFieldStub,
        ...stubs
      }
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

    // The list saves the whole query of the page: the stub shows its props.
    const SearchQueryList = {
      name: 'SearchQueryList',
      props: {
        entityType: { type: String, default: null },
        keptQueryKeys: { type: Array, default: () => [] },
        queries: { type: Array, default: () => [] },
        withRouteQuery: { type: Boolean, default: false }
      },
      template: '<div />'
    }

    const mountList = async (getters = {}) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const { wrapper } = await mountPage({
        section: 'tasks',
        stubs: { SearchQueryList, TaskList: TaskListStub },
        actions: { loadScheduleItems: vi.fn(() => []) },
        getters: {
          assetValidationColumns: () => [],
          user: () => ({ id: 'manager-1', departments: [], full_name: 'M' }),
          ...getters
        }
      })
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      return { SearchQueryList, wrapper }
    }

    // The search field saved its text alone.
    it('saves the search and every filter from its list of searches', async () => {
      const { wrapper } = await mountList()
      const list = wrapper.findComponent(SearchQueryList)

      expect(list.props('withRouteQuery')).toBe(true)
      // the task picked is no filter
      expect(list.props('keptQueryKeys')).toEqual(['task_id'])
      expect(wrapper.findComponent(SearchFieldStub).props('canSave')).toBe(
        false
      )
      wrapper.unmount()
    })

    it('reads a search saved as a text as the search of the page', async () => {
      const { wrapper } = await mountList({
        taskSearchQueries: () => [
          { id: 'text', entity_type: 'Asset', search_query: 'retake chara' },
          { id: 'old', entity_type: 'Asset', search_query: 'modeling=wip' },
          {
            id: 'query',
            entity_type: 'Asset',
            search_query: 'search=chair&priority=2'
          },
          { id: 'shot', entity_type: 'Shot', search_query: 'wip' }
        ]
      })

      expect(
        wrapper
          .findComponent(SearchQueryList)
          .props('queries')
          .map(query => query.search_query)
      ).toEqual([
        'search=retake+chara',
        'search=modeling%3Dwip',
        'search=chair&priority=2'
      ])
      wrapper.unmount()
    })

    // Zou files a search under a free text, its entity type: the task type
    // goes there.
    it('saves its searches under its task type', async () => {
      const { SearchQueryList, wrapper } = await mountList()

      expect(wrapper.findComponent(SearchQueryList).props('entityType')).toBe(
        'task-type-1'
      )
      wrapper.unmount()
    })

    it('lists the searches of its task type, and those saved for all of them', async () => {
      const { wrapper } = await mountList({
        taskSearchQueries: () => [
          { id: 'own', entity_type: 'task-type-1', search_query: 'priority=2' },
          { id: 'other', entity_type: 'task-type-2', search_query: 'late=late' },
          { id: 'all', entity_type: 'Asset', search_query: 'search=chair' },
          { id: 'shot', entity_type: 'Shot', search_query: 'search=sh01' }
        ]
      })

      expect(
        wrapper
          .findComponent(SearchQueryList)
          .props('queries')
          .map(query => query.id)
      ).toEqual(['own', 'all'])
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

    // The modal cannot judge every name: € is "eur" for Zou.
    it('tells a name Zou says is taken, until the next opening', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const refusal = Object.assign(new Error('Bad Request'), {
        status: 400,
        body: { message: 'Metadata descriptor already exists.' }
      })
      const page = await mountPage({
        section: 'tasks',
        actions: {
          addMetadataDescriptor: vi.fn(() => Promise.reject(refusal))
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
      const openNew = () =>
        wrapper
          .findAllComponents(ButtonSimple)
          .find(button => button.props('icon') === 'plus')
          .vm.$emit('click')

      await openNew()
      await modal().vm.$emit('confirm', { name: 'Budget €' })
      await flushPromises()
      expect(modal().props('takenName')).toBe('Budget €')
      expect(modal().props('isError')).toBe(false)
      expect(consoleError).not.toHaveBeenCalled()

      await modal().vm.$emit('cancel')
      await openNew()
      expect(modal().props('active')).toBe(true)
      expect(modal().props('takenName')).toBe('')

      await modal().vm.$emit('confirm', { name: 'Budget €' })
      await flushPromises()
      await modal().vm.$emit('cancel')
      await wrapper
        .findComponent(TaskList)
        .vm.$emit('edit-metadata', descriptor.id)
      expect(modal().props('active')).toBe(true)
      expect(modal().props('takenName')).toBe('')
    })

    // The name field stays open to typing while the save runs, and the
    // modal may close and open on another column before Zou answers.
    it('tells the name sent, and leaves a later opening alone', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const refusal = Object.assign(new Error('Bad Request'), {
        status: 400,
        body: { message: 'Metadata descriptor already exists.' }
      })
      let refuse
      const page = await mountPage({
        section: 'tasks',
        actions: {
          addMetadataDescriptor: vi.fn(
            () =>
              new Promise((resolve, reject) => {
                refuse = () => reject(refusal)
              })
          )
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

      await wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'plus')
        .vm.$emit('click')
      const form = { name: 'Budget €' }
      await modal().vm.$emit('confirm', form)
      form.name = 'Budget € 2'
      refuse()
      await flushPromises()
      expect(modal().props('takenName')).toBe('Budget €')

      await modal().vm.$emit('confirm', { name: 'Difficulty' })
      await modal().vm.$emit('cancel')
      await wrapper
        .findComponent(TaskList)
        .vm.$emit('edit-metadata', descriptor.id)
      refuse()
      await flushPromises()
      expect(modal().props('active')).toBe(true)
      expect(modal().props('takenName')).toBe('')
    })

    // Zou keeps the names of the task columns unique per task type.
    it('checks a new name against the columns of its task type', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const own = {
        ...descriptor,
        entity_type: 'Task',
        task_type_id: 'task-type-1'
      }
      const other = {
        id: 'descriptor-2',
        name: 'Camera',
        entity_type: 'Task',
        task_type_id: 'task-type-2'
      }
      const page = await mountPage({
        section: 'tasks',
        getters: { taskMetadataDescriptors: () => [own, other] }
      })
      wrapper = page.wrapper

      expect(
        wrapper.findComponent(AddMetadataModal).props('descriptors')
      ).toEqual([own])
    })
  })

  describe('task filters', () => {
    const TaskListStub = {
      name: 'TaskList',
      props: { tasks: { type: Array, default: () => [] } },
      emits: ['task-selected'],
      // the tasks tab shows its schedule in the slot of the list
      template: '<div><slot /></div>',
      methods: {
        resetSelection: () => {},
        // as the list does: the store first, then the event
        selectTask(event, task) {
          this.$store.dispatch('addSelectedTask', { task })
          this.$emit('task-selected', task)
        }
      }
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

    // The URL filters are read once the tasks arrive, 100 ms after mounting,
    // and a last timer of the load fires 200 ms later.
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

    const mountSelectable = query => {
      const selection = ref(new Map())
      return mountTasks(
        query,
        {
          nbSelectedTasks: () => selection.value.size,
          selectedTasks: () => selection.value
        },
        {
          actions: {
            addSelectedTask: (context, { task }) => {
              selection.value = new Map([[task.id, task]])
            },
            clearSelectedTasks: () => {
              selection.value = new Map()
            }
          }
        }
      )
    }

    // The load keeps in the URL the filters that are set, and no other: a
    // saved search compares its query to that one. Then it selects the task
    // of the link.
    it.each([
      ['a link with no filter', '', {}],
      ['a link with a filter', '?priority=2', { priority: '2' }],
      ['a link to a task', '?task_id=task-10', { task_id: 'task-10' }],
      ['a link to a task the page cannot find', '?task_id=task-9', {}]
    ])('opens %s without a new history entry', async (_, query, landed) => {
      const historyLength = window.history.length
      await mountSelectable(query)

      expect(wrapper.vm.$route.query).toEqual(landed)
      expect(window.history.length).toBe(historyLength)
    })

    it('lays the page out in panels, the task picked on the side', async () => {
      await mountSelectable('')
      const layout = wrapper.findComponent(PanelLayout)

      expect(wrapper.find('.page-tabs .tabs').exists()).toBe(true)
      // the tabs keep to the list: the task panel runs beside them
      expect(layout.classes()).toContain('side-beside-tabs')
      const filters = wrapper.find('.filters-panel')
      expect(filters.find('.back-link').exists()).toBe(true)
      expect(filters.findComponent(SearchFieldStub).exists()).toBe(true)
      // the status and the sort fold with the filters
      const folded = filters.find('.filters.collapsible')
      expect(
        folded.findComponent({ name: 'ComboboxStatusMultiple' }).exists()
      ).toBe(true)
      expect(
        folded
          .findAllComponents({ name: 'ComboboxStyled' })
          .map(combo => combo.props('label'))
      ).toContain('main.sorted_by')
      // the funnel of the filters follows the search, and the schedule
      // button, an icon alone, leads the buttons
      const toggle = wrapper.findComponent(FiltersToggle)
      const scheduleButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('title') === 'schedule.title')
      expect(toggle.props('icon')).toBe('funnel')
      expect(
        filters.findComponent(SearchFieldStub).element.nextElementSibling
      ).toBe(toggle.element)
      expect(scheduleButton.props('icon')).toBe('calendar')
      expect(scheduleButton.props('text')).toBeUndefined()
      expect(scheduleButton.element.nextElementSibling).toBe(
        wrapper
          .findAllComponents(ButtonSimple)
          .find(button => button.props('icon') === 'plus').element
      )
      expect(
        wrapper.find('.list-panel').findComponent(TaskListStub).exists()
      ).toBe(true)
      expect(wrapper.find('.side-column').exists()).toBe(false)
      expect(layout.props('sideFocused')).toBe(false)

      wrapper.findComponent(TaskListStub).vm.selectTask({}, statusTasks[0])
      await flushPromises()

      const side = wrapper.find('.side-column')
      expect(side.findComponent({ name: 'TaskInfo' }).exists()).toBe(true)
      // on a phone the task shows in place of the list, with a way back
      expect(layout.props('sideFocused')).toBe(true)
      await side.findComponent('.back-to-list').trigger('click')
      await flushPromises()
      expect(wrapper.find('.side-column').exists()).toBe(false)
    })

    it('offers the display settings of the list on the tasks tab only', async () => {
      await mountTasks('')
      const hasDisplaySettings = () =>
        wrapper.findComponent({ name: 'ComboboxDisplayOptions' }).exists()
      const base = '/productions/production-1/assets/task-types/task-type-1'

      expect(hasDisplaySettings()).toBe(true)

      await wrapper.vm.$router.push(`${base}/schedule`)
      await flushPromises()
      expect(hasDisplaySettings()).toBe(false)

      await wrapper.vm.$router.push(`${base}/estimation`)
      await flushPromises()
      expect(hasDisplaySettings()).toBe(false)
    })

    it('opens the folded filters of the schedule tab on its two dates', async () => {
      await mountTasks('')
      await wrapper.vm.$router.push(
        '/productions/production-1/assets/task-types/task-type-1/schedule'
      )
      await flushPromises()

      const folded = wrapper.find('.filters.collapsible').element.children
      const dates = wrapper.findAllComponents(DateField)
      expect(dates.map(date => date.props('label'))).toEqual([
        'main.start_date',
        'main.end_date'
      ])
      expect(dates.map(date => date.element)).toEqual([folded[0], folded[1]])
      expect(dates.every(date => date.classes('edit-action'))).toBe(true)
    })

    it('sets the options of the schedule after the display settings', async () => {
      await mountTasks('')
      await wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('title') === 'schedule.title')
        .trigger('click')
      await flushPromises()

      // under its label
      const dataDisplay = wrapper.findComponent({ name: 'ComboboxOptions' })
      expect(
        wrapper.findComponent({ name: 'ComboboxDisplayOptions' }).element
          .nextElementSibling
      ).toBe(dataDisplay.element.parentElement)
    })

    it('picks the zoom of the schedule tab in a styled combobox', async () => {
      await mountTasks('')
      await wrapper.vm.$router.push(
        '/productions/production-1/assets/task-types/task-type-1/schedule'
      )
      await flushPromises()

      const zoom = styledCombo('schedule.zoom_level')()
      expect(zoom.props('options').map(option => option.value)).toEqual([
        0, 1, 2, 3
      ])
      expect(zoom.props('modelValue')).toBe(1)
    })

    it('marks the editing a phone hides', async () => {
      await mountTasks('')

      const marked = wrapper
        .findAllComponents(ButtonSimple)
        .filter(button => button.classes('edit-action'))
        .map(button => button.props('icon'))
      expect(marked).toEqual(['plus', 'import', 'export'])
    })

    // A saved search, or Back, changes the query from outside the fields.
    it('follows a query changed from outside its fields', async () => {
      let typed = ''
      const getValue = vi
        .spyOn(SearchFieldStub.methods, 'getValue')
        .mockImplementation(() => typed)
      const setValue = vi
        .spyOn(SearchFieldStub.methods, 'setValue')
        .mockImplementation(value => {
          typed = value
        })
      try {
        await mountTasks('')
        const status = () =>
          wrapper.findComponent(ComboboxStatusMultiple).props('modelValue')

        await wrapper.vm.$router.push({
          query: { search: 'chair', task_status_id: 'status-2' }
        })
        await flushPromises()

        expect(typed).toBe('chair')
        expect(status()).toEqual(['status-2'])
        expect(listedTaskIds()).toEqual(['task-11'])
        expect(wrapper.vm.$route.query).toEqual({
          search: 'chair',
          task_status_id: 'status-2'
        })

        await wrapper.vm.$router.push({ query: {} })
        await flushPromises()

        expect(typed).toBe('')
        expect(status()).toEqual([])
        expect(listedTaskIds()).toEqual(['task-10', 'task-11', 'task-12'])
      } finally {
        getValue.mockRestore()
        setValue.mockRestore()
      }
    })

    it('counts the folded filters set, and clears every filter at once', async () => {
      await mountTasks('?task_status_id=status-2&difficulty=4&retake_count=none')
      const toggle = () => wrapper.findComponent(FiltersToggle)

      expect(toggle().props('count')).toBe(3)
      expect(toggle().props('resettable')).toBe(true)
      expect(listedTaskIds()).toEqual([])

      toggle().vm.$emit('reset')
      await flushPromises()

      expect(wrapper.vm.$route.query).toEqual({})
      expect(listedTaskIds()).toEqual(['task-10', 'task-11', 'task-12'])
      expect(toggle().props('count')).toBe(0)
      expect(toggle().props('resettable')).toBe(false)
    })

    const styledCombo = label => () =>
      wrapper
        .findAllComponents({ name: 'ComboboxStyled' })
        .find(combo => combo.props('label') === label)

    it.each([
      [
        'asset type',
        () => wrapper.findComponent(ComboboxMultiple),
        ['props'],
        'asset_type_id',
        'props'
      ],
      [
        'status',
        () => wrapper.findComponent(ComboboxStatusMultiple),
        ['status-2'],
        'task_status_id',
        'status-2'
      ],
      [
        'difficulty',
        styledCombo('tasks.fields.difficulty'),
        '4',
        'difficulty',
        '4'
      ],
      ['due date', styledCombo('tasks.due_date'), 'dueweek', 'duedate', 'dueweek'],
      ['late', styledCombo('tasks.late'), 'donelate', 'late', 'donelate'],
      ['priority', styledCombo('task_types.fields.priority'), '2', 'priority', '2'],
      [
        'retake count',
        styledCombo('tasks.fields.retake_count'),
        'none',
        'retake_count',
        'none'
      ]
    ])(
      'adds a history entry for a pick in the %s filter',
      async (_, widget, value, key, valueInUrl) => {
        await mountTasks('')
        const historyLength = window.history.length

        widget().vm.$emit('update:modelValue', value)
        await flushPromises()

        expect(wrapper.vm.$route.query).toEqual({ [key]: valueInUrl })
        expect(window.history.length).toBe(historyLength + 1)
      }
    )

    it('adds a history entry for a task picked', async () => {
      await mountSelectable('')
      const historyLength = window.history.length

      wrapper.findComponent(TaskListStub).vm.selectTask({}, statusTasks[0])
      await flushPromises()

      expect(wrapper.vm.$route.query.task_id).toBe('task-10')
      expect(window.history.length).toBe(historyLength + 1)
    })

    it('adds a history entry for a search typed', async () => {
      const getValue = vi.spyOn(SearchFieldStub.methods, 'getValue')
      try {
        await mountTasks('')
        const historyLength = window.history.length

        getValue.mockReturnValue('chair')
        wrapper.findComponent(SearchFieldStub).vm.$emit('change', 'chair')
        await flushPromises()

        expect(wrapper.vm.$route.query.search).toBe('chair')
        expect(window.history.length).toBe(historyLength + 1)
      } finally {
        getValue.mockRestore()
      }
    })

    it('adds no history entry for the refresh of a remote update', async () => {
      const socket = { on: vi.fn(), off: vi.fn() }
      await mountTasks('', {}, { socket })
      const [, onTaskUpdate] = socket.on.mock.calls.find(
        ([event]) => event === 'task:update'
      )
      const historyLength = window.history.length

      onTaskUpdate({ task_id: 'task-10' })
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()

      expect(wrapper.vm.$route.query).toEqual({})
      expect(window.history.length).toBe(historyLength)
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
        .find(button => button.props('title') === 'schedule.title')
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

    // The search and the filters empty the selection: the task id leaves the
    // URL before their navigation lands, which still adds its history entry.
    describe('with a task selected', () => {
      const selected = ref(0)
      let typed
      let getValue

      beforeEach(async () => {
        typed = ''
        getValue = vi
          .spyOn(SearchFieldStub.methods, 'getValue')
          .mockImplementation(() => typed)
        selected.value = 0
        await mountTasks(
          '',
          {
            nbSelectedTasks: () => selected.value,
            selectedTasks: () =>
              new Map(selected.value ? [['task-10', statusTasks[0]]] : [])
          },
          {
            actions: {
              clearSelectedTasks: () => {
                selected.value = 0
              }
            }
          }
        )
        selected.value = 1
        await flushPromises()
        expect(wrapper.vm.$route.query.task_id).toBe('task-10')
      })

      afterEach(() => getValue.mockRestore())

      it('keeps a search typed in the URL', async () => {
        const historyLength = window.history.length
        typed = 'chair'
        wrapper.findComponent(SearchFieldStub).vm.$emit('change', 'chair')
        await flushPromises()

        expect(wrapper.vm.$route.query.search).toBe('chair')
        expect(wrapper.vm.$route.query.task_id).toBeUndefined()
        expect(window.history.length).toBe(historyLength + 1)
      })

      it('keeps a filter picked in the URL', async () => {
        const historyLength = window.history.length
        wrapper
          .findAllComponents({ name: 'ComboboxStyled' })
          .find(combo => combo.props('label') === 'task_types.fields.priority')
          .vm.$emit('update:modelValue', '2')
        await flushPromises()

        expect(wrapper.vm.$route.query.priority).toBe('2')
        expect(wrapper.vm.$route.query.task_id).toBeUndefined()
        expect(window.history.length).toBe(historyLength + 1)
      })

      // The page stays mounted when the schedule tab opens, on a URL without
      // the filters of the list.
      it('keeps the filters of the list out of the schedule tab', async () => {
        await wrapper.vm.$router.push(
          '/productions/production-1/assets/task-types/task-type-1/schedule'
        )
        // the task panel closed
        selected.value = 0
        await flushPromises()

        expect(wrapper.vm.$route.query).toEqual({})
      })
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
          .find(button => button.props('title') === 'schedule.title')
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
          .find(button => button.props('title') === 'schedule.title')
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
          .find(button => button.props('title') === 'schedule.title')
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

  // A link to a task opens the page with that task selected, in the list
  // that the filters of the link leave.
  describe('selection from a link to a task', () => {
    // Five props sorted by name: the first status keeps the 1st, 4th and 5th.
    const linkTasks = [
      'status-1',
      'status-2',
      'status-2',
      'status-1',
      'status-1'
    ].map((statusId, index) => ({
      id: `task-${index + 20}`,
      assignees: [],
      difficulty: 3,
      entity: { id: `asset-${index + 20}` },
      entity_id: `asset-${index + 20}`,
      entity_name: `Prop ${index + 1}`,
      retake_count: 0,
      task_status_id: statusId,
      task_type_id: 'task-type-1'
    }))
    // unmounted after each test, a failed one included
    let wrapper = null
    let storeActions = null

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    })

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      linkTasks.forEach(({ entity_id }) =>
        assetStore.cache.assetMap.delete(entity_id)
      )
    })

    // The props of the link, loaded by the page or by a visit before.
    const loadProps = () => {
      linkTasks.forEach(linkTask => {
        assetStore.cache.assetMap.set(linkTask.entity_id, {
          id: linkTask.entity_id,
          asset_type_id: 'props',
          tasks: [linkTask.id]
        })
      })
    }

    const openLink = async (query, { isLoaded = false } = {}) => {
      if (isLoaded) loadProps()
      const selection = trackTaskSelection()
      const page = await mountPage({
        section: 'tasks',
        query,
        // the list links each row to its task
        routes: [
          {
            path: '/productions/:production_id/assets/task-types/:task_type_id/:section',
            component: Page
          },
          {
            name: 'task',
            path: '/productions/:production_id/:type/tasks/:task_id',
            component: Page
          }
        ],
        state: selection.state,
        mutations: selection.mutations,
        stubs: { TaskList: false },
        actions: {
          ...selection.actions,
          initTaskType: vi.fn(loadProps),
          loadScheduleItems: vi.fn(() => [])
        },
        getters: {
          ...selection.getters,
          assetValidationColumns: () => [],
          productionAssetTypes: () => [{ id: 'props', name: 'Props' }],
          taskMap: () => new Map(linkTasks.map(t => [t.id, t])),
          taskTypeMap: () => new Map(),
          user: () => ({ id: 'manager-1', departments: [], full_name: 'M' })
        }
      })
      wrapper = page.wrapper
      storeActions = page.storeActions
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      return selection
    }

    // A Shift+click reached past the list and threw: the filter had dropped
    // rows above the task.
    it('extends a Shift+click from the task of a link with a filter', async () => {
      const selection = await openLink('?task_status_id=status-1&task_id=task-24')
      expect(selection.selectedIds()).toEqual(['task-24'])

      await wrapper.findAll('tbody td.name')[0].trigger('click', {
        shiftKey: true
      })

      expect(selection.selectedIds()).toEqual(['task-20', 'task-23', 'task-24'])
    })

    it('moves Alt+Up from the task of a link with a filter', async () => {
      const selection = await openLink('?task_status_id=status-1&task_id=task-24')

      window.dispatchEvent(
        new KeyboardEvent('keydown', { altKey: true, keyCode: 38 })
      )
      await nextTick()

      expect(selection.selectedIds()).toEqual(['task-23'])
    })

    // The panel shows the task, but no row: a Shift+click starts from the
    // first row, as on a page just opened.
    it('extends a Shift+click from the first row when the filter hides the task', async () => {
      const selection = await openLink('?task_status_id=status-1&task_id=task-22')
      expect(selection.selectedIds()).toEqual(['task-22'])

      await wrapper.findAll('tbody td.name')[1].trigger('click', {
        shiftKey: true
      })

      expect(selection.selectedIds()).toEqual(['task-20', 'task-23'])
    })

    // Back on the page, its props were still loaded: it skipped the filter
    // and the task of the URL, and listed every task.
    it('applies the filter and the task of the URL on a return to the page', async () => {
      const historyLength = window.history.length
      const selection = await openLink(
        '?task_status_id=status-1&task_id=task-24',
        { isLoaded: true }
      )

      expect(storeActions.initTaskType).not.toHaveBeenCalled()
      expect(
        wrapper
          .findComponent(TaskList)
          .props('tasks')
          .map(({ id }) => id)
      ).toEqual(['task-20', 'task-23', 'task-24'])
      expect(selection.selectedIds()).toEqual(['task-24'])
      expect(window.history.length).toBe(historyLength)
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

  // The store's task type follows the route: a load still running when the
  // page is left ends under the route of the next page, which has none.
  describe('load of a page left meanwhile', () => {
    const taskType = ref(null)
    const assetTasks = ['task-a', 'task-b'].map(id => ({
      id,
      assignees: [],
      entity_id: `asset-${id}`,
      entity_name: id,
      task_type_id: 'task-type-1'
    }))

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      taskType.value = {
        id: 'task-type-1',
        name: 'Modeling',
        for_entity: 'Asset'
      }
    })

    afterEach(() => {
      assetTasks.forEach(task => assetStore.cache.assetMap.delete(task.entity_id))
    })

    const mountLoadingPage = ({ actions, getters = {} }) =>
      mountPage({
        actions,
        getters: {
          assetValidationColumns: () => [],
          currentTaskType: () => taskType.value,
          taskMap: () => new Map(assetTasks.map(task => [task.id, task])),
          user: () => ({ id: 'manager-1', departments: [], full_name: 'M' }),
          ...getters
        },
        routes: [
          {
            path: '/productions/:production_id/assets/task-types/:task_type_id/:section',
            component: Page
          },
          { path: '/productions/:production_id/shots', component: Page }
        ],
        section: 'tasks'
      })

    // The shots list the user went to holds a search in its URL.
    const leave = async (wrapper, router) => {
      wrapper.unmount()
      taskType.value = {}
      await router.push('/productions/production-1/shots?search=retake')
    }

    // Sentry: GET /api/data/projects/:id/schedule-items/undefined/episodes
    it('asks no episode schedule items when left while its entities load', async () => {
      let endLoad
      const { router, storeActions, wrapper } = await mountLoadingPage({
        actions: {
          initTaskType: vi.fn(
            () => new Promise(resolve => (endLoad = resolve))
          ),
          loadEpisodeScheduleItems: vi.fn(() => [])
        },
        getters: {
          currentEpisode: () => ({ id: 'episode-1', name: 'E01' }),
          isTVShow: () => true
        }
      })
      await vi.advanceTimersByTimeAsync(100)
      expect(storeActions.initTaskType).toHaveBeenCalledTimes(1)

      await leave(wrapper, router)
      endLoad()
      await flushPromises()

      expect(storeActions.loadEpisodeScheduleItems).not.toHaveBeenCalled()
    })

    // The left page ran the search of the next page's URL, then wrote its
    // own empty search field back there: that page listed every row.
    it.each([
      ['its entities load', 'initTaskType', false],
      ['its schedule items load', 'loadScheduleItems', false],
      ['the schedule items of its loaded entities load', 'loadScheduleItems', true]
    ])(
      'keeps the search of the next page when left while %s',
      async (_, pendingAction, isLoaded) => {
        if (isLoaded) {
          assetTasks.forEach(task => {
            assetStore.cache.assetMap.set(task.entity_id, {
              id: task.entity_id,
              tasks: [task.id]
            })
          })
        }
        let endLoad
        const pendingLoad = vi.fn(
          () => new Promise(resolve => (endLoad = resolve))
        )
        const { router, storeActions, wrapper } = await mountLoadingPage({
          actions: {
            initTaskType: vi.fn(),
            loadScheduleItems: vi.fn(() => []),
            [pendingAction]: pendingLoad
          }
        })
        await vi.advanceTimersByTimeAsync(100)
        await flushPromises()
        expect(pendingLoad).toHaveBeenCalledTimes(1)
        expect(storeActions.initTaskType).toHaveBeenCalledTimes(
          isLoaded ? 0 : 1
        )

        await leave(wrapper, router)
        endLoad([])
        await flushPromises()
        await vi.advanceTimersByTimeAsync(200)

        expect(router.currentRoute.value.fullPath).toBe(
          '/productions/production-1/shots?search=retake'
        )
      }
    )

    it('starts no load when left within its first 100 ms', async () => {
      const { router, storeActions, wrapper } = await mountLoadingPage({
        actions: { initTaskType: vi.fn(), loadScheduleItems: vi.fn(() => []) }
      })

      await leave(wrapper, router)
      await vi.advanceTimersByTimeAsync(100)

      expect(storeActions.initTaskType).not.toHaveBeenCalled()
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

    const importColumns = async (forEntity, getters = {}) => {
      // the data load the page starts 100 ms after mounting is not under test
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const mounted = await mountPage({
        getters: {
          currentTaskType: () => ({
            id: 'task-type-1',
            name: 'Layout',
            for_entity: forEntity
          }),
          ...getters
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

    // Zou reads them in expert mode, for the studio managers.
    it('take the real dates of whoever can edit them', async () => {
      const columns = await importColumns('Asset', {
        canEditRealDates: () => true
      })
      const withRealDates = [
        'Estimation',
        'Start date',
        'Due date',
        'WIP date',
        'Feedback date',
        'Approval date',
        'Difficulty'
      ]

      expect(columns.columns).toEqual(['Parent', 'Entity', ...withRealDates])
      expect(columns.listedOptionalColumns).toEqual(withRealDates)
    })
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

    // The filters apply to the three sections: the URL keeps them.
    it('keeps the query of the page from a section to another', async () => {
      const base = '/productions/production-1/assets/task-types/task-type-1'
      const paths = await mountTabs(
        { currentTaskType: () => ({ ...shotTaskType, for_entity: 'Asset' }) },
        `${base}?priority=2`
      )
      expect(paths).toEqual([
        `${base}?priority=2`,
        `${base}/schedule?priority=2`,
        `${base}/estimation?priority=2`
      ])
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

// The schedules of the page: the rows of the people around their bars, and
// a bar whose change Zou refuses, put back with a line above it.
describe('TaskType page, schedule bars', () => {
  // Monday 5 to Friday 9 October
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
  const refuse = () => vi.fn(() => Promise.reject(buildRefusal(403)))
  const format = date => date.format('YYYY-MM-DD')
  const span = bar => [format(bar.startDate), format(bar.endDate)]
  // unmounted after each test, a failed one included
  let wrapper = null

  beforeEach(() => {
    // the data load starts 100 ms after mounting, the schedule dates follow
    // 200 ms after it
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    assetStore.cache.assetMap.set('asset-1', {
      id: 'asset-1',
      tasks: [scheduleTask.id]
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    assetStore.cache.assetMap.delete('asset-1')
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const mountSchedule = async (actions = {}) => {
    const page = await mountPage({
      section: 'schedule',
      // the dates of the task type set on its bar
      mutations: {
        SET_SCHEDULE_ITEM_DATES: scheduleStore.mutations.SET_SCHEDULE_ITEM_DATES
      },
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
        })
      }
    })
    wrapper = page.wrapper
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()
    return page
  }

  const findSchedule = () => wrapper.findComponent({ name: 'Schedule' })
  const findRows = () => findSchedule().props('hierarchy')
  const findBar = () =>
    findRows()
      .flatMap(row => row.children)
      .find(bar => bar.id === 'task-2')
  // the widget stamps where a change found the bar
  const stamp = bar => {
    bar._dragOrigStartDate = bar.startDate.clone()
    bar._dragOrigEndDate = bar.endDate.clone()
    bar._dragOrigEstimation = bar.estimation
  }

  // The row of a person spans their bars: the bars pointed to a copy of it,
  // so a move re-spanned a row no one sees.
  it('re-spans the row shown when one of its bars moves', async () => {
    await mountSchedule()
    const bar = findBar()
    const row = findRows().find(({ id }) => id === person.id)
    stamp(bar)
    bar.startDate = bar.startDate.clone().add(7, 'days')
    bar.endDate = bar.endDate.clone().add(7, 'days')

    findSchedule().vm.$emit('item-changed', bar)
    await flushPromises()

    expect(span(row)).toEqual(['2026-10-12', '2026-10-16'])
  })

  it('puts back a bar whose move Zou refuses, and its row', async () => {
    await mountSchedule({ updateTask: refuse() })
    const bar = findBar()
    const row = bar.parentElement
    stamp(bar)
    bar.startDate = bar.startDate.clone().add(7, 'days')
    bar.endDate = bar.endDate.clone().add(7, 'days')

    findSchedule().vm.$emit('item-changed', bar)
    await flushPromises()

    expect(span(bar)).toEqual(['2026-10-05', '2026-10-09'])
    expect(span(row)).toEqual(['2026-10-05', '2026-10-09'])
    const error = wrapper.findComponent(ErrorText)
    expect(error.props('text')).toBe('main.cell_save_error {"name":"Chair"}')
    expect(error.classes()).toContain('has-text-centered')
    expect(console.error).toHaveBeenCalled()
  })

  it('puts back an estimation typed in the schedule that Zou refuses', async () => {
    await mountSchedule({ updateTask: refuse() })
    const bar = findBar()
    stamp(bar)
    // the widget applies the estimation before it tells
    bar.estimation = 16 * 60
    bar.man_days = 16 * 60

    findSchedule().vm.$emit('estimation-changed', {
      taskId: 'task-2',
      estimation: 16 * 60,
      item: bar,
      daysOff: []
    })
    await flushPromises()

    expect([bar.estimation, bar.man_days]).toEqual([0, 0])
    expect(span(bar)).toEqual(['2026-10-05', '2026-10-09'])
    // the man-days of its row add up its bars again
    expect(ScheduleStub.methods.refreshManDays).toHaveBeenCalledWith(
      bar.parentElement
    )
    expect(wrapper.findComponent(ErrorText).props('text')).toBe(
      'main.cell_save_error {"name":"Chair"}'
    )
  })

  // A change Zou took stays when a later one is refused.
  it('puts back the task type dates Zou took before a refused change', async () => {
    await mountSchedule({
      saveScheduleItem: vi
        .fn()
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(buildRefusal(403))
    })
    const fieldDate = index =>
      wrapper
        .findAllComponents(DateField)
        [index].props('modelValue')
        .toISOString()
        .slice(0, 10)

    wrapper
      .findAllComponents(DateField)[1]
      .vm.$emit('update:model-value', new Date('2026-10-23T00:00:00Z'))
    await flushPromises()
    wrapper
      .findAllComponents(DateField)[0]
      .vm.$emit('update:model-value', new Date('2026-10-12T00:00:00Z'))
    await flushPromises()

    expect([fieldDate(0), fieldDate(1)]).toEqual(['2026-10-01', '2026-10-23'])
  })

  // Two dates picked before the first answer: the fields show what Zou took.
  it('keeps the task type dates Zou took after an overlapping refusal', async () => {
    const settles = []
    await mountSchedule({
      saveScheduleItem: vi.fn(
        () =>
          new Promise((resolve, reject) => {
            settles.push({ resolve, reject })
          })
      )
    })
    const fieldDate = index =>
      wrapper
        .findAllComponents(DateField)
        [index].props('modelValue')
        .toISOString()
        .slice(0, 10)

    wrapper
      .findAllComponents(DateField)[0]
      .vm.$emit('update:model-value', new Date('2026-10-12T00:00:00Z'))
    await flushPromises()
    wrapper
      .findAllComponents(DateField)[1]
      .vm.$emit('update:model-value', new Date('2026-10-23T00:00:00Z'))
    await flushPromises()
    settles[0].reject(buildRefusal(403))
    await flushPromises()
    settles[1].resolve()
    await flushPromises()

    expect([fieldDate(0), fieldDate(1)]).toEqual(['2026-10-12', '2026-10-23'])
  })

  // The dates of the task type are those of its bar on the production
  // schedule.
  it.each([
    ['start', 0, '2026-10-12', '2026-10-01'],
    ['end', 1, '2026-10-23', '2026-10-30']
  ])(
    'puts back the %s date of the task type Zou refuses',
    async (_, index, picked, saved) => {
      const { storeActions } = await mountSchedule({
        saveScheduleItem: refuse()
      })

      wrapper
        .findAllComponents(DateField)
        [index].vm.$emit('update:model-value', new Date(`${picked}T00:00:00Z`))
      await flushPromises()

      expect(storeActions.saveScheduleItem).toHaveBeenCalledTimes(1)
      expect(
        wrapper
          .findAllComponents(DateField)
          [index].props('modelValue')
          .toISOString()
          .slice(0, 10)
      ).toBe(saved)
      expect(wrapper.findComponent(ErrorText).props('text')).toBe(
        'main.cell_save_error {"name":"Modeling"}'
      )
    }
  )
})
