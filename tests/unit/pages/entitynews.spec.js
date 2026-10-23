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
  return { getEntityNews, onNewsNew, wrapper }
}

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

  test('shows the task types unlinked while the store holds no production', async () => {
    const { wrapper } = await mountNews({
      production: null,
      taskTypeMap: new Map([[taskType.id, taskType]])
    })

    expect(wrapper.findComponent(TaskTypeName).props('productionId')).toBeNull()
  })
})
