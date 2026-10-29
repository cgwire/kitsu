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

describe('PreviewFileList, card layout', () => {
  it('opts both tables into the mobile cards', () => {
    const wrapper = mountList([])
    const tables = wrapper.findAll('table')
    expect(tables).toHaveLength(2)
    tables.forEach(table =>
      expect(table.classes()).toContain('datatable--cards')
    )
    wrapper.unmount()
  })

  it('heads the card with the entity', () => {
    const wrapper = mountList([])
    expect(wrapper.find('tbody td.entity-name').classes()).toContain(
      'card-head'
    )
    wrapper.unmount()
  })

  it('labels the value cells', () => {
    const wrapper = mountList([])
    const label = selector =>
      wrapper.find(`tbody ${selector}`).attributes('data-label')
    expect(label('td.date')).toBe('logs.preview_files.date')
    expect(label('td.production')).toBe('logs.preview_files.production')
    expect(label('.task-type')).toBe('logs.preview_files.task_type_id')
    expect(label('td.revision')).toBe('logs.preview_files.revision')
    expect(label('td.status')).toBe('logs.preview_files.status')
    wrapper.unmount()
  })

  it('leaves the mark broken action off the card', () => {
    const wrapper = mountList([])
    expect(
      wrapper.find('tbody td.end-cell').attributes('data-label')
    ).toBeUndefined()
    wrapper.unmount()
  })
})
