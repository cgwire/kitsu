import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import Todos from '@/components/pages/Todos.vue'

const feedbackStatus = { id: 'status-1', is_feedback_request: true }
const wipStatus = { id: 'status-2', is_feedback_request: false }

// Distinct due dates keep the priority sort deterministic.
const pendingTask = {
  id: 'task-1',
  task_status_id: feedbackStatus.id,
  priority: 0,
  due_date: '2026-01-01'
}
const wipTask = {
  id: 'task-2',
  task_status_id: wipStatus.id,
  priority: 0,
  due_date: '2026-01-02'
}
// A status created after the context load is missing from the map.
const unknownStatusTask = {
  id: 'task-3',
  task_status_id: 'status-3',
  priority: 0,
  due_date: '2026-01-03'
}

const taskStatusMap = new Map([
  [feedbackStatus.id, feedbackStatus],
  [wipStatus.id, wipStatus]
])

const SearchFieldStub = {
  template: '<div />',
  methods: {
    getValue: () => '',
    setValue: () => {}
  }
}

const mountPage = async todos => {
  const store = createStore({
    getters: {
      displayedDoneTasks: () => [],
      displayedTodos: () => todos,
      doneSelectionGrid: () => ({}),
      getProductionTaskStatuses: () => () => [],
      isTodosLoading: () => false,
      isTodosLoadingError: () => false,
      nbSelectedTasks: () => 0,
      openProductions: () => [],
      productionMap: () => new Map(),
      selectedTasks: () => new Map(),
      taskStatuses: () => [],
      taskStatusMap: () => taskStatusMap,
      taskTypeMap: () => new Map(),
      timeSpentMap: () => new Map(),
      timeSpentTotal: () => 0,
      todoListScrollPosition: () => 0,
      todoSearchQueries: () => [],
      todoSelectionGrid: () => ({}),
      user: () => ({ id: 'user-1' })
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      loadAggregatedPersonDaysOff: vi.fn(() => []),
      loadDoneTasks: vi.fn(),
      loadTodos: vi.fn(),
      setTodosSearch: vi.fn()
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  const wrapper = shallowMount(Todos, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = { on: vi.fn(), off: vi.fn() }
            app.config.globalProperties.$t = key => key
          }
        }
      ],
      stubs: { SearchField: SearchFieldStub }
    }
  })
  await nextTick()
  return wrapper
}

describe('Todos page', () => {
  describe('pendingTasks', () => {
    it('keeps the tasks waiting for a feedback', async () => {
      const wrapper = await mountPage([pendingTask, wipTask])
      expect(wrapper.vm.pendingTasks).toEqual([pendingTask])
      wrapper.unmount()
    })

    it('ignores a task whose status is missing from the map', async () => {
      const wrapper = await mountPage([pendingTask, unknownStatusTask])
      expect(wrapper.vm.pendingTasks).toEqual([pendingTask])
      wrapper.unmount()
    })
  })

  describe('notPendingTasks', () => {
    it('keeps the tasks not waiting for a feedback', async () => {
      const wrapper = await mountPage([pendingTask, wipTask])
      expect(wrapper.vm.notPendingTasks).toEqual([wipTask])
      wrapper.unmount()
    })

    it('keeps a task whose status is missing from the map', async () => {
      const wrapper = await mountPage([wipTask, unknownStatusTask])
      expect(wrapper.vm.notPendingTasks).toEqual([wipTask, unknownStatusTask])
      wrapper.unmount()
    })
  })
})
