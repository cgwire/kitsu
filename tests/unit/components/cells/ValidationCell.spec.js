import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ValidationCell from '@/components/cells/ValidationCell.vue'

const task = { id: 'task-1', task_status_id: 'status-1', assignees: [] }

const mountCell = props =>
  shallowMount(ValidationCell, {
    props: {
      column: { id: 'modeling', color: '#000000' },
      entity: { id: 'asset-1', validations: new Map([['modeling', 'task-1']]) },
      ...props
    },
    global: {
      plugins: [
        createStore({
          getters: {
            isCurrentUserClient: () => false,
            isDarkTheme: () => false,
            personMap: () => new Map(),
            taskMap: () => new Map([['task-1', task]]),
            taskStatusMap: () =>
              new Map([['status-1', { short_name: 'wip', color: '#000000' }]])
          }
        })
      ]
    }
  })

describe('ValidationCell, masked task', () => {
  test('shows the task of its entity by default', async () => {
    const wrapper = mountCell({})
    await flushPromises()
    expect(wrapper.find('.tag').exists()).toBe(true)
  })

  test('shows nothing when the task is masked', async () => {
    const wrapper = mountCell({ hideTask: true, taskTest: task })
    await flushPromises()
    expect(wrapper.find('.tag').exists()).toBe(false)
    expect(wrapper.vm.task).toBeNull()
  })
})
