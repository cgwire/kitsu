import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// Importing the sequences module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import sequencesStore from '@/store/modules/sequences'

import EditShotModal from '@/components/modals/EditShotModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import TextField from '@/components/widgets/TextField.vue'

// Minimal i18n in non-legacy mode so `useI18n()` works next to the global
// `$t` mock of tests/unit.setup.js: labels render as their locale keys.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const getters = {
  currentProduction: () => ({ id: 'p1' }),
  isPaperProduction: () => false,
  openProductions: () => [{ id: 'p1' }],
  sequenceOptions: () => [],
  shotMetadataDescriptors: () => []
}

const store = createStore({ getters })

// A shot starting at frame 0 is a real case: the frame in must survive the
// edit form instead of reading as an empty field.
const shot = {
  id: 'sh-1',
  name: 'SH01',
  sequence_id: 'sq-1',
  project_id: 'p1',
  nb_frames: 100,
  data: { frame_in: 0, frame_out: 99 }
}

const mountModal = (shotToEdit = shot) =>
  shallowMount(EditShotModal, {
    global: { plugins: [store, i18n], renderStubDefaultSlot: true },
    props: { active: true, shotToEdit }
  })

const confirmForm = wrapper => {
  wrapper.findComponent(ModalFooter).vm.$emit('confirm')
  return wrapper.emitted('confirm').at(-1)[0]
}

const findField = (wrapper, labelKey) =>
  wrapper
    .findAllComponents(TextField)
    .find(field => field.props('label') === labelKey)

describe('modals/EditShotModal', () => {
  it('keeps a frame in of 0', async () => {
    const wrapper = mountModal()
    await nextTick()
    expect(confirmForm(wrapper)).toMatchObject({ frameIn: 0, frameOut: 99 })
  })

  it('counts the frames of a range starting at 0', async () => {
    const wrapper = mountModal()
    await nextTick()
    findField(wrapper, 'shots.fields.frame_out').vm.$emit(
      'update:model-value',
      109
    )
    await nextTick()
    expect(confirmForm(wrapper).nb_frames).toBe(110)
  })

  it('counts one frame when the frame out meets the frame in', async () => {
    const wrapper = mountModal({
      ...shot,
      data: { frame_in: 1, frame_out: 100 }
    })
    await nextTick()
    findField(wrapper, 'shots.fields.frame_out').vm.$emit(
      'update:model-value',
      1
    )
    await nextTick()
    expect(confirmForm(wrapper).nb_frames).toBe(1)
  })

  // The stored count can differ from the range on purpose (handles, legacy
  // data): only an edit of a bound recomputes it.
  it('keeps the stored frame count when the modal opens', async () => {
    const wrapper = mountModal({
      ...shot,
      nb_frames: 120,
      data: { frame_in: 0, frame_out: 0 }
    })
    await nextTick()
    expect(confirmForm(wrapper).nb_frames).toBe(120)
  })

  it('keeps the stored frame count when it is handed another shot', async () => {
    const wrapper = mountModal()
    await wrapper.setProps({
      shotToEdit: {
        ...shot,
        id: 'sh-2',
        nb_frames: 90,
        data: { frame_in: 10, frame_out: 20 }
      }
    })
    await nextTick()
    expect(confirmForm(wrapper).nb_frames).toBe(90)
  })

  it('keeps the frame count while a bound is empty', async () => {
    const wrapper = mountModal({ ...shot, nb_frames: 24, data: {} })
    await nextTick()
    findField(wrapper, 'shots.fields.frame_out').vm.$emit(
      'update:model-value',
      99
    )
    await nextTick()
    expect(confirmForm(wrapper).nb_frames).toBe(24)
  })

  // The real MetadataField, fed back by the v-model of the modal form.
  it('sends every checklist option ticked in the form', async () => {
    const checklist = {
      id: 'descriptor-1',
      name: 'Steps',
      entity_type: 'Shot',
      field_name: 'steps',
      data_type: 'checklist',
      choices: ['[ ] Layout', '[ ] Lighting'],
      departments: []
    }
    const checklistStore = createStore({
      getters: {
        ...getters,
        isCurrentUserAdmin: () => true,
        shotMetadataDescriptors: () => [checklist]
      }
    })
    const wrapper = shallowMount(EditShotModal, {
      global: {
        plugins: [checklistStore, i18n],
        renderStubDefaultSlot: true,
        stubs: { MetadataField: false }
      },
      props: { active: true, shotToEdit: shot }
    })
    await nextTick()
    const boxes = wrapper.findAll('input[type="checkbox"]')
    expect(boxes).toHaveLength(2)

    await boxes[0].setValue(true)
    await boxes[1].setValue(true)

    expect(JSON.parse(confirmForm(wrapper).data.steps)).toEqual({
      Layout: true,
      Lighting: true
    })
  })

  // The real sequences module: the Shots page loads the sequences of its
  // production, and a production switch empties them (CLEAR_SHOTS).
  describe('sequence loading', () => {
    const production = { id: 'p1' }
    let loadSequences
    let mounted
    let sequenceStore

    const loadPageSequences = () =>
      sequenceStore.commit('LOAD_SEQUENCES_END', {
        sequences: [
          { id: 'sq-1', name: 'SQ01', project_id: 'p1' },
          { id: 'sq-2', name: 'SQ02', project_id: 'p1' }
        ],
        episodeMap: new Map(),
        production,
        userFilters: {},
        loadingKey: 'p1/'
      })

    // Like the pages: mounted with no shot, then opened on the one to edit.
    const mountClosed = () => {
      mounted = shallowMount(EditShotModal, {
        global: { plugins: [sequenceStore, i18n], renderStubDefaultSlot: true },
        props: { active: false, shotToEdit: null }
      })
      return mounted
    }
    const open = wrapper => wrapper.setProps({ active: true, shotToEdit: shot })
    const close = wrapper => wrapper.setProps({ active: false })

    // Opening schedules the focus of the name field, a stub without focus()
    // here: the timer must not fire once the test is over.
    beforeEach(() => {
      vi.useFakeTimers()
      sequencesStore.cache.sequences = []
      sequencesStore.cache.sequenceMap.clear()
      loadSequences = vi.fn()
      sequenceStore = createStore({
        getters: {
          currentEpisode: () => null,
          currentProduction: () => production,
          isPaperProduction: () => false,
          openProductions: () => [production],
          shotMetadataDescriptors: () => []
        },
        modules: {
          sequences: {
            state: { ...sequencesStore.state },
            getters: sequencesStore.getters,
            mutations: sequencesStore.mutations,
            actions: { loadSequences }
          }
        }
      })
    })

    afterEach(() => {
      mounted?.unmount()
      vi.useRealTimers()
    })

    it('loads the sequences when a production switch emptied them', async () => {
      loadPageSequences()
      const wrapper = mountClosed()
      sequenceStore.commit('CLEAR_SHOTS')

      await open(wrapper)

      expect(loadSequences).toHaveBeenCalledTimes(1)
    })

    it('does not reload the sequences it lists', async () => {
      const wrapper = mountClosed()
      loadPageSequences()

      await open(wrapper)
      await close(wrapper)

      expect(wrapper.findComponent(Combobox).props('options')).toHaveLength(2)
      expect(loadSequences).not.toHaveBeenCalled()
    })

    it('loads the sequences on opening only', async () => {
      const wrapper = mountClosed()

      await open(wrapper)
      await close(wrapper)

      expect(loadSequences).toHaveBeenCalledTimes(1)
    })
  })
})
