import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it } from 'vitest'

import TaskDetailExtensions from '@/components/sides/TaskDetailExtensions.vue'

const task = (id, projectId) => ({
  id,
  project_id: projectId,
  entity_id: `shot-${id}`,
  entity_type_name: 'Shot',
  task_type_id: `type-${id}`
})

describe('TaskDetailExtensions.vue', () => {
  it('opens the selected project plugin with Kitsu identity and resets on Task switching', async () => {
    const store = createStore({
      state: { user: { user: { locale: 'ja-JP' } } },
      getters: {
        isDarkTheme: () => true,
        taskPlugins: () => [
          { plugin_id: 'vfx_files', name: 'VFX Files', frontend_task_enabled: true },
          { plugin_id: 'other_plugin', name: 'Other plugin', frontend_task_enabled: true }
        ]
      }
    })
    const wrapper = mount(TaskDetailExtensions, {
      props: { task: task('task-1', 'production-1'), entityType: 'Shot' },
      global: { plugins: [store], mocks: { $t: key => key } },
      slots: { default: '<div class="comments-content">Comments</div>' }
    })

    expect(wrapper.find('.comments-content').exists()).toBe(true)
    expect(wrapper.findAll('[role="tab"]').map(tab => tab.text())).toEqual([
      'comments.title', 'VFX Files', 'Other plugin'
    ])
    await wrapper.get('[role="tab"]:nth-child(1)').trigger('click')
    expect(wrapper.find('.comments-content').exists()).toBe(true)
    await wrapper.get('[role="tab"]:nth-child(2)').trigger('click')
    await flushPromises()

    let frame = wrapper.get('iframe')
    let params = new URL(frame.attributes('src'), 'https://kitsu.test').searchParams
    expect(Object.fromEntries(params)).toEqual({
      production_id: 'production-1',
      task_id: 'task-1',
      entity_id: 'shot-task-1',
      entity_type: 'Shot',
      task_type_id: 'type-task-1'
    })

    await wrapper.setProps({ task: task('task-2', 'production-2') })
    await flushPromises()
    expect(wrapper.find('iframe').exists()).toBe(false)
    await wrapper.get('[role="tab"]:nth-child(2)').trigger('click')
    frame = wrapper.get('iframe')
    params = new URL(frame.attributes('src'), 'https://kitsu.test').searchParams
    expect(params.get('production_id')).toBe('production-2')
    expect(params.get('task_id')).toBe('task-2')

    wrapper.unmount()
  })
})
