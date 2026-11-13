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
      global: { plugins: [router, store] }
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
