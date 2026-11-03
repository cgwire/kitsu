import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import TaskStatusList from '@/components/lists/TaskStatusList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
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
const mountPage = async ({
  failing = [],
  deleteError = null,
  deletion = null
} = {}) => {
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
    if (action === 'deleteTaskStatus' && deletion) return deletion
    if (action === 'deleteTaskStatus' && deleteError) {
      return Promise.reject(deleteError)
    }
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
      plugins: [store, router]
    }
  })
  await flushPromises()
  const list = () => wrapper.findComponent(TaskStatusList)
  const drop = ids =>
    list().vm.$emit(
      'update-priorities',
      ids.map((id, index) => ({ id, priority: index + 1 }))
    )
  return { drop, errorHandler, list, saves, store, wrapper }
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

  describe('deletion', () => {
    const done = { id: 'done', name: 'Done' }
    const wip = { id: 'wip', name: 'WIP' }

    const openDeleteModal = async (wrapper, status = done) => {
      wrapper.findComponent(TaskStatusList).vm.$emit('delete-clicked', status)
      await flushPromises()
      return wrapper.findComponent(DeleteModal)
    }

    const deleteDone = async wrapper => {
      const modal = await openDeleteModal(wrapper)
      modal.vm.$emit('confirm')
      await flushPromises()
      return modal
    }

    const pendingDeletion = () => {
      const deletion = {}
      deletion.promise = new Promise((resolve, reject) => {
        Object.assign(deletion, { resolve, reject })
      })
      return deletion
    }

    const refusal = { body: { message: 'Task status Done is in use.' } }

    const deletions = store =>
      store.dispatch.mock.calls.filter(
        ([action]) => action === 'deleteTaskStatus'
      )

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    // Zou refuses it while a status automation uses the status.
    it('explains when status automations use the status', async () => {
      const message =
        'Task status Done is used by 2 status automations (1 archived). Remove it from them first.'
      const { wrapper } = await mountPage({ deleteError: { body: { message } } })

      const modal = await deleteDone(wrapper)

      expect(modal.props('isError')).toBe(true)
      expect(modal.props('errorText')).toBe(
        'task_status.delete_blocked_by_automations'
      )
      expect(modal.props('errorDetails')).toBe(message)
      expect(console.error).toHaveBeenCalledTimes(1)
    })

    it('falls back to the generic message on any other error', async () => {
      const { wrapper } = await mountPage({
        deleteError: new Error('Network Error')
      })

      const modal = await deleteDone(wrapper)

      expect(modal.props('isError')).toBe(true)
      expect(modal.props('errorText')).toBe('task_status.delete_error')
      expect(modal.props('errorDetails')).toBe('')
      expect(console.error).toHaveBeenCalledTimes(1)
    })

    it('closes the modal once the status is deleted', async () => {
      const { wrapper } = await mountPage()

      const modal = await deleteDone(wrapper)

      expect(modal.props('active')).toBe(false)
      expect(modal.props('isError')).toBe(false)
    })

    it('takes a new confirmation after a refusal', async () => {
      const { store, wrapper } = await mountPage({ deleteError: refusal })
      const modal = await deleteDone(wrapper)

      modal.vm.$emit('confirm')
      await flushPromises()

      expect(deletions(store)).toHaveLength(2)
      expect(console.error).toHaveBeenCalledTimes(2)
    })

    it('starts over when the modal opens again', async () => {
      const { wrapper } = await mountPage({ deleteError: refusal })
      await deleteDone(wrapper)

      const modal = await openDeleteModal(wrapper, wip)

      expect(modal.props('isError')).toBe(false)
      expect(modal.props('errorDetails')).toBe('')
      expect(console.error).toHaveBeenCalledTimes(1)
    })

    it('ignores a second confirmation while the first one is pending', async () => {
      const { store, wrapper } = await mountPage({
        deletion: pendingDeletion().promise
      })
      const modal = await deleteDone(wrapper)

      modal.vm.$emit('confirm')
      await flushPromises()

      expect(deletions(store)).toHaveLength(1)
    })

    it('keeps a late refusal off a modal reopened for another status', async () => {
      const deletion = pendingDeletion()
      const { wrapper } = await mountPage({ deletion: deletion.promise })
      const modal = await deleteDone(wrapper)
      modal.vm.$emit('cancel')
      await openDeleteModal(wrapper, wip)

      deletion.reject(refusal)
      await flushPromises()

      expect(modal.props('isError')).toBe(false)
      expect(modal.props('errorDetails')).toBe('')
      expect(console.error).toHaveBeenCalledTimes(1)
    })

    it('leaves a modal reopened for another status open after a late success', async () => {
      const deletion = pendingDeletion()
      const { wrapper } = await mountPage({ deletion: deletion.promise })
      const modal = await deleteDone(wrapper)
      modal.vm.$emit('cancel')
      await openDeleteModal(wrapper, wip)

      deletion.resolve()
      await flushPromises()

      expect(modal.props('active')).toBe(true)
    })
  })
})
