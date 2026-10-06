import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import TaskType from '@/components/pages/TaskType.vue'
import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'

const SearchFieldStub = {
  template: '<div />',
  methods: {
    setValue: () => {}
  }
}

// Monday 31 August, one working day
const task = {
  id: 'task-1',
  estimation: 8 * 60,
  start_date: '2026-08-31T00:00:00',
  due_date: '2026-08-31T00:00:00'
}

const mountPage = async () => {
  const storeActions = {
    clearSelectedTasks: vi.fn(),
    initTaskType: vi.fn(() => Promise.resolve()),
    updateTask: vi.fn(() => Promise.resolve())
  }
  const store = createStore({
    getters: {
      currentEpisode: () => null,
      currentProduction: () => ({ id: 'production-1', name: 'Production' }),
      currentTaskType: () => ({
        id: 'task-type-1',
        name: 'Modeling',
        for_entity: 'Asset'
      }),
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isPaperProduction: () => false,
      isTVShow: () => false,
      nbSelectedTasks: () => 0,
      organisation: () => ({ hours_by_day: 8 }),
      personMap: () => new Map(),
      productionTaskStatuses: () => [],
      selectedTasks: () => new Map(),
      taskMap: () => new Map([[task.id, task]]),
      taskMetadataDescriptors: () => [],
      taskSearchQueries: () => [],
      user: () => ({ id: 'manager-1', departments: [] })
    },
    actions: storeActions
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/productions/:production_id/assets/task-types/:task_type_id/estimation',
        component: { template: '<div />' }
      }
    ]
  })
  await router.push(
    '/productions/production-1/assets/task-types/task-type-1/estimation'
  )
  const wrapper = shallowMount(TaskType, {
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
  await flushPromises()
  return { storeActions, wrapper }
}

describe('TaskType page', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // The estimation helper and the schedule widget send the estimation in
  // minutes: the end date follows it.
  it('saves an estimation edited in the estimation tab', async () => {
    // the data load the page starts 100 ms after mounting is not under test
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { storeActions, wrapper } = await mountPage()

    wrapper
      .findComponent(EstimationHelper)
      .vm.$emit('estimation-changed', { taskId: 'task-1', estimation: 16 * 60 })
    await flushPromises()

    expect(storeActions.updateTask).toHaveBeenCalledTimes(1)
    expect(storeActions.updateTask.mock.calls[0][1]).toEqual({
      taskId: 'task-1',
      data: {
        estimation: 16 * 60,
        start_date: '2026-08-31',
        due_date: '2026-09-01'
      }
    })
    wrapper.unmount()
  })
})
