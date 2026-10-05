import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

// Importing the page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import assetsStore from '@/store/modules/assets'

import Concepts from '@/components/pages/Concepts.vue'
import Combobox from '@/components/widgets/Combobox.vue'
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

const buildConcept = (id, createdBy = 'person-1', links = []) => ({
  id,
  created_at: '2026-09-01',
  created_by: createdBy,
  entity_concept_links: links,
  tasks: [{ id: `task-${id}`, task_status_id: 'status-todo' }]
})

const mountPage = async ({
  concepts = [],
  dispatch = vi.fn(() => Promise.resolve()),
  people = [],
  selection = [],
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
      selectedConcepts: () =>
        new Map(selection.map(concept => [concept.id, concept])),
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

  describe('multiple selection', () => {
    const stubs = {
      TaskInfo: { template: '<div class="panel"><slot name="selection" /></div>' }
    }

    test('shows the selected concepts in the side panel', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { wrapper } = await mountPage({
        concepts,
        selection: concepts,
        stubs
      })

      const cards = wrapper.find('.panel').findAllComponents(ConceptCard)
      expect(cards.map(card => card.props('concept'))).toEqual(concepts)
      expect(cards.every(card => card.props('compact'))).toBe(true)
    })

    test('drops from the selection the concept clicked in the panel', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { dispatch, wrapper } = await mountPage({
        concepts,
        selection: concepts,
        stubs
      })

      wrapper
        .find('.panel')
        .findAllComponents(ConceptCard)[0]
        .vm.$emit('click', {})
      await flushPromises()

      expect(dispatch).toHaveBeenCalledWith(
        'addSelectedConcepts',
        new Map([['concept-2', concepts[1]]])
      )
    })
  })

  describe('asset filters', () => {
    const buildAsset = (id, name, type) => ({
      id,
      name,
      full_name: `${type} / ${name}`,
      asset_type_id: `type-${type}`,
      asset_type_name: type
    })
    const assets = [
      buildAsset('asset-tree', 'Tree', 'Props'),
      buildAsset('asset-rock', 'Rock', 'Props'),
      buildAsset('asset-hall', 'Hall', 'Sets'),
      buildAsset('asset-unused', 'Unused', 'Characters')
    ]

    // The automatic stub does not carry the props vue-multiselect declares
    // through a mixin.
    const AssetFilter = {
      name: 'AssetFilter',
      props: ['modelValue', 'options'],
      template: '<div />'
    }

    const mountWithLinks = () =>
      mountPage({
        concepts: [
          buildConcept('concept-tree', 'person-1', ['asset-tree']),
          buildConcept('concept-both', 'person-1', ['asset-rock', 'asset-hall']),
          buildConcept('concept-free')
        ],
        stubs: { 'vue-multiselect': AssetFilter }
      })

    const typeFilter = wrapper =>
      wrapper
        .findAllComponents(Combobox)
        .find(
          combobox => combobox.props('label') === 'concepts.fields.asset_type'
        )
    const assetFilter = wrapper => wrapper.findComponent(AssetFilter)

    const pick = async (filter, value) => {
      filter.vm.$emit('update:modelValue', value)
      await flushPromises()
    }
    const shownConcepts = wrapper =>
      wrapper
        .findAllComponents(ConceptCard)
        .map(card => card.props('concept').id)
        .sort()
    const optionNames = filter =>
      filter.props('options').map(option => option.label ?? option.name)

    beforeEach(() => {
      assets.forEach(asset => assetsStore.cache.assetMap.set(asset.id, asset))
    })

    afterEach(() => {
      assetsStore.cache.assetMap.clear()
    })

    test('offers the types and the assets a concept is linked to', async () => {
      const { wrapper } = await mountWithLinks()

      expect(optionNames(typeFilter(wrapper))).toEqual([
        'main.all',
        'Props',
        'Sets'
      ])
      expect(optionNames(assetFilter(wrapper))).toEqual([
        'main.all',
        'concepts.actions.empty',
        'Props / Rock',
        'Props / Tree',
        'Sets / Hall'
      ])
    })

    test('keeps the concepts linked to an asset of the chosen type', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(typeFilter(wrapper), 'type-Sets')

      expect(shownConcepts(wrapper)).toEqual(['concept-both'])
    })

    test('keeps the concepts linked to the chosen asset', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(assetFilter(wrapper), { id: 'asset-tree' })

      expect(shownConcepts(wrapper)).toEqual(['concept-tree'])
    })

    test('keeps the concepts without any link', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(assetFilter(wrapper), { id: 'none' })

      expect(shownConcepts(wrapper)).toEqual(['concept-free'])
    })

    test('narrows the assets to the chosen type', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(typeFilter(wrapper), 'type-Props')

      expect(optionNames(assetFilter(wrapper))).toEqual([
        'main.all',
        'Rock',
        'Tree'
      ])
    })

    test('drops the chosen asset when the type changes to another one', async () => {
      const { wrapper } = await mountWithLinks()
      await pick(assetFilter(wrapper), { id: 'asset-hall' })

      await pick(typeFilter(wrapper), 'type-Props')

      expect(assetFilter(wrapper).props('modelValue').id).toBe('')
      expect(shownConcepts(wrapper)).toEqual(['concept-both', 'concept-tree'])
    })
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
