import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import resizableColumn from '@/directives/resizable-column'

import TodosList from '@/components/lists/TodosList.vue'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const task = {
  id: 'task-1',
  project_id: 'production-1',
  task_type_id: 'task-type-1',
  entity_type_name: 'Shot',
  full_entity_name: 'SQ010 / SH0010',
  due_date: '2026-10-01'
}

const mountList = props =>
  shallowMount(TodosList, {
    global: {
      plugins: [
        createStore({
          getters: {
            dateFormat: () => 'YYYY-MM-DD',
            isCurrentUserManager: () => false,
            isCurrentUserSupervisor: () => false,
            nbSelectedTasks: () => 0,
            openProductions: () => [],
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            productionMap: () => new Map(),
            taskMap: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false,
            user: () => ({ id: 'user-1', departments: [] })
          }
        }),
        resizableColumn
      ],
      stubs: { RouterLink: true }
    },
    props
  })

// The pages mount the list while the tasks load: the table only renders
// once the loading ends.
const mountLoadedList = async () => {
  const wrapper = mountList({ isLoading: true, tasks: [] })
  await wrapper.setProps({ isLoading: false, tasks: [task] })
  return wrapper
}

// MouseEventInit has no pageX key, so jsdom drops it in the constructor.
const mouseEvent = (type, pageX) => {
  const event = new MouseEvent(type, { bubbles: true })
  Object.defineProperty(event, 'pageX', { value: pageX })
  return event
}

describe('lists/TodosList', () => {
  afterEach(() => {
    localStorage.clear()
  })

  test('lets the user resize the entity column once the tasks load', async () => {
    const wrapper = await mountLoadedList()

    expect(wrapper.find('thead th.name .resizable-knob').exists()).toBe(true)

    wrapper.unmount()
  })

  test('keeps the entity column width when the list reloads', async () => {
    const wrapper = await mountLoadedList()
    const knob = wrapper.find('thead th.name .resizable-knob').element

    // jsdom lays nothing out: the column starts from a 0px width.
    knob.dispatchEvent(mouseEvent('mousedown', 100))
    document.dispatchEvent(mouseEvent('mousemove', 520))
    document.dispatchEvent(mouseEvent('mouseup', 520))
    await wrapper.setProps({ isLoading: true })
    await wrapper.setProps({ isLoading: false })

    expect(wrapper.find('thead th.name').element.style.width).toBe('420px')

    wrapper.unmount()
  })
})
