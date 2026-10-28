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
const registerPreviewFileStatuses = vi.fn()
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
  {
    firstPage = newsList,
    getters = {},
    loadTask = (_, { taskId }) => ({ id: taskId }),
    total = firstPage.length
  } = {}
) => {
  pget.mockReset()
  pget.mockResolvedValue({ data: newsList, total: 2, stats: [] })
  pget.mockResolvedValueOnce({ data: firstPage, total, stats: [] })

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
      news: {
        ...newsModule,
        state: () => ({
          deletedNewsIds: new Set(),
          isNewsListComplete: false,
          newsList: [],
          newsListVersion: 0
        })
      }
    },
    actions: { loadTask, registerPreviewFileStatuses },
    getters: {
      currentProduction: () => production,
      dateFormat: () => 'YYYY-MM-DD',
      openProductions: () => [production],
      personMap: () => new Map(),
      taskTypeMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ timezone: 'Europe/Paris' }),
      ...getters
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
  return { router, socket, store, wrapper: mounted }
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

    // Zou sends news:delete before the task:update of the same deletion, to
    // every client, with no project when the task is gone.
    it('drops a news as soon as Zou announces its deletion', async () => {
      const { socket, store, wrapper } = await mountPage(feedPath)
      expect(socket.on).toHaveBeenCalledWith(
        'news:delete',
        expect.any(Function)
      )

      emitSocketEvent(socket, 'news:delete', { news_id: 'news-2' })
      emitSocketEvent(socket, 'task:update', {
        project_id: production.id,
        task_id: 'task-2'
      })
      await settle()

      expect(pget).toHaveBeenCalledTimes(1)
      expect(rejections).toEqual([])
      expect(store.getters.newsList.map(news => news.id)).toEqual(['news-1'])
      expect(wrapper.findAllComponents(NewsRow)).toHaveLength(1)
    })

    it('ignores the deletion of a news it does not show', async () => {
      const { socket, store } = await mountPage(feedPath)

      emitSocketEvent(socket, 'news:delete', {
        news_id: 'news-3',
        project_id: 'production-2'
      })
      await settle()

      expect(store.getters.newsList).toHaveLength(2)
    })

    it('keeps the task drawer open when the news shown is deleted', async () => {
      const { socket, wrapper } = await mountPage(feedPath)
      wrapper.findAllComponents(NewsRow)[0].vm.$emit('select', newsList[0])
      await flushPromises()

      emitSocketEvent(socket, 'news:delete', { news_id: 'news-2' })
      await flushPromises()

      expect(wrapper.find('.side-column').classes()).toContain('is-open')
      expect(wrapper.findComponent(TaskInfo).props('task')?.id).toBe('task-2')
    })

    it('stops listening to the deletions once unmounted', async () => {
      const { socket } = await mountPage(feedPath)
      const [, onNewsDelete] = socket.on.mock.calls.find(
        ([name]) => name === 'news:delete'
      )

      mounted.unmount()
      mounted = null

      expect(socket.off).toHaveBeenCalledWith('news:delete', onNewsDelete)
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

  describe('live news', () => {
    const feedPath = `/productions/${production.id}/news-feed`
    const shotType = { id: 'task-type-shot', for_entity: 'Shot' }
    const assetType = { id: 'task-type-asset', for_entity: 'Asset' }
    const taskTypeMap = () =>
      new Map([shotType, assetType].map(taskType => [taskType.id, taskType]))
    const person = { id: 'person-1' }
    const personMap = () => new Map([[person.id, person]])

    const liveNews = fields => ({
      id: 'news-3',
      author_id: person.id,
      created_at: '2026-09-16T10:00:00',
      episode_id: null,
      project_id: production.id,
      task_id: 'task-3',
      task_status_id: 'status-wip',
      task_type_id: shotType.id,
      ...fields
    })

    const receive = async (socket, news) => {
      pget.mockResolvedValueOnce(news)
      emitSocketEvent(socket, 'news:new', {
        news_id: news.id,
        project_id: news.project_id,
        task_status_id: news.task_status_id,
        task_type_id: news.task_type_id
      })
      await flushPromises()
    }

    const newsIds = store => store.getters.newsList.map(news => news.id)

    // 23:30 UTC on 16 September is 01:30 on the 17th in Paris.
    const pastParisMidnight = { created_at: '2026-09-16T23:30:00' }

    it.each([
      ['an author', '?person_id=person-1', { author_id: 'person-2' }],
      ['an episode', '?episode_id=episode-1', { episode_id: 'episode-2' }],
      [
        'an episode, for an asset',
        '?episode_id=episode-1',
        { episode_id: 'episode-1', task_type_id: assetType.id }
      ],
      ['a start date', '?after=2026-09-17', {}],
      ['an end date', '?before=2026-09-16', {}],
      [
        'an end date, past midnight in Paris',
        '?before=2026-09-17',
        pastParisMidnight
      ]
    ])(
      'leaves out a live news that misses the filter on %s',
      async (_, query, fields) => {
        const { socket, store } = await mountPage(feedPath + query, {
          getters: { personMap, taskTypeMap }
        })

        await receive(socket, liveNews(fields))

        expect(newsIds(store)).toEqual(['news-2', 'news-1'])
      }
    )

    it.each([
      ['an author', '?person_id=person-1', {}],
      ['an episode', '?episode_id=episode-1', {}],
      ['a period', '?after=2026-09-15&before=2026-09-17', {}],
      [
        'a start date, past midnight in Paris',
        '?after=2026-09-17',
        pastParisMidnight
      ]
    ])(
      'shows a live news that matches the filter on %s',
      async (_, query, fields) => {
        const { socket, store } = await mountPage(feedPath + query, {
          getters: { personMap, taskTypeMap }
        })

        await receive(socket, liveNews({ episode_id: 'episode-1', ...fields }))

        expect(newsIds(store)).toEqual(['news-3', 'news-2', 'news-1'])
      }
    )

    // In previews mode, a row mounted again starts its player over.
    it('keeps the rows of the day mounted when a news arrives', async () => {
      const { socket, wrapper } = await mountPage(feedPath)
      const rowOf = newsId =>
        wrapper
          .findAllComponents(NewsRow)
          .find(row => row.props('news').id === newsId)
      const row = rowOf('news-2')
      const canvasId = row.props('canvasId')

      await receive(socket, liveNews({ created_at: '2026-09-15T12:00:00' }))

      expect(wrapper.findAllComponents(NewsRow)).toHaveLength(3)
      expect(rowOf('news-2').vm).toBe(row.vm)
      expect(rowOf('news-2').props('canvasId')).toBe(canvasId)
    })

    // A moved comment keeps the date of its first post.
    it('puts a live news older than the top of the feed at its date', async () => {
      const { socket, store, wrapper } = await mountPage(feedPath)
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const row = wrapper
        .findAllComponents(NewsRow)
        .find(newsRow => newsRow.props('news').id === 'news-1')

      await receive(socket, liveNews({ created_at: '2026-09-14T12:00:00' }))

      expect(newsIds(store)).toEqual(['news-2', 'news-3', 'news-1'])
      expect(
        wrapper
          .findAllComponents(NewsRow)
          .find(newsRow => newsRow.props('news').id === 'news-1').vm
      ).toBe(row.vm)
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })

    it('loads no live news of a production the studio feed leaves out', async () => {
      const { socket, store } = await mountPage('/news-feed')

      emitSocketEvent(socket, 'news:new', {
        news_id: 'news-3',
        project_id: 'production-2'
      })
      await flushPromises()

      expect(pget).toHaveBeenCalledTimes(1)
      expect(store.getters.newsList).toHaveLength(2)
    })

    it('shows a live news of an open production on the studio feed', async () => {
      const { socket, store } = await mountPage('/news-feed')

      await receive(socket, liveNews())

      expect(newsIds(store)).toEqual(['news-3', 'news-2', 'news-1'])
    })

    it('drops a news whose status edit takes it out of the filter', async () => {
      const { socket, store } = await mountPage(
        `${feedPath}?task_status_id=status-wip`
      )
      pget.mockResolvedValueOnce({
        ...newsList[0],
        task_status_id: 'status-retake'
      })

      emitSocketEvent(socket, 'task:update', {
        project_id: production.id,
        task_id: 'task-2'
      })
      await flushPromises()

      expect(newsIds(store)).toEqual(['news-1'])
    })

    it('updates a news whose status edit keeps it in the filter', async () => {
      const { socket, store } = await mountPage(
        `${feedPath}?task_status_id=status-wip`
      )
      pget.mockResolvedValueOnce({
        ...newsList[0],
        change: true,
        task_status_id: 'status-wip'
      })

      emitSocketEvent(socket, 'task:update', {
        project_id: production.id,
        task_id: 'task-2'
      })
      await flushPromises()

      expect(newsIds(store)).toEqual(['news-2', 'news-1'])
      expect(store.getters.newsList[0].change).toBe(true)
    })
  })

  describe('late answers', () => {
    const feedPath = `/productions/${production.id}/news-feed`
    const news3 = {
      id: 'news-3',
      created_at: '2026-09-16T10:00:00',
      project_id: production.id,
      task_id: 'task-3'
    }

    // The next request answers on demand.
    const deferNextRequest = () => {
      let answer = null
      pget.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            answer = resolve
          })
      )
      return async value => {
        answer(value)
        await flushPromises()
      }
    }

    const newsIds = store => store.getters.newsList.map(news => news.id)

    it('keeps out a new news deleted while it loads', async () => {
      const { socket, store } = await mountPage(feedPath)
      const answer = deferNextRequest()

      emitSocketEvent(socket, 'news:new', {
        news_id: 'news-3',
        project_id: production.id
      })
      emitSocketEvent(socket, 'news:delete', { news_id: 'news-3' })
      await answer(news3)

      expect(newsIds(store)).toEqual(['news-2', 'news-1'])
    })

    it('does not bring back a news deleted while it reloads', async () => {
      const { socket, store } = await mountPage(feedPath)
      const answer = deferNextRequest()

      emitSocketEvent(socket, 'task:update', {
        project_id: production.id,
        task_id: 'task-2'
      })
      emitSocketEvent(socket, 'news:delete', { news_id: 'news-2' })
      await answer(newsList[0])

      expect(newsIds(store)).toEqual(['news-1'])
    })

    it('keeps out a new news that loads once the feed is loaded again', async () => {
      const { socket, store, wrapper } = await mountPage(feedPath)
      const answer = deferNextRequest()

      emitSocketEvent(socket, 'news:new', {
        news_id: 'news-3',
        project_id: production.id
      })
      wrapper
        .findComponent(NewsFilters)
        .vm.$emit('update:previewMode', 'previews')
      await flushPromises()
      await answer(news3)

      expect(pget).toHaveBeenCalledTimes(3)
      expect(newsIds(store)).toEqual(['news-2', 'news-1'])
    })

    it('keeps out a news deleted while its page loads', async () => {
      const { socket, store, wrapper } = await mountPage(feedPath, {
        firstPage: Array.from({ length: 50 }, (_, index) => ({
          ...newsList[0],
          id: `news-page-${index}`
        })),
        total: 60
      })
      const answer = deferNextRequest()

      await wrapper.find('.news.page').trigger('scroll')
      emitSocketEvent(socket, 'news:delete', { news_id: 'news-3' })
      await answer({ data: [news3], total: 60, stats: [] })

      expect(newsIds(store)).not.toContain('news-3')
    })

    it('keeps out a news deleted while the feed loads again', async () => {
      const { socket, store, wrapper } = await mountPage(feedPath)
      const answer = deferNextRequest()

      wrapper
        .findComponent(NewsFilters)
        .vm.$emit('update:previewMode', 'previews')
      await flushPromises()
      emitSocketEvent(socket, 'news:delete', { news_id: 'news-2' })
      await answer({ data: newsList, total: 2, stats: [] })

      expect(newsIds(store)).toEqual(['news-1'])
    })

    // Vue keeps evaluating the computeds of a page left meanwhile.
    it('loads nothing once the feed is left', async () => {
      const { router, wrapper } = await mountPage(feedPath)
      const answer = deferNextRequest()

      wrapper
        .findComponent(NewsFilters)
        .vm.$emit('update:previewMode', 'previews')
      await flushPromises()
      mounted.unmount()
      mounted = null
      await router.push('/news-feed')
      await answer({ data: newsList, total: 2, stats: [] })

      expect(pget).toHaveBeenCalledTimes(2)
      expect(router.currentRoute.value.fullPath).toBe('/news-feed')
    })

    it('keeps out a page that loads once the feed is loaded again', async () => {
      const { store, wrapper } = await mountPage(feedPath, {
        firstPage: Array.from({ length: 50 }, (_, index) => ({
          ...newsList[0],
          id: `news-page-${index}`
        })),
        total: 60
      })
      const answer = deferNextRequest()

      await wrapper.find('.news.page').trigger('scroll')
      wrapper
        .findComponent(NewsFilters)
        .vm.$emit('update:previewMode', 'previews')
      await flushPromises()
      await answer({ data: [news3], total: 60, stats: [] })

      expect(pget).toHaveBeenCalledTimes(3)
      expect(newsIds(store)).toEqual(['news-2', 'news-1'])
    })
  })

  describe('more news', () => {
    const feedPath = `/productions/${production.id}/news-feed`

    // News one minute apart, the newest first, as Zou pages them.
    const page = (from, count) =>
      Array.from({ length: count }, (_, index) => ({
        id: `news-${from + index}`,
        created_at: new Date(Date.UTC(2026, 8, 15, 10) - (from + index) * 6e4)
          .toISOString()
          .slice(0, 19),
        project_id: production.id,
        task_id: `task-${from + index}`
      }))

    const scrollDown = async wrapper => {
      await wrapper.find('.news.page').trigger('scroll')
      await flushPromises()
    }

    // A news posted since the first load moves the next page one news back.
    it('loads each news once when the next page starts with a shown one', async () => {
      const { store, wrapper } = await mountPage(feedPath, {
        firstPage: page(0, 50),
        total: 60
      })
      pget.mockResolvedValueOnce({ data: page(49, 10), total: 60, stats: [] })

      await scrollDown(wrapper)

      const ids = store.getters.newsList.map(news => news.id)
      expect(ids).toHaveLength(59)
      expect(new Set(ids).size).toBe(59)
    })

    // The page is full, so the feed goes on even though it kept 49 news.
    it('asks for the page after a full page that starts with a shown one', async () => {
      const { store, wrapper } = await mountPage(feedPath, {
        firstPage: page(0, 50),
        total: 120
      })
      pget.mockResolvedValueOnce({ data: page(49, 50), total: 120, stats: [] })
      pget.mockResolvedValueOnce({ data: page(99, 10), total: 120, stats: [] })

      await scrollDown(wrapper)
      await scrollDown(wrapper)

      const ids = store.getters.newsList.map(news => news.id)
      expect(pget).toHaveBeenCalledTimes(3)
      expect(new Set(ids).size).toBe(109)
    })

    // A page of news already listed makes the feed no longer: no scroll
    // would come to ask for the next one.
    it('asks for the next page at once when a page adds no news', async () => {
      const { store, wrapper } = await mountPage(feedPath, {
        firstPage: page(0, 50),
        total: 120
      })
      pget.mockResolvedValueOnce({ data: page(0, 50), total: 120, stats: [] })
      pget.mockResolvedValueOnce({ data: page(50, 10), total: 120, stats: [] })

      await scrollDown(wrapper)

      expect(pget).toHaveBeenCalledTimes(3)
      expect(store.getters.newsList).toHaveLength(60)
    })

    it('leaves a live news older than the loaded pages to its page', async () => {
      const { socket, store } = await mountPage(feedPath, {
        firstPage: page(0, 50),
        total: 120
      })
      pget.mockResolvedValueOnce({ ...page(70, 1)[0], id: 'news-moved' })

      emitSocketEvent(socket, 'news:new', {
        news_id: 'news-moved',
        project_id: production.id
      })
      await flushPromises()

      expect(store.getters.newsList.map(news => news.id)).not.toContain(
        'news-moved'
      )
    })

    it('asks for no more news once a page comes back short', async () => {
      const { wrapper } = await mountPage(feedPath, {
        firstPage: page(0, 50),
        total: 120
      })
      pget.mockResolvedValueOnce({ data: page(50, 10), total: 120, stats: [] })

      await scrollDown(wrapper)
      await scrollDown(wrapper)

      expect(pget).toHaveBeenCalledTimes(2)
    })

    it('asks for no more news when the first page is short', async () => {
      const { wrapper } = await mountPage(feedPath, { firstPage: page(0, 10) })

      await scrollDown(wrapper)

      expect(pget).toHaveBeenCalledTimes(1)
    })
  })

  describe('previews mode', () => {
    const feedPath = `/productions/${production.id}/news-feed`
    const previewsPath = `${feedPath}?preview_mode=previews`
    const previewFile = () => ({
      id: 'preview-1',
      extension: 'png',
      revision: 1,
      status: 'processing'
    })
    const fileEvent = {
      comment_id: 'comment-2',
      extension: 'png',
      preview_file_id: 'preview-1',
      revision: 1,
      status: 'processing'
    }
    const withPreview = news => ({
      ...news,
      comment_id: 'comment-2',
      preview_file_id: 'preview-1',
      preview_files: [previewFile()]
    })

    // The event names the file, not the files of the revision the player
    // plays.
    it('loads a news again for its previews once its file is in', async () => {
      const { socket, store } = await mountPage(previewsPath, {
        firstPage: [{ ...newsList[0], comment_id: 'comment-2' }, newsList[1]]
      })
      pget.mockResolvedValueOnce(withPreview(newsList[0]))

      emitSocketEvent(socket, 'preview-file:add-file', fileEvent)
      await flushPromises()

      expect(pget).toHaveBeenLastCalledWith(
        `/api/data/projects/${production.id}/news/news-2`
      )
      expect(store.getters.newsList[0].preview_files).toEqual([previewFile()])
    })

    it('loads no news again for a file in comments mode', async () => {
      const { socket } = await mountPage(feedPath, {
        firstPage: [{ ...newsList[0], comment_id: 'comment-2' }, newsList[1]]
      })

      emitSocketEvent(socket, 'preview-file:add-file', fileEvent)
      await flushPromises()

      expect(pget).toHaveBeenCalledTimes(1)
    })

    it('loads no news again for a file without comment', async () => {
      const { socket } = await mountPage(previewsPath)

      emitSocketEvent(socket, 'preview-file:add-file', {
        ...fileEvent,
        comment_id: undefined
      })
      await flushPromises()

      expect(pget).toHaveBeenCalledTimes(1)
    })

    // A picture is built in a job: the registry follows its status, after a
    // socket drop too.
    it('hands the previews of a news loaded again to the status registry', async () => {
      const { socket } = await mountPage(previewsPath, {
        firstPage: [{ ...newsList[0], comment_id: 'comment-2' }, newsList[1]]
      })
      registerPreviewFileStatuses.mockClear()
      pget.mockResolvedValueOnce(withPreview(newsList[0]))

      emitSocketEvent(socket, 'preview-file:add-file', fileEvent)
      await flushPromises()

      expect(registerPreviewFileStatuses).toHaveBeenCalledWith(
        expect.anything(),
        [previewFile()]
      )
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
