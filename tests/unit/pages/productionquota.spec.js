import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import csv from '@/lib/csv'
import personStore from '@/store/modules/people'

import ProductionQuota from '@/components/pages/ProductionQuota.vue'
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
    }
  ]
})

let wrapper

const mountPage = async (query = {}, { quotas = {}, stubs = {} } = {}) => {
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
  store.dispatch = vi.fn(action =>
    Promise.resolve(action === 'computeQuota' ? quotas : undefined)
  )
  await router.push({
    path: '/productions/production-1/quota/day/2026/9',
    query
  })
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
})
