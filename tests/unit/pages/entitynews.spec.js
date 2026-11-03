import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@/composables/format', () => ({
  useFormat: () => ({ formatDisplayDate: () => '' })
}))

import EntityNews from '@/components/pages/entities/EntityNews.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

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
  newsList = [news],
  production = { id: 'production-1' },
  taskTypeMap = new Map()
} = {}) => {
  const getEntityNews = vi.fn(() => Promise.resolve({ data: newsList }))
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
    props: { entity: { id: 'shot-1' } }
  })
  await flushPromises()
  const [, onNewsNew] = socket.on.mock.calls.find(
    ([eventName]) => eventName === 'news:new'
  )
  return { getEntityNews, onNewsNew, socket, wrapper }
}

const handlerOf = (socket, event) =>
  socket.on.mock.calls.find(([eventName]) => eventName === event)?.[1]

describe('EntityNews', () => {
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

  test('shows the task types unlinked while the store holds no production', async () => {
    const { wrapper } = await mountNews({
      production: null,
      taskTypeMap: new Map([[taskType.id, taskType]])
    })

    expect(wrapper.findComponent(TaskTypeName).props('productionId')).toBeNull()
  })
})
