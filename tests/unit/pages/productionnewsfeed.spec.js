import { flushPromises, shallowMount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const pget = vi.fn()
vi.mock('@/store/api/client', () => ({
  default: { pget: (...args) => pget(...args) }
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import newsModule from '@/store/modules/news'

import NewsRow from '@/components/pages/news/NewsRow.vue'
import ProductionNewsFeed from '@/components/pages/ProductionNewsFeed.vue'

const production = { id: 'production-1', name: 'Caminandes' }

const newsList = [
  {
    id: 'news-2',
    created_at: '2026-09-15T10:00:00',
    project_id: production.id,
    task_id: 'task-2'
  },
  {
    id: 'news-1',
    created_at: '2026-09-14T10:00:00',
    project_id: production.id,
    task_id: 'task-1'
  }
]

let mounted = null

const mountPage = async path => {
  pget.mockReset()
  pget.mockResolvedValue({ data: newsList, total: 2, stats: [] })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/productions/:production_id/news-feed',
        component: { template: '<div />' }
      },
      { path: '/news-feed', component: { template: '<div />' } }
    ]
  })
  router.push(path)
  await router.isReady()

  const store = createStore({
    modules: {
      news: { ...newsModule, state: () => ({ newsList: [], newsTotal: 0 }) }
    },
    getters: {
      currentProduction: () => production,
      dateFormat: () => 'YYYY-MM-DD',
      personMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ timezone: 'Europe/Paris' })
    }
  })

  mounted = shallowMount(ProductionNewsFeed, {
    global: {
      plugins: [
        router,
        store,
        {
          install: app => {
            app.config.globalProperties.$socket = { on: vi.fn(), off: vi.fn() }
          }
        }
      ]
    }
  })
  await flushPromises()
  return { store, wrapper: mounted }
}

describe('pages/ProductionNewsFeed', () => {
  // The page saves its filters to localStorage: a mode left there by one
  // test would reach the next one.
  afterEach(() => {
    mounted?.unmount()
    mounted = null
    localStorage.clear()
  })

  it.each([
    ['production', `/productions/${production.id}/news-feed`],
    ['studio', '/news-feed']
  ])('keeps the loaded news of the %s feed on screen', async (_, path) => {
    const { store, wrapper } = await mountPage(path)

    expect(pget).toHaveBeenCalledTimes(1)
    expect(store.getters.newsList).toHaveLength(2)
    expect(wrapper.findAllComponents(NewsRow)).toHaveLength(2)
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  // Zou reads the page size from `limit` and ignores `page_size`.
  it.each([
    ['comments', '', 50],
    ['previews', '?preview_mode=previews', 6]
  ])('asks for the page size of the %s mode', async (_, query, limit) => {
    await mountPage(`/productions/${production.id}/news-feed${query}`)

    const path = pget.mock.calls[0][0]
    expect(new URL(path, 'http://kitsu').searchParams.get('limit')).toBe(
      String(limit)
    )
    expect(path).not.toContain('page_size')
  })
})
