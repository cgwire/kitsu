import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

import MainSchedule from '@/components/pages/MainSchedule.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const Page = { template: '<div />' }
const ScheduleStub = {
  name: 'Schedule',
  props: ['hierarchy'],
  template: '<div />',
  methods: { scrollToToday() {} }
}

const production = {
  id: 'production-1',
  name: 'Production',
  type: 'Project',
  start_date: '2026-01-01',
  end_date: '2026-06-01'
}

const mountPage = async productions => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/main-schedule', component: Page },
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
  })
  await router.push('/main-schedule')
  const store = createStore({
    getters: {
      openProductions: () => productions,
      taskTypeMap: () => new Map()
    }
  })
  const wrapper = shallowMount(MainSchedule, {
    global: {
      plugins: [router, store],
      stubs: { Schedule: ScheduleStub }
    }
  })
  await flushPromises()
  const [item] = wrapper.findComponent(ScheduleStub).props('hierarchy')
  return router.resolve(item.route).path
}

describe('MainSchedule page', () => {
  it('opens all the episodes of a TV show, where the selector shows', async () => {
    const path = await mountPage([{ ...production, production_type: 'tvshow' }])
    expect(path).toBe('/productions/production-1/episodes/all/schedule')
  })

  it('opens the schedule of a production without episodes', async () => {
    const path = await mountPage([{ ...production, production_type: 'short' }])
    expect(path).toBe('/productions/production-1/schedule')
  })
})
