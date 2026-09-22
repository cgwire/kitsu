import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

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

const mountPage = async (query = {}) => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => currentProduction,
      isCurrentUserArtist: () => false,
      isPaperProduction: () => false,
      productionShotTaskTypes: () => shotTaskTypes,
      user: () => ({ id: 'user-1' })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  await router.push({
    path: '/productions/production-1/quota/day/2026/9',
    query
  })
  await router.isReady()
  wrapper = shallowMount(ProductionQuota, {
    global: { plugins: [store, router], mocks: { $t: key => key } }
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
})
