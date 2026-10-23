import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import TaskStatusList from '@/components/lists/TaskStatusList.vue'
import TaskStatus from '@/components/pages/TaskStatus.vue'

const buildStatuses = (names, fields = {}) =>
  names.map((name, index) => ({
    id: name.toLowerCase(),
    name,
    priority: index + 1,
    ...fields
  }))

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/task-status', component: { template: '<div />' } }]
})

// Each drop makes the list emit the statuses in their new order. A status
// saves in 100 ms.
const mountPage = async ({ failing = [] } = {}) => {
  const store = createStore({
    state: {
      taskStatuses: [
        ...buildStatuses(['Todo', 'Ready', 'WIP', 'Done']),
        ...buildStatuses(['Sketch', 'Approved'], { for_concept: true })
      ]
    },
    getters: {
      archivedTaskStatus: () => [],
      taskStatus: state => state.taskStatuses
    },
    mutations: {
      EDIT_TASK_STATUS_END: (state, { id, ...fields }) => {
        Object.assign(
          state.taskStatuses.find(status => status.id === id),
          fields
        )
      }
    }
  })
  const saves = []
  store.dispatch = vi.fn((action, status) => {
    if (action !== 'updateTaskStatusPriority') return Promise.resolve()
    saves.push(`${status.id}:${status.priority}`)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (failing.includes(status.id)) reject(new Error('Bad Gateway'))
        else resolve()
      }, 100)
    })
  })
  await router.push('/task-status')
  await router.isReady()
  const errorHandler = vi.fn()
  const wrapper = shallowMount(TaskStatus, {
    global: {
      config: { errorHandler },
      plugins: [store, router],
      mocks: { $t: key => key }
    }
  })
  await flushPromises()
  const list = () => wrapper.findComponent(TaskStatusList)
  const drop = ids =>
    list().vm.$emit(
      'update-priorities',
      ids.map((id, index) => ({ id, priority: index + 1 }))
    )
  return { drop, errorHandler, list, saves }
}

const openTab = async query => {
  await router.push({ path: '/task-status', query })
  await vi.advanceTimersByTimeAsync(0)
}

describe('TaskStatus', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // Regression: a reorder dropped while the statuses of the previous one
  // were saved, one by one, saved its own at the same time: the order kept
  // mixed both, with statuses sharing a priority.
  it('saves the statuses of a reorder after those of the previous one', async () => {
    const { drop, saves } = await mountPage()
    vi.useFakeTimers()

    drop(['done', 'todo', 'ready', 'wip'])
    await vi.advanceTimersByTimeAsync(150)
    drop(['ready', 'done', 'todo', 'wip'])
    await vi.advanceTimersByTimeAsync(100)
    drop(['wip', 'done', 'todo', 'ready'])
    await vi.advanceTimersByTimeAsync(5000)

    expect(saves).toEqual([
      'done:1',
      'todo:2',
      'ready:3',
      'wip:4',
      'wip:1',
      'done:2',
      'todo:3',
      'ready:4'
    ])
  })

  // Regression: both lists shared one queue, so a drop on one list took the
  // place of the order waiting for the other.
  it('saves the order of each list', async () => {
    const { drop, saves } = await mountPage()
    vi.useFakeTimers()

    drop(['done', 'todo', 'ready', 'wip'])
    await vi.advanceTimersByTimeAsync(50)
    await openTab({ entity: 'concepts' })
    drop(['approved', 'sketch'])
    await openTab({ entity: 'entities' })
    drop(['wip', 'done', 'todo', 'ready'])
    await vi.advanceTimersByTimeAsync(5000)

    expect(saves).toEqual(expect.arrayContaining(['approved:1', 'sketch:2']))
    expect(saves.slice(-4)).toEqual(['wip:1', 'done:2', 'todo:3', 'ready:4'])
  })

  // Regression: a failed save changed no status in the store, so the list
  // kept what it showed during the drag, deleted rows included.
  it('shows the order of a drop at once, saved or not', async () => {
    const { drop, errorHandler, list } = await mountPage({ failing: ['done'] })
    vi.useFakeTimers()

    drop(['done', 'todo', 'ready', 'wip'])
    await vi.advanceTimersByTimeAsync(0)
    expect(list().props('entries').map(({ id }) => id)).toEqual([
      'done',
      'todo',
      'ready',
      'wip'
    ])

    await vi.advanceTimersByTimeAsync(1000)
    expect(errorHandler.mock.calls[0][0]).toEqual(new Error('Bad Gateway'))
  })
})
