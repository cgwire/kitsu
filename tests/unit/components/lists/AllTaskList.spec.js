import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import AllTaskList from '@/components/lists/AllTaskList.vue'

import { openModalHost } from '../../fixtures/modal-host'
import { trackTaskSelection } from '../../fixtures/task-selection'

describe('lists/AllTaskList', () => {
  const tasks = ['task-1', 'task-2'].map(id => ({ id, assignees: [] }))

  const mountList = selection =>
    shallowMount(AllTaskList, {
      global: {
        plugins: [
          createStore({
            state: selection.state,
            mutations: selection.mutations,
            getters: {
              organisation: () => ({ hours_by_day: 8 }),
              personMap: () => new Map(),
              taskTypeMap: () => new Map(),
              user: () => ({ id: 'user-1' }),
              ...selection.getters
            },
            actions: selection.actions
          })
        ]
      },
      props: { tasks }
    })

  const pressAltDown = async () => {
    const event = new KeyboardEvent('keydown', {
      altKey: true,
      cancelable: true,
      keyCode: 40
    })
    window.dispatchEvent(event)
    await nextTick()
    return event
  }

  // The task of a comment being edited moved behind the modal.
  test('keeps the selection on Alt+Down behind a modal', async () => {
    const selection = trackTaskSelection()
    const wrapper = mountList(selection)
    await wrapper.find('tbody tr.task-line').trigger('click')
    const closeModal = await openModalHost()

    const event = await pressAltDown()

    expect(selection.selectedIds()).toEqual(['task-1'])
    expect(event.defaultPrevented).toBe(true)

    closeModal()
    await pressAltDown()

    expect(selection.selectedIds()).toEqual(['task-2'])

    wrapper.unmount()
  })
})
