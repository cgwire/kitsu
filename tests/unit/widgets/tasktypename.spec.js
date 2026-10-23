import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const mountTag = props => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      {
        name: 'task-type',
        path: '/productions/:production_id/:type/task-types/:task_type_id',
        component: { template: '<div />' }
      },
      {
        name: 'episode-task-type',
        path: '/productions/:production_id/episodes/:episode_id/:type/task-types/:task_type_id',
        component: { template: '<div />' }
      }
    ]
  })
  const store = createStore({ getters: { isCurrentUserClient: () => false } })
  const errorHandler = vi.fn()
  const wrapper = mount(TaskTypeName, {
    global: { plugins: [router, store], config: { errorHandler } },
    props: { productionId: 'production-1', ...props }
  })
  return { wrapper, errorHandler }
}

describe('TaskTypeName', () => {
  test('links a known task type to its task-type page', () => {
    const { wrapper, errorHandler } = mountTag({
      taskType: { id: 'task-type-1', name: 'Animation', for_entity: 'Shot' }
    })

    expect(errorHandler).not.toHaveBeenCalled()
    expect(wrapper.find('a').attributes('href')).toBe(
      '/productions/production-1/shots/task-types/task-type-1'
    )
    expect(wrapper.text()).toBe('Animation')
  })

  // Pages spread a taskTypeMap entry into the prop, so a task type missing
  // from the map arrives as a truthy object without id or for_entity.
  test('renders no link for a task type without an entity', () => {
    const { wrapper, errorHandler } = mountTag({
      taskType: { episode_id: 'episode-1' }
    })

    expect(errorHandler).not.toHaveBeenCalled()
    expect(wrapper.find('a').exists()).toBe(false)
  })
})
