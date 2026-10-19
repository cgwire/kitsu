import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

import NewsFilters from '@/components/pages/news/NewsFilters.vue'
import NewsRow from '@/components/pages/news/NewsRow.vue'
import ProductionNewsFeed from '@/components/pages/ProductionNewsFeed.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

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

const mountPage = async (
  path,
  { loadTask = (_, { taskId }) => ({ id: taskId }) } = {}
) => {
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
    actions: { loadTask },
    getters: {
      currentProduction: () => production,
      dateFormat: () => 'YYYY-MM-DD',
      personMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ timezone: 'Europe/Paris' })
    }
  })

  const socket = { on: vi.fn(), off: vi.fn() }
  mounted = shallowMount(ProductionNewsFeed, {
    global: {
      plugins: [
        router,
        store,
        {
          install: app => {
            app.config.globalProperties.$socket = socket
          }
        }
      ]
    }
  })
  await flushPromises()
  return { socket, store, wrapper: mounted }
}

const emitSocketEvent = (socket, event, eventData) => {
  const [, handler] = socket.on.mock.calls.find(([name]) => name === event)
  handler(eventData)
}

// The API client rejects with the superagent error, which carries the status.
const httpError = status =>
  Object.assign(new Error(`HTTP ${status}`), { status })

// Node reports a rejected promise once the microtask queue has drained.
const settle = () => new Promise(resolve => setTimeout(resolve))

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

  describe('socket reloads', () => {
    const feedPath = `/productions/${production.id}/news-feed`
    const rejections = []
    const onRejection = reason => rejections.push(reason)

    beforeEach(() => {
      rejections.length = 0
      process.on('unhandledRejection', onRejection)
    })

    afterEach(() => {
      process.off('unhandledRejection', onRejection)
      vi.restoreAllMocks()
    })

    // Deleting or moving a comment deletes its news in Zou, then emits
    // task:update for its task.
    it('drops a deleted news when its task updates', async () => {
      const { socket, store, wrapper } = await mountPage(feedPath)
      pget.mockRejectedValueOnce(httpError(404))

      emitSocketEvent(socket, 'task:update', {
        project_id: production.id,
        task_id: 'task-2'
      })
      await settle()

      expect(pget).toHaveBeenLastCalledWith(
        `/api/data/projects/${production.id}/news/news-2`
      )
      expect(rejections).toEqual([])
      expect(store.getters.newsList.map(news => news.id)).toEqual(['news-1'])
      expect(wrapper.findAllComponents(NewsRow)).toHaveLength(1)
    })

    it('skips a new news deleted before it loads', async () => {
      const { socket, store } = await mountPage(feedPath)
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      pget.mockRejectedValueOnce(httpError(404))

      emitSocketEvent(socket, 'news:new', {
        project_id: production.id,
        news_id: 'news-3'
      })
      await settle()

      expect(pget).toHaveBeenLastCalledWith(
        `/api/data/projects/${production.id}/news/news-3`
      )
      expect(rejections).toEqual([])
      expect(consoleError).not.toHaveBeenCalled()
      expect(store.getters.newsList).toHaveLength(2)
    })

    it('logs any other reload failure', async () => {
      const { socket, store } = await mountPage(feedPath)
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = httpError(500)
      pget.mockRejectedValue(error)

      emitSocketEvent(socket, 'task:update', {
        project_id: production.id,
        task_id: 'task-2'
      })
      emitSocketEvent(socket, 'news:new', {
        project_id: production.id,
        news_id: 'news-3'
      })
      await settle()

      expect(rejections).toEqual([])
      expect(consoleError.mock.calls).toEqual([[error], [error]])
      expect(store.getters.newsList).toHaveLength(2)
    })
  })

  describe('task selection', () => {
    const feedPath = `/productions/${production.id}/news-feed`

    // Each task load ends on demand: the user may select another news, or
    // change a filter, before it lands.
    const deferTaskLoads = () => {
      const settlers = new Map()
      const loadTask = vi.fn(
        (_, { taskId }) =>
          new Promise((resolve, reject) => {
            settlers.set(taskId, { resolve, reject })
          })
      )
      const finish = async taskId => {
        settlers.get(taskId).resolve({ id: taskId })
        await flushPromises()
      }
      const fail = async taskId => {
        settlers.get(taskId).reject(httpError(502))
        await flushPromises()
      }
      return { fail, finish, loadTask }
    }

    const panelTask = wrapper => wrapper.findComponent(TaskInfo).props('task')

    it('shows the task of the news selected last when an earlier load ends after it', async () => {
      const { finish, loadTask } = deferTaskLoads()
      const { wrapper } = await mountPage(feedPath, { loadTask })
      const [first, second] = wrapper.findAllComponents(NewsRow)

      first.vm.$emit('select', newsList[0])
      second.vm.$emit('select', newsList[1])
      await finish('task-1')
      await finish('task-2')

      expect(panelTask(wrapper)?.id).toBe('task-1')
      expect(first.props('isSelected')).toBe(false)
      expect(second.props('isSelected')).toBe(true)
    })

    it('drops a task that loads once the feed is loaded again', async () => {
      const { finish, loadTask } = deferTaskLoads()
      const { wrapper } = await mountPage(feedPath, { loadTask })

      wrapper.findAllComponents(NewsRow)[0].vm.$emit('select', newsList[0])
      wrapper
        .findComponent(NewsFilters)
        .vm.$emit('update:taskTypeId', 'task-type-1')
      await flushPromises()
      await finish('task-2')

      expect(panelTask(wrapper)).toBe(null)
      expect(
        wrapper.findAllComponents(NewsRow).some(row => row.props('isSelected'))
      ).toBe(false)
    })

    // A second click closes the task shown: on a news still loading, it is
    // the end of a double click.
    it('opens a news clicked twice while its task loads', async () => {
      const { finish, loadTask } = deferTaskLoads()
      const { wrapper } = await mountPage(feedPath, { loadTask })
      const row = wrapper.findAllComponents(NewsRow)[0]

      row.vm.$emit('select', newsList[0])
      row.vm.$emit('select', newsList[0])
      await finish('task-2')

      expect(panelTask(wrapper)?.id).toBe('task-2')
      expect(row.props('isSelected')).toBe(true)
    })

    it('loads a task again on a click after its load failed', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const { fail, finish, loadTask } = deferTaskLoads()
      const { wrapper } = await mountPage(feedPath, { loadTask })
      const row = wrapper.findAllComponents(NewsRow)[0]

      row.vm.$emit('select', newsList[0])
      await fail('task-2')
      row.vm.$emit('select', newsList[0])
      await finish('task-2')

      expect(loadTask).toHaveBeenCalledTimes(2)
      expect(consoleError).toHaveBeenCalledTimes(1)
      expect(panelTask(wrapper)?.id).toBe('task-2')
      consoleError.mockRestore()
    })
  })

  describe('Escape', () => {
    const feedPath = `/productions/${production.id}/news-feed`
    let modal = null

    afterEach(() => {
      modal?.remove()
      modal = null
    })

    const openDrawer = async wrapper => {
      wrapper.findAllComponents(NewsRow)[0].vm.$emit('select', newsList[0])
      await flushPromises()
    }

    const isDrawerOpen = wrapper =>
      wrapper.find('.side-column').classes().includes('is-open')

    const pressEscape = async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
      )
      await flushPromises()
    }

    it('closes the task drawer', async () => {
      const { wrapper } = await mountPage(feedPath)
      await openDrawer(wrapper)
      expect(isDrawerOpen(wrapper)).toBe(true)

      await pressEscape()

      expect(isDrawerOpen(wrapper)).toBe(false)
    })

    // A modal opened from the drawer's task closes on the same Escape.
    it('keeps the task drawer open when the Escape closes a modal', async () => {
      const { wrapper } = await mountPage(feedPath)
      await openDrawer(wrapper)
      modal = document.createElement('div')
      modal.className = 'modal is-active'
      document.body.appendChild(modal)

      await pressEscape()

      expect(isDrawerOpen(wrapper)).toBe(true)
    })
  })
})
