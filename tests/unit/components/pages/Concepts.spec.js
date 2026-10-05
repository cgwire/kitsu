import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

// Importing the page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import Concepts from '@/components/pages/Concepts.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

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

const buildConcept = (id, createdBy = 'person-1') => ({
  id,
  created_at: '2026-09-01',
  created_by: createdBy,
  tasks: [{ id: `task-${id}`, task_status_id: 'status-todo' }]
})

const mountPage = async ({
  concepts = [],
  dispatch = vi.fn(() => Promise.resolve()),
  people = [],
  stubs = {}
} = {}) => {
  const handlers = {}
  const socket = {
    on: vi.fn((event, handler) => {
      handlers[event] = handler
    }),
    off: vi.fn()
  }
  const store = createStore({
    state: { production: { id: 'production-1', name: 'Wing It' } },
    getters: {
      concepts: () => concepts,
      currentProduction: state => state.production,
      isTVShow: () => true,
      personMap: () => new Map(people.map(person => [person.id, person])),
      selectedConcepts: () => new Map(),
      taskStatusMap: () => new Map()
    }
  })
  store.dispatch = dispatch
  store.commit = vi.fn()
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
  return { dispatch, handlers, store, wrapper }
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

  test('commits a status change received from the server', async () => {
    const concept = buildConcept('concept-1')
    const { handlers, store } = await mountPage({ concepts: [concept] })

    handlers['task:status-changed']({
      task_id: 'task-concept-1',
      new_task_status_id: 'status-done'
    })

    expect(store.commit).toHaveBeenCalledWith('UPDATE_TASK', {
      task: concept.tasks[0],
      taskStatusId: 'status-done'
    })
  })

  test('selects the concept whose card is clicked', async () => {
    const concept = buildConcept('concept-1')
    const { dispatch, wrapper } = await mountPage({ concepts: [concept] })

    wrapper.findComponent(ConceptCard).vm.$emit('click', { ctrlKey: false })
    await flushPromises()

    expect(dispatch).toHaveBeenCalledWith(
      'addSelectedConcepts',
      new Map([[concept.id, concept]])
    )
  })

  // The card is the button: a focusable row around it doubled every stop.
  test('leaves a single tab stop per concept', async () => {
    const { wrapper } = await mountPage({
      concepts: [buildConcept('concept-1')]
    })

    expect(wrapper.find('.item').attributes('tabindex')).toBeUndefined()
  })

  test('accepts dropped files when there is no concept yet', async () => {
    const { wrapper } = await mountPage()

    await wrapper.find('.empty-concepts').trigger('dragover')

    expect(wrapper.find('.drop-mask').exists()).toBe(true)
  })

  test('clears the loading error when a reload succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let isOffline = true
    const dispatch = vi.fn(action =>
      isOffline && action === 'loadAssets'
        ? Promise.reject(new Error('network'))
        : Promise.resolve()
    )
    const { store, wrapper } = await mountPage({ dispatch })
    expect(wrapper.findComponent(TableInfo).props('isError')).toBe(true)

    isOffline = false
    store.state.production = { ...store.state.production }
    await flushPromises()

    expect(wrapper.findComponent(TableInfo).exists()).toBe(false)
  })

  test('clears the upload error when a retry succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { dispatch, wrapper } = await mountPage()
    const modal = wrapper.findComponent({ name: 'AddPreviewModal' })
    dispatch.mockRejectedValueOnce(new Error('network'))
    modal.vm.$emit('confirm', [])
    await flushPromises()
    expect(modal.props('isError')).toBe(true)

    modal.vm.$emit('confirm', [])
    await flushPromises()

    expect(modal.props('isError')).toBe(false)
  })

  test('keeps every publisher selectable once one is picked', async () => {
    const people = [{ id: 'person-1' }, { id: 'person-2' }]
    const { wrapper } = await mountPage({
      concepts: [
        buildConcept('concept-1', 'person-1'),
        buildConcept('concept-2', 'person-2')
      ],
      people
    })
    const field = wrapper.findComponent(PeopleField)

    field.vm.$emit('update:modelValue', people[0])
    await flushPromises()

    expect(wrapper.findAll('.item')).toHaveLength(1)
    expect(field.props('people')).toHaveLength(2)
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
