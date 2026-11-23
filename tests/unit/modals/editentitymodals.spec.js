import { nextTick } from 'vue'
import { createStore } from 'vuex'

import { shallowMountWithI18n } from '../fixtures/i18n'

import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import EditSequenceModal from '@/components/modals/EditSequenceModal.vue'
import EditShotModal from '@/components/modals/EditShotModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import TextField from '@/components/widgets/TextField.vue'

// The entities the store holds, by id, one map per type.
const entityMaps = {
  assetMap: new Map(),
  editMap: new Map(),
  episodeMap: new Map(),
  sequenceMap: new Map(),
  shotMap: new Map()
}

const column = fieldName => ({ id: `${fieldName}-id`, field_name: fieldName })

const noColumns = () => ({ asset: [], edit: [], episode: [], sequence: [], shot: [] })

// The columns of the production, one list per entity type.
const store = createStore({
  state: { descriptors: noColumns() },
  mutations: {
    clearColumns: state => {
      state.descriptors = noColumns()
    },
    setColumns: (state, { type, fieldNames }) => {
      state.descriptors[type] = fieldNames.map(column)
    },
    // The productions store changes the columns in place.
    renameColumn: (state, { type, fieldName, newFieldName }) => {
      state.descriptors[type].find(d => d.field_name === fieldName).field_name =
        newFieldName
    },
    deleteColumn: (state, { type, fieldName }) => {
      state.descriptors[type] = state.descriptors[type].filter(
        d => d.field_name !== fieldName
      )
    }
  },
  getters: {
    assetCreated: () => '',
    assetMap: () => entityMaps.assetMap,
    editMap: () => entityMaps.editMap,
    episodeMap: () => entityMaps.episodeMap,
    sequenceMap: () => entityMaps.sequenceMap,
    shotMap: () => entityMaps.shotMap,
    assetMetadataDescriptors: state => state.descriptors.asset,
    currentEpisode: () => null,
    currentProduction: () => ({ id: 'p1' }),
    editMetadataDescriptors: state => state.descriptors.edit,
    episodeMetadataDescriptors: state => state.descriptors.episode,
    episodes: () => [],
    isPaperProduction: () => false,
    isTVShow: () => false,
    openProductions: () => [{ id: 'p1' }],
    productionAssetTypeOptions: () => [],
    sequenceMetadataDescriptors: state => state.descriptors.sequence,
    sequenceOptions: () => [],
    shotMetadataDescriptors: state => state.descriptors.shot
  }
})

const typeInColumn = async (wrapper, fieldName, value) => {
  wrapper
    .findAllComponents(MetadataField)
    .find(field => field.props('descriptor').field_name === fieldName)
    .vm.$emit('update:modelValue', value)
  await nextTick()
}

const typeInField = async (wrapper, label, value) => {
  wrapper
    .findAllComponents(TextField)
    .find(field => field.props('label') === label)
    .vm.$emit('update:modelValue', value)
  await nextTick()
}

// The asset modal sends a creation as confirm-and-stay.
const sentData = wrapper =>
  (wrapper.emitted('confirm') ?? wrapper.emitted('confirm-and-stay')).at(-1)[0]
    .data

const footerError = wrapper => wrapper.findComponent(ModalFooter).props('errorText')
const footerConfirm = wrapper => wrapper.findComponent(ModalFooter).vm.$emit('confirm')

const modals = [
  {
    name: 'EditAssetModal',
    type: 'asset',
    mapGetter: 'assetMap',
    modal: EditAssetModal,
    entityProp: 'assetToEdit',
    errorText: wrapper => wrapper.find('p.error').text(),
    confirm: wrapper => wrapper.find('a.button.is-primary').trigger('click')
  },
  {
    name: 'EditEditModal',
    type: 'edit',
    mapGetter: 'editMap',
    modal: EditEditModal,
    entityProp: 'editToEdit',
    errorText: footerError,
    confirm: footerConfirm
  },
  {
    name: 'EditEpisodeModal',
    type: 'episode',
    mapGetter: 'episodeMap',
    modal: EditEpisodeModal,
    entityProp: 'episodeToEdit',
    errorText: footerError,
    confirm: footerConfirm
  },
  {
    name: 'EditSequenceModal',
    type: 'sequence',
    mapGetter: 'sequenceMap',
    modal: EditSequenceModal,
    entityProp: 'sequenceToEdit',
    errorText: footerError,
    confirm: footerConfirm
  },
  {
    name: 'EditShotModal',
    type: 'shot',
    mapGetter: 'shotMap',
    modal: EditShotModal,
    entityProp: 'shotToEdit',
    errorText: footerError,
    confirm: footerConfirm
  }
]

// The page tells the modal when the save failed on an entity deleted in the
// meantime, from another session for instance.
describe.each(modals)('modals/$name, failed save', ({ modal, entityProp, errorText }) => {
  test('tells a deleted entity from the other failures', async () => {
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: {
        active: true,
        isError: true,
        [entityProp]: { id: 'entity-1', name: 'Tree', data: {} }
      }
    })
    const otherFailure = errorText(wrapper)

    await wrapper.setProps({ isDeleted: true })

    expect(errorText(wrapper)).toBe(
      '"Tree" could not be saved: it was deleted in the meantime.'
    )
    expect(otherFailure).not.toBe(errorText(wrapper))
  })

  // The same modal creates the entities, which have no id yet, and a detail
  // page hands it null when its entity is gone.
  test.each([
    ['a creation', { name: '' }],
    ['no entity', null]
  ])('keeps its own message for %s', async (_, entity) => {
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: { active: true, isError: true, [entityProp]: entity }
    })
    const otherFailure = errorText(wrapper)

    await wrapper.setProps({ isDeleted: true })

    expect(errorText(wrapper)).toBe(otherFailure)
  })
})

// Someone else deletes or renames a column while the form is open: the store
// changes the columns and the data of the entity in place, and the form keeps
// its copy.
describe.each(modals)('modals/$name, column changed while open', ({ modal, type, entityProp, confirm, mapGetter }) => {
  const setColumns = (...fieldNames) => store.commit('setColumns', { type, fieldNames })

  afterEach(() => {
    Object.values(entityMaps).forEach(map => map.clear())
    store.commit('clearColumns')
  })

  test('sends no key the entity lost meanwhile', async () => {
    setColumns('mood', 'notes', 'size')
    const entity = {
      id: 'entity-1',
      name: 'Tree',
      data: { mood: 'calm', notes: 'n', size: 'big' }
    }
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: { active: true, [entityProp]: entity }
    })
    await nextTick()
    // mood renamed to tone, and notes deleted, then created again
    setColumns('tone', 'notes', 'size')
    entity.data.tone = entity.data.mood
    delete entity.data.mood
    delete entity.data.notes

    await confirm(wrapper)

    const { data } = wrapper.emitted('confirm').at(-1)[0]
    expect(data).not.toHaveProperty('mood')
    expect(data).not.toHaveProperty('notes')
    expect(data).toMatchObject({ size: 'big' })
  })

  // A detail page hands over a copy of its entity, which keeps the data the
  // store replaced on a live update of that entity.
  test('checks the keys against the entity the store holds', async () => {
    setColumns('mood', 'notes')
    const stored = { id: 'entity-1', name: 'Tree', data: { mood: 'calm', notes: 'n' } }
    entityMaps[mapGetter].set(stored.id, stored)
    const copy = { ...stored, data: { ...stored.data } }
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: { active: true, [entityProp]: copy }
    })
    await nextTick()
    // notes deleted, then created again
    delete stored.data.notes

    await confirm(wrapper)

    const { data } = wrapper.emitted('confirm').at(-1)[0]
    expect(data).not.toHaveProperty('notes')
    expect(data).toMatchObject({ mood: 'calm' })
  })

  // A field empty at opening has no key in the entity data, or a key Zou
  // keeps with no value.
  test.each([
    ['no key', {}],
    ['a key with no value', { notes: null }]
  ])('sends a value typed into a field with %s at opening', async (_, data) => {
    setColumns('notes')
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: { active: true, [entityProp]: { id: 'entity-1', name: 'Tree', data } }
    })
    await nextTick()
    await typeInColumn(wrapper, 'notes', 'n')

    await confirm(wrapper)

    expect(sentData(wrapper)).toMatchObject({ notes: 'n' })
  })

  // Zou moves no null value on a rename: the entity keeps the old key.
  test.each([
    ['no key', {}],
    ['a key with no value', { look: null, notes: null }]
  ])('sends no value typed into a field with %s at opening, for a column deleted or renamed meanwhile', async (_, data) => {
    setColumns('look', 'notes', 'mood')
    const entity = { id: 'entity-1', name: 'Tree', data }
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: { active: true, [entityProp]: entity }
    })
    await nextTick()
    await typeInColumn(wrapper, 'look', 'warm')
    await typeInColumn(wrapper, 'notes', 'n')
    await typeInColumn(wrapper, 'mood', 'calm')
    // look renamed to style, and notes deleted
    store.commit('renameColumn', { type, fieldName: 'look', newFieldName: 'style' })
    store.commit('deleteColumn', { type, fieldName: 'notes' })
    delete entity.data.notes
    await nextTick()

    await confirm(wrapper)

    const sent = sentData(wrapper)
    expect(sent).not.toHaveProperty('look')
    expect(sent).not.toHaveProperty('notes')
    expect(sent).toMatchObject({ mood: 'calm' })
  })

  // The same modal creates the entities: the page hands it the next one.
  test('sends the values typed for a creation after an edit', async () => {
    setColumns('notes')
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: {
        active: true,
        [entityProp]: { id: 'entity-1', name: 'Tree', data: { notes: 'old' } }
      }
    })
    await nextTick()
    await wrapper.setProps({ [entityProp]: { name: '' } })
    await typeInField(wrapper, 'Name', 'Bush')
    await typeInColumn(wrapper, 'notes', 'new')

    await confirm(wrapper)

    expect(sentData(wrapper)).toMatchObject({ notes: 'new' })
  })
})

// The resolution field writes in the data, where no column holds it. The
// shot modal keeps it out of the data.
describe.each(modals.filter(({ name }) => name !== 'EditShotModal'))(
  'modals/$name, resolution',
  ({ modal, entityProp, confirm }) => {
    test('sends a resolution typed for an entity without one', async () => {
      const wrapper = shallowMountWithI18n(modal, {
        global: { plugins: [store], renderStubDefaultSlot: true },
        props: { active: true, [entityProp]: { id: 'entity-1', name: 'Tree', data: {} } }
      })
      await nextTick()
      await typeInField(wrapper, 'Resolution', '4K')

      await confirm(wrapper)

      expect(sentData(wrapper)).toMatchObject({ resolution: '4K' })
    })
  }
)
