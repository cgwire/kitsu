// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store/api/people', async importOriginal => {
  const { default: peopleApi } = await importOriginal()
  return { default: { ...peopleApi, getContext: vi.fn() } }
})
vi.mock('@/store/api/productions', async importOriginal => {
  const { default: productionsApi } = await importOriginal()
  return { default: { ...productionsApi, getProduction: vi.fn() } }
})

import peopleApi from '@/store/api/people'
import productionsApi from '@/store/api/productions'
import store from '@/store'

const projectStatus = [
  { id: 'status-open', name: 'Open' },
  { id: 'status-closed', name: 'Closed' }
]

const openProduction = {
  id: 'production-open',
  name: 'Open production',
  project_status_id: 'status-open',
  task_types: []
}

const closedProduction = roles => ({
  id: 'production-closed',
  name: 'Closed production',
  project_status_id: 'status-closed',
  task_types: [],
  task_statuses_link: { 'task-status-1': { roles_for_board: roles } }
})

const context = {
  asset_types: [],
  custom_actions: [],
  departments: [],
  notification_count: 0,
  persons: [],
  plugins: [],
  preview_background_files: [],
  project_roles: {},
  project_status: projectStatus,
  projects: [openProduction],
  search_filter_groups: {},
  search_filters: {},
  status_automations: [],
  studios: [],
  task_status: [],
  task_types: [],
  user_limit: 0
}

const openOn = productionId => {
  store.commit('LOAD_PRODUCTION_STATUS_END', projectStatus)
  store.commit('ADD_PRODUCTION', { ...openProduction })
  store.commit('ADD_PRODUCTION', closedProduction(['user']))
  store.commit('SET_CURRENT_PRODUCTION', productionId)
}

describe('loadContext', () => {
  beforeEach(() => {
    store.commit('RESET_ALL')
    peopleApi.getContext.mockResolvedValue(context)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // The open listing leaves a closed production out. Its settings pages save
  // a value, then read it back from a context reload: the board sent each
  // roles change over the roles it had before the previous one.
  test('refreshes a closed current production', async () => {
    openOn('production-closed')
    productionsApi.getProduction.mockResolvedValue(
      closedProduction(['user', 'manager'])
    )

    await store.dispatch('loadContext')

    expect(productionsApi.getProduction).toHaveBeenCalledWith(
      'production-closed'
    )
    expect(store.getters.currentProduction.task_statuses_link).toEqual({
      'task-status-1': { roles_for_board: ['user', 'manager'] }
    })
  })

  test('takes an open current production from the listing', async () => {
    openOn('production-open')

    await store.dispatch('loadContext')

    expect(productionsApi.getProduction).not.toHaveBeenCalled()
    expect(store.getters.currentProduction.id).toEqual('production-open')
  })

  test('loads the context when the closed production fails to load', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    openOn('production-closed')
    productionsApi.getProduction.mockRejectedValue(new Error('Not found'))

    await store.dispatch('loadContext')

    expect(store.getters.currentProduction.id).toEqual('production-closed')
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
