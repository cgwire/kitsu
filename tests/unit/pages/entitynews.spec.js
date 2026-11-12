import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import { markRequestFailure } from '@/lib/errors'

vi.mock('@/composables/format', () => ({
  useFormat: () => ({ formatDisplayDate: () => '' })
}))

import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

const taskType = { id: 'task-type-1', name: 'Animation', for_entity: 'Shot' }

const news = {
  id: 'news-1',
  author: { id: 'person-1', full_name: 'Jane Doe' },
  author_id: 'person-1',
  change: false,
  created_at: '2026-09-21T10:00:00',
  episode_id: 'episode-1',
  project_id: 'production-1',
  task_id: 'task-1',
  task_status_id: 'task-status-1',
  task_type_id: taskType.id
}

const mountNews = async ({
  entity = { id: 'shot-1' },
  firstLoad = null,
  newsList = [news],
  production = { id: 'production-1' },
  taskTypeMap = new Map()
} = {}) => {
  const getEntityNews = vi.fn(() => Promise.resolve({ data: newsList }))
  if (firstLoad) getEntityNews.mockImplementationOnce(() => firstLoad)
  const store = createStore({
    getters: {
      currentProduction: () => production,
      taskStatusMap: () => new Map(),
      taskTypeMap: () => taskTypeMap
    },
    actions: { getEntityNews }
  })
  const socket = { on: vi.fn(), off: vi.fn() }
  const wrapper = shallowMount(EntityNews, {
    global: {
      plugins: [
        store,
        {
          install: app => {
            app.config.globalProperties.$socket = socket
          }
        }
      ]
    },
    props: { entity }
  })
  await flushPromises()
  const [, onNewsNew] = socket.on.mock.calls.find(
    ([eventName]) => eventName === 'news:new'
  )
  return { getEntityNews, onNewsNew, socket, wrapper }
}

const handlerOf = (socket, event) =>
  socket.on.mock.calls.find(([eventName]) => eventName === event)?.[1]

const holdNextLoad = getEntityNews => {
  let answer = null
  getEntityNews.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        answer = resolve
      })
  )
  return data => answer({ data })
}

describe('EntityNews', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('passes the task type scoped to the episode when it is known', async () => {
    const { wrapper } = await mountNews({
      taskTypeMap: new Map([[taskType.id, taskType]])
    })

    expect(wrapper.findComponent(TaskTypeName).props('taskType')).toEqual({
      ...taskType,
      episode_id: 'episode-1'
    })
  })

  // A task type created after the tab loaded is absent from the map: the
  // tag must not receive a partial object the widget would turn into a
  // broken link.
  test('passes null when the task type is unknown', async () => {
    const { wrapper } = await mountNews()

    expect(wrapper.findComponent(TaskTypeName).props('taskType')).toBeNull()
  })

  test('reloads the list on a news of the current production', async () => {
    const { getEntityNews, onNewsNew } = await mountNews()

    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    await flushPromises()

    expect(getEntityNews).toHaveBeenCalledTimes(2)
  })

  test('ignores a news of another production', async () => {
    const { getEntityNews, onNewsNew } = await mountNews()

    onNewsNew({ news_id: 'news-2', project_id: 'production-2' })
    await flushPromises()

    expect(getEntityNews).toHaveBeenCalledTimes(1)
  })

  // Zou sends the news of every production to every client, and the store
  // holds no production for a user with none open.
  test('ignores the news while the store holds no production', async () => {
    const { getEntityNews, onNewsNew } = await mountNews({
      newsList: [],
      production: null
    })

    expect(() =>
      onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    ).not.toThrow()
    await flushPromises()

    expect(getEntityNews).toHaveBeenCalledTimes(1)
  })

  // Removing a task or an entity sends one news:delete per news.
  test('drops a deleted news without loading the list again', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews({
      newsList: [news, { ...news, id: 'news-2' }]
    })
    expect(socket.on).toHaveBeenCalledWith('news:delete', expect.any(Function))

    handlerOf(socket, 'news:delete')({ news_id: 'news-1' })
    await flushPromises()

    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
    expect(getEntityNews).toHaveBeenCalledTimes(1)
  })

  test('keeps out a news deleted while the list loads again', async () => {
    const { getEntityNews, onNewsNew, socket, wrapper } = await mountNews()
    let answer = null
    getEntityNews.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          answer = resolve
        })
    )

    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    handlerOf(socket, 'news:delete')({ news_id: 'news-1' })
    answer({ data: [news] })
    await flushPromises()

    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
  })

  test('ignores the deletion of a news it does not show', async () => {
    const { socket, wrapper } = await mountNews()

    handlerOf(socket, 'news:delete')?.({ news_id: 'news-9' })
    await flushPromises()

    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
  })

  test('stops listening to the deletions once unmounted', async () => {
    const { socket, wrapper } = await mountNews()
    const onNewsDelete = handlerOf(socket, 'news:delete')

    wrapper.unmount()

    expect(onNewsDelete).toEqual(expect.any(Function))
    expect(socket.off).toHaveBeenCalledWith('news:delete', onNewsDelete)
  })

  // Zou sends no event again once the socket is back.
  test('loads the list again when the socket reconnects', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews()
    getEntityNews.mockResolvedValueOnce({ data: [] })

    handlerOf(socket, 'connect')()
    await flushPromises()

    expect(getEntityNews).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
  })

  test('keeps the list on screen while it loads again after a reconnection', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews()
    const answer = holdNextLoad(getEntityNews)

    handlerOf(socket, 'connect')()
    await flushPromises()

    expect(wrapper.findComponent(Spinner).exists()).toBe(false)
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
    answer([news, { ...news, id: 'news-2' }])
    await flushPromises()
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(2)
  })

  // The socket may come back before the API, while Zou restarts.
  test('logs a failed load after a reconnection and keeps the list', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const failure = new Error('Bad Gateway')
    markRequestFailure(failure)
    getEntityNews.mockRejectedValueOnce(failure)

    const rejections = await recordUnhandledRejections(async () => {
      handlerOf(socket, 'connect')()
      await flushPromises()
    })

    expect(rejections).toEqual([])
    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
  })

  // A failed request is reported by the API client: anything else is a bug,
  // which Sentry must get.
  test('leaves a bug of a reconnection unhandled', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const bug = new TypeError('Cannot read properties of undefined')
    getEntityNews.mockRejectedValueOnce(bug)

    const rejections = await recordUnhandledRejections(async () => {
      handlerOf(socket, 'connect')()
      await flushPromises()
    })

    expect(rejections).toEqual([bug])
    expect(consoleError).not.toHaveBeenCalled()
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
  })

  test('loads nothing on a reconnection while it has no entity', async () => {
    const { getEntityNews, socket } = await mountNews({ entity: null })

    const rejections = await recordUnhandledRejections(async () => {
      handlerOf(socket, 'connect')()
      await flushPromises()
    })

    expect(rejections).toEqual([])
    expect(getEntityNews).not.toHaveBeenCalled()
  })

  // The socket may come back while the first load still waits for the API.
  test('keeps the news a reconnection shows over an older load that fails', async () => {
    let failFirstLoad = null
    const firstLoad = new Promise((resolve, reject) => {
      failFirstLoad = reject
    })
    const { socket, wrapper } = await mountNews({ firstLoad })
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    handlerOf(socket, 'connect')()
    await flushPromises()
    const failure = new Error('Gateway Timeout')
    failFirstLoad(failure)
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findComponent(Spinner).exists()).toBe(false)
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
  })

  test('keeps the news of a reload over the older load of a reconnection', async () => {
    const { getEntityNews, onNewsNew, socket, wrapper } = await mountNews()
    const answer = holdNextLoad(getEntityNews)
    handlerOf(socket, 'connect')()
    getEntityNews.mockResolvedValueOnce({
      data: [news, { ...news, id: 'news-2' }]
    })
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    await flushPromises()

    answer([news])
    await flushPromises()

    expect(wrapper.findAll('.timeline-entry')).toHaveLength(2)
  })

  test('keeps out a news deleted while a reconnection loads the list', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews()
    const answer = holdNextLoad(getEntityNews)

    handlerOf(socket, 'connect')()
    handlerOf(socket, 'news:delete')({ news_id: 'news-1' })
    answer([news])
    await flushPromises()

    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
  })

  test('shows the news of a reload that answers after a newer one failed', async () => {
    const { getEntityNews, onNewsNew, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const answer = holdNextLoad(getEntityNews)
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    const failure = new Error('Bad Gateway')
    getEntityNews.mockRejectedValueOnce(failure)
    onNewsNew({ news_id: 'news-3', project_id: 'production-1' })
    await flushPromises()

    answer([news, { ...news, id: 'news-2' }])
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(2)
  })

  test('shows the news of a reconnection that answers after a newer reload failed', async () => {
    const { getEntityNews, onNewsNew, socket, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const answer = holdNextLoad(getEntityNews)
    handlerOf(socket, 'connect')()
    const failure = new Error('Bad Gateway')
    getEntityNews.mockRejectedValueOnce(failure)
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    await flushPromises()

    answer([news, { ...news, id: 'news-2' }])
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(2)
  })

  test('empties the list when the load of another entity fails', async () => {
    const { getEntityNews, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const failure = new Error('Bad Gateway')
    getEntityNews.mockRejectedValueOnce(failure)

    await wrapper.setProps({ entity: { id: 'shot-2' } })
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
    expect(wrapper.findComponent(EmptySection).exists()).toBe(true)
  })

  test('drops the list a reconnection loaded for the former entity', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews()
    const answer = holdNextLoad(getEntityNews)
    handlerOf(socket, 'connect')()
    getEntityNews.mockResolvedValueOnce({ data: [{ ...news, id: 'news-9' }] })
    await wrapper.setProps({ entity: { id: 'shot-2' } })
    await flushPromises()

    answer([news, { ...news, id: 'news-2' }])
    await flushPromises()

    expect(getEntityNews).toHaveBeenCalledTimes(3)
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
  })

  test('drops the list a reconnection loaded for the former entity once the new one failed', async () => {
    const { getEntityNews, socket, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const answer = holdNextLoad(getEntityNews)
    handlerOf(socket, 'connect')()
    const failure = new Error('Bad Gateway')
    getEntityNews.mockRejectedValueOnce(failure)
    await wrapper.setProps({ entity: { id: 'shot-2' } })
    await flushPromises()

    answer([news])
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
  })

  test('keeps the list when a reload fails', async () => {
    const { getEntityNews, onNewsNew, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const failure = new Error('Bad Gateway')
    getEntityNews.mockRejectedValueOnce(failure)

    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(1)
  })

  test('shows none of the news of the former entity once an older reload of it fails', async () => {
    const { getEntityNews, onNewsNew, socket, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    let failReload = null
    getEntityNews.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          failReload = reject
        })
    )
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    getEntityNews.mockResolvedValueOnce({
      data: [news, { ...news, id: 'news-2' }]
    })
    handlerOf(socket, 'connect')()
    await flushPromises()
    holdNextLoad(getEntityNews)
    await wrapper.setProps({ entity: { id: 'shot-2' } })

    const failure = new Error('Bad Gateway')
    failReload(failure)
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
  })

  test('keeps the news of the entity on screen when a reload of the former one fails', async () => {
    const { getEntityNews, onNewsNew, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    let failReload = null
    getEntityNews.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          failReload = reject
        })
    )
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    getEntityNews.mockResolvedValueOnce({
      data: [news, { ...news, id: 'news-2' }]
    })
    await wrapper.setProps({ entity: { id: 'shot-2' } })
    await flushPromises()

    const failure = new Error('Bad Gateway')
    failReload(failure)
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(2)
  })

  // Back on an entity, the news of the other one must not stay on screen.
  test('shows the news an older load brings for the entity back on screen', async () => {
    const { getEntityNews, onNewsNew, wrapper } = await mountNews()
    const answer = holdNextLoad(getEntityNews)
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    getEntityNews.mockResolvedValueOnce({ data: [{ ...news, id: 'news-9' }] })
    await wrapper.setProps({ entity: { id: 'shot-2' } })
    await flushPromises()
    holdNextLoad(getEntityNews)
    await wrapper.setProps({ entity: { id: 'shot-1' } })

    answer([news, { ...news, id: 'news-2' }])
    await flushPromises()

    expect(wrapper.findAll('.timeline-entry')).toHaveLength(2)
  })

  test('shows none of the news of the former entity once a reload of it succeeds', async () => {
    const { getEntityNews, onNewsNew, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const answer = holdNextLoad(getEntityNews)
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    const failure = new Error('Bad Gateway')
    getEntityNews.mockRejectedValueOnce(failure)
    await wrapper.setProps({ entity: { id: 'shot-2' } })
    await flushPromises()

    answer([news, { ...news, id: 'news-2' }])
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
  })

  test('drops a reload that answers after a newer reconnection', async () => {
    const { getEntityNews, onNewsNew, socket, wrapper } = await mountNews()
    const answer = holdNextLoad(getEntityNews)
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    getEntityNews.mockResolvedValueOnce({
      data: [news, { ...news, id: 'news-2' }]
    })
    handlerOf(socket, 'connect')()
    await flushPromises()

    answer([news])
    await flushPromises()

    expect(wrapper.findAll('.timeline-entry')).toHaveLength(2)
  })

  // The older answer lacks the news posted since: it never shows.
  test('drops an older load of an entity after a trip to another one', async () => {
    const { getEntityNews, onNewsNew, wrapper } = await mountNews()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const answer = holdNextLoad(getEntityNews)
    onNewsNew({ news_id: 'news-2', project_id: 'production-1' })
    getEntityNews.mockResolvedValueOnce({
      data: [news, { ...news, id: 'news-2' }, { ...news, id: 'news-3' }]
    })
    onNewsNew({ news_id: 'news-3', project_id: 'production-1' })
    await flushPromises()
    getEntityNews.mockResolvedValueOnce({ data: [{ ...news, id: 'news-9' }] })
    await wrapper.setProps({ entity: { id: 'shot-2' } })
    await flushPromises()
    const failure = new Error('Bad Gateway')
    getEntityNews.mockRejectedValueOnce(failure)
    await wrapper.setProps({ entity: { id: 'shot-1' } })
    await flushPromises()

    answer([news])
    await flushPromises()

    expect(consoleError.mock.calls).toEqual([[failure]])
    expect(wrapper.findAll('.timeline-entry')).toHaveLength(0)
    expect(wrapper.findComponent(EmptySection).exists()).toBe(true)
  })

  test('stops listening to the reconnections once unmounted', async () => {
    const { socket, wrapper } = await mountNews()
    const onSocketConnect = handlerOf(socket, 'connect')

    wrapper.unmount()

    expect(onSocketConnect).toEqual(expect.any(Function))
    expect(socket.off).toHaveBeenCalledWith('connect', onSocketConnect)
  })

  test('shows the task types unlinked while the store holds no production', async () => {
    const { wrapper } = await mountNews({
      production: null,
      taskTypeMap: new Map([[taskType.id, taskType]])
    })

    expect(wrapper.findComponent(TaskTypeName).props('productionId')).toBeNull()
  })
})
