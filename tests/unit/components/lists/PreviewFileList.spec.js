import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import PreviewFileList from '@/components/lists/PreviewFileList.vue'

const previewFile = {
  id: 'preview-1',
  created_at: '2026-10-01T10:00:00',
  project_id: 'production-1',
  task_id: 'task-1',
  task_type_id: 'task-type-1',
  full_entity_name: 'SQ010 / SH0010',
  revision: 1,
  status: 'broken'
}

const mountList = errors =>
  shallowMount(PreviewFileList, {
    props: { previewFiles: [previewFile] },
    global: {
      config: { errorHandler: err => errors.push(err) },
      plugins: [
        createStore({
          getters: {
            dateFormat: () => 'YYYY-MM-DD',
            productionMap: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false
          }
        })
      ]
    }
  })

// The header sits in its own table, so it follows the body scroll by hand.
describe('PreviewFileList, body scroll', () => {
  it('moves the header with the horizontal scroll of the body', () => {
    const errors = []
    const wrapper = mountList(errors)
    const body = wrapper.find('.datatable-body').element.closest('div')
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
    const body = wrapper.find('.datatable-body').element.closest('div')
    wrapper.unmount()

    body.dispatchEvent(new Event('scroll'))

    expect(errors).toEqual([])
  })
})
