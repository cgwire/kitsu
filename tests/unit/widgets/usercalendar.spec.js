import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { createStore } from 'vuex'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import UserCalendar from '@/components/widgets/UserCalendar.vue'

const todoStatus = {
  id: 'status-1',
  name: 'Todo',
  short_name: 'todo',
  color: '#f5f5f5',
  is_default: true
}
const wipStatus = {
  id: 'status-2',
  name: 'WIP',
  short_name: 'wip',
  color: '#3273dc',
  is_default: false
}
const taskType = { id: 'type-1', name: 'Animation', color: '#1e90ff' }

// The calendar opens on the current month.
const toDateKey = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-` +
  `${String(date.getDate()).padStart(2, '0')}`

const previewPath = '/api/pictures/previews/preview-files/preview-1.png'

const mountCalendar = async (
  taskStatus,
  { task: taskOverrides = {}, previewFileStatusMap } = {}
) => {
  const today = toDateKey(new Date())
  const task = {
    id: 'task-1',
    project_id: 'project-1',
    task_type_id: taskType.id,
    task_status_id: taskStatus.id,
    start_date: today,
    due_date: today,
    full_entity_name: 'Prod / SH010',
    entity_preview_file_id: null,
    ...taskOverrides
  }
  const store = createStore({
    getters: {
      previewFileStatusMap: () => previewFileStatusMap,
      productionMap: () => new Map(),
      taskMap: () => new Map([[task.id, task]]),
      taskStatusMap: () => new Map([[taskStatus.id, taskStatus]]),
      taskTypeMap: () => new Map([[taskType.id, taskType]])
    }
  })
  const wrapper = mount(UserCalendar, {
    props: { tasks: [task], isLoading: false },
    global: { plugins: [store] }
  })
  await flushPromises()
  return wrapper
}

describe('UserCalendar', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      }
    )
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  // Out of the box the default status is near white, unreadable on the light
  // event chip.
  it('draws the status dot of the default status in grey', async () => {
    const wrapper = await mountCalendar(todoStatus)
    const dot = wrapper.find('.status-dot')
    expect(dot.exists()).toBe(true)
    expect(dot.element.style.background).toBe('rgb(111, 114, 122)')
    wrapper.unmount()
  })

  it('draws the status dot of another status in its color', async () => {
    const wrapper = await mountCalendar(wipStatus)
    const dot = wrapper.find('.status-dot')
    expect(dot.exists()).toBe(true)
    expect(dot.element.style.background).toBe('rgb(50, 115, 220)')
    wrapper.unmount()
  })

  it('draws no picture for an entity without preview', async () => {
    const wrapper = await mountCalendar(todoStatus)
    expect(wrapper.find('.event-thumbnail').exists()).toBe(true)
    expect(wrapper.find('.event-thumbnail img').exists()).toBe(false)
    wrapper.unmount()
  })

  it('draws a preview the registry does not know under its usual URL', async () => {
    const wrapper = await mountCalendar(todoStatus, {
      task: { entity_preview_file_id: 'preview-1' },
      previewFileStatusMap: reactive(new Map())
    })
    expect(wrapper.find('.event-thumbnail img').attributes('src')).toBe(
      previewPath
    )
    wrapper.unmount()
  })

  it('waits for a processing preview before drawing it', async () => {
    const wrapper = await mountCalendar(todoStatus, {
      task: { entity_preview_file_id: 'preview-1' },
      previewFileStatusMap: reactive(new Map([['preview-1', 'processing']]))
    })
    expect(wrapper.find('.event-thumbnail').exists()).toBe(true)
    expect(wrapper.find('.event-thumbnail img').exists()).toBe(false)
    wrapper.unmount()
  })

  // A new URL: the plain one may have got a 404 while Zou built the picture.
  it('draws the preview once the registry knows it ready', async () => {
    const previewFileStatusMap = reactive(new Map([['preview-1', 'processing']]))
    const wrapper = await mountCalendar(todoStatus, {
      task: { entity_preview_file_id: 'preview-1' },
      previewFileStatusMap
    })
    previewFileStatusMap.set('preview-1', 'ready')
    await flushPromises()
    expect(wrapper.find('.event-thumbnail img').attributes('src')).toBe(
      `${previewPath}?ready`
    )
    wrapper.unmount()
  })
})
