import { flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

// Importing the panel transitively pulls in the root store
// (assets module → lib/models → timezone → @/store); stub it so no Vuex
// store is built.
vi.mock('@/store', () => ({ default: {} }))

import errors from '@/lib/errors'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import ActionPanel from '@/components/tops/ActionPanel.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'

import { shallowMountWithI18n } from '../fixtures/i18n'

const statuses = [
  { id: 'status-retake', name: 'Retake', short_name: 'retake' },
  { id: 'status-wip', name: 'Work In Progress', short_name: 'wip' }
]

const buildTasks = nbTasks =>
  Array.from({ length: nbTasks }, (_, index) => ({
    id: `task-${index}`,
    project_id: 'production-1',
    task_type_id: 'task-type-1',
    task_status_id: 'status-wip'
  }))

// What the panel says, with the real English messages.
describe('ActionPanel, status change messages', () => {
  const mountedPanels = []

  const mountPanel = async (nbTasks = 3) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/productions/:production_id/shots',
          name: 'shots',
          component: { template: '<div />' }
        }
      ]
    })
    await router.push('/productions/production-1/shots')
    await router.isReady()
    const tasks = buildTasks(nbTasks)
    const store = createStore({
      getters: {
        assetsByType: () => [],
        conceptFolders: () => [],
        currentProduction: () => ({ id: 'production-1' }),
        currentUserRoleForProduction: () => () => 'manager',
        getCustomActionsByType: () => () => [],
        isCurrentUserAdmin: () => false,
        isCurrentUserArtist: () => false,
        isCurrentUserClient: () => false,
        isShowAssignations: () => true,
        nbSelectedTasks: () => tasks.length,
        nbSelectedValidations: () => 0,
        productionMap: () => new Map(),
        selectedAssets: () => new Map(),
        selectedConcepts: () => new Map(),
        selectedEdits: () => new Map(),
        selectedShots: () => new Map(),
        selectedTasks: () => new Map(tasks.map(task => [task.id, task])),
        selectedValidations: () => new Map(),
        taskMap: () => new Map(tasks.map(task => [task.id, task])),
        taskStatusForCurrentUser: () => statuses,
        taskStatusMap: () =>
          new Map(statuses.map(status => [status.id, status])),
        taskTypeMap: () => new Map(),
        user: () => ({ id: 'user-1', departments: [] })
      }
    })
    store.dispatch = vi.fn(() => Promise.resolve())
    const wrapper = shallowMountWithI18n(ActionPanel, {
      props: { productionId: 'production-1' },
      global: { plugins: [router, store], stubs: { AtTextarea: false } }
    })
    await flushPromises()
    mountedPanels.push(wrapper)
    return { store, wrapper }
  }

  const chooseStatus = async (wrapper, statusId) => {
    wrapper
      .findComponent(ComboboxStatus)
      .vm.$emit('update:model-value', statusId)
    await flushPromises()
  }

  const modal = wrapper => wrapper.findComponent(ConfirmModal)

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    mountedPanels
      .splice(0)
      .filter(wrapper => wrapper.exists())
      .forEach(wrapper => wrapper.unmount())
  })

  test('names the status and the number of tasks to confirm', async () => {
    const { wrapper } = await mountPanel()

    await chooseStatus(wrapper, 'status-wip')

    expect(modal(wrapper).props('text')).toBe(
      'Change the status of the 3 selected tasks to Work In Progress?'
    )
  })

  test('invites to select a status', async () => {
    const { wrapper } = await mountPanel()

    expect(wrapper.findComponent(ComboboxStatus).props('placeholder')).toBe(
      'Select a status'
    )
  })

  test('announces a comment alone on the button and in the modal', async () => {
    const { wrapper } = await mountPanel()

    await wrapper.find('.action-bar textarea').setValue('Check the timing')

    expect(wrapper.find('.action-bar .confirm-button').text()).toBe(
      'Post the comment on the 3 selected tasks'
    )
    expect(modal(wrapper).props('text')).toBe(
      'Post the comment on the 3 selected tasks?'
    )
  })

  test('warns that a failure may have changed some of the tasks', async () => {
    const { wrapper } = await mountPanel()

    expect(modal(wrapper).props('errorText')).toBe(
      'An error occurred while updating the 3 selected tasks: some of them may have changed. Check them before trying again.'
    )
  })

  test('tells the failure on one task in the bar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { store, wrapper } = await mountPanel(1)
    const refusal = new Error('Refused')
    errors.markRequestFailure(refusal)
    store.dispatch.mockRejectedValueOnce(refusal)
    await chooseStatus(wrapper, 'status-wip')

    await wrapper.find('.action-bar .confirm-button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.action-bar p.is-danger').text()).toBe(
      'An error occurred while updating the selected task.'
    )
  })
})

// The list of the comment form of a task follows the order of its
// production: the panel shows the same order.
describe('ActionPanel, order of the statuses', () => {
  const mountedPanels = []

  const productionMap = new Map([
    [
      'production-1',
      {
        id: 'production-1',
        task_statuses: ['status-retake', 'status-wip'],
        task_statuses_link: {
          'status-retake': { priority: 2 },
          'status-wip': { priority: 1 }
        }
      }
    ],
    [
      'production-2',
      {
        id: 'production-2',
        task_statuses: ['status-retake', 'status-wip'],
        task_statuses_link: {
          'status-retake': { priority: 1 },
          'status-wip': { priority: 2 }
        }
      }
    ]
  ])

  const openStatusList = async (
    path,
    tasks,
    currentProductionId = 'production-1'
  ) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/my-tasks',
          name: 'todos',
          component: { template: '<div />' }
        },
        {
          path: '/productions/:production_id/shots',
          name: 'shots',
          component: { template: '<div />' }
        }
      ]
    })
    await router.push(path)
    await router.isReady()
    const store = createStore({
      getters: {
        assetsByType: () => [],
        conceptFolders: () => [],
        currentProduction: () => productionMap.get(currentProductionId),
        currentUserRoleForProduction: () => () => 'manager',
        getCustomActionsByType: () => () => [],
        getProductionTaskTypes: () => () => [],
        isCurrentUserAdmin: () => false,
        isCurrentUserArtist: () => false,
        isCurrentUserClient: () => false,
        isDarkTheme: () => false,
        isShowAssignations: () => true,
        nbSelectedTasks: () => tasks.length,
        nbSelectedValidations: () => 0,
        productionMap: () => productionMap,
        selectedAssets: () => new Map(),
        selectedConcepts: () => new Map(),
        selectedEdits: () => new Map(),
        selectedShots: () => new Map(),
        selectedTasks: () => new Map(tasks.map(task => [task.id, task])),
        selectedValidations: () => new Map(),
        taskMap: () => new Map(tasks.map(task => [task.id, task])),
        taskStatusForCurrentUser: () => statuses,
        taskStatusMap: () =>
          new Map(statuses.map(status => [status.id, status])),
        taskTypeMap: () => new Map(),
        user: () => ({ id: 'user-1', departments: [] })
      }
    })
    const wrapper = shallowMountWithI18n(ActionPanel, {
      props: { productionId: tasks[0].project_id },
      global: {
        plugins: [router, store],
        stubs: { ComboboxStatus: false }
      }
    })
    await flushPromises()
    mountedPanels.push(wrapper)
    if (!wrapper.find('.action-bar').exists()) {
      await wrapper.find('.status-item').trigger('click')
    }
    await wrapper.find('.action-bar [role="combobox"]').trigger('click')
    return wrapper
  }

  const listedStatuses = wrapper =>
    wrapper
      .findAll('.action-bar [role="option"] .tag')
      .map(tag => tag.attributes('title'))

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    mountedPanels
      .splice(0)
      .filter(wrapper => wrapper.exists())
      .forEach(wrapper => wrapper.unmount())
  })

  test('follows the production of the selected tasks', async () => {
    const wrapper = await openStatusList(
      '/productions/production-1/shots',
      buildTasks(2)
    )

    expect(listedStatuses(wrapper)).toEqual(['Work In Progress', 'Retake'])
  })

  // On My Tasks, the current production can be any other one.
  test('follows the production of the selected tasks on My Tasks', async () => {
    const wrapper = await openStatusList(
      '/my-tasks',
      buildTasks(2),
      'production-2'
    )

    expect(listedStatuses(wrapper)).toEqual(['Work In Progress', 'Retake'])
  })

  test('stays sorted by name for tasks of several productions', async () => {
    const tasks = buildTasks(2)
    tasks[1].project_id = 'production-2'

    const wrapper = await openStatusList('/my-tasks', tasks)

    expect(listedStatuses(wrapper)).toEqual(['Retake', 'Work In Progress'])
  })
})

// The comment of the bar offers what the comment form of a task offers
// after @ and #. For several tasks, it leaves out the frame, which points at
// the preview of one task, and All: Zou copies an #All comment to every other
// task of each selected entity.
describe('ActionPanel, suggestions of the comment', () => {
  const mountedPanels = []

  const person = (id, firstName) => ({
    id,
    first_name: firstName,
    last_name: 'Doe',
    full_name: `${firstName} Doe`
  })
  const alice = person('person-alice', 'Alice')
  const bob = person('person-bob', 'Bob')

  const taskTypes = [
    {
      id: 'task-type-layout',
      name: 'Layout',
      for_entity: 'Shot',
      department_id: 'department-layout'
    },
    { id: 'task-type-modeling', name: 'Modeling', for_entity: 'Asset' },
    {
      id: 'task-type-animation',
      name: 'Animation',
      for_entity: 'Shot',
      department_id: 'department-animation'
    },
    {
      id: 'task-type-fx',
      name: 'FX',
      for_entity: 'Shot',
      department_id: 'department-fx'
    }
  ]

  const departments = [
    { id: 'department-animation', name: 'Animation', color: '#ff3860' },
    { id: 'department-fx', name: 'FX', color: '#3273dc' },
    { id: 'department-layout', name: 'Layout', color: '#00b242' },
    { id: 'department-other', name: 'Other', color: '#999999' }
  ]

  const productionMap = new Map([
    [
      'production-1',
      {
        id: 'production-1',
        task_types: [
          'task-type-layout',
          'task-type-modeling',
          'task-type-animation'
        ],
        team: [alice.id, bob.id]
      }
    ],
    [
      'production-2',
      {
        id: 'production-2',
        task_types: ['task-type-layout', 'task-type-fx'],
        team: [bob.id]
      }
    ],
    [
      'production-3',
      { id: 'production-3', task_types: [], team: [alice.id, bob.id] }
    ]
  ])

  // otherTasks: tasks of the page beyond the selection.
  const mountOn = async (path, tasks, team = [alice, bob], otherTasks = []) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/my-tasks',
          name: 'todos',
          component: { template: '<div />' }
        },
        {
          path: '/productions/:production_id/shots',
          name: 'shots',
          component: { template: '<div />' }
        }
      ]
    })
    await router.push(path)
    await router.isReady()
    const store = createStore({
      state: { selection: tasks, otherTasks },
      getters: {
        assetsByType: () => [],
        conceptFolders: () => [],
        currentProduction: () => productionMap.get('production-1'),
        currentUserRoleForProduction: () => () => 'manager',
        departmentMap: () =>
          new Map(departments.map(department => [department.id, department])),
        getCustomActionsByType: () => () => [],
        // As the store: a production that lists no task type has them all.
        getProductionTaskTypes: () => productionId => {
          const taskTypeIds = productionMap.get(productionId).task_types
          return taskTypeIds.length
            ? taskTypes.filter(taskType => taskTypeIds.includes(taskType.id))
            : taskTypes
        },
        isCurrentUserAdmin: () => false,
        isCurrentUserArtist: () => false,
        isCurrentUserClient: () => false,
        isShowAssignations: () => true,
        nbSelectedTasks: state => state.selection.length,
        nbSelectedValidations: () => 0,
        personMap: () => new Map([alice, bob].map(member => [member.id, member])),
        productionMap: () => productionMap,
        selectedAssets: () => new Map(),
        selectedConcepts: () => new Map(),
        selectedEdits: () => new Map(),
        selectedShots: () => new Map(),
        selectedTasks: state =>
          new Map(state.selection.map(task => [task.id, task])),
        selectedValidations: () => new Map(),
        taskMap: state =>
          new Map(
            [...state.otherTasks, ...state.selection].map(task => [
              task.id,
              task
            ])
          ),
        taskStatusForCurrentUser: () => statuses,
        taskStatusMap: () =>
          new Map(statuses.map(status => [status.id, status])),
        taskTypeMap: () =>
          new Map(taskTypes.map(taskType => [taskType.id, taskType])),
        user: () => ({ id: 'user-1', departments: [] })
      },
      mutations: {
        SELECT_TASK: (state, task) => {
          state.selection = [...state.selection, task]
        }
      }
    })
    store.dispatch = vi.fn(() => Promise.resolve())
    // The task panel gives the team of the production of the first task.
    const wrapper = shallowMountWithI18n(ActionPanel, {
      attachTo: document.body,
      props: { productionId: tasks[0]?.project_id ?? 'production-1', team },
      global: { plugins: [router, store], stubs: { AtTextarea: false } }
    })
    await flushPromises()
    mountedPanels.push(wrapper)
    // Without a selected task, the panel has no status bar.
    const statusItem = wrapper.find('.status-item')
    if (!wrapper.find('.action-bar').exists() && statusItem.exists()) {
      await statusItem.trigger('click')
    }
    return { store, wrapper }
  }

  const suggestions = wrapper =>
    wrapper.findComponent({ name: 'AtTextarea' }).props('members')
  const isPerson = member =>
    !member.isDepartment && !member.isTaskType && !member.isTime
  const isFrame = member => Boolean(member.isTime)
  const isDepartment = member => Boolean(member.isDepartment)
  const isTaskType = member => Boolean(member.isTaskType)
  const suggested = (wrapper, kind) =>
    suggestions(wrapper)
      .filter(kind)
      .map(member => member.full_name)

  const commentField = wrapper => wrapper.find('.action-bar textarea')
  // vue-at opens its list 10 ms after the keystroke.
  const typeComment = async (wrapper, text) => {
    await commentField(wrapper).setValue(text)
    await vi.advanceTimersByTimeAsync(20)
  }
  const isListOpen = wrapper =>
    wrapper.find('.action-bar .atwho-panel').exists()
  const pressOn = async element => {
    element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(20)
  }

  const shotTasks = () =>
    buildTasks(2).map((task, index) => ({
      ...task,
      entity_id: `shot-${index}`,
      task_type_id: 'task-type-layout'
    }))
  const shotTask = (entityId, taskTypeId, productionId = 'production-1') => ({
    id: `${entityId}-${taskTypeId}`,
    entity_id: entityId,
    project_id: productionId,
    task_type_id: taskTypeId,
    task_status_id: 'status-wip'
  })

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    mountedPanels
      .splice(0)
      .filter(wrapper => wrapper.exists())
      .forEach(wrapper => wrapper.unmount())
    vi.useRealTimers()
  })

  test('offers the team, the departments, and the task types', async () => {
    // For tasks of one production, the team the task panel gives.
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      shotTasks(),
      [alice],
      [shotTask('shot-0', 'task-type-animation')]
    )

    expect(wrapper.findComponent({ name: 'AtTextarea' }).props('ats')).toEqual(
      ['#', '@']
    )
    expect(suggested(wrapper, isPerson)).toEqual(['Alice Doe'])
    expect(suggested(wrapper, isDepartment)).toEqual(['Animation', 'Layout'])
    expect(suggested(wrapper, isTaskType)).toEqual([
      'Layout',
      'Animation'
    ])
  })

  test('follows every production of the selection', async () => {
    const tasks = shotTasks()
    tasks[0].project_id = 'production-2'

    const { wrapper } = await mountOn('/my-tasks', tasks, [bob], [
      shotTask('shot-0', 'task-type-fx', 'production-2'),
      shotTask('shot-1', 'task-type-animation')
    ])

    // Zou looks for a name in the team of the production of each task.
    expect(suggested(wrapper, isPerson)).toEqual(['Alice Doe', 'Bob Doe'])
    expect(suggested(wrapper, isDepartment)).toEqual([
      'Animation',
      'FX',
      'Layout'
    ])
    expect(suggested(wrapper, isTaskType)).toEqual([
      'Layout',
      'FX',
      'Animation'
    ])
  })

  // Zou copies a hashtag comment only to the tasks each entity has.
  test('offers the task types of the tasks of the selected entity', async () => {
    const [task] = shotTasks()

    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      [task],
      [alice],
      [shotTask('shot-1', 'task-type-animation')]
    )

    expect(suggested(wrapper, isTaskType)).toEqual(['Layout', 'All'])
  })

  test('offers the frame for one selected task only', async () => {
    const [firstTask, secondTask] = shotTasks()
    const { store, wrapper } = await mountOn(
      '/productions/production-1/shots',
      [firstTask],
      [alice]
    )
    await wrapper.setProps({ isMoviePreview: true })
    expect(suggested(wrapper, isFrame)).toEqual(['frame'])

    store.commit('SELECT_TASK', secondTask)
    await vi.advanceTimersByTimeAsync(20)
    expect(suggested(wrapper, isFrame)).toEqual([])
  })

  // The task panel gives the frame of its preview, as to the comment form.
  test('writes the frame of the preview of the task panel', async () => {
    const [task] = shotTasks()
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      [task],
      [alice]
    )
    await wrapper.setProps({
      fps: 25,
      getFrame: () => 29,
      isMoviePreview: true,
      revision: 2
    })

    await typeComment(wrapper, 'Ready @fra')
    await commentField(wrapper).trigger('keydown.enter')

    expect(commentField(wrapper).element.value).toBe(
      'Ready v2 00:00:01:04 (30) '
    )
  })

  test('leaves a typed @frame as it is for several selected tasks', async () => {
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      shotTasks(),
      [alice]
    )
    await wrapper.setProps({
      fps: 25,
      getFrame: () => 29,
      isMoviePreview: true,
      revision: 2
    })

    await typeComment(wrapper, 'Ready @frame ')

    expect(commentField(wrapper).element.value).toBe('Ready @frame ')
  })

  // A frame points at a movie: a picture or no preview has none.
  test('leaves the frame out beside a picture', async () => {
    const [task] = shotTasks()
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      [task],
      [alice]
    )
    await wrapper.setProps({ fps: 25, getFrame: () => 29, revision: 2 })

    expect(suggested(wrapper, isFrame)).toEqual([])
    await typeComment(wrapper, 'Ready @frame ')
    expect(commentField(wrapper).element.value).toBe('Ready @frame ')
  })

  // For one task, All copies the comment to the other tasks of its entity, as
  // from the comment form of the task.
  test('offers All for one selected task only', async () => {
    const [firstTask, secondTask] = shotTasks()
    const { store, wrapper } = await mountOn(
      '/productions/production-1/shots',
      [firstTask],
      [alice]
    )
    expect(suggested(wrapper, isTaskType)).toContain('All')

    store.commit('SELECT_TASK', secondTask)
    await vi.advanceTimersByTimeAsync(20)
    expect(suggested(wrapper, isTaskType)).not.toContain('All')
  })

  // Without a selected task, the # list names no task type: the walk of
  // every task loaded is left out.
  test('leaves the loaded tasks alone without a selected task', async () => {
    let entityReads = 0
    const otherTask = {
      ...shotTask('shot-9', 'task-type-layout'),
      get entity_id() {
        entityReads += 1
        return 'shot-9'
      }
    }
    const [task] = shotTasks()
    const { store } = await mountOn(
      '/productions/production-1/shots',
      [],
      [alice],
      [otherTask]
    )
    expect(entityReads).toBe(0)

    store.commit('SELECT_TASK', task)
    await vi.advanceTimersByTimeAsync(20)
    expect(entityReads).toBeGreaterThan(0)
  })

  test('offers the task types of every selected entity', async () => {
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      shotTasks(),
      [alice],
      [shotTask('shot-1', 'task-type-animation')]
    )

    expect(suggested(wrapper, isTaskType)).toEqual(['Layout', 'Animation'])
  })

  test('offers the departments of every task type to a production with no task type list', async () => {
    const tasks = shotTasks().map(task => ({
      ...task,
      project_id: 'production-3'
    }))

    const { wrapper } = await mountOn('/my-tasks', tasks)

    expect(suggested(wrapper, isDepartment)).toEqual([
      'Animation',
      'FX',
      'Layout'
    ])
  })

  test('follows the departments of the selection when the team stays', async () => {
    const { store, wrapper } = await mountOn('/my-tasks', shotTasks())
    expect(suggested(wrapper, isDepartment)).toEqual(['Animation', 'Layout'])

    store.state.selection = shotTasks().map(task => ({
      ...task,
      project_id: 'production-3'
    }))
    await vi.advanceTimersByTimeAsync(20)

    expect(suggested(wrapper, isDepartment)).toEqual([
      'Animation',
      'FX',
      'Layout'
    ])
  })

  test('posts the text of the field with the picked suggestion', async () => {
    const { store, wrapper } = await mountOn(
      '/productions/production-1/shots',
      shotTasks()
    )
    await typeComment(wrapper, 'Ready @Lay')
    await commentField(wrapper).trigger('keydown.enter')

    await wrapper.find('.action-bar .confirm-button').trigger('click')
    wrapper.findComponent(ConfirmModal).vm.$emit('confirm')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('changeSelectedTaskStatus', {
      taskStatusId: '',
      comment: 'Ready @Layout '
    })
  })

  // vue-at picks its highlighted entry on Enter, whatever the modifiers.
  test.each([
    ['Ctrl', 'ctrlKey'],
    ['Cmd', 'metaKey']
  ])(
    'posts the text as typed on %s+Enter, its list open',
    async (key, modifier) => {
      const { store, wrapper } = await mountOn(
        '/productions/production-1/shots',
        shotTasks()
      )
      await typeComment(wrapper, 'Ready @Lay')
      expect(isListOpen(wrapper)).toBe(true)

      await commentField(wrapper).trigger('keydown.enter', { [modifier]: true })
      await commentField(wrapper).trigger('keyup.enter', { [modifier]: true })
      wrapper.findComponent(ConfirmModal).vm.$emit('confirm')
      await flushPromises()

      expect(isListOpen(wrapper)).toBe(false)
      expect(store.dispatch).toHaveBeenCalledWith('changeSelectedTaskStatus', {
        taskStatusId: '',
        comment: 'Ready @Lay'
      })
    }
  )

  // The list lies over the button, and over the confirmation it opens.
  test('closes its list on a press elsewhere, not on the list', async () => {
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      shotTasks()
    )
    await typeComment(wrapper, 'Ready @')
    expect(isListOpen(wrapper)).toBe(true)

    await pressOn(wrapper.find('.action-bar .atwho-li').element)
    expect(isListOpen(wrapper)).toBe(true)

    await pressOn(document.body)
    expect(isListOpen(wrapper)).toBe(false)
  })

  test('closes its list once the focus leaves the field', async () => {
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      shotTasks()
    )
    await typeComment(wrapper, 'Ready @')

    // A focus on the field keeps the list: vue-at focuses it again when an
    // entry is picked.
    commentField(wrapper).element.focus()
    await vi.advanceTimersByTimeAsync(20)
    expect(isListOpen(wrapper)).toBe(true)

    // Tab goes to the button, under the list.
    wrapper.find('.action-bar .confirm-button').element.focus()
    await vi.advanceTimersByTimeAsync(20)
    expect(isListOpen(wrapper)).toBe(false)
  })

  test('closes its list when the change is confirmed', async () => {
    const { wrapper } = await mountOn(
      '/productions/production-1/shots',
      shotTasks()
    )
    await typeComment(wrapper, 'Ready @')

    await wrapper.find('.action-bar .confirm-button').trigger('click')

    expect(isListOpen(wrapper)).toBe(false)
  })

  // vue-at reopens its list at each change of its members.
  test('keeps its list closed while its suggestions change', async () => {
    const { store, wrapper } = await mountOn('/my-tasks', shotTasks())
    await typeComment(wrapper, 'Ready @')
    await pressOn(document.body)

    // The task panel builds its team again when the first task changes.
    await wrapper.setProps({ team: [alice, bob] })
    await vi.advanceTimersByTimeAsync(20)
    expect(isListOpen(wrapper)).toBe(false)

    store.commit('SELECT_TASK', {
      ...shotTasks()[0],
      id: 'task-new',
      project_id: 'production-2'
    })
    await vi.advanceTimersByTimeAsync(20)
    expect(isListOpen(wrapper)).toBe(false)
    expect(suggested(wrapper, isDepartment)).toEqual([
      'Animation',
      'FX',
      'Layout'
    ])
  })
})
