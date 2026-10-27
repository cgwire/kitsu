import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
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

import { BrokenFileReader, GoneFileReader } from '../fixtures/file-reader'

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
            app.config.globalProperties.$t = key => key
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
const taskTypeRoute = (name, path) => ({
  name,
  path,
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
    '/productions/:production_id/episodes/task-types/:task_type_id'
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
      template: '<div />',
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
    const mountTasks = async query => {
      const page = await mountPage({
        section: 'tasks',
        query,
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
          loadScheduleItems: vi.fn(() => [])
        },
        getters: {
          assetValidationColumns: () => [],
          productionAssetTypes: () => [
            { id: 'chars', name: 'Characters' },
            { id: 'props', name: 'Props' }
          ],
          taskMap: () => new Map(statusTasks.map(t => [t.id, t])),
          user: () => ({ id: 'manager-1', departments: [], full_name: 'M' })
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

    it('is shown for an episode task type with all episodes in the store', async () => {
      const shown = await hasImportButton(
        {
          currentEpisode: () => ({ id: 'all' }),
          currentTaskType: () => ({ ...shotTaskType, for_entity: 'Episode' })
        },
        '/productions/production-1/episodes/task-types/task-type-1'
      )
      expect(shown).toBe(true)
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
})
