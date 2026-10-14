import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import EntityTaskList from '@/components/lists/EntityTaskList.vue'

const task = {
  id: 'task-1',
  task_type_id: 'task-type-1',
  task_status_id: 'task-status-1',
  estimation: 0,
  duration: 0,
  start_date: null,
  due_date: null,
  assignees: []
}

const mountList = errors =>
  shallowMount(EntityTaskList, {
    props: { entries: [task] },
    global: {
      config: { errorHandler: err => errors.push(err) },
      plugins: [
        createStore({
          getters: {
            currentProduction: () => ({ id: 'production-1' }),
            dateFormat: () => 'YYYY-MM-DD',
            getTaskTypePriority: () => () => 1,
            isCurrentUserClient: () => false,
            isCurrentUserVendor: () => false,
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            taskMap: () => new Map(),
            taskStatusMap: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false
          }
        })
      ]
    }
  })

// The header sits in its own table, so it follows the body scroll by hand.
describe('EntityTaskList, body scroll', () => {
  it('moves the header with the horizontal scroll of the body', () => {
    const errors = []
    const wrapper = mountList(errors)
    const body = wrapper.find('.task-list-body').element
    body.scrollLeft = 30

    body.dispatchEvent(new Event('scroll'))

    expect(wrapper.find('table').element.style.left).toBe('-30px')
    expect(errors).toEqual([])
    wrapper.unmount()
  })

  // The browser still delivers a scroll queued before the unmount, once the
  // template refs are null.
  it('ignores a scroll that reaches the detached body', () => {
    const errors = []
    const wrapper = mountList(errors)
    const body = wrapper.find('.task-list-body').element
    wrapper.unmount()

    body.dispatchEvent(new Event('scroll'))

    expect(errors).toEqual([])
  })
})
