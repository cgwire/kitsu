import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import TaskTypeList from '@/components/lists/TaskTypeList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import TaskTypes from '@/components/pages/TaskTypes.vue'

const taskType = {
  id: 'task-type-1',
  name: 'Compositing',
  for_entity: 'Asset',
  archived: true
}
const otherTaskType = { ...taskType, id: 'task-type-2', name: 'Render' }

// The messages Zou returns, see crud/task_type.py pre_delete and
// crud/base.py build_db_error_message.
const linksError = {
  body: {
    message:
      'Task type is attached to schedule items and projects. Re-issue the request with force=true to detach.'
  }
}
const tasksError = {
  body: { message: 'The change conflicts with records referencing this one.' }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/task-types', component: { template: '<div />' } }]
})

// The plain deletion rejects with deleteError, the forced one resolves,
// unless deleteImpl takes over the deleteTaskType dispatch.
const mountComponent = async (deleteError, deleteImpl) => {
  const store = createStore({
    getters: {
      archivedTaskTypes: () => [taskType, otherTaskType],
      departmentMap: () => new Map(),
      taskTypes: () => []
    }
  })
  const deleteTaskType =
    deleteImpl ||
    (payload =>
      payload.force ? Promise.resolve() : Promise.reject(deleteError))
  store.dispatch = vi.fn((action, payload) =>
    action === 'deleteTaskType' ? deleteTaskType(payload) : Promise.resolve()
  )
  await router.push('/task-types?tab=archived')
  await router.isReady()
  const wrapper = shallowMount(TaskTypes, {
    global: { plugins: [store, router], mocks: { $t: key => key } }
  })
  await flushPromises()
  return { store, wrapper }
}

const openDeleteModal = async (wrapper, target = taskType) => {
  wrapper.findComponent(TaskTypeList).vm.$emit('delete-clicked', target)
  await flushPromises()
  return wrapper.findComponent(DeleteModal)
}

const confirmDeletion = async wrapper => {
  wrapper.findComponent(DeleteModal).vm.$emit('confirm')
  await flushPromises()
  return wrapper.findComponent(DeleteModal)
}

describe('TaskTypes', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not force the deletion on the first confirmation', async () => {
    const { store, wrapper } = await mountComponent(new Error('Network Error'))
    await openDeleteModal(wrapper)

    await confirmDeletion(wrapper)

    expect(store.dispatch).toHaveBeenCalledWith('deleteTaskType', {
      taskType,
      force: false
    })
  })

  describe('when the schedule or the productions still hold it', () => {
    it('explains what detaching drops, with the server details', async () => {
      const { wrapper } = await mountComponent(linksError)
      await openDeleteModal(wrapper)

      const modal = await confirmDeletion(wrapper)

      expect(modal.props('isError')).toBe(true)
      expect(modal.props('errorText')).toEqual(
        'task_types.delete_blocked_by_links'
      )
      expect(modal.props('errorDetails')).toEqual(linksError.body.message)
    })

    it('offers to detach and delete on a second confirmation', async () => {
      const { store, wrapper } = await mountComponent(linksError)
      await openDeleteModal(wrapper)
      let modal = await confirmDeletion(wrapper)
      expect(modal.props('deleteButtonText')).toEqual('task_types.delete_force')

      modal = await confirmDeletion(wrapper)

      expect(store.dispatch).toHaveBeenLastCalledWith('deleteTaskType', {
        taskType,
        force: true
      })
      expect(modal.props('active')).toBe(false)
      expect(modal.props('isError')).toBe(false)
    })

    it('starts over when the modal opens on another task type', async () => {
      const { store, wrapper } = await mountComponent(linksError)
      await openDeleteModal(wrapper)
      await confirmDeletion(wrapper)

      const modal = await openDeleteModal(wrapper, otherTaskType)

      expect(modal.props('isError')).toBe(false)
      expect(modal.props('deleteButtonText')).toEqual('')
      await confirmDeletion(wrapper)
      expect(store.dispatch).toHaveBeenLastCalledWith('deleteTaskType', {
        taskType: otherTaskType,
        force: false
      })
    })
  })

  // Force only purges schedule items and production links, so a task type
  // still carrying tasks cannot be forced: no detach button.
  it('explains when tasks still use it, without offering to force', async () => {
    const { wrapper } = await mountComponent(tasksError)
    await openDeleteModal(wrapper)

    const modal = await confirmDeletion(wrapper)

    expect(modal.props('isError')).toBe(true)
    expect(modal.props('errorText')).toEqual(
      'task_types.delete_blocked_by_tasks'
    )
    expect(modal.props('errorDetails')).toEqual(tasksError.body.message)
    expect(modal.props('deleteButtonText')).toEqual('')
  })

  it('ignores a second confirmation while the first one is pending', async () => {
    const { store, wrapper } = await mountComponent(
      null,
      () => new Promise(() => {})
    )
    await openDeleteModal(wrapper)

    await confirmDeletion(wrapper)
    await confirmDeletion(wrapper)

    const deletions = store.dispatch.mock.calls.filter(
      ([action]) => action === 'deleteTaskType'
    )
    expect(deletions).toHaveLength(1)
  })

  it('ignores the answer of a deletion cancelled before it settled', async () => {
    let rejectDeletion
    const { store, wrapper } = await mountComponent(
      null,
      () => new Promise((resolve, reject) => (rejectDeletion = reject))
    )
    await openDeleteModal(wrapper)
    await confirmDeletion(wrapper)
    wrapper.findComponent(DeleteModal).vm.$emit('cancel')
    await openDeleteModal(wrapper, otherTaskType)

    rejectDeletion(linksError)
    await flushPromises()

    const modal = wrapper.findComponent(DeleteModal)
    expect(modal.props('isError')).toBe(false)
    expect(modal.props('deleteButtonText')).toEqual('')
    expect(store.dispatch).toHaveBeenCalledTimes(3)
  })

  it('falls back to the generic message on any other error', async () => {
    const { wrapper } = await mountComponent(new Error('Network Error'))
    await openDeleteModal(wrapper)

    const modal = await confirmDeletion(wrapper)

    expect(modal.props('isError')).toBe(true)
    expect(modal.props('errorText')).toEqual('task_types.delete_error')
    expect(modal.props('errorDetails')).toEqual('')
    expect(modal.props('deleteButtonText')).toEqual('')
  })
})
