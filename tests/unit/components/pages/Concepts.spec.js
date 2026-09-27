import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

// Importing the page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import Concepts from '@/components/pages/Concepts.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/productions/:production_id/concepts',
      name: 'concepts',
      component: Concepts
    }
  ]
})

const buildConcept = id => ({
  id,
  created_at: '2026-09-01',
  created_by: 'person-1',
  tasks: [{ id: `task-${id}`, task_status_id: 'status-todo' }]
})

const mountPage = async ({ concepts = [], stubs = {} } = {}) => {
  const handlers = {}
  const socket = {
    on: vi.fn((event, handler) => {
      handlers[event] = handler
    }),
    off: vi.fn()
  }
  const store = createStore({
    getters: {
      concepts: () => concepts,
      currentProduction: () => ({ id: 'production-1', name: 'Wing It' }),
      isTVShow: () => true,
      personMap: () => new Map(),
      selectedConcepts: () => new Map(),
      taskStatusMap: () => new Map()
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  await router.push('/productions/production-1/concepts')
  await router.isReady()
  const wrapper = shallowMount(Concepts, {
    global: {
      plugins: [store, router],
      mocks: { $t: key => key },
      config: { globalProperties: { $socket: socket } },
      stubs
    }
  })
  await flushPromises()
  return { dispatch: store.dispatch, handlers, wrapper }
}

describe('Concepts page', () => {
  // The concepts route carries no episode: moving the store to the all
  // pseudo-episode leaked into the topbar and the next section link.
  test('loads every asset without moving the current episode', async () => {
    const { dispatch } = await mountPage()

    expect(dispatch).toHaveBeenCalledWith('loadAssets', { all: true })
    expect(dispatch).toHaveBeenCalledWith('loadConcepts')
    expect(dispatch).not.toHaveBeenCalledWith(
      'setCurrentEpisode',
      expect.anything()
    )
  })

  test('applies a status change received from the server', async () => {
    const concept = buildConcept('concept-1')
    const { handlers } = await mountPage({ concepts: [concept] })

    handlers['task:status-changed']({
      task_id: 'task-concept-1',
      new_task_status_id: 'status-done'
    })

    expect(concept.tasks[0].task_status_id).toBe('status-done')
  })

  test('opens the upload modal with the dropped files', async () => {
    const setFiles = vi.fn()
    const { wrapper } = await mountPage({
      concepts: [buildConcept('concept-1')],
      stubs: {
        AddPreviewModal: {
          name: 'AddPreviewModal',
          props: { active: { type: Boolean, default: false } },
          template: '<div />',
          methods: { setFiles }
        }
      }
    })
    const files = [new File(['x'], 'concept.png')]

    await wrapper.find('.concept-list').trigger('dragover')
    await wrapper.find('.drop-mask').trigger('drop', {
      dataTransfer: { files }
    })
    await flushPromises()

    expect(
      wrapper.findComponent({ name: 'AddPreviewModal' }).props('active')
    ).toBe(true)
    expect(setFiles).toHaveBeenCalledWith(files)
  })
})
