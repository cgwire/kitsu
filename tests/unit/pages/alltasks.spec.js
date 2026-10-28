import { flushPromises, shallowMount } from '@vue/test-utils'
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

import AllTaskList from '@/components/lists/AllTaskList.vue'
import AllTasks from '@/components/pages/AllTasks.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import StatusStats from '@/components/widgets/StatusStats.vue'

const todoStatus = {
  id: 'status-1',
  short_name: 'todo',
  color: '#f5f5f5',
  is_default: true
}
const wipStatus = {
  id: 'status-2',
  short_name: 'wip',
  color: '#3273dc',
  is_default: false
}

const openTasks = {
  data: [],
  is_more: false,
  stats: {
    status: [
      { task_status_id: todoStatus.id, amount: 3 },
      { task_status_id: wipStatus.id, amount: 1 }
    ]
  }
}

const mountPage = async ({
  loadOpenTasks = vi.fn(() => openTasks)
} = {}) => {
  const store = createStore({
    getters: {
      activePeopleWithoutBot: () => [],
      getProductionTaskStatuses: () => () => [],
      getProductionTaskTypes: () => () => [],
      openProductions: () => [],
      personMap: () => new Map(),
      productionMap: () => new Map(),
      selectedTasks: () => new Map(),
      taskStatusMap: () =>
        new Map([
          [todoStatus.id, todoStatus],
          [wipStatus.id, wipStatus]
        ])
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      loadOpenTasks
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  await router.push('/')
  const wrapper = shallowMount(AllTasks, {
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
      // The status stats sit in the side slot of the layout, in the default
      // slot of the task panel.
      stubs: {
        PageLayout: {
          template: '<div><slot name="main" /><slot name="side" /></div>'
        },
        TaskInfo: { template: '<div><slot /></div>' }
      }
    }
  })
  await flushPromises()
  return wrapper
}

describe('AllTasks page', () => {
  // Out of the box the default status is near white, unreadable on the light
  // side panel.
  it('draws the bar of the default status in grey', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findComponent(StatusStats).props('stats')).toEqual([
      { name: 'TODO', color: '#6F727A', value: 3 },
      { name: 'WIP', color: '#3273dc', value: 1 }
    ])
    wrapper.unmount()
  })

  // A production can refuse its open tasks to a person who is client or
  // vendor on it, while the filter lists every open production.
  it('clears the loading error once the tasks load again', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const loadOpenTasks = vi
      .fn()
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValue(openTasks)
    const wrapper = await mountPage({ loadOpenTasks })
    expect(wrapper.findComponent(AllTaskList).props('isError')).toBe(true)
    expect(consoleError).toHaveBeenCalledOnce()

    wrapper
      .findComponent(ComboboxProduction)
      .vm.$emit('update:modelValue', 'production-2')
    await flushPromises()

    expect(loadOpenTasks).toHaveBeenCalledTimes(2)
    expect(wrapper.findComponent(AllTaskList).props('isError')).toBe(false)
    wrapper.unmount()
    consoleError.mockRestore()
  })
})
