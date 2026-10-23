import { shallowMount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@/composables/time', () => ({
  useTime: () => ({ formatTime: () => '' })
}))

import NewsRow from '@/components/pages/news/NewsRow.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const taskType = { id: 'task-type-1', name: 'Animation', for_entity: 'Shot' }

const news = {
  id: 'news-1',
  author_id: 'person-1',
  created_at: '2026-09-21T10:00:00',
  episode_id: 'episode-1',
  project_id: 'production-1',
  task_id: 'task-1',
  task_status_id: 'task-status-1',
  task_type_id: taskType.id
}

const mountRow = taskTypeMap => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  const store = createStore({
    getters: {
      personMap: () => new Map(),
      productionMap: () => new Map(),
      taskStatusMap: () => new Map(),
      taskTypeMap: () => taskTypeMap
    }
  })
  return shallowMount(NewsRow, {
    global: { plugins: [router, store] },
    props: { canvasId: 'canvas-1', news }
  })
}

describe('NewsRow', () => {
  test('passes the task type scoped to the episode when it is known', () => {
    const wrapper = mountRow(new Map([[taskType.id, taskType]]))

    expect(wrapper.findComponent(TaskTypeName).props('taskType')).toEqual({
      ...taskType,
      episode_id: 'episode-1'
    })
  })

  // A task type created after the tab loaded is absent from the map: the
  // tag must not receive a partial object the widget would turn into a
  // broken link.
  test('passes null when the task type is unknown', () => {
    const wrapper = mountRow(new Map())

    expect(wrapper.findComponent(TaskTypeName).props('taskType')).toBeNull()
  })
})
