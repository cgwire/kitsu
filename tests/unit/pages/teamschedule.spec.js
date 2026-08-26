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

import TeamSchedule from '@/components/pages/TeamSchedule.vue'

const ScheduleStub = {
  template: '<div />',
  methods: {
    scrollToToday: () => {}
  }
}

const mountPage = async () => {
  const socket = { on: vi.fn(), off: vi.fn() }
  const store = createStore({
    getters: {
      daysOff: () => [],
      departmentMap: () => new Map(),
      displayedPeople: () => [],
      getProductionTaskTypes: () => () => [],
      isCurrentUserManager: () => true,
      openProductions: () => [],
      organisation: () => ({}),
      productionMap: () => new Map(),
      taskTypeMap: () => new Map(),
      user: () => ({ id: 'user-1', departments: [] })
    },
    actions: {
      getPersonsTasksDates: vi.fn(() => []),
      loadDaysOff: vi.fn(),
      loadPeople: vi.fn()
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  const wrapper = shallowMount(TeamSchedule, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = socket
            app.config.globalProperties.$t = key => key
          }
        }
      ],
      stubs: { Schedule: ScheduleStub }
    }
  })
  await nextTick()
  const handler = socket.on.mock.calls.find(
    ([event]) => event === 'preview-file:set-main'
  )[1]
  return { wrapper, socket, handler }
}

describe('TeamSchedule page', () => {
  describe('preview-file:set-main socket handler', () => {
    // The unassigned tasks are enriched copies kept in component state, so
    // no store mutation can refresh their thumbnail.
    it('refreshes the thumbnail of the tasks of the entity', async () => {
      const { wrapper, handler } = await mountPage()
      wrapper.vm.unassignedTasks = [
        { id: 'task-1', entity_id: 'entity-1', entity_preview_file_id: '' },
        { id: 'task-2', entity_id: 'entity-1', entity_preview_file_id: 'old' },
        { id: 'task-3', entity_id: 'entity-2', entity_preview_file_id: 'old' }
      ]

      handler({ entity_id: 'entity-1', preview_file_id: 'preview-1' })

      expect(
        wrapper.vm.unassignedTasks.map(task => task.entity_preview_file_id)
      ).toEqual(['preview-1', 'preview-1', 'old'])
      wrapper.unmount()
    })

    it('ignores an entity absent from the panel', async () => {
      const { wrapper, handler } = await mountPage()
      wrapper.vm.unassignedTasks = [
        { id: 'task-1', entity_id: 'entity-1', entity_preview_file_id: 'old' }
      ]

      handler({ entity_id: 'entity-9', preview_file_id: 'preview-1' })

      expect(wrapper.vm.unassignedTasks[0].entity_preview_file_id).toEqual(
        'old'
      )
      wrapper.unmount()
    })

    it('is unregistered on unmount', async () => {
      const { wrapper, socket, handler } = await mountPage()
      wrapper.unmount()
      expect(socket.off).toHaveBeenCalledWith('preview-file:set-main', handler)
    })
  })
})
