import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import csv from '@/lib/csv'
import errors from '@/lib/errors'
import personStore from '@/store/modules/people'

import ProductionQuota from '@/components/pages/ProductionQuota.vue'
import PeopleQuotaInfo from '@/components/sides/PeopleQuotaInfo.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'

const shotTaskTypes = [
  { id: 'shot-1', name: 'Layout', for_entity: 'Shot' },
  { id: 'shot-2', name: 'Animation', for_entity: 'Shot' }
]
const currentProduction = { id: 'production-1', name: 'Wing It', team: [] }

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/productions/:production_id/quota/day/:year/:month',
      name: 'quota-day',
      component: ProductionQuota
    },
    {
      path: '/productions/:production_id/quota/week/:year',
      name: 'quota-week',
      component: ProductionQuota
    },
    {
      path: '/productions/:production_id/quota/week/:year/:week/persons/:person_id',
      name: 'quota-week-person',
      component: ProductionQuota
    }
  ]
})

const personWeekPath = week =>
  `/productions/production-1/quota/week/2026/${week}/persons/person-1`

// The shots loads, answered when and how the test decides.
const holdLoads = () => {
  const loads = []
  const load = ({ week }) =>
    new Promise((resolve, reject) => loads.push({ week, resolve, reject }))
  return { loads, load }
}

let wrapper

const mountPage = async (
  query = {},
  {
    quotas = {},
    stubs = {},
    path = '/productions/production-1/quota/day/2026/9',
    loadPersonShots = () => Promise.resolve([])
  } = {}
) => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => currentProduction,
      isCurrentUserArtist: () => false,
      isPaperProduction: () => false,
      isShotsLoading: () => false,
      personMap: () => personStore.cache.personMap,
      productionShotTaskTypes: () => shotTaskTypes,
      shotMap: () => new Map([['shot-a'], ['shot-b']]),
      taskTypeMap: () => new Map(),
      user: () => ({ id: 'user-1' })
    }
  })
  store.dispatch = vi.fn((action, payload) => {
    if (action === 'getPersonQuotaShots') return loadPersonShots(payload)
    return Promise.resolve(action === 'computeQuota' ? quotas : undefined)
  })
  await router.push({ path, query })
  await router.isReady()
  wrapper = shallowMount(ProductionQuota, {
    global: { plugins: [store, router], mocks: { $t: key => key }, stubs }
  })
  await flushPromises()
  return { store, wrapper }
}

describe('ProductionQuota', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // The mounted page keeps a $route watcher that rewrites the query: unmount
  // it so it cannot answer the navigation of the next test.
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
  })

  it('lets the user pick a task type on a first visit', async () => {
    const { wrapper } = await mountPage()

    const combobox = wrapper.findComponent(ComboboxTaskType)
    expect(combobox.exists()).toBe(true)
    expect(combobox.props('modelValue')).toBe('shot-1')
    expect(combobox.props('disabled')).toBe(false)
    expect(wrapper.findComponent(PeopleField).exists()).toBe(false)
  })

  // The page reads the quotas computed by the list through its template ref.
  it('exports the quotas computed by the list', async () => {
    const period = { frames: {}, entries: {} }
    const quota = { day: period, week: period, month: period, year: period }
    const quotas = { 'person-1': quota, total: quota }
    const person = { id: 'person-1', name: 'Jane Doe', full_name: 'Jane Doe' }
    personStore.cache.personMap.set(person.id, person)
    const generateQuotas = vi
      .spyOn(csv, 'generateQuotas')
      .mockImplementation(() => {})

    const { wrapper } = await mountPage({}, { quotas, stubs: { Quota: false } })
    await wrapper
      .findAll('button-simple-stub')
      .find(button => button.attributes('icon') === 'download')
      .trigger('click')

    expect(generateQuotas).toHaveBeenCalledTimes(1)
    const [, exportedQuotas, people, countMode] = generateQuotas.mock.calls[0]
    expect(exportedQuotas).toEqual(quotas)
    expect(people).toEqual([person])
    expect(countMode).toBe('frames')
    personStore.cache.personMap.delete(person.id)
    generateQuotas.mockRestore()
  })

  // A failed load left the panel closed, or loading for good when it was
  // already open.
  it('shows a failed load of the shots of a person in the panel', async () => {
    const failure = new Error('Internal server error')
    errors.markRequestFailure(failure)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { wrapper } = await mountPage(
      {},
      {
        path: personWeekPath(42),
        loadPersonShots: () => Promise.reject(failure)
      }
    )

    const panel = wrapper.findComponent(PeopleQuotaInfo)
    expect(panel.exists()).toBe(true)
    expect(panel.props('isLoading')).toBe(false)
    expect(panel.props('isLoadingError')).toBe(true)
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  // The list shows its shots above the error: those of the week left must
  // not stay listed under the week that failed.
  it('drops the shots of the previous period when a load fails', async () => {
    const failure = new Error('Internal server error')
    errors.markRequestFailure(failure)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let loadShots = () => Promise.resolve([{ id: 'shot-a', weight: 1 }])
    const { wrapper } = await mountPage(
      {},
      { path: personWeekPath(41), loadPersonShots: () => loadShots() }
    )

    loadShots = () => Promise.reject(failure)
    await router.push(personWeekPath(42))
    await flushPromises()

    const panel = wrapper.findComponent(PeopleQuotaInfo)
    expect(panel.props('isLoadingError')).toBe(true)
    expect(panel.props('shots')).toEqual([])
  })

  // A click on a cell loads twice, and the user can move on before an
  // answer: a late answer must not overwrite the panel of the latest load.
  it('keeps the answer of the latest load only', async () => {
    const failure = new Error('Internal server error')
    errors.markRequestFailure(failure)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const shots = [{ id: 'shot-43', weight: 1 }]
    const { loads, load } = holdLoads()
    const { wrapper } = await mountPage(
      {},
      { path: personWeekPath(42), loadPersonShots: load }
    )
    await router.push(personWeekPath(43))
    await flushPromises()

    loads
      .filter(({ week }) => week === '43')
      .forEach(({ resolve }) => resolve(shots))
    await flushPromises()
    loads
      .filter(({ week }) => week === '42')
      .forEach(({ reject }) => reject(failure))
    await flushPromises()

    const panel = wrapper.findComponent(PeopleQuotaInfo)
    expect(panel.props('isLoading')).toBe(false)
    expect(panel.props('isLoadingError')).toBe(false)
    expect(panel.props('shots')).toEqual(shots)
  })

  it('lists the shots of the latest week when the week left answers last', async () => {
    const shots = [{ id: 'shot-43', weight: 1 }]
    const { loads, load } = holdLoads()
    const { wrapper } = await mountPage(
      {},
      { path: personWeekPath(42), loadPersonShots: load }
    )
    await router.push(personWeekPath(43))
    await flushPromises()

    loads
      .filter(({ week }) => week === '43')
      .forEach(({ resolve }) => resolve(shots))
    await flushPromises()
    loads
      .filter(({ week }) => week === '42')
      .forEach(({ resolve }) => resolve([{ id: 'shot-42', weight: 1 }]))
    await flushPromises()

    expect(wrapper.findComponent(PeopleQuotaInfo).props('shots')).toEqual(shots)
  })

  it('keeps the panel closed when a load ends after it was closed', async () => {
    const failure = new Error('Internal server error')
    errors.markRequestFailure(failure)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { loads, load } = holdLoads()
    const { wrapper } = await mountPage(
      {},
      { path: personWeekPath(42), loadPersonShots: load }
    )
    await router.push('/productions/production-1/quota/week/2026')
    await flushPromises()

    loads.forEach(({ reject }) => reject(failure))
    await flushPromises()

    expect(wrapper.findComponent(PeopleQuotaInfo).exists()).toBe(false)
  })
})
