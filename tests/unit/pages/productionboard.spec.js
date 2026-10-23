import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

import BoardSettings from '@/components/pages/production/BoardSettings.vue'
import ProductionBoard from '@/components/pages/production/ProductionBoard.vue'

const mountComponent = currentProduction => {
  const store = createStore({
    getters: {
      currentProduction: () => currentProduction,
      productionTaskStatuses: () => [{ id: 'status-1', name: 'WIP' }]
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  const wrapper = shallowMount(ProductionBoard, {
    global: { plugins: [store] }
  })
  return { store, wrapper }
}

describe('ProductionBoard', () => {
  // A production served by its id from an older Zou carries no task status
  // links: the first roles edit must still reach the server.
  it('saves the roles of a status the production has no link for', async () => {
    const { store, wrapper } = mountComponent({ id: 'production-1' })

    wrapper.findComponent(BoardSettings).vm.$emit('update-roles', {
      taskStatusId: 'status-1',
      roles: ['manager']
    })
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('editTaskStatusLink', {
      roles_for_board: ['manager'],
      project_id: 'production-1',
      task_status_id: 'status-1'
    })
  })
})
