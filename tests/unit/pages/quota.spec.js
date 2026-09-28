import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import Quota from '@/components/pages/quota/Quota.vue'

const person = { id: 'person-1', name: 'Jane Doe', full_name: 'Jane Doe' }

const buildQuota = weekFrames => ({
  day: { frames: {}, entries: {} },
  week: { frames: weekFrames, entries: {} },
  month: { frames: {}, entries: {} },
  year: { frames: {}, entries: {} }
})

const mountQuota = async (quotas, props = {}) => {
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1' }),
      isShotsLoading: () => false,
      personMap: () => new Map([[person.id, person]]),
      shotMap: () => new Map([['shot-a'], ['shot-b']]),
      taskTypeMap: () => new Map()
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve(quotas))
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: Quota }]
  })
  await router.push('/')
  await router.isReady()
  const wrapper = shallowMount(Quota, {
    props: {
      computeMode: 'weighted',
      countMode: 'frames',
      detailLevel: 'week',
      taskTypeId: 'task-type-1',
      year: 2025,
      month: 9,
      ...props
    },
    global: { plugins: [store, router], mocks: { $t: key => key } }
  })
  await flushPromises()
  return wrapper
}

describe('Quota', () => {
  test('highlights a week below the quota to reach', async () => {
    const quota = buildQuota({ '2025-3': 5 })
    const wrapper = await mountQuota(
      { [person.id]: quota, total: quota },
      { maxQuota: 10 }
    )

    const personRow = wrapper.findAll('tr.datatable-row')[0]
    const weekCells = personRow.findAll('td').slice(1)
    expect(weekCells[2].classes()).toContain('quota-low')
    expect(weekCells[3].classes()).not.toContain('quota-low')
  })
})
