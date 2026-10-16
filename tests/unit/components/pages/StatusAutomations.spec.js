import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import StatusAutomationList from '@/components/lists/StatusAutomationList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import StatusAutomations from '@/components/pages/StatusAutomations.vue'

import { shallowMountWithI18n } from '../../fixtures/i18n'

const statusAutomation = {
  id: 'automation-1',
  entity_type: 'asset',
  in_task_type_id: 'task-type-1',
  in_task_status_id: 'task-status-1',
  out_field_type: 'status',
  out_task_type_id: 'task-type-2',
  out_task_status_id: 'task-status-2',
  import_last_revision: false,
  archived: false
}

describe('StatusAutomations page', () => {
  const mountPage = async (actions = {}) => {
    const store = createStore({
      getters: {
        statusAutomations: () => [statusAutomation],
        archivedStatusAutomations: () => [],
        taskStatusMap: () => new Map(),
        taskTypeMap: () => new Map()
      },
      actions: { loadStatusAutomations: () => {}, ...actions }
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }]
    })
    await router.push('/')
    const wrapper = shallowMountWithI18n(StatusAutomations, {
      global: {
        plugins: [store, router],
        stubs: { DeleteModal: false }
      }
    })
    await flushPromises()
    return wrapper
  }

  // An automation has no name, and the text of the custom actions read
  // "remove custom action  from your database".
  it('asks to confirm the deletion of a status automation', async () => {
    const wrapper = await mountPage()

    wrapper
      .findComponent(StatusAutomationList)
      .vm.$emit('delete-clicked', statusAutomation)
    await nextTick()

    const deleteModal = wrapper.findComponent(DeleteModal)
    expect(deleteModal.props('active')).toBe(true)
    const text = deleteModal.find('.text').text()
    expect(text).not.toContain('custom action')
    expect(text).not.toContain('undefined')
    expect(text).toBe(
      'Are you sure you want to remove this status automation from your database?'
    )
  })

  // Zou refuses to delete an automation that a production or a production
  // template uses.
  it('explains why the deletion of a status automation fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const wrapper = await mountPage({
      deleteStatusAutomation: () => Promise.reject(new Error('Bad request'))
    })

    wrapper
      .findComponent(StatusAutomationList)
      .vm.$emit('delete-clicked', statusAutomation)
    await nextTick()
    const deleteModal = wrapper.findComponent(DeleteModal)
    deleteModal.vm.$emit('confirm')
    await flushPromises()

    expect(deleteModal.find('.is-danger').text()).toBe(
      'An error occurred while deleting this status automation. It may be ' +
        'linked to a production or a production template. If so, you must ' +
        'remove it from every production and template first.'
    )
    expect(consoleError).toHaveBeenCalledOnce()
    consoleError.mockRestore()
  })
})
